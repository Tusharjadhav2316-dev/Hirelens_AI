import os
import sys
import pytest
from pydantic import ValidationError

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from schemas.interview_session import (
    InterviewSessionState,
    QuestionAskedRecord,
    AnswerGivenRecord,
)
from crew.interview_manager import start_session, advance_session

def test_interview_session_defaults():
    session = InterviewSessionState(session_id="test-session-123")
    assert session.session_id == "test-session-123"
    assert session.interview_type == "mixed"
    assert session.target_role == "Software Engineer"
    assert session.difficulty == "intermediate"
    assert session.question_index == 0
    assert session.questions_asked == []
    assert session.answers_given == []
    assert session.status == "in_progress"

def test_interview_session_invalid_interview_type():
    with pytest.raises(ValidationError):
        InterviewSessionState(
            session_id="test-session-123",
            interview_type="invalid_type"  # type: ignore
        )

def test_interview_session_invalid_difficulty():
    with pytest.raises(ValidationError):
        InterviewSessionState(
            session_id="test-session-123",
            difficulty="god_mode"  # type: ignore
        )

def test_interview_session_roundtrip_serialization():
    data = {
        "session_id": "sess-456",
        "interview_type": "technical",
        "target_role": "Backend Engineer",
        "difficulty": "advanced",
        "question_index": 2,
        "questions_asked": [
            {"id": "q1", "question": "Explain indexing in PostgreSQL", "category": "Database", "difficulty": "Medium"},
            {"id": "q2", "question": "How does Kafka handle partitioning?", "category": "System Design", "difficulty": "Hard"}
        ],
        "answers_given": [
            {"question_id": "q1", "answer": "B-trees are used by default...", "feedback": {"clarity": "Good"}}
        ],
        "status": "in_progress"
    }
    session = InterviewSessionState.model_validate(data)
    assert session.session_id == "sess-456"
    assert session.interview_type == "technical"
    assert len(session.questions_asked) == 2
    assert len(session.answers_given) == 1
    assert session.answers_given[0].question_id == "q1"

    dumped = session.model_dump()
    assert dumped["session_id"] == "sess-456"
    assert dumped["target_role"] == "Backend Engineer"

def test_interview_manager_start_and_advance_session():
    session = start_session(
        interview_type="behavioral",
        target_role="Product Manager",
        difficulty="beginner"
    )
    assert session.session_id is not None
    assert len(session.session_id) > 0
    assert session.interview_type == "behavioral"
    assert session.target_role == "Product Manager"
    assert session.difficulty == "beginner"
    assert session.question_index == 0

    advanced = advance_session(session)
    assert advanced.session_id == session.session_id
