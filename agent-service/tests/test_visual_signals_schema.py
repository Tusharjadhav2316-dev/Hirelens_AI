import pytest
from pydantic import ValidationError
from schemas.visual_signals import VisualSignals
from tools.interview_tools import INTERVIEW_GUARDRAIL

def test_visual_signals_valid_instantiation():
    signals = VisualSignals(
        camera_enabled=True,
        face_detected_ratio=0.95,
        out_of_frame_events=1,
        out_of_frame_total_seconds=2.5,
        framing_note="Good centered framing at eye level"
    )
    assert signals.camera_enabled is True
    assert signals.face_detected_ratio == 0.95
    assert signals.out_of_frame_events == 1
    assert signals.framing_note == "Good centered framing at eye level"

def test_visual_signals_extra_forbid_rejects_emotion_and_biometric_injections():
    """Verify that model_config extra='forbid' strictly prevents emotion/expression fields."""
    with pytest.raises(ValidationError) as exc_info1:
        VisualSignals(
            camera_enabled=True,
            emotion="happy", # Forbidden injection
        )
    assert "extra_forbidden" in str(exc_info1.value)

    with pytest.raises(ValidationError) as exc_info2:
        VisualSignals(
            camera_enabled=True,
            expression="smiling", # Forbidden injection
        )
    assert "extra_forbidden" in str(exc_info2.value)

    with pytest.raises(ValidationError) as exc_info3:
        VisualSignals(
            camera_enabled=True,
            attention_score=0.88, # Forbidden injection
        )
    assert "extra_forbidden" in str(exc_info3.value)

    with pytest.raises(ValidationError) as exc_info4:
        VisualSignals(
            camera_enabled=True,
            gaze_direction="center", # Forbidden injection
        )
    assert "extra_forbidden" in str(exc_info4.value)

    with pytest.raises(ValidationError) as exc_info5:
        VisualSignals(
            camera_enabled=True,
            age=28, # Forbidden injection
        )
    assert "extra_forbidden" in str(exc_info5.value)

def test_guardrail_contains_no_inferred_state_clause():
    """Verify INTERVIEW_GUARDRAIL explicitly forbids characterizing emotional state or confidence."""
    assert "The candidate's internal emotional state, confidence level, honesty, or personality MUST NEVER be characterized or scored" in INTERVIEW_GUARDRAIL
