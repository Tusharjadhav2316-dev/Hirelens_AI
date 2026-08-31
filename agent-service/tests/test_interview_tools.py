import os
import sys
import json
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from tools.interview_tools import (
    INTERVIEW_GUARDRAIL,
    prepare_interview_questions,
    evaluate_interview_answer
)

def test_interview_guardrail_phrasing_present():
    assert "Never fabricate candidate skills" in INTERVIEW_GUARDRAIL
    assert "Never claim a candidate definitely passed or failed" in INTERVIEW_GUARDRAIL
    assert "Clearly distinguish resume facts from job-description requirements" in INTERVIEW_GUARDRAIL

def test_prepare_interview_questions_structure_and_bounds():
    output_str = prepare_interview_questions._run(
        role="Senior Backend Developer",
        count=15, # Exceeds max count cap of 10
        resume_text="Python Developer with 4 years experience in FastAPI.",
        job_description="Backend role requiring Python, FastAPI, and Kubernetes."
    )
    data = json.loads(output_str)

    # Output structure must have questions list
    assert "questions" in data
    # Safe count upper bound cap of 10 enforced
    assert len(data["questions"]) <= 10

def test_evaluate_interview_answer_no_verdict_fields():
    output_str = evaluate_interview_answer._run(
        question="How do you handle microservice failures?",
        answer="I implement circuit breaker pattern with resilience4j and fallback handlers.",
        resume_text="Backend Engineer."
    )
    data = json.loads(output_str)

    # Assert no verdict or hiring decision fields exist in evaluation output
    for forbidden_key in ["passed", "failed", "hired", "rejected", "hire_probability"]:
        assert forbidden_key not in data, f"Forbidden verdict field '{forbidden_key}' found in interview feedback!"

def test_evaluate_interview_answer_empty_input():
    output_str = evaluate_interview_answer._run(question="", answer="")
    data = json.loads(output_str)
    assert "error" in data
