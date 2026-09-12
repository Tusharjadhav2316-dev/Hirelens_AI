# Sprint 9 — Day 1

## Day Title
Repository Audit — Sprint 8 Reality Check and Interview Architecture Grounding

## Objective
Establish, via direct code inspection rather than prior documentation, exactly what Sprint 8 delivered for interview capability, exactly how the Manager actually routes requests today, and exactly which three gaps (unreachable tool, no session concept, no interactive UI) Sprint 9 must close. No code is written today — this is the audit that everything else in Sprint 9 is built on.

## Why This Day Exists
The brief is explicit: "do not assume that something exists in the current codebase merely because it exists in the reference documentation," and "identify which Interview-related capabilities already exist" before designing anything new. Sprint 8's own documentation describes an LLM-driven hierarchical delegation model that, per this day's audit, is not what actually runs in production. Building Sprint 9 on the documented-but-not-real model would mean designing an "Interview Manager" that delegates to agents nothing else in the codebase actually delegates to — a design that wouldn't fit the system it's meant to extend.

## Repository Evidence / Current State
Confirmed via direct inspection of `agent-service/` and `frontend/` after Sprint 8:
- `agent-service/tools/interview_tools.py` contains two real, tested, working tools: `prepare_interview_questions` (role, count, resume_text, job_description) and `evaluate_interview_answer` (question, answer, resume_text). Both share an `INTERVIEW_GUARDRAIL` constant covering anti-fabrication and no-verdict rules. Both have graceful structured fallbacks when no OpenRouter key is configured.
- `agent-service/crew/manager.py`'s Route 4 (`"interview" in clean or "mock" in clean or "questions" in clean or "prep" in clean`) calls `prepare_interview_questions._run()` directly with a hardcoded `role="Software Engineer"`, `count=5`. **`evaluate_interview_answer` is never called from anywhere in the routing code** — confirmed via `grep -rn "evaluate_interview_answer" crew/` returning only its import/registration in `tools/__init__.py`, never an invocation.
- A repository-wide search for `.kickoff(` across `agent-service/` returns zero results. `crew/manager.py` defines `get_career_crew()` assembling a real CrewAI `Crew(process=Process.hierarchical, ...)` with all 7 agents, but this function is never called. All 7 of the Manager's actual routes (`Route 1` through `Route 7`) are deterministic keyword-matched branches calling tool `._run()` methods or `call_openrouter_api()` directly.
- `frontend/components/agent/artifacts/InterviewQuestionCard.tsx` renders a static list of `InterviewQuestionItem` objects with an expandable "Key Tips" section per question. There is no answer `<textarea>`, no Submit button, no feedback display, no progress indicator, and no concept of a "current" vs. "past" question.
- `frontend/types/agent.ts` defines `InterviewQuestionArtifactData` as `{ questions: InterviewQuestionItem[] }` only — no fields for answers, feedback, session ID, or progress.
- No Firestore collection, security rule, or client-side type anywhere in the repository references an interview session of any kind.
- The Sprint 8 close-out entry in `01_Master_Roadmap.md` (pre-correction) listed the 6 specialized agents incorrectly and undercounted artifact renderers by one — corrected today as part of this audit (see `20_Decision_Log.md`).

## Concepts
- The distinction between a CrewAI `Agent` object existing in code and that agent actually being exercised via `Crew.kickoff()` at request time — these are not the same thing, and Sprint 8's documentation conflated them.
- "Reachable" vs. "implemented": a tool can be fully coded and tested in isolation while being completely unreachable through any real user-facing path, which is exactly `evaluate_interview_answer`'s situation entering Sprint 9.

## Prerequisites
None — this is the first day of Sprint 9 and depends only on the Sprint 8 codebase existing, which it does.

## Setup
No code changes today. Set up a local read-only audit pass: run `grep -rn "kickoff\|Process.hierarchical" agent-service/` and `grep -rn "evaluate_interview_answer" agent-service/crew/` to reproduce this day's findings independently before proceeding.

## Resources
- `agent-service/crew/manager.py` (the single most important file to read in full today)
- `agent-service/tools/interview_tools.py`
- `agent-service/tests/test_interview_tools.py`
- `frontend/components/agent/artifacts/InterviewQuestionCard.tsx`
- `frontend/types/agent.ts`

## Files to Inspect
- `agent-service/crew/manager.py` (full file)
- `agent-service/crew/workflows.py` (the existing "plain module, not an agent" precedent)
- `agent-service/crew/agents/interview_coach_agent.py`
- `agent-service/tools/interview_tools.py`
- `agent-service/schemas/agent_response.py`, `agent-service/schemas/events.py`
- `frontend/types/agent.ts`, `frontend/lib/agentStreamClient.ts`
- `frontend/components/agent/ArtifactRenderer.tsx`

