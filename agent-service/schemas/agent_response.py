from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AgentAction(BaseModel):
    tool: str
    tool_input: Dict[str, Any] = Field(default_factory=dict)
    log: Optional[str] = None

class Artifact(BaseModel):
    id: str
    type: str
    title: str
    data: Dict[str, Any] = Field(default_factory=dict)

class AgentResponse(BaseModel):
    output: str
    artifacts: List[Artifact] = Field(default_factory=list)
    actions_taken: List[AgentAction] = Field(default_factory=list)
