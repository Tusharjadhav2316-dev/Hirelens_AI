# Sprint 9 — Day 2

## Day Title
Interview Manager Module, Session State Schema, and Contract Decisions

## Objective
Build `agent-service/crew/interview_manager.py` as a plain Python module (not a CrewAI `Agent`), define the `InterviewSessionState` Pydantic model and its TypeScript mirror, and lock in the two foundational Day 1-derived decisions: no new CrewAI agents, and no new streaming event types. No question generation or answer evaluation logic yet — today is the session-state skeleton only.

## Why This Day Exists
Every later Sprint 9 day (question personalization, mock interview flow, answer evaluation, UI) needs a settled answer to "where does session state live and what shape is it" before it can be built. Getting this decision right — and explicitly grounded in Day 1's routing-mechanism finding — prevents Sprint 9 from repeating Sprint 8's documentation-vs-reality gap by designing against an idealized architecture instead of the real one.

## Repository Evidence / Current State
Per Day 1: no session concept exists anywhere. `agent-service/crew/workflows.py` is the existing precedent for "plain module handling multi-step logic, not a CrewAI Agent" (Sprint 8's application-workflow sequencing). `agent-service/schemas/agent_response.py` and `events.py` define the existing `ChatRequest`/`AgentEvent` shapes that `interview_session` must extend without breaking.

## Concepts
- Request-scoped vs. persistent state (recap of the Sprint 8 precedent for `resume`/`attachments`, now applied to interview sessions).
- Why "Interview Manager" can be a real, named architectural component in documentation and code structure without being a CrewAI `Agent` class — the name describes a *responsibility*, not a specific framework primitive.

## Prerequisites
Day 1 complete: routing mechanism, unreachable tool, and UI gap all confirmed.

## Setup
No new dependencies.

## Resources
- `agent-service/crew/workflows.py` — structural precedent
- `agent-service/schemas/events.py` — existing `ChatRequest` schema to extend

## Files to Inspect
- `agent-service/schemas/events.py` (`ChatRequest` definition)
- `agent-service/crew/workflows.py`

## Files to Create
- `agent-service/schemas/interview_session.py` — `InterviewSessionState` Pydantic model
- `agent-service/crew/interview_manager.py` — session lifecycle functions (skeleton today: `start_session`, `advance_session` stubs returning fixed sample data; real logic Days 4–6)
- `agent-service/tests/test_interview_session_schema.py`

## Files to Modify
- `agent-service/schemas/events.py` — `ChatRequest` gains an optional `interview_session: Optional[InterviewSessionState] = None` field
- `frontend/types/agent.ts` — mirror `InterviewSessionState` as a TypeScript interface; extend `AgentStreamPayload` with optional `interview_session`

## Architecture Impact
Adds one new schema and one new plain module. Does not touch `manager.py`'s routing yet (that's Day 5) or any existing agent/tool. `ChatRequest`'s new field is optional, so every existing non-interview request path is unaffected — confirmed by re-running Sprint 8's full test suite unchanged at the end of today.

## Data Flow
```
(Skeleton only today - no real routing wired yet)
interview_manager.start_session(role, jd, resume, interview_type, difficulty, count) -> InterviewSessionState (question_index=0, questions_asked=[], status="in_progress")
interview_manager.advance_session(session, answer) -> InterviewSessionState (updated, stubbed - real logic Day 5/6)
```

## Implementation Plan

### Step 1 — `InterviewSessionState` Schema
```python
# schemas/interview_session.py
from pydantic import BaseModel
from typing import Literal, Optional

class QuestionAskedRecord(BaseModel):
    id: str
    question: str
    category: Optional[str] = None
    difficulty: Optional[str] = None

class AnswerGivenRecord(BaseModel):
    question_id: str
    answer: str
    feedback: Optional[dict] = None

class InterviewSessionState(BaseModel):
    session_id: str
    interview_type: Literal["hr", "behavioral", "technical", "mixed"] = "mixed"
    target_role: str = "Software Engineer"
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    question_index: int = 0
    questions_asked: list[QuestionAskedRecord] = []
    answers_given: list[AnswerGivenRecord] = []
    status: Literal["in_progress", "completed"] = "in_progress"
```