## Files to Modify
- `hirelens-wiki-docs/docs/01_Master_Roadmap.md` — Sprint 8 close-out corrected in place (agent list, artifact count)
- `hirelens-wiki-docs/docs/20_Decision_Log.md` — audit findings logged as new ADRs (not rewriting Sprint 8's original ADRs)

## Files to Create
None — Day 1 is audit and documentation only.

## Architecture Impact
None to the running system today. This day's output is the corrected mental model Days 2–10 build against.

## Data Flow
No new data flow today — this day traces the *existing* data flow for an interview request end-to-end:
```
User: "give me interview questions"
  -> POST /api/agent/chat
  -> Next.js proxy (unchanged since Sprint 8)
  -> agent-service /chat -> process_manager_request_async
  -> Route 4 matches "questions" keyword
  -> prepare_interview_questions._run(role="Software Engineer", count=5, resume_text=..., job_description=...)
  -> artifact: interview_question_card { questions: [...] }
  -> (dead end - no path exists from here to submitting an answer)
```

## Implementation Plan

### Step 1 — Reproduce the Routing-Mechanism Finding
Run `grep -rn "\.kickoff(" agent-service/` and confirm zero results. Run `grep -n "# Route" agent-service/crew/manager.py` and confirm all 7 routes are `elif` keyword branches. This is the single most consequential finding for Sprint 9's design and must be independently verified, not taken on faith from this document.

### Step 2 — Reproduce the Unreachable-Tool Finding
Run `grep -rn "evaluate_interview_answer" agent-service/crew/` and confirm the only matches are import/registration lines, never a call site. Cross-reference against `agent-service/tools/__init__.py`'s export list to confirm the tool is indeed registered and importable — it is fully built, simply never invoked.

### Step 3 — Reproduce the UI-Gap Finding
Read `InterviewQuestionCard.tsx` in full and confirm there is no `<textarea>`, no `onSubmit`/`onClick` handler that sends data anywhere, and no state tracking "which question is currently active." Read `InterviewQuestionArtifactData` in `types/agent.ts` and confirm no answer/feedback/session fields exist.

### Step 4 — Correct the Sprint 8 Close-Out
Update `01_Master_Roadmap.md`'s Sprint 8 "Actual Outcome" text to list the correct 6 specialized agents (Resume, ATS, Optimizer, Career, Job Search, Interview Coach) and the correct count of 8 typed artifact renderers. Log this correction, and the routing-mechanism finding, as new dated entries in `20_Decision_Log.md` — do not silently edit history; the original (incorrect) text is superseded, not deleted from the record of what happened.

### Step 5 — Draft the Sprint 9 Architecture Grounding
Using Steps 1–3's findings, draft the "What Sprint 8 Already Delivered" table and the corrected data-flow diagram that appear in `02_Architecture.md`'s Sprint 9 section — this becomes the shared reference for Days 2–10.

## Ready-to-Paste Antigravity Prompt
"Do not write any application code today. Run `grep -rn '.kickoff(' agent-service/`, `grep -rn 'evaluate_interview_answer' agent-service/crew/`, and `grep -n '# Route' agent-service/crew/manager.py`, and report the exact results. Then read `agent-service/crew/manager.py` in full and summarize, in your own words, how a request is actually routed today — do not assume it matches `Sprint_08/Day_02.md`'s original design without checking."

## Testing
No new automated tests today — this is a documentation/audit day. The "test" is that Steps 1–3's `grep` commands are reproducible by anyone reading this document, with results matching what's stated above.

## Regression Testing
Not applicable — no code changed today.

## Manual Verification
Manually exercise the live product (or a local dev instance) by asking the Agent Workspace "give me interview questions" and confirming: questions appear, there is genuinely no way to submit an answer to any of them anywhere in the UI. This is the experiential confirmation of Step 3's code-level finding.

## Expected Behaviour
A clear, code-verified understanding of Sprint 8's actual interview-related delivery, documented in `02_Architecture.md` and `20_Decision_Log.md`, that Days 2–10 can be built against without further ambiguity.

## Failure Cases
If any of Steps 1–3's `grep` commands produce different results than stated above (e.g., a `.kickoff(` call is found somewhere), this entire day's findings — and by extension much of Sprint 9's architecture — must be revisited before proceeding to Day 2.

## Debugging Guidance
If the actual codebase differs from this document's audit findings (e.g., because further Sprint 8 hotfixes were applied after this documentation was written), treat this document's Day 1 as out of date and re-run the audit steps against the current code before continuing — the discipline this day models (verify, don't assume) applies to this very document too.

## Security Considerations
None — audit only, no new attack surface introduced today.

## Checklist
- [x] Routing-mechanism finding reproduced and confirmed
- [x] Unreachable-tool finding reproduced and confirmed
- [x] UI-gap finding reproduced and confirmed
- [x] Sprint 8 close-out corrected in `01_Master_Roadmap.md`
- [x] Audit findings logged as new `20_Decision_Log.md` entries
- [x] Sprint 9 architecture grounding drafted in `02_Architecture.md`

## Commit Message
`docs(sprint9-day1): audit Sprint 8 interview capability, correct close-out, ground Sprint 9 architecture in actual code`

## Documentation Updates
`01_Master_Roadmap.md`, `20_Decision_Log.md`, `02_Architecture.md` all updated per this day's findings (already reflected in this documentation package).

## End-of-Day Review
Sprint 9 now has an accurate, code-verified starting point. Every subsequent day's design decisions trace back to a specific finding from today, not to Sprint 8's original (partially inaccurate) planning documents.

## Tomorrow Preview
Day 2 designs `interview_manager.py` (the session lifecycle module) and the `InterviewSessionState` schema, and makes the explicit decision — grounded in today's routing-mechanism finding — not to introduce new CrewAI agents or new streaming event types.
