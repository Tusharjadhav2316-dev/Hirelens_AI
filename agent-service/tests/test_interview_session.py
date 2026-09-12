import os
import sys
import json
import asyncio
from unittest.mock import patch
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crew.interview_manager import (
    start_session,
    process_answer,
    present_question,
    _should_ask_follow_up,
    _step_difficulty,
    MAX_QUESTIONS_PER_SESSION,
    MAX_FOLLOW_UPS_PER_QUESTION,
)
from schemas.interview_session import InterviewSessionState, QuestionAskedRecord
from crew.manager import process_manager_request_async
from crew.event_bus import EventBus

def test_should_ask_follow_up_decision_rule():
    # Ambiguous/vague answer with >= 2 improvements
    feedback_vague = {
        "strengths": ["Clear tone"],
        "improvements": ["Needs to be more specific about your individual contribution", "Add concrete metrics and quantifiable outcomes"]
    }
    assert _should_ask_follow_up(feedback_vague) is True

    # Strong answer with 0 or 1 improvement
    feedback_strong = {
        "strengths": ["Excellent structure", "Clear explanation of architecture"],
        "improvements": ["Minor: could mention team size"]
    }
    assert _should_ask_follow_up(feedback_strong) is False

    # 2 improvements but without ambiguity keywords
    feedback_other = {
        "strengths": ["Good energy"],
        "improvements": ["Tone was slightly informal", "Pacing was fast"]
    }
    assert _should_ask_follow_up(feedback_other) is False

def test_step_difficulty_rule():
    feedback_strong = {
        "strengths": ["Clear STAR structure", "Excellent depth in system architecture", "Strong articulation"],
        "improvements": ["None"]
    }
    feedback_weak = {
        "strengths": ["Direct response"],
        "improvements": ["Need more details", "Explain trade-offs"]
    }

    # Steps up from beginner to intermediate, then to advanced
    assert _step_difficulty("beginner", feedback_strong) == "intermediate"
    assert _step_difficulty("intermediate", feedback_strong) == "advanced"
    # Never exceeds advanced
    assert _step_difficulty("advanced", feedback_strong) == "advanced"

    # Weak/moderate answer keeps current difficulty
    assert _step_difficulty("intermediate", feedback_weak) == "intermediate"
    assert _step_difficulty("beginner", feedback_weak) == "beginner"

def test_max_follow_ups_ceiling():
    session = start_session(
        interview_type="technical",
        target_role="Backend Developer",
        difficulty="intermediate"
    )
    present_question(session)
    assert len(session.questions_asked) == 1

    vague_feedback = json.dumps({
        "strengths": ["Clear tone"],
        "improvements": [
            "Your explanation was vague regarding database sharding",
            "Please provide specific metrics on query performance"
        ]
    })

    with patch("crew.interview_manager.evaluate_interview_answer._run", return_value=vague_feedback), \
         patch("crew.interview_manager.prepare_interview_questions._run", return_value=json.dumps({"questions": []})):
        # Turn 1: Weak/vague answer triggering follow-up
        res1 = process_answer(session, "I wrote code for the database.")
        assert res1["is_follow_up"] is True
        assert len(session.questions_asked) == 2
        assert "_followup" in session.questions_asked[-1].id

        # Turn 2: Another weak answer for the follow-up question -> follow-up ceiling MAX=1 reached!
        res2 = process_answer(session, "Still working on SQL.")
        assert res2["is_follow_up"] is False
        assert len(session.questions_asked) == 3
        # Advanced to question index 1
        assert session.question_index == 1

@patch("tools.interview_tools.call_openrouter_api", return_value=None)
def test_max_questions_session_completion(mock_api):
    session = start_session(
        interview_type="behavioral",
        target_role="Product Manager",
        difficulty="intermediate"
    )
    session.question_index = MAX_QUESTIONS_PER_SESSION - 1
    session.questions_asked = [
        QuestionAskedRecord(id=str(MAX_QUESTIONS_PER_SESSION), question="Tell me about a difficult stakeholder.")
    ]

    # Process answer for the 15th question
    res = process_answer(session, "I aligned stakeholder expectations through clear weekly status updates and KPIs.")
    assert session.question_index >= MAX_QUESTIONS_PER_SESSION
    assert session.status == "completed"
    assert res["next_question"] is None

@patch("tools.interview_tools.call_openrouter_api", return_value=None)
def test_manager_sub_router_4a_4b_4c(mock_api):
    bus = EventBus()

    # 4a: Start session
    resp_4a = asyncio.run(process_manager_request_async(
        message="Let's do a technical mock interview",
        resume_text="Senior Python engineer with Kubernetes experience",
        bus=bus
    ))
    assert resp_4a["status"] == "single_intent_delegation"
    assert "interview_session" in resp_4a
    session_data = resp_4a["interview_session"]
    assert session_data["interview_type"] == "technical"
    assert len(session_data["questions_asked"]) == 1

    active_session = InterviewSessionState(**session_data)

    # 4b: Submit answer
    resp_4b = asyncio.run(process_manager_request_async(
        message="I use Prometheus metrics and Kubernetes HPA for automated scaling.",
        resume_text="Senior Python engineer",
        bus=bus,
        interview_session=active_session
    ))
    assert resp_4b["status"] == "single_intent_delegation"
    assert "interview_session" in resp_4b
    updated_session = resp_4b["interview_session"]
    assert len(updated_session["answers_given"]) == 1

    # 4c: Re-present active question (empty message)
    active_session_2 = InterviewSessionState(**updated_session)
    resp_4c = asyncio.run(process_manager_request_async(
        message="",
        resume_text="Senior Python engineer",
        bus=bus,
        interview_session=active_session_2
    ))
    assert resp_4c["status"] == "single_intent_delegation"
    assert "Active Question" in resp_4c["message"]
