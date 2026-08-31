import os
import json
import httpx
from typing import Optional
from crewai.tools import tool

def get_next_internal_url() -> str:
    return os.environ.get("NEXT_INTERNAL_URL", "http://localhost:3000").rstrip("/")

@tool("optimize_resume_section")
def optimize_resume_section(
    section: str = "experience",
    content: str = "",
    mode: str = "ats",
    job_description: Optional[str] = None,
    internal_jwt: Optional[str] = None
) -> str:
    """
    Optimize a specified section of the resume using target optimization mode.
    Calls existing Next.js endpoint /api/ai-improve with internal authentication.
    """
    if not content or not content.strip():
        return json.dumps({"error": "Content to optimize cannot be empty."})

    internal_url = get_next_internal_url()
    target_endpoint = f"{internal_url}/api/ai-improve"

    headers = {"Content-Type": "application/json"}
    if internal_jwt:
        headers["X-Internal-Auth"] = internal_jwt.strip()

    payload = {
        "section": section,
        "content": content,
        "mode": mode,
        "jobDescription": job_description
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(target_endpoint, headers=headers, json=payload)

        if response.status_code == 401:
            return json.dumps({"error": "Unauthorized request to optimization service."})
        elif response.status_code == 400:
            return json.dumps({"error": f"Invalid optimization payload: {response.text}"})
        elif response.status_code == 429:
            return json.dumps({"error": "Rate limit exceeded on optimization provider."})
        elif response.status_code >= 500:
            return json.dumps({"error": "Optimization service error. Please try again."})

        response.raise_for_status()
        return response.text

    except httpx.TimeoutException:
        return json.dumps({"error": "Resume optimization request timed out."})
    except httpx.RequestError as e:
        return json.dumps({"error": f"Failed to connect to optimization service: {str(e)}"})
    except Exception as e:
        return json.dumps({"error": f"Unexpected error during optimization: {str(e)}"})
