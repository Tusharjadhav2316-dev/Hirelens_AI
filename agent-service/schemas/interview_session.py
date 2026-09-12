from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

class QuestionAskedRecord(BaseModel):
    id: str
    question: str
    category: Optional[str] = None
    difficulty: Optional[str] = None

class AnswerGivenRecord(BaseModel):
    question_id: str
    answer: str
    feedback: Optional[Dict[str, Any]] = None

class InterviewSessionState(BaseModel):
    session_id: str
    interview_type: Literal["hr", "behavioral", "technical", "mixed"] = "mixed"
    target_role: str = "Software Engineer"
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    question_index: int = 0
    questions_asked: List[QuestionAskedRecord] = Field(default_factory=list)
    answers_given: List[AnswerGivenRecord] = Field(default_factory=list)
    status: Literal["in_progress", "completed"] = "in_progress"
