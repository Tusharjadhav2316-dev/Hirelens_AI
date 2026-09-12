import os
import sys
import json
import pytest
from pydantic import ValidationError
from unittest.mock import patch

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from schemas.interview_report import InterviewReportArtifactData
from tools.interview_tools import generate_interview_report
from crew.interview_manager import complete_session, start_session
from schemas.interview_session import QuestionAskedRecord, AnswerGivenRecord

def test_valid_interview_report_schema():
    valid_data = {
        "interview_type": "technical",
        "target_role": "Backend Engineer",
        "questions_asked": 5,
        "readiness_by_category": {
            "Technical": "Strong"
        },
        "strengths": ["Clear explanation of concurrency", "Deep knowledge of database indexing"],
        "improvement_areas": ["Include specific latency metrics", "Discuss memory trade-offs"],
        "priority_topics": ["Distributed system caching", "STAR response structure"],
        "note": "These are coaching recommendations, not guaranteed measurements."
    }
    report = InterviewReportArtifactData.model_validate(valid_data)
    assert report.target_role == "Backend Engineer"
    assert report.readiness_by_category["Technical"] == "Strong"
    assert report.questions_asked == 5

def test_injected_numeric_score_fails_validation():
    """Extra numeric score fields MUST fail validation via extra='forbid'."""
    invalid_data = {
        "interview_type": "technical",
        "target_role": "Backend Engineer",
        "questions_asked": 5,
        "readiness_by_category": {
            "Technical": "Strong"
        },
        "strengths": ["Clear explanation"],
        "improvement_areas": ["Include metrics"],
        "priority_topics": ["Distributed systems"],
        "note": "These are coaching recommendations, not guaranteed measurements.",
        "score": 8.5  # Forbidden extra field!
    }
    with pytest.raises(ValidationError):
        InterviewReportArtifactData.model_validate(invalid_data)

def test_injected_overall_score_fails_validation():
    invalid_data = {
        "interview_type": "behavioral",
        "target_role": "Product Manager",
        "questions_asked": 3,
        "readiness_by_category": {
            "Behavioral": "Moderate"
        },
        "strengths": ["Good communication"],
        "improvement_areas": ["Quantify user impact"],
        "priority_topics": ["Conflict resolution"],
        "overall_score": 85  # Forbidden extra field!
    }
    with pytest.raises(ValidationError):
        InterviewReportArtifactData.model_validate(invalid_data)

@patch("tools.interview_tools.call_openrouter_api", return_value=None)
def test_generate_interview_report_fallback_qualitative(mock_api):
    questions = [
        {"id": "1", "question": "Explain database indexing."}
    ]
    answers = [
        {"question_id": "1", "answer": "B-trees allow O(log n) lookups.", "feedback": {"strengths": ["Accurate"]}}
    ]
    res_str = generate_interview_report._run(
        questions_asked=questions,
        answers_given=answers,
        target_role="Database Administrator",
        interview_type="technical"
    )
    report_dict = json.loads(res_str)
    # Must validate against schema
    report = InterviewReportArtifactData.model_validate(report_dict)
    assert report.target_role == "Database Administrator"
    assert report.interview_type == "technical"
    assert "score" not in report_dict
    assert "overall_score" not in report_dict
    assert "numeric_score" not in report_dict

@patch("tools.interview_tools.call_openrouter_api", return_value=None)
def test_complete_session_produces_report(mock_api):
    session = start_session(
        interview_type="hr",
        target_role="Operations Specialist",
        difficulty="intermediate"
    )
    session.questions_asked = [
        QuestionAskedRecord(id="1", question="Tell me about your career journey.", category="HR", difficulty="Medium")
    ]
    session.answers_given = [
        AnswerGivenRecord(question_id="1", answer="I managed logistics pipelines.", feedback={"strengths": ["Clear background"]})
    ]

    updated_session, report = complete_session(session)
    assert updated_session.status == "completed"
    assert isinstance(report, dict)
    assert "readiness_by_category" in report
    assert "HR" in report["readiness_by_category"]
    assert report["readiness_by_category"]["HR"] in ["Strong", "Moderate", "Needs Improvement"]
