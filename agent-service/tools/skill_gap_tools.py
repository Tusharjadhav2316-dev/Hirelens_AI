import os
import json
import httpx
from typing import Optional, Dict, Any
from crewai.tools import tool

def get_next_internal_url() -> str:
    return os.environ.get("NEXT_INTERNAL_URL", "http://localhost:3000").rstrip("/")

@tool("analyze_skill_gap")
def analyze_skill_gap(
    job_description: str = "",
    resume_text: str = "",
    resume_obj: Optional[Dict[str, Any]] = None,
    internal_jwt: Optional[str] = None
) -> str:
    """
    Analyze skill gap between candidate resume and target job description.
    Calls existing Next.js internal endpoint /api/internal/jd-match.
    Uses deterministic JD Matcher algorithm (lib/jdMatcher.ts).
    """
    clean_jd = (job_description or "").strip()
    if not clean_jd:
        return json.dumps({"error": "Job description is required for skill gap analysis."})

    clean_resume_text = (resume_text or "").strip()

    internal_url = get_next_internal_url()
    target_endpoint = f"{internal_url}/api/internal/jd-match"

    headers = {"Content-Type": "application/json"}
    if internal_jwt:
        headers["X-Internal-Auth"] = internal_jwt.strip()

    payload = {
        "resumeText": clean_resume_text,
        "jobDescription": clean_jd,
        "resume": resume_obj
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(target_endpoint, headers=headers, json=payload)

        if response.status_code == 401:
            return json.dumps({"error": "Unauthorized request to skill gap analysis service."})
        elif response.status_code == 400:
            return json.dumps({"error": f"Invalid skill gap request payload: {response.text}"})
        elif response.status_code >= 500:
            return json.dumps({"error": "Internal skill gap service error. Please try again later."})

        response.raise_for_status()
        return response.text

    except httpx.TimeoutException:
        return json.dumps({"error": "Skill gap analysis request timed out."})
    except httpx.RequestError as e:
        return json.dumps({"error": f"Failed to connect to skill gap analysis service: {str(e)}"})
    except Exception as e:
        return json.dumps({"error": f"Unexpected error during skill gap analysis: {str(e)}"})