### Step 2 — Extend `ChatRequest`
```python
class ChatRequest(BaseModel):
    # ... existing fields (message, messages, resume, resume_text, job_description, attachments) unchanged ...
    interview_session: Optional[InterviewSessionState] = None
```
Optional with no default-breaking change — every existing caller (Sprint 8's frontend, all existing tests) continues to work with this field simply absent.

### Step 3 — `interview_manager.py` Skeleton
```python
import uuid
from schemas.interview_session import InterviewSessionState

def start_session(interview_type: str, target_role: str, difficulty: str) -> InterviewSessionState:
    return InterviewSessionState(
        session_id=str(uuid.uuid4()),
        interview_type=interview_type,
        target_role=target_role,
        difficulty=difficulty,
    )

def advance_session(session: InterviewSessionState) -> InterviewSessionState:
    """Stub for Day 2 - real question-generation wiring happens Day 4/5."""
    return session
```

### Step 4 — TypeScript Mirror
```typescript
// types/agent.ts additions
export interface QuestionAskedRecord { id: string; question: string; category?: string; difficulty?: string; }
export interface AnswerGivenRecord { questionId: string; answer: string; feedback?: InterviewFeedbackArtifactData; }
export interface InterviewSessionState {
  sessionId: string;
  interviewType: "hr" | "behavioral" | "technical" | "mixed";
  targetRole: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  questionIndex: number;
  questionsAsked: QuestionAskedRecord[];
  answersGiven: AnswerGivenRecord[];
  status: "in_progress" | "completed";
}
// AgentStreamPayload gains: interview_session?: InterviewSessionState;
```

### Step 5 — Lock In the Two Foundational Decisions
Confirm in code review today (not deferred) that: (a) no `Agent(...)` object is created for interview session logic anywhere in this day's diff, and (b) no new string is added to `AgentEvent`'s type union in either `events.py` or `agentStreamClient.ts`. These are the two decisions Day 1's audit made possible and Day 2 is responsible for actually holding to.

## Ready-to-Paste Antigravity Prompt
"Create `agent-service/schemas/interview_session.py` defining an `InterviewSessionState` Pydantic model exactly as specified in `Sprint_09/Day_02.md`. Add an optional `interview_session: Optional[InterviewSessionState] = None` field to the existing `ChatRequest` in `schemas/events.py` without changing any other field or breaking any existing caller. Create `agent-service/crew/interview_manager.py` as a plain module (explicitly NOT a CrewAI `Agent`) with `start_session` and `advance_session` functions. Do not add any new event type to `AgentEvent` in either `events.py` or `agentStreamClient.ts`."

## Testing
- `test_interview_session_schema.py`: `InterviewSessionState` validates correctly with defaults; rejects an invalid `interview_type`/`difficulty` value; round-trips through `model_dump()`/`model_validate()` without data loss.
- Re-run Sprint 8's full existing test suite (`pytest -v` in `agent-service/`, `npm test` in `frontend/`) and confirm 100% still passing — proves the optional-field extension is non-breaking.

## Regression Testing
This is the primary regression check for today: every existing Sprint 8 test must still pass unchanged, since `ChatRequest`'s new field is additive-only.

## Manual Verification
Construct a `ChatRequest` payload with and without `interview_session` present and confirm both parse correctly against the updated schema.

## Expected Behaviour
The schema exists, is tested, and adding it has zero observable effect on any existing Sprint 8 request that doesn't include the new field.

## Failure Cases
Any existing Sprint 8 test failing after this change indicates the `ChatRequest` extension was not made in a backward-compatible way — must be fixed before proceeding to Day 3.

## Debugging Guidance
If a test unexpectedly requires `interview_session`, check that the new field has `Optional[...] = None`, not just `Optional[...]` without a default.

## Security Considerations
None new today — schema definitions only, no new endpoint or data access.

## Checklist
- [x] `InterviewSessionState` schema defined and tested (Python + TypeScript)
- [x] `ChatRequest` extended without breaking any existing test
- [x] `interview_manager.py` created as a plain module, confirmed no `Agent(...)` object added
- [x] Confirmed no new `AgentEvent` type added anywhere
- [x] Full Sprint 8 regression suite passing unchanged

## Commit Message
`feat(sprint9-day2): InterviewSessionState schema and interview_manager module skeleton`

## Documentation Updates
`20_Decision_Log.md`'s "Interview Manager is a plain Python module" and "No new streaming event types" ADRs are the design this day implements; no further changes needed.

## End-of-Day Review
The session-state foundation exists, is backward-compatible, and is held to the two architectural constraints Day 1's audit established. No interview logic works yet — that starts Day 3.

## Tomorrow Preview
Day 3 wires resume/job-description/attachment context into `start_session`, so a session actually starts with real candidate context rather than the Day 2 skeleton's placeholder defaults.
