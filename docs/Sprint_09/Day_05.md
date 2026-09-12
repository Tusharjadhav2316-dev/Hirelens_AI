# Sprint 9 — Day 5

## Day Title
Mock Interview Session Flow and Adaptive Follow-Up Logic

## Objective
Wire `interview_manager.py` into `manager.py`'s existing deterministic router by extending Route 4 into a session-aware sub-router, and implement the adaptive follow-up decision rule (documented in `02_Architecture.md`) as plain, auditable Python conditionals. By the end of today, a session can start, receive an answer, and either ask a follow-up or advance — though `evaluate_interview_answer` itself is still called with Day 4's static logic; the live feedback wiring is finalized Day 6.

## Why This Day Exists
This is the day Sprint 9's stated primary goal — turning single-shot question generation into an actual mock-interview experience — becomes real in the routing layer. It is also the day the `evaluate_interview_answer` reachability gap identified in Day 1 actually gets closed, which `26_Risks.md` flags as the single most important thing to get right in this Sprint.

## Repository Evidence / Current State
`manager.py`'s Route 4 currently: matches interview keywords, calls `prepare_interview_questions` once, returns. No session awareness. No answer-submission path exists anywhere in the router.

## Concepts
- Sub-routing within an existing deterministic route (extending, not replacing, the pattern already used for the 7 top-level routes).
- The Adaptive Follow-Up Decision Rule as a fully specified, auditable set of conditionals (already documented in `02_Architecture.md`) rather than a black-box scoring model.

## Prerequisites
Day 4 complete: `prepare_interview_questions` supports `interview_type`/`difficulty`.

## Setup
No new dependencies.

## Resources
- `02_Architecture.md`'s "Adaptive Follow-Up Decision Rule" section — the exact logic to implement today
- `agent-service/crew/manager.py`'s existing Route 4 and its surrounding routes, as the pattern to extend

## Files to Inspect
- `agent-service/crew/manager.py` (Route 4 and the overall `elif` structure)

## Files to Modify
- `agent-service/crew/manager.py` — Route 4 becomes session-aware: if no `interview_session` in the request and interview-start keywords match, call `interview_manager.start_session(...)`; if `interview_session` is present and a pending answer is included in the message, call `interview_manager.process_answer(...)`
- `agent-service/crew/interview_manager.py` — implement `process_answer`, `_should_ask_follow_up`, and the difficulty-stepping logic; add `MAX_QUESTIONS_PER_SESSION = 15` and `MAX_FOLLOW_UPS_PER_QUESTION = 1` constants

## Files to Create
- `agent-service/tests/test_interview_session.py`

## Architecture Impact
This is the day `manager.py` gains its first genuinely stateful-feeling route (state lives in the request payload, not the server, per the Day 2 decision, but the *behavior* — remembering where you are in a multi-turn flow — is new to the router). No other route is touched.

## Data Flow
```
Turn 1: "start a technical interview for a software engineer role"
  -> Route 4a (new): no interview_session present, interview-start keywords matched
  -> interview_manager.start_session(interview_type="technical", target_role=..., difficulty="intermediate")
  -> prepare_interview_questions(..., interview_type="technical", difficulty="intermediate")
  -> session.questions_asked = [first question]; question_index = 0
  -> artifact: interview_question_card (isActive=true, question[0]); session state returned in response

Turn 2: client resends interview_session (question_index=0) + the user's answer to question 0
  -> Route 4b (new): interview_session present, message contains an answer for the active question
  -> interview_manager.process_answer(session, answer)
       -> evaluate_interview_answer(question, answer, resume_text)   [wiring finalized Day 6]
       -> _should_ask_follow_up(feedback) -> True/False
       -> IF True: generate_follow_up_question(...); append as questions_asked[len]; do NOT increment question_index past the follow-up slot
       -> IF False: increment question_index; adjust difficulty per the stepping rule; pull next question from the plan (or generate one if not pre-planned)
  -> IF question_index >= total planned questions: session.status = "completed"; interview_manager.complete_session(...) [Day 6]
  -> ELSE: artifact: interview_question_card (isActive=true, next question); session state returned
```

## Implementation Plan

### Step 1 — Extend Route 4 into a Sub-Router
```python
elif "interview" in clean or "mock" in clean or "questions" in clean or "prep" in clean or has_active_interview_session:
    if interview_session is None:
        # Route 4a: start a new session
        session = interview_manager.start_session(
            interview_type=detect_interview_type(clean),  # simple keyword classifier, defaults to "mixed"
            target_role=detect_target_role(clean, resume_text),  # falls back to "Software Engineer"
            difficulty="intermediate",
        )
        result = interview_manager.present_question(session, resume_text, job_description)
    elif pending_answer:
        # Route 4b: process a submitted answer
        result = interview_manager.process_answer(interview_session, pending_answer, resume_text)
    else:
        # Route 4c: session exists but no answer yet - re-present the active question (idempotent)
        result = interview_manager.present_question(interview_session, resume_text, job_description)
```
`has_active_interview_session` and `pending_answer` are simple presence checks on the request payload, following the same lightweight style as the rest of `manager.py`'s router — no new framework introduced.

