import os
import sys
import json
import asyncio
from unittest.mock import patch
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from schemas.interview_session import InterviewSessionState, QuestionAskedRecord, AnswerGivenRecord
from schemas.interview_report import InterviewReportArtifactData
from schemas.interview_feedback import InterviewFeedbackArtifactData
from crew.event_bus import EventBus
from crew.manager import process_manager_request_async
from crew.interview_manager import (
    start_session,
    present_question,
    process_answer,
    complete_session,
    MAX_QUESTIONS_PER_SESSION,
    MAX_FOLLOW_UPS_PER_QUESTION
)
from tools.interview_tools import (
    prepare_interview_questions,
    evaluate_interview_answer,
    generate_interview_report,
    INTERVIEW_GUARDRAIL
)

def test_full_interview_lifecycle_end_to_end():
    """
    End-to-end test simulating a complete candidate interview session:
    1. Start technical session for Fullstack Engineer with resume & JD.
    2. Present first question.
    3. Candidate provides vague answer -> triggers adaptive follow-up question.
    4. Candidate answers follow-up with strong answer -> difficulty progresses.
    5. Final question answered -> session completes, generating qualitative report.
    """
    resume_sample = "Fullstack Engineer with 4 years building React, Node.js, and PostgreSQL applications."
    jd_sample = "Senior Fullstack Engineer: Requires React, Node.js, AWS, and system design experience."

    # 1. Start session
    session = start_session(
        interview_type="technical",
        target_role="Senior Fullstack Engineer",
        difficulty="intermediate",
        resume_text=resume_sample,
        job_description=jd_sample
    )
    assert session.status == "in_progress"
    assert session.interview_type == "technical"
    assert session.target_role == "Senior Fullstack Engineer"

    # 2. Present initial question
    presented = present_question(session, resume_text=resume_sample, job_description=jd_sample)
    session = presented["session"]
    assert len(session.questions_asked) == 1
    q1 = session.questions_asked[0]
    assert q1.id == "1"
    assert len(q1.question) > 0

    # 3. Answer 1: Vague answer to trigger follow-up
    vague_feedback_mock = json.dumps({
        "clarity": "Answer lacked specificity on architecture.",
        "structure": "Needs STAR format.",
        "specificity": "No metrics or trade-offs mentioned.",
        "technical_depth": "Basic overview only.",
        "strengths": ["Clear tone"],
        "improvements": [
            "Your explanation was unclear and vague regarding database performance",
            "Include specific metrics and trade-offs"
        ],
        "suggested_answer_direction": "Highlight specific caching and query optimization strategies."
    })

    with patch("crew.interview_manager.evaluate_interview_answer._run", return_value=vague_feedback_mock):
        ans1_res = process_answer(session, "I worked on databases and made them fast.", resume_text=resume_sample)
        session = ans1_res["session"]
        assert ans1_res["is_follow_up"] is True
        assert len(session.questions_asked) == 2
        assert "_followup" in session.questions_asked[-1].id

    # 4. Answer 2 (Follow-up): Strong answer -> should advance base question and step difficulty
    strong_feedback_mock = json.dumps({
        "clarity": "Very clear and articulate.",
        "structure": "Followed STAR structure effectively.",
        "specificity": "Provided concrete latency metrics (-40% p99).",
        "technical_depth": "Deep explanation of Redis caching and connection pooling.",
        "strengths": [
            "Clear technical depth in caching layer",
            "Strong articulation of trade-offs and latency metrics"
        ],
        "improvements": ["Minor: could mention automated failover setup"],
        "suggested_answer_direction": "Continue leveraging quantitative results."
    })

    with patch("crew.interview_manager.evaluate_interview_answer._run", return_value=strong_feedback_mock), \
         patch("crew.interview_manager.prepare_interview_questions._run", return_value=json.dumps({"questions": []})):
        ans2_res = process_answer(session, "We introduced Redis caching with TTLs and connection pools, reducing p99 latency from 450ms to 80ms under 5k RPS.", resume_text=resume_sample)
        session = ans2_res["session"]
        assert ans2_res["is_follow_up"] is False
        assert session.question_index == 1
        assert session.difficulty == "advanced"

    # 5. Fast-forward to session completion (MAX_QUESTIONS reached)
    session.question_index = MAX_QUESTIONS_PER_SESSION - 1
    session.questions_asked.append(QuestionAskedRecord(id=str(MAX_QUESTIONS_PER_SESSION), question="How do you handle microservice failures?"))

    with patch("tools.interview_tools.call_openrouter_api", return_value=None):
        final_res = process_answer(session, "We implemented circuit breakers and dead-letter queues in RabbitMQ.", resume_text=resume_sample)
        session = final_res["session"]
        assert session.status == "completed"
        assert final_res["report"] is not None
        report_data = final_res["report"]
        assert "readiness_by_category" in report_data
        assert "score" not in report_data
        assert "overall_score" not in report_data

def test_full_manager_routing_with_all_events():
    """
    Tests full async manager routing with EventBus capturing all streaming events.
    Verifies zero new event types across the session stream.
    """
    async def run_test():
        bus = EventBus()
        task = asyncio.create_task(
            process_manager_request_async(
                message="Start an HR mock interview",
                resume_text="Operations Manager with 5 years experience.",
                job_description=None,
                attachments=[],
                bus=bus,
                interview_session=None
            )
        )
        events = [e async for e in bus.stream()]
        result = await task

        assert result["status"] == "single_intent_delegation"
        assert "interview_session" in result
        assert len(events) > 0
        valid_types = {
            "agent_started", "agent_completed", "tool_started", "tool_completed",
            "message_delta", "artifact", "action_required", "error", "completed"
        }
        for ev in events:
            assert ev["type"] in valid_types
            assert ev["type"] != "unknown"

    asyncio.run(run_test())

def test_zero_score_and_non_fabrication_contract():
    """
    Asserts that the system strictly adheres to non-fabrication and zero-score rules.
    """
    assert "Never fabricate" in INTERVIEW_GUARDRAIL
    assert "Never predict hiring decisions" in INTERVIEW_GUARDRAIL
    assert "Never claim a candidate definitely passed or failed" in INTERVIEW_GUARDRAIL

    # Feedback validation
    fb = InterviewFeedbackArtifactData(
        question="How do you handle conflict in teams?",
        answer="I listen actively and find common goals.",
        clarity="Good clarity",
        structure="Used STAR method",
        specificity="Specific examples",
        technical_depth="Solid depth",
        strengths=["Direct response"],
        improvements=["Add more metrics"],
        suggested_answer_direction="Highlight impact"
    )
    fb_dump = fb.model_dump()
    for forbidden in ["score", "passed", "failed", "hired", "rejected", "hire_probability"]:
        assert forbidden not in fb_dump

    # Report validation
    rep = InterviewReportArtifactData(
        interview_type="technical",
        target_role="Fullstack Engineer",
        questions_asked=5,
        readiness_by_category={"Technical": "Strong"},
        strengths=["Clear logic"],
        improvement_areas=["Quantify scale"],
        priority_topics=["Distributed locking"],
        note="Coaching recommendations only"
    )
    rep_dump = rep.model_dump()
    for forbidden in ["score", "overall_score", "passed", "failed", "hired"]:
        assert forbidden not in rep_dump
