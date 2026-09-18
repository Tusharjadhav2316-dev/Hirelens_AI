import pytest
from pydantic import ValidationError
from schemas.speech_signals import SpeechSignals
from tools.interview_tools import INTERVIEW_GUARDRAIL
from crew.interview_manager import _should_coach

def test_speech_signals_valid_instantiation():
    signals = SpeechSignals(
        word_count=120,
        duration_seconds=45.0,
        words_per_minute=160,
        filler_word_counts={"um": 3, "like": 2},
        total_fillers=5,
        repeated_phrases=["in terms of"],
        long_pause_count=1,
        answer_length_band="optimal"
    )
    assert signals.word_count == 120
    assert signals.words_per_minute == 160
    assert signals.total_fillers == 5
    assert signals.answer_length_band == "optimal"

def test_speech_signals_extra_forbid_rejects_emotion_and_confidence_injections():
    """Verify that model_config extra='forbid' strictly prevents emotion/confidence fields."""
    with pytest.raises(ValidationError) as exc_info:
        SpeechSignals(
            word_count=50,
            confidence_score=0.85, # Forbidden injection
        )
    assert "extra_forbidden" in str(exc_info.value)

    with pytest.raises(ValidationError) as exc_info2:
        SpeechSignals(
            word_count=50,
            emotion="nervous", # Forbidden injection
        )
    assert "extra_forbidden" in str(exc_info2.value)

    with pytest.raises(ValidationError) as exc_info3:
        SpeechSignals(
            word_count=50,
            tone="hesitant", # Forbidden injection
        )
    assert "extra_forbidden" in str(exc_info3.value)

    with pytest.raises(ValidationError) as exc_info4:
        SpeechSignals(
            word_count=50,
            honesty_rating=0.99, # Forbidden injection
        )
    assert "extra_forbidden" in str(exc_info4.value)

def test_guardrail_contains_no_inferred_state_clause():
    """Verify INTERVIEW_GUARDRAIL explicitly forbids characterizing emotional state or confidence."""
    assert "Delivery observations may be described and coached using countable facts" in INTERVIEW_GUARDRAIL
    assert "The candidate's internal emotional state, confidence level, honesty, or personality MUST NEVER be characterized or scored" in INTERVIEW_GUARDRAIL

def test_should_coach_with_speech_signals():
    """Verify coaching decision uses observable filler counts and WPM without numeric confidence scoring."""
    # Fast pace / high fillers triggers coaching in coaching mode
    high_filler_signals = {"total_fillers": 7, "words_per_minute": 150}
    assert _should_coach({}, "coaching", high_filler_signals) is True

    # Normal signals and strong content do not trigger extra coaching
    normal_signals = {"total_fillers": 1, "words_per_minute": 130}
    assert _should_coach({"improvements": [], "strengths": ["Clear", "Specific"]}, "coaching", normal_signals) is False

    # Realistic mock mode strictly suppresses live coaching regardless of signals
    assert _should_coach({}, "realistic_mock", high_filler_signals) is False