### Step 2 — `MAX_QUESTIONS_PER_SESSION` and `MAX_FOLLOW_UPS_PER_QUESTION`
```python
MAX_QUESTIONS_PER_SESSION = 15
MAX_FOLLOW_UPS_PER_QUESTION = 1

def process_answer(session, answer, resume_text):
    feedback = evaluate_interview_answer._run(question=..., answer=answer, resume_text=resume_text)
    follow_ups_this_question = _count_follow_ups_for_current_question(session)
    if _should_ask_follow_up(feedback) and follow_ups_this_question < MAX_FOLLOW_UPS_PER_QUESTION:
        follow_up = generate_follow_up_question._run(...)  # Day 6 wiring
        # append follow-up, do not advance question_index
    else:
        session.question_index += 1
        session.difficulty = _step_difficulty(session.difficulty, feedback)
    if session.question_index >= min(len(session.questions_asked_plan), MAX_QUESTIONS_PER_SESSION):
        session.status = "completed"
    return session
```

### Step 3 — `_should_ask_follow_up` (Exact Rule, Documented)
```python
def _should_ask_follow_up(feedback: dict) -> bool:
    improvements = feedback.get("improvements", [])
    ambiguity_markers = ["unclear", "specific", "vague", "ambiguous"]
    text_blob = " ".join(improvements).lower()
    return len(improvements) >= 2 and any(marker in text_blob for marker in ambiguity_markers)
```
This is the literal, auditable implementation of the rule already documented in `02_Architecture.md` — no hidden model call decides this, only string inspection of the already-generated feedback.

### Step 4 — `_step_difficulty`
```python
DIFFICULTY_ORDER = ["beginner", "intermediate", "advanced"]

def _step_difficulty(current: str, feedback: dict) -> str:
    strong_answer = len(feedback.get("improvements", [])) <= 1 and len(feedback.get("strengths", [])) >= 2
    if strong_answer:
        idx = min(DIFFICULTY_ORDER.index(current) + 1, len(DIFFICULTY_ORDER) - 1)
        return DIFFICULTY_ORDER[idx]
    return current
```

## Ready-to-Paste Antigravity Prompt
"Extend Route 4 in `agent-service/crew/manager.py` into a session-aware sub-router per `Sprint_09/Day_05.md`'s Step 1: starting a new session via `interview_manager.start_session` when no `interview_session` is present, and processing a submitted answer via `interview_manager.process_answer` when one is. Implement `process_answer`, `_should_ask_follow_up`, and `_step_difficulty` in `interview_manager.py` exactly as specified, with `MAX_QUESTIONS_PER_SESSION = 15` and `MAX_FOLLOW_UPS_PER_QUESTION = 1` hard ceilings. Do not modify any other route in `manager.py`."

## Testing
- `test_interview_session.py`: a session that receives 2+ ambiguous-feedback answers in a row for the same question never exceeds 1 follow-up (ceiling enforced); a session given 20 turns never exceeds `question_index=15`; `_step_difficulty` correctly steps up only on strong answers and never exceeds "advanced."

## Regression Testing
Re-run all Sprint 8 tests and Day 1–4's new tests — confirm the 6 other top-level routes and the non-session Route 4 behavior (a request with `interview_session=None` and no start-keywords falls through to the conversational fallback, unchanged) are unaffected.

## Manual Verification
Manually step through a 3-turn interview session (start, weak answer triggering a follow-up, strong answer advancing with a difficulty bump) and confirm the session state evolves exactly as the data-flow diagram describes.

## Expected Behaviour
A user can now have a genuine back-and-forth mock interview through the API, with `evaluate_interview_answer` finally reachable and doing real work.

## Failure Cases
- A malformed/tampered `interview_session` payload (see `26_Risks.md`'s "Interview Session State Tampering" entry) should not crash the router — invalid enum values are rejected by Pydantic validation before reaching `interview_manager.py`'s logic, resulting in a clear `error` event, not a stack trace.
- A session with zero resume/JD context should still function — falls back to generic questions exactly as `prepare_interview_questions` already does today.

## Debugging Guidance
If a session seems stuck re-asking the same question, check `_should_ask_follow_up` and the follow-up counter first — an off-by-one in `_count_follow_ups_for_current_question` is the most likely cause of an apparent infinite loop, not a deeper architectural issue.

## Security Considerations
Confirm `interview_session` fields are validated against the Pydantic model's `Literal` constraints before any string is interpolated into a prompt — an out-of-range `difficulty`/`interview_type` value must be rejected, not passed through to an LLM call.

## Checklist
- [x] Route 4 extended into a session-aware sub-router
- [x] `process_answer`, `_should_ask_follow_up`, `_step_difficulty` implemented exactly as documented
- [x] `MAX_QUESTIONS_PER_SESSION`/`MAX_FOLLOW_UPS_PER_QUESTION` ceilings enforced and tested
- [x] `evaluate_interview_answer` is now reachable end-to-end (closing the Day 1 gap)
- [x] Full regression suite (Sprint 8 + Days 1–4) passing

## Commit Message
`feat(sprint9-day5): session-aware Route 4, adaptive follow-up rule, evaluate_interview_answer wired live`

## Documentation Updates
`02_Architecture.md`'s Adaptive Follow-Up Decision Rule section is the design this day implements verbatim; no further changes needed.

## End-of-Day Review
The single most important gap this Sprint exists to close — `evaluate_interview_answer` being unreachable — is closed today. A real mock interview conversation is now possible end-to-end, still without a polished UI (Day 7) or a final report (Day 6).

## Tomorrow Preview
Day 6 implements `generate_interview_report`, wires session completion, and finalizes `interview_feedback_card`'s exact data shape for the frontend to render.
