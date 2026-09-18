from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class CategoryWeight(BaseModel):
    category: str = Field(..., description="Interview category name, e.g., 'Domain Knowledge', 'Problem Solving'")
    weight: float = Field(..., ge=0.0, le=1.0, description="Relative emphasis weight between 0.0 and 1.0")

    model_config = {
        "extra": "forbid"
    }

class RoleIntelligence(BaseModel):
    target_role: str = Field(..., description="Target role name as requested")
    role_summary: str = Field(..., description="Concise overview of the role scope and core responsibilities")
    likely_competencies: List[str] = Field(..., min_length=1, description="Core competencies and skills required for this role")
    interview_categories: List[CategoryWeight] = Field(..., min_length=1, description="Decomposed interview evaluation categories with weights")
    technical_balance: Literal["mostly_technical", "balanced", "mostly_non_technical"] = Field(..., description="Ratio of domain/technical versus behavioral/interpersonal focus")
    suggested_topics: List[str] = Field(..., min_length=1, description="Key discussion topics and case areas to assess in interviews")
    evidence_basis: Literal["job_description", "role_inference", "role_inference_plus_resume"] = Field(..., description="Source of truth used for role decomposition")
    assumptions: List[str] = Field(default_factory=list, description="Explicit assumptions made when job description is omitted or incomplete")

    model_config = {
        "extra": "forbid"
    }
