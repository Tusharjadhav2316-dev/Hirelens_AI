# Sprint 10 — Day 4

## Day Title
Adaptive Trainer Engine — Training Modes, Retry Loop, Session Memory

## Objective
Extend Sprint 9's `interview_manager.py` into a trainer engine: add `coaching` vs. `realistic_mock` training modes, the answer-retry loop (max 1 per question), pause/resume, and in-session interviewer memory so the interviewer can reference earlier answers. No new agents; no parallel engine.

## Why
The brief's core principle is "trainer, not question bot." Sprint 9 already implements question → answer → evaluate → follow-up-or-advance. What's missing is the *teaching* layer: coaching interventions, the chance to retry an answer after guidance, and continuity ("you mentioned X earlier — why that choice?").

## Repository Evidence
- `agent-service/crew/interview_manager.py` — confirmed present: `start_session`, `present_question`, `process_answer`, `complete_session`, `MAX_QUESTIONS_PER_SESSION`, `MAX_FOLLOW_UPS_PER_QUESTION`, and the adaptive follow-up rule (`_should_ask_follow_up`, `_step_difficulty`). This is the engine being extended.
- `agent-service/crew/manager.py` — Route 4a/4b/4c sub-router confirmed at ~lines 386–525; the trainer adds a parallel branch keyed on the presence of a trainer session, leaving 4a/4b/4c intact for Sprint 9's text flow.
- `tools/interview_tools.py` — `evaluate_interview_answer`, `generate_follow_up_question`, `generate_interview_report` confirmed present and reusable.
- `.kickoff(` still zero call sites — so extensions are plain functions, consistent with the codebase.

## Existing Functionality
Full Sprint 9 session loop, bounded ceilings, adaptive follow-up rule, difficulty stepping, all 4 interview tools, anti-fabrication guardrail.

## New Functionality
Training modes, coaching-intervention decision, retry loop, pause/resume, session memory summarisation for question continuity, `MAX_RETRIES_PER_QUESTION`.

## Architecture
Trainer logic lives in `interview_manager.py` alongside Sprint 9's functions (same module, new functions) so there is exactly one interview engine. Agent count unchanged at 7.

## Concepts
Mode as a behavioural switch on *when* coaching surfaces, not on *what* is computed — both modes evaluate identically; realistic_mock defers coaching to the report. Session memory as bounded summarisation rather than unbounded transcript replay.

## Prerequisites
Day 3 complete (persisted session to read/write).

## Dependencies
None new.

## Resources
`interview_manager.py`, `02_Architecture.md` Adaptive Trainer Decision Rule.

## Files to Inspect
- `agent-service/crew/interview_manager.py` (in full)
- `agent-service/crew/manager.py` (Route 4 structure)

## Files to Modify
- `agent-service/crew/interview_manager.py` — add `process_trainer_answer`, `_should_coach`, `_build_session_memory`, `offer_retry`, `pause_session`, `resume_session`; add `MAX_RETRIES_PER_QUESTION = 1`
- `agent-service/crew/manager.py` — add a trainer branch (Route 4t) that activates when a `trainer_session` is present; existing 4a/4b/4c untouched
- `agent-service/tools/interview_tools.py` — `generate_follow_up_question` gains an optional `session_memory` parameter for continuity

## Files to Create
- `agent-service/tests/test_trainer_engine.py`

## Architecture Impact
No new module, no new agent, no new engine. Route 4 gains one branch.

## Data Flow
```
Answer submitted (text today; voice from Day 5)
  -> process_trainer_answer(session, transcript)
       -> evaluate_interview_answer(question, transcript, resume_text)
       -> decision per 02_Architecture.md rule:
            content_weak + follow-ups available -> FOLLOW-UP (with session_memory)
            coaching mode + weak              -> COACH, then OFFER RETRY (<=1)
            content_strong                    -> ADVANCE + difficulty step up
            else                              -> ADVANCE
       -> realistic_mock: coaching suppressed, stored for the report
  -> persisted turn record appended (Day 3 service)
  -> artifact: trainer_answer_feedback (coaching mode) or trainer_question_card (mock mode)
```

## State Flow
`question_index`, `retry_count_for_current_question`, `follow_ups_for_current_question`, `status` all live on the persisted session. Session memory is derived per request, never stored separately (avoids a second source of truth).

## Agent Responsibilities
Unchanged — 7 agents. `interview_coach_agent` keeps its tool allowlist plus Day 2's `analyze_role`.

