from pydantic import BaseModel, Field
from typing import Optional

class VisualSignals(BaseModel):
    """
    Observable geometric visual framing signals computed deterministically on the client.
    Strictly forbids emotion, expression, gaze, attention, age, gender, or confidence fields.
    """
    model_config = {"extra": "forbid"}

    camera_enabled: bool = Field(default=False, description="Whether camera was enabled during the turn")
    face_detected_ratio: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Proportion of sampled frames where a face was detected in frame (0.0 to 1.0)"
    )
    out_of_frame_events: int = Field(
        default=0,
        ge=0,
        description="Number of times the candidate moved out of frame"
    )
    out_of_frame_total_seconds: float = Field(
        default=0.0,
        ge=0.0,
        description="Total duration in seconds spent out of camera frame"
    )
    framing_note: Optional[str] = Field(
        default=None,
        description="Factual, geometric framing observation (e.g., 'Centered', 'Camera angle low', 'Far from camera')"
    )
