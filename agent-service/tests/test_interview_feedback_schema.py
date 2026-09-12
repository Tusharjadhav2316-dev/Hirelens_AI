import os
import sys
import json
import pytest
from unittest.mock import patch

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from schemas.interview_feedback import InterviewFeedbackArtifactData
from tools.interview_tools import evaluate_interview_answer

def test_interview_feedback_artifact_data_valid():
    feedback_data = {
        "question": "How do you handle API rate limiting?",
        "answer": "I use token bucket algorithms with Redis in memory.",
        "clarity": "Very clear and articulate.",
        "structure": "Logical presentation.",
        "specificity": "Mentioned token bucket and Redis specifically.",
        "technical_depth": "Appropriate for senior backend role.",
        "strengths": ["Clear technical foundation", "Understands distributed caching"],
        "improvements": ["Could discuss fallback policies on Redis timeout"],
        "suggested_answer_direction": "Highlight what happens when Redis becomes unavailable."
    }
    validated = InterviewFeedbackArtifactData.model_validate(feedback_data)
    assert validated.question == "How do you handle API rate limiting?"
    assert len(validated.strengths) == 2
    assert len(validated.improvements) == 1

@patch("tools.interview_tools.call_openrouter_api", return_value=None)
def test_evaluate_interview_answer_matches_feedback_schema(mock_api):
    question_text = "How do you design high-availability systems?"
    answer_text = "I use multi-region active-active deployments with automated failover."
    res_str = evaluate_interview_answer._run(
        question=question_text,
        answer=answer_text,
        resume_text="Senior Architect"
    )
    feedback_dict = json.loads(res_str)

    # Combine with question & answer for artifact schema validation
    combined_data = {
        "question": question_text,
        "answer": answer_text,
        **feedback_dict
    }
    validated = InterviewFeedbackArtifactData.model_validate(combined_data)
    assert validated.question == question_text
    assert validated.answer == answer_text
    assert isinstance(validated.strengths, list)
    assert isinstance(validated.improvements, list)
    assert isinstance(validated.clarity, str)
    assert isinstance(validated.structure, str)
    assert isinstance(validated.specificity, str)
    assert isinstance(validated.technical_depth, str)
    assert isinstance(validated.suggested_answer_direction, str)