## Service Responsibilities
`interview_manager.py` owns every trainer decision. `manager.py` only routes.

## Tool Responsibilities
`generate_follow_up_question` may now receive `session_memory` (a bounded summary of prior answers) so follow-ups can reference earlier content. It must still never invent facts not present in resume/JD/transcripts.

## UI/UX Work
None today (Interview Room is Day 9) — behaviour is verified via artifacts and tests.

## Voice/Audio Work
None — the engine is input-agnostic, which is deliberate: it takes a transcript whether typed (today) or spoken (Day 5+).

## Camera/Visual Work
None.

## Security
Session memory is built only from the authenticated user's own session record. Transcripts remain data, never instructions — the existing guardrail placement is preserved when `session_memory` is added to prompts.

## Privacy
Session memory is derived in-memory per request and not persisted as an additional copy of the candidate's content.

## Cost Controls
`MAX_RETRIES_PER_QUESTION = 1`, existing `MAX_FOLLOW_UPS_PER_QUESTION = 1`, `MAX_QUESTIONS_PER_SESSION = 15`. Session memory is truncated to a bounded character budget so prompt size can't grow linearly with interview length.

## Implementation Plan
1. Add `MAX_RETRIES_PER_QUESTION`; add `retry_count` to the per-question session record.
2. Implement `_should_coach(feedback, training_mode)` — in `realistic_mock` always `False` during the interview.
3. Implement `process_trainer_answer` per the documented decision rule, returning `(updated_session, artifact_payload, next_action)`.
4. Implement `offer_retry` / retry acceptance path: retry replaces the stored answer for that question but **records both** so the report can mention that a retry occurred — without claiming a quantified improvement.
5. Implement `_build_session_memory(session, char_budget)` — bounded summary of prior Q/A.
6. Implement `pause_session` / `resume_session` (status transitions + timestamps).
7. Add Route 4t in `manager.py`; verify 4a/4b/4c behaviour is byte-identical.

## Testing
- `test_trainer_engine.py`: retry never exceeds 1 per question; follow-ups never exceed 1; `realistic_mock` emits no coaching artifact during the interview but the report contains the coaching content; `content_strong` steps difficulty up and never past `advanced`; `_build_session_memory` respects its char budget; pause/resume transitions valid and invalid jumps rejected.

## Regression Testing
Sprint 9's Route 4a/4b/4c must behave identically — run Sprint 9's `test_interview_session.py` and its manual TEST H (full text mock interview) unchanged.

## Manual Verification
Run a full text-mode trainer interview in coaching mode (expect per-answer coaching + a retry offer on a weak answer), then in realistic_mock mode (expect no mid-interview coaching, all of it in the report).

## Expected Behaviour
The engine teaches rather than merely quizzing, with all loops bounded.

## Failure Cases
A user repeatedly submitting weak answers must not produce an endless coach→retry→coach cycle — the retry cap forces advancement. Retry on the final question must still reach `completed` rather than stalling.

## Debugging Guidance
If an interview appears stuck on one question, check `retry_count` and `follow_ups_for_current_question` first — an off-by-one in either counter is the likeliest cause, as it was in Sprint 9.

## Rollback Considerations
Remove Route 4t and the new functions; Sprint 9's engine remains intact because nothing existing was rewritten. Persisted sessions from Day 3 would remain readable but un-advanceable — acceptable, and a reason to keep Route 4t removal paired with a user-facing notice if rolled back mid-use.

## Checklist
- [ ] Both training modes implemented and behaviourally distinct
- [ ] Retry loop capped at 1/question; retry recorded without fake improvement metrics
- [ ] Pause/resume working with valid transitions only
- [ ] Session memory bounded and used by follow-ups
- [ ] Route 4t added; 4a/4b/4c verified unchanged
- [ ] No new agents; count still 7
- [ ] Sprint 9 interview regression-verified

## Commit Message
`feat(sprint10-day4): adaptive trainer engine - training modes, retry loop, session memory`

## Documentation Updates
`02_Architecture.md` Adaptive Trainer Decision Rule is implemented verbatim today.

## End-of-Day Review
The trainer brain is complete and input-agnostic — it will accept spoken transcripts on Day 5 with no further engine changes.

## Tomorrow Preview
Day 5 builds microphone capture, the authenticated STT route behind `SpeechProviderAdapter`, and the VAD assist — the first voice code in HireLens's history.
