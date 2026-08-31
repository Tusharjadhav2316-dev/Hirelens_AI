import os
import sys
import json
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from tools.skill_gap_tools import analyze_skill_gap

def test_analyze_skill_gap_requires_jd():
    output_str = analyze_skill_gap._run(job_description="")
    data = json.loads(output_str)
    assert "error" in data
    assert "Job description is required" in data["error"]

def test_analyze_skill_gap_unauthorized_call():
    # Calling internal skill gap endpoint with invalid/missing JWT should return structured error
    output_str = analyze_skill_gap._run(
        job_description="Seeking a Senior React Engineer with 5+ years experience.",
        resume_text="Senior Engineer with React experience.",
        internal_jwt="invalid_jwt"
    )
    data = json.loads(output_str)
    assert "error" in data
