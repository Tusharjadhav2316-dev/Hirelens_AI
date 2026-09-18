import os
import sys
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from pydantic import ValidationError
from schemas.trainer_session import InterviewTrainerSession, TrainerAnswerRecord
from schemas.interview_session import QuestionAskedRecord
from schemas.role_intelligence import RoleIntelligence

class TestTrainerSessionSchema:
    def test_valid_trainer_session_creation(self):
        role_intel = RoleIntelligence(
            target_role="Product Manager",
            role_summary="Leads product vision and execution.",
            likely_competencies=["Product Strategy", "User Research", "Agile Execution"],
            interview_categories=[
                {"category": "Product Sense", "weight": 0.5},
                {"category": "Execution", "weight": 0.5}
            ],
            technical_balance="balanced",
            suggested_topics=["Feature prioritization", "Stakeholder management"],
            evidence_basis="role_inference",
            assumptions=["Standard PM market requirements."]
        )

        session = InterviewTrainerSession(
            session_id="test-session-123",
            target_role="Product Manager",
            interview_type="mixed",
            difficulty="intermediate",
            training_mode="coaching",
            role_intelligence=role_intel,
            status="setup"
        )

        assert session.session_id == "test-session-123"
        assert session.target_role == "Product Manager"
        assert session.status == "setup"
        assert len(session.questions_asked) == 0
        assert len(session.answers_given) == 0

    def test_reject_audio_url_injection(self):
        """Rejects attempt to persist audio_url in InterviewTrainerSession."""
        data = {
            "session_id": "test-session-123",
            "target_role": "Product Manager",
            "interview_type": "mixed",
            "difficulty": "intermediate",
            "training_mode": "coaching",
            "audio_url": "https://storage.googleapis.com/audio/test.wav"  # FORBIDDEN
        }
        with pytest.raises(ValidationError):
            InterviewTrainerSession.model_validate(data)

    def test_reject_video_url_injection(self):
        """Rejects attempt to persist video_url in InterviewTrainerSession."""
        data = {
            "session_id": "test-session-123",
            "target_role": "Product Manager",
            "video_url": "https://storage.googleapis.com/video/test.mp4"  # FORBIDDEN
        }
        with pytest.raises(ValidationError):
            InterviewTrainerSession.model_validate(data)

    def test_reject_raw_frames_in_answer_record(self):
        """Rejects attempt to persist raw_frames in TrainerAnswerRecord."""
        data = {
            "question_id": "q1",
            "answer": "This is my answer.",
            "raw_frames": ["base64frame1", "base64frame2"]  # FORBIDDEN
        }
        with pytest.raises(ValidationError):
            TrainerAnswerRecord.model_validate(data)

    def test_reject_audio_blob_in_answer_record(self):
        """Rejects attempt to persist audio_blob in TrainerAnswerRecord."""
        data = {
            "question_id": "q1",
            "answer": "This is my answer.",
            "audio_blob": "data:audio/wav;base64,AAA..."  # FORBIDDEN
        }
        with pytest.raises(ValidationError):
            TrainerAnswerRecord.model_validate(data)

    def test_retry_count_bounded(self):
        """Ensures retry_count cannot exceed 1."""
        valid_ans = TrainerAnswerRecord(
            question_id="q1",
            answer="Answer with 1 retry.",
            retry_count=1
        )
        assert valid_ans.retry_count == 1

        with pytest.raises(ValidationError):
            TrainerAnswerRecord(
                question_id="q1",
                answer="Answer with 2 retries.",
                retry_count=2  # Exceeds max 1
            )

    def test_turn_idempotency_deduplication_logic(self):
        """Simulates turn appending and updating ensuring deduplication by question_id."""
        answers = [
            TrainerAnswerRecord(question_id="q1", answer="First attempt", retry_count=0)
        ]

        # Retry on same question replaces or updates the answer record, never appends a duplicate
        new_answer = TrainerAnswerRecord(question_id="q1", answer="Second attempt with coaching", retry_count=1)

        # Deduplication algorithm
        existing_idx = next((i for i, a in enumerate(answers) if a.question_id == new_answer.question_id), None)
        if existing_idx is not None:
            answers[existing_idx] = new_answer
        else:
            answers.append(new_answer)

        assert len(answers) == 1
        assert answers[0].answer == "Second attempt with coaching"
        assert answers[0].retry_count == 1

        # Distinct question appends cleanly
        q2_ans = TrainerAnswerRecord(question_id="q2", answer="Q2 response", retry_count=0)
        existing_idx_q2 = next((i for i, a in enumerate(answers) if a.question_id == q2_ans.question_id), None)
        if existing_idx_q2 is not None:
            answers[existing_idx_q2] = q2_ans
        else:
            answers.append(q2_ans)

        assert len(answers) == 2
        assert answers[1].question_id == "q2"
