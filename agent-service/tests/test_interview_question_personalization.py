import os
import sys
import json
from unittest.mock import patch
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from tools.interview_tools import prepare_interview_questions

@patch("tools.interview_tools.call_openrouter_api", return_value=None)
def test_backward_compatibility_defaults(mock_api):
    """Calling prepare_interview_questions without interview_type and difficulty uses default parameters."""
    output_str = prepare_interview_questions._run(
        role="Frontend Engineer",
        count=3,
        resume_text="React developer with 3 years experience.",
        job_description="Looking for Next.js and Tailwind expert."
    )
    data = json.loads(output_str)
    assert "questions" in data
    assert len(data["questions"]) == 3
    for q in data["questions"]:
        assert "difficulty" in q
        assert q["difficulty"] == "Medium"
        assert q["category"] == "Mixed"
        assert "question" in q
        assert "rationale" in q

@patch("tools.interview_tools.call_openrouter_api", return_value=None)
def test_interview_modes_and_categories(mock_api):
    """Verify fallback categories reflect interview_type parameter."""
    modes = [
        ("hr", "HR"),
        ("behavioral", "Behavioral"),
        ("technical", "Technical"),
        ("mixed", "Mixed"),
    ]
    for mode_val, expected_cat in modes:
        output_str = prepare_interview_questions._run(
            role="DevOps Engineer",
            count=2,
            interview_type=mode_val,
            difficulty="intermediate"
        )
        data = json.loads(output_str)
        assert len(data["questions"]) == 2
        for q in data["questions"]:
            assert q["category"] == expected_cat

@patch("tools.interview_tools.call_openrouter_api", return_value=None)
def test_difficulty_tagging_in_fallback(mock_api):
    """Verify fallback difficulties match beginner/intermediate/advanced mappings."""
    diff_map = [
        ("beginner", "Easy"),
        ("intermediate", "Medium"),
        ("advanced", "Hard"),
    ]
    for diff_arg, expected_label in diff_map:
        output_str = prepare_interview_questions._run(
            role="Data Scientist",
            count=2,
            interview_type="technical",
            difficulty=diff_arg
        )
        data = json.loads(output_str)
        for q in data["questions"]:
            assert q["difficulty"] == expected_label

@patch("tools.interview_tools.call_openrouter_api", return_value=None)
def test_technical_project_deep_dive_trigger(mock_api):
    """When technical mode is chosen and resume has project/built text, question references projects."""
    resume_with_projects = "Built a distributed streaming pipeline using Apache Kafka and developed microservices in Go."
    output_str = prepare_interview_questions._run(
        role="Platform Engineer",
        count=2,
        resume_text=resume_with_projects,
        interview_type="technical",
        difficulty="advanced"
    )
    data = json.loads(output_str)
    for q in data["questions"]:
        assert "project" in q["question"].lower()
        assert q["difficulty"] == "Hard"
        assert q["category"] == "Technical"

def test_api_response_parsing():
    """Verify that when OpenRouter returns valid JSON, it is parsed and returned with questions."""
    mock_payload = json.dumps({
        "questions": [
            {
                "id": 1,
                "category": "Technical",
                "difficulty": "Hard",
                "question": "Explain how you handle distributed transactions across microservices.",
                "rationale": "Tests senior-level architecture knowledge."
            }
        ]
    })
    with patch("tools.interview_tools.call_openrouter_api", return_value=mock_payload):
        output_str = prepare_interview_questions._run(
            role="Backend Architect",
            count=1,
            interview_type="technical",
            difficulty="advanced"
        )
        data = json.loads(output_str)
        assert "questions" in data
        assert len(data["questions"]) == 1
        assert data["questions"][0]["difficulty"] == "Hard"
        assert data["questions"][0]["category"] == "Technical"
