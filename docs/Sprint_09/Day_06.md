# Sprint 9 — Day 6

## Day Title
Structured Feedback, Session Completion, and the Interview Report

## Objective
Finalize the `interview_feedback_card` data contract from `evaluate_interview_answer`'s existing output shape, implement `generate_interview_report` as a new tool, and wire `interview_manager.complete_session` so that reaching the end of a session's planned questions produces a real, qualitative (non-numeric) report artifact.

## Why This Day Exists
Day 5 made answer evaluation reachable; today makes its output presentable (a defined artifact contract the frontend can render on Day 8) and makes session completion mean something (a report, not just a status flag). This is also the day the "no numeric interview score" decision gets enforced in a concrete schema, not just a prompt instruction.

## Repository Evidence / Current State
`evaluate_interview_answer`'s existing JSON output (`clarity`, `structure`, `specificity`, `technical_depth`, `strengths`, `improvements`, `suggested_answer_direction`) already matches the brief's desired feedback shape closely — confirmed already strips forbidden verdict fields (`passed`, `failed`, `hired`, `rejected`, `hire_probability`). Today formalizes this as the `InterviewFeedbackArtifactData` contract rather than changing the tool's actual output.

## Concepts
- Formalizing an existing, already-correct output shape as a typed contract (schema-first documentation of proven behavior), vs. designing new behavior from scratch.
- Qualitative session-level readiness labels ("Strong"/"Moderate"/"Needs Improvement") as an aggregation of already-qualitative per-answer feedback — no numeric intermediate step at any point in the pipeline.

## Prerequisites
Day 5 complete: sessions can start, receive answers, and trigger follow-ups or advance.

## Setup
No new dependencies.

## Resources
- `agent-service/tools/interview_tools.py`'s existing `evaluate_interview_answer` output shape
- `20_Decision_Log.md`'s "no numeric interview score" ADR

## Files to Inspect
- `agent-service/tools/interview_tools.py`

## Files to Modify
- `agent-service/crew/interview_manager.py` — implement `complete_session`, calling the new `generate_interview_report` tool and setting `session.status = "completed"`

