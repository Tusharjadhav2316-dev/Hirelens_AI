from typing import Dict, Any, Optional, List, Union, Literal
from pydantic import BaseModel, Field
from schemas.interview_session import InterviewSessionState

class AgentStartedEvent(BaseModel):
    type: Literal["agent_started"] = "agent_started"
    agent: str

class AgentCompletedEvent(BaseModel):
    type: Literal["agent_completed"] = "agent_completed"
    agent: str

class ToolStartedEvent(BaseModel):
    type: Literal["tool_started"] = "tool_started"
    agent: str
    tool: str

class ToolCompletedEvent(BaseModel):
    type: Literal["tool_completed"] = "tool_completed"
    agent: str
    tool: str

class MessageDeltaEvent(BaseModel):
    type: Literal["message_delta"] = "message_delta"
    agent: str
    text: str

class ArtifactEvent(BaseModel):
    type: Literal["artifact"] = "artifact"
    artifact: Dict[str, Any]

class ActionRequiredEvent(BaseModel):
    type: Literal["action_required"] = "action_required"
    actions: List[Dict[str, Any]] = Field(default_factory=list)

class ErrorEvent(BaseModel):
    type: Literal["error"] = "error"
    message: str

class CompletedEvent(BaseModel):
    type: Literal["completed"] = "completed"

AgentEventUnion = Union[
    AgentStartedEvent,
    AgentCompletedEvent,
    ToolStartedEvent,
    ToolCompletedEvent,
    MessageDeltaEvent,
    ArtifactEvent,
    ActionRequiredEvent,
    ErrorEvent,
    CompletedEvent
]

class AttachmentItem(BaseModel):
    id: Optional[str] = None
    name: str
    mimeType: Optional[str] = None
    extractedText: str
    size: Optional[int] = None

class ChatRequest(BaseModel):
    message: Optional[str] = Field(default="", description="User message or prompt")
    messages: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Chat messages history list")
    resume_text: Optional[str] = Field(default="", description="Candidate resume text")
    resume: Optional[Union[Dict[str, Any], str]] = Field(default=None, description="Candidate resume object or text")
    job_description: Optional[str] = Field(default=None, description="Target job description")
    attachments: Optional[List[AttachmentItem]] = Field(default_factory=list, description="Uploaded supporting career documents")
    interview_session: Optional[InterviewSessionState] = Field(default=None, description="Active mock interview session state")

