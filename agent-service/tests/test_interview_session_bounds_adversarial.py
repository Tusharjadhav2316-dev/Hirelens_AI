import os
import sys
import json
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from schemas.interview_session import InterviewSessionState, QuestionAskedRecord, AnswerGivenRecord
from crew import interview_manager
from crew.interview_manager import (
    MAX_QUESTIONS_PER_SESSION,
    MAX_FOLLOW_UPS_PER_QUESTION,
    process_answer,
    present_question,
    start_session,
    complete_session
)

def test_negative_question_index_clamped_and_handled_safely():
    """
    Asserts that a tampered negative question_index (e.g., -999) is clamped to >= 0
    and does not bypass completion logic or crash the flow.
    """
    session = InterviewSessionState(
        session_id="adversarial-test-1",
        interview_type="technical",
        target_role="Backend Developer",
        difficulty="intermediate",
        question_index=-999,
        questions_asked=[
            QuestionAskedRecord(id="1", question="Tell me about indexing.", category="Technical", difficulty="Medium")
        ],
        answers_given=[],
        status="in_progress"
    )
    
    result = process_answer(session, "Indexing creates B-trees to speed up query retrieval.", resume_text=None)
    updated_session = result["session"]
    assert updated_session.question_index >= 0

def test_oversized_questions_asked_list_is_capped():
    """
    Asserts that a tampered payload with > MAX_QUESTIONS_PER_SESSION fabricated questions
    is clamped to <= MAX_QUESTIONS_PER_SESSION and transitions to completion.
    """
    fabricated_questions = [
        QuestionAskedRecord(id=str(i), question=f"Fabricated question {i}", category="Technical", difficulty="Medium")
        for i in range(35)
    ]
    
    session = InterviewSessionState(
        session_id="adversarial-test-2",
        interview_type="technical",
        target_role="DevOps Engineer",
        difficulty="intermediate",
        question_index=20,
        questions_asked=fabricated_questions,
        answers_given=[],
        status="in_progress"
    )
    
    result = process_answer(session, "I use Docker and Kubernetes for container orchestration.", resume_text=None)
    updated_session = result["session"]
    assert len(updated_session.questions_asked) <= MAX_QUESTIONS_PER_SESSION
    assert updated_session.status == "completed" or updated_session.question_index >= MAX_QUESTIONS_PER_SESSION

def test_repeated_ambiguous_answers_never_exceed_one_follow_up():
    """
    Simulates sending repeated vague/ambiguous answers to force follow-ups,
    asserting that follow-ups never exceed MAX_FOLLOW_UPS_PER_QUESTION (1) per base question.
    """
    session = start_session(
        interview_type="behavioral",
        target_role="Product Manager",
        difficulty="intermediate"
    )
    present_res = present_question(session)
    session = present_res["session"]
    initial_q_id = session.questions_asked[0].id
    
    # First vague answer triggers follow-up
    vague_answer_1 = "I just talked to people and it worked out vaguely without specific metrics or details."
    res_1 = process_answer(session, vague_answer_1)
    session = res_1["session"]
    
    # Check if follow up was triggered
    if res_1.get("is_follow_up"):
        assert len(session.questions_asked) == 2
        assert "_followup" in session.questions_asked[-1].id
        
        # Second vague answer to the follow-up question MUST NOT trigger another follow-up
        vague_answer_2 = "Still no metrics or specific tools, it was just very vague and unclear."
        res_2 = process_answer(session, vague_answer_2)
        session = res_2["session"]
        
        # Must advance question_index and present a new base question, NOT another follow-up
        assert res_2.get("is_follow_up") is False
        assert not session.questions_asked[-1].id.endswith("_followup_followup")
        assert session.question_index == 1

def test_adversarial_start_session_sanitizes_invalid_enums():
    """
    Asserts that start_session sanitizes invalid interview_type or difficulty values.
    """
    session = start_session(
        interview_type="invalid_type",  # type: ignore
        target_role="Staff Architect",
        difficulty="legendary"  # type: ignore
    )
    assert session.interview_type == "mixed"
    assert session.difficulty == "intermediate"

def test_present_question_clamps_negative_index():
    """
    Asserts that present_question handles negative index tampering safely.
    """
    session = InterviewSessionState(
        session_id="adversarial-test-3",
        interview_type="mixed",
        target_role="Data Engineer",
        difficulty="beginner",
        question_index=-50,
        questions_asked=[],
        answers_given=[],
        status="in_progress"
    )
    res = present_question(session)
    assert res["session"].question_index >= 0
    assert len(res["session"].questions_asked) >= 1
