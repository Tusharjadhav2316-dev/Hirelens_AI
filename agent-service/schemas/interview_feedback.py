from typing import List, Optional
from pydantic import BaseModel

class InterviewFeedbackArtifactData(BaseModel):
    """Formalized data schema for interview answer evaluation feedback artifact."""
    question: str
    answer: str
    clarity: str
    structure: str
    specificity: str
    technical_depth: str
    strengths: List[str]
    improvements: List[str]
    suggested_answer_direction: str
