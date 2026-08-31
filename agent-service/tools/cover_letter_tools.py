import os
import json
import httpx
from typing import Optional
from crewai.tools import tool

def get_next_internal_url() -> str:
    return os.environ.get("NEXT_INTERNAL_URL", "http://localhost:3000").rstrip("/")

@tool("generate_cover_letter")
def generate_cover_letter(
    job_title: str = "Software Engineer",
    company: str = "Target Company",
    job_description: Optional[str] = None,
    resume_text: Optional[str] = None,
    tone: str = "Professional and Confident",
    internal_jwt: Optional[str] = None
) -> str:
    """
    Generate a tailored cover letter matched to job title and description.
    Calls existing Next.js endpoint /api/cover-letter with internal authentication.
    """
    clean_job_title = (job_title or "").strip() or "Software Engineer"
    clean_company = (company or "").strip() or "Target Company"
    clean_resume = (resume_text or "").strip()
    clean_jd = (job_description or "").strip()

    internal_url = get_next_internal_url()
    target_endpoint = f"{internal_url}/api/cover-letter"

    headers = {"Content-Type": "application/json"}
    if internal_jwt:
        headers["X-Internal-Auth"] = internal_jwt.strip()

    # Form payload adhering strictly to Next.js /api/cover-letter contract
    payload = {
        "action": "generate",
        "jobTitle": clean_job_title,
        "companyName": clean_company,
        "jobDescription": clean_jd,
        "resumeText": clean_resume,
        "customInput": clean_resume or clean_jd or "Software Engineering Position",
        "tone": tone or "Professional and Confident"
    }

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(target_endpoint, headers=headers, json=payload)

        if response.status_code == 401:
            return json.dumps({"error": "Unauthorized request to cover letter service."})
        elif response.status_code == 400:
            return json.dumps({"error": f"Invalid cover letter payload: {response.text}"})
        elif response.status_code >= 500:
            return json.dumps({"error": f"Cover letter service error: {response.text}"})

        response.raise_for_status()
        return response.text

    except httpx.TimeoutException:
        return json.dumps({"error": "Cover letter generation request timed out."})
    except httpx.RequestError as e:
        return json.dumps({"error": f"Failed to connect to cover letter service: {str(e)}"})
    except Exception as e:
        return json.dumps({"error": f"Unexpected error during cover letter generation: {str(e)}"})
