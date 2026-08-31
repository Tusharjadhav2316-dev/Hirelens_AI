import os
import json
import httpx
from typing import Optional
from crewai.tools import tool

def get_next_internal_url() -> str:
    url = os.environ.get("NEXT_INTERNAL_URL", "http://localhost:3000").rstrip("/")
    return url

@tool("get_ats_analysis")
def get_ats_analysis(resume_text: str = "", job_description: Optional[str] = None, internal_jwt: Optional[str] = None) -> str:
    """
    Fetch deterministic ATS score analysis breakdown for candidate resume.
    Calls Next.js internal endpoint /api/internal/ats-score.
    Never calculates score in Python or via LLM.
    """
    if not resume_text or not resume_text.strip():
        return json.dumps({"error": "Resume text is required for ATS analysis."})

    internal_url = get_next_internal_url()
    target_endpoint = f"{internal_url}/api/internal/ats-score"

    headers = {"Content-Type": "application/json"}
    if internal_jwt:
        headers["X-Internal-Auth"] = internal_jwt.strip()

    payload = {
        "resume": resume_text,
        "jobDescription": job_description
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(target_endpoint, headers=headers, json=payload)
        
        if response.status_code == 401:
            return json.dumps({"error": "Unauthorized request to ATS service."})
        elif response.status_code == 400:
            return json.dumps({"error": f"Invalid request payload: {response.text}"})
        elif response.status_code >= 500:
            return json.dumps({"error": "Internal ATS service error. Please try again later."})
        
        response.raise_for_status()
        return response.text

    except httpx.TimeoutException:
        return json.dumps({"error": "ATS analysis request timed out."})
    except httpx.RequestError as e:
        return json.dumps({"error": f"Failed to connect to ATS service: {str(e)}"})
    except Exception as e:
        return json.dumps({"error": f"Unexpected error during ATS analysis: {str(e)}"})