## Files to Create
- `agent-service/schemas/interview_feedback.py` — `InterviewFeedbackArtifactData` Pydantic model (formalizing `evaluate_interview_answer`'s existing shape)
- `agent-service/schemas/interview_report.py` — `InterviewReportArtifactData` Pydantic model, with **no numeric field of any kind**
- `agent-service/tools/interview_tools.py` addition — `generate_interview_report` tool
- `agent-service/tests/test_interview_report_no_score.py`
- `agent-service/tests/test_interview_feedback_schema.py`

## Architecture Impact
Adds one new tool (`generate_interview_report`) to `interview_coach_agent`'s tool list (now 4 tools total: `prepare_interview_questions`, `evaluate_interview_answer`, `generate_follow_up_question`, `generate_interview_report`). No new agent.

## Data Flow
```
interview_manager.process_answer(...) -> IF session.question_index >= total:
  -> interview_manager.complete_session(session)
       -> generate_interview_report._run(session.questions_asked, session.answers_given, target_role, interview_type)
       -> parses/validates against InterviewReportArtifactData (schema REJECTS any numeric score field)
  -> artifact: interview_report_card
  -> session.status = "completed"
```

## Implementation Plan

### Step 1 — `InterviewFeedbackArtifactData` (Formalizing Existing Behavior)
```python
class InterviewFeedbackArtifactData(BaseModel):
    question: str
    answer: str
    clarity: str
    structure: str
    specificity: str
    technical_depth: str
    strengths: list[str]
    improvements: list[str]
    suggested_answer_direction: str
    # Pydantic's default "extra=ignore" behavior means any stray numeric/verdict field
    # the model might emit is silently dropped, not just python-level .pop()'d as today -
    # this is a stronger guarantee than the existing runtime pop() alone.
```

### Step 2 — `InterviewReportArtifactData` — No Numeric Field, Enforced
```python
class InterviewReportArtifactData(BaseModel):
    interview_type: str
    target_role: str
    questions_asked: int
    readiness_by_category: dict[str, Literal["Strong", "Moderate", "Needs Improvement"]]
    strengths: list[str]
    improvement_areas: list[str]
    priority_topics: list[str]
    note: str = "These are coaching recommendations, not guaranteed measurements."

    model_config = {"extra": "forbid"}  # a stray "score": 7.5 field from the LLM FAILS validation, not silently passes through
```
`extra = "forbid"` is the deliberate mechanism behind `test_interview_report_no_score.py` — it turns "the model tried to add a score" into a hard validation failure surfaced as a structured `error` event, rather than a silent pass-through that would violate the Decision Log's ADR.

### Step 3 — `generate_interview_report` Tool
```python
@tool("generate_interview_report")
def generate_interview_report(
    questions_asked: list[dict],
    answers_given: list[dict],
    target_role: str,
    interview_type: str,
) -> str:
    system_prompt = (
        f"{INTERVIEW_GUARDRAIL}\n"
        "Summarize this completed mock interview session. Use ONLY qualitative readiness labels "
        "(Strong / Moderate / Needs Improvement) per category - NEVER a numeric score of any kind. "
        "If there is insufficient evidence to assess a category, say so explicitly rather than guessing. "
        "Output ONLY valid JSON matching the InterviewReportArtifactData schema."
    )
    # ... builds user_prompt from questions_asked + answers_given + their feedback ...
    ai_response = call_openrouter_api(system_prompt, user_prompt)
    # parse, then validate against InterviewReportArtifactData - a numeric score field
    # anywhere in the response causes validation to fail, triggering the fallback below
    try:
        parsed = json.loads(clean_json)
        validated = InterviewReportArtifactData.model_validate(parsed)
        return validated.model_dump_json()
    except Exception:
        return _fallback_report(target_role, interview_type, len(questions_asked))
```

### Step 4 — `complete_session`
```python
def complete_session(session: InterviewSessionState) -> InterviewSessionState:
    report_json = generate_interview_report._run(
        questions_asked=[q.model_dump() for q in session.questions_asked],
        answers_given=[a.model_dump() for a in session.answers_given],
        target_role=session.target_role,
        interview_type=session.interview_type,
    )
    session.status = "completed"
    return session, json.loads(report_json)  # report returned alongside session for the artifact event
```

## Ready-to-Paste Antigravity Prompt
"Create `agent-service/schemas/interview_report.py` defining `InterviewReportArtifactData` with `model_config = {'extra': 'forbid'}` and no numeric field of any kind, per `Sprint_09/Day_06.md`. Add a `generate_interview_report` tool to `interview_tools.py` that validates its own OpenRouter response against this schema before returning, falling back to a qualitative-only synthetic report if validation fails for any reason (including if the model tried to include a numeric score). Wire `interview_manager.complete_session` to call it when a session's `question_index` reaches its planned total."

## Testing
- `test_interview_report_no_score.py`: construct a report payload with an injected `"score": 8.5` field and confirm `InterviewReportArtifactData.model_validate()` raises a validation error (proves `extra="forbid"` actually works, not just documented intent).
- `test_interview_feedback_schema.py`: `evaluate_interview_answer`'s existing output (unchanged from Sprint 8) validates cleanly against the new `InterviewFeedbackArtifactData` model — proves the formalization step didn't require changing the tool itself.

## Regression Testing
Confirm `evaluate_interview_answer`'s actual behavior/output is byte-for-byte unchanged from Sprint 8 — today only adds a schema *around* it, never modifies its logic.

## Manual Verification
Complete a full mock interview session manually (via Day 5's flow) through to its final question and confirm a `interview_report_card`-shaped JSON is produced with qualitative labels only, no numbers.

## Expected Behaviour
Every completed session produces a structurally guaranteed numeric-score-free report; every individual answer's feedback matches the formalized `InterviewFeedbackArtifactData` shape.

## Failure Cases
If `generate_interview_report`'s OpenRouter call returns a response that fails schema validation (numeric score, missing required field, malformed JSON), the fallback synthetic report must still be qualitative-only and must still clearly communicate to the user that this is a general summary, not one that could analyze specifics of their answers if the real generation failed.

## Debugging Guidance
If `test_interview_report_no_score.py` ever fails to catch an injected score, check `model_config = {"extra": "forbid"}` wasn't accidentally overridden or removed — this single line is the entire enforcement mechanism.

## Security Considerations
No new security surface — this is schema/prompt work operating on data already flowing through the existing authenticated pipeline.

## Checklist
- [x] `InterviewFeedbackArtifactData` formalizes existing `evaluate_interview_answer` output without changing its behavior
- [x] `InterviewReportArtifactData` structurally forbids any numeric field (`extra="forbid"`, tested with an injection attempt)
- [x] `generate_interview_report` tool implemented with guardrail-sharing and schema validation
- [x] `complete_session` wired to produce a report when a session finishes
- [x] `evaluate_interview_answer`'s Sprint 8 behavior confirmed unchanged

## Commit Message
`feat(sprint9-day6): interview feedback/report schemas, generate_interview_report tool, session completion`

## Documentation Updates
`20_Decision_Log.md`'s "no numeric interview score" ADR is enforced in code today, not just documented; no further doc changes needed.

## End-of-Day Review
A complete session now produces a real, structurally-guaranteed-safe report. Every backend piece of Sprint 9's core loop (start, question, answer, feedback, follow-up, advance, complete, report) now exists and is reachable. Day 7 makes it visible.

## Tomorrow Preview
Day 7 builds the actual Interview Coach UI — the answer input, feedback display, progress indicator, and setup screen from `24_UI_Wireframes.md`'s Sprint 9 section.
