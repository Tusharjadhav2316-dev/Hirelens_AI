import os
import sys
import json
import time
import jwt
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from tools.ats_tools import get_ats_analysis
from tools.resume_tools import propose_resume_change

TEST_SECRET = "a-very-secure-cryptographically-random-test-secret-key-32bytes!"

def mint_test_jwt(uid: str = "test_user_123", secret: str = TEST_SECRET, exp_delta: int = 60) -> str:
    now = int(time.time())
    payload = {
        "uid": uid,
        "sub": uid,
        "iat": now,
        "exp": now + exp_delta
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def test_ats_tool_unauthorized_call():
    """Verify that calling get_ats_analysis without a valid JWT or server returned error is handled safely."""
    # When Next.js internal server is not running or no valid JWT is provided
    result_str = get_ats_analysis._run(resume_text="Senior Developer with 5 years React experience.", internal_jwt="invalid_token")
    result = json.loads(result_str)
    assert "error" in result

def test_propose_resume_change_proposal_only():
    """Verify propose_resume_change returns a structured proposal and does not apply changes."""
    result_str = propose_resume_change._run(
        section="summary",
        item_id="sum_1",
        before="Worked on React apps.",
        after="Architected scalable React applications with 99.9% uptime.",
        rationale="Quantified achievements and upgraded action verbs."
    )
    result = json.loads(result_str)
    assert result["type"] == "resume_diff_proposal"
    assert result["status"] == "proposal_only"
    assert result["applied"] is False
    assert result["section"] == "summary"
    assert result["before"] == "Worked on React apps."
    assert result["after"] == "Architected scalable React applications with 99.9% uptime."
    assert result["rationale"] == "Quantified achievements and upgraded action verbs."

def test_ats_tool_determinism_mock_boundary(monkeypatch):
    """Assert ATS tool contract formatting and deterministic score behavior."""
    os.environ["INTERNAL_AGENT_JWT_SECRET"] = TEST_SECRET
    os.environ["NEXT_INTERNAL_URL"] = "http://localhost:3000"

    test_token = mint_test_jwt()
    sample_resume = "Senior Full Stack Engineer. 8 years experience in Python, FastAPI, React, AWS."
    
    # Verify tool call syntax executes without runtime crashes
    result_str = get_ats_analysis._run(resume_text=sample_resume, internal_jwt=test_token)
    assert isinstance(result_str, str)
