from typing import List, Dict, Literal
from pydantic import BaseModel, ConfigDict

class InterviewReportArtifactData(BaseModel):
    """
    Formalized qualitative-only interview report schema.
    Structurally forbids any numeric scores or hiring verdicts via extra='forbid'.
    """
    interview_type: str
    target_role: str
    questions_asked: int
    readiness_by_category: Dict[str, Literal["Strong", "Moderate", "Needs Improvement"]]
    strengths: List[str]
    improvement_areas: List[str]
    priority_topics: List[str]
    note: str = "These are coaching recommendations, not guaranteed measurements."

    model_config = ConfigDict(extra="forbid")
