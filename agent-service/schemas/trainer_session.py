from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from schemas.role_intelligence import RoleIntelligence
from schemas.interview_session import QuestionAskedRecord

class TrainerAnswerRecord(BaseModel):
    question_id: str = Field(..., description="ID of the question being answered")
    answer: str = Field(..., description="Transcript text or typed response")
    feedback: Optional[Dict[str, Any]] = Field(default=None, description="Structured feedback on the answer")
    speech_signals: Optional[Dict[str, Any]] = Field(default=None, description="Observable speech and delivery signals")
    visual_signals: Optional[Dict[str, Any]] = Field(default=None, description="Geometric visual framing signals")
    retry_count: int = Field(default=0, ge=0, le=1, description="Number of retries attempted for this question (max 1)")
    submitted_at: Optional[str] = Field(default=None, description="ISO timestamp of submission")

    model_config = {
        "extra": "forbid"
    }

class InterviewTrainerSession(BaseModel):
    session_id: str = Field(..., description="Unique UUID for this trainer session")
    target_role: str = Field(..., description="Target role name (source of truth from user)")
    interview_type: Literal["hr", "behavioral", "technical", "mixed", "role_specific"] = Field(
        default="mixed", description="Category focus of the interview"
    )
    difficulty: Literal["beginner", "intermediate", "advanced"] = Field(
        default="intermediate", description="Target difficulty level"
    )
    training_mode: Literal["coaching", "realistic_mock"] = Field(
        default="coaching", description="Interactive coaching vs realistic mock mode"
    )
    role_intelligence: Optional[RoleIntelligence] = Field(
        default=None, description="Structured role intelligence decomposition"
    )
    question_index: int = Field(default=0, ge=0, description="Current question index in progress")
    questions_asked: List[QuestionAskedRecord] = Field(
        default_factory=list, description="List of questions presented to candidate"
    )
    answers_given: List[TrainerAnswerRecord] = Field(
        default_factory=list, description="List of candidate answers and evaluations"
    )
    voice_enabled: bool = Field(default=True, description="Whether voice/mic input mode is enabled")
    camera_enabled: bool = Field(default=False, description="Whether camera framing assistance is enabled")
    status: Literal["setup", "in_progress", "paused", "completed", "abandoned"] = Field(
        default="setup", description="Lifecycle state of the training session"
    )
    started_at: Optional[str] = Field(default=None, description="ISO timestamp of session start")
    completed_at: Optional[str] = Field(default=None, description="ISO timestamp of session completion")
    final_report: Optional[Dict[str, Any]] = Field(default=None, description="Final qualitative report data")
    created_at: Optional[str] = Field(default=None, description="ISO timestamp of session creation")
    updated_at: Optional[str] = Field(default=None, description="ISO timestamp of last update")

    model_config = {
        "extra": "forbid"
    }
