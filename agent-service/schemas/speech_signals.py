from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class SpeechSignals(BaseModel):
    """
    Observable speech delivery metrics computed deterministically from candidate audio/transcript.
    Strictly forbids emotion, tone, pitch, or confidence inference fields.
    """
    model_config = {"extra": "forbid"}

    word_count: int = Field(ge=0, description="Total words spoken in the answer")
    duration_seconds: Optional[float] = Field(default=None, ge=0.0, description="Elapsed recording duration in seconds")
    words_per_minute: Optional[int] = Field(default=None, ge=0, description="Overall speaking pace in words per minute")
    filler_word_counts: Dict[str, int] = Field(default_factory=dict, description="Count per identified filler word")
    total_fillers: int = Field(default=0, ge=0, description="Total count of all filler words")
    repeated_phrases: List[str] = Field(default_factory=list, description="Immediate 2-3 word phrase repetitions detected")
    long_pause_count: int = Field(default=0, ge=0, description="Count of coarse pauses exceeding 2.5s")
    answer_length_band: str = Field(
        default="optimal",
        description="Banded length assessment: too_brief, concise, optimal, lengthy, or overlong"
    )
