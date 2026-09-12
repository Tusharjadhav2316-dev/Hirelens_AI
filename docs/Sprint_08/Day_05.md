# Sprint 8 — Day 5

## Day Title
Multi-Step Workflow Orchestration — The Manager Sequences, It Doesn't Delegate-and-Forget

## Objective
Extend the Manager Agent from Day 2's single-turn delegation into multi-step workflow sequencing for compound requests — most importantly "help me apply to this job," which chains Resume → ATS → Job Search/Skill Gap → Optimizer → Cover Letter — while keeping every intermediate step individually reviewable, per the brief's "every step should be reviewable" requirement.

## Why This Day Exists
A user asking "help me apply to this job" is really asking for five things in sequence, several of which depend on the output of the one before it (you can't tailor a cover letter before you know the skill gap; you can't know the skill gap before you have both the resume and the JD). This is exactly the kind of "multi-step reasoning" the architecture doc's agent-vs-tool classification says justifies dedicated orchestration — but per `20_Decision_Log.md`, that orchestration is the *existing* Manager Agent doing sequential delegation, not a new "Application Planning Agent." Today proves that decision holds up under a real compound workflow before Sprint 8 commits further to it.

## Repository Evidence / Current State
No workflow/pipeline concept of any kind exists prior to Sprint 8 — every existing feature (Resume Builder, ATS Analyzer, Optimizer, Cover Letter) is used independently by a human clicking between dashboard pages. Today is the first place HireLens sequences multiple AI-backed steps automatically.

## Concepts
- Sequential vs. hierarchical delegation within a single CrewAI `Process.hierarchical` crew — the Manager can issue multiple delegate `Task`s in sequence within one user turn, using each result as context for the next.
- "Reviewable step" — every intermediate artifact (ATS card, skill-gap card, diff, cover letter draft) streams to the UI as its own artifact event, not just a final combined result, so the user can intervene mid-workflow.

## Prerequisites
Day 4 complete: all 9 tools working.

## Setup
No new dependencies.

## Resources
- `02_Architecture.md`'s "Application Workflow" boundary note and `20_Decision_Log.md`'s "Cover Letter and Skill Gap ship as tools" ADR — both inform why this is Manager logic, not a new agent class.

## Files to Inspect
None new — this day is entirely about orchestration logic layered on Day 2–4's existing agents/tools.

## Files to Create
- `agent-service/crew/workflows.py` (defines the named multi-step sequences, e.g. `APPLICATION_WORKFLOW_STEPS`)
- `agent-service/tests/test_workflow_sequencing.py`

## Files to Modify
- `agent-service/crew/manager.py` — Manager's task-planning logic gains a small "does this request match a known compound workflow" check before falling through to single-delegate routing

## Architecture Impact
No new agents or tools. This is purely a task-planning/sequencing enhancement to the existing Manager. If this later proves insufficient (e.g., needs conditional branching, retries, or persistence across sessions), a CrewAI `Flow` becomes the natural upgrade path — deferred until that need is demonstrated, per `20_Decision_Log.md`.

## Data Flow
```
User: "help me apply to this Backend Engineer role at Acme" [+ pasted JD]
  -> Manager recognizes an "apply to a job" compound intent
  -> Step 1: ATS Agent.get_ats_analysis(resume, jd)          --> artifact: ats_score_card
  -> Step 2: (Job Search Agent).analyze_skill_gap(jd)         --> artifact: skill_gap_card
  -> Step 3: Optimizer Agent, informed by skill gap weak spots --> artifact: resume_diff (per section)
  -> Step 4: (after user Applies or explicitly skips diffs) Cover Letter tool --> artifact: cover_letter_preview
  -> Manager assembles a final message summarizing all 4 steps, each already delivered as its own artifact
```
Note step 4 waits on user action from step 3 in the real UI (see Day 9) — within a single non-interactive request/response turn, the Manager instead proposes all steps' outputs together and lets the user Apply/Reject/Accept each independently once rendered.

## Implementation Plan

### Step 1 — Named Workflow Definitions
```python
APPLICATION_WORKFLOW_STEPS = [
    ("ats", "Analyze current ATS fit for this job description"),
    ("skill_gap", "Identify matched and missing skills against this job description"),
    ("optimize", "Suggest targeted improvements addressing the missing skills, where truthfully supportable by existing resume content"),
    ("cover_letter", "Draft a tailored cover letter for this job"),
]
```
Explicitly not a database-persisted workflow definition — this is Python code, request-scoped, matching the "no new Firestore collections beyond agentUsage" decision.

### Step 2 — Manager Task-Planning Extension
Before falling through to Day 2's single-intent delegation, the Manager's planning step checks the user's message against a small set of known compound-intent patterns ("apply to this job", "help me get ready for this role") using the LLM's own classification (no hardcoded regex — brittle and doesn't generalize) with a fallback to single-intent routing if no compound pattern is confidently matched.

### Step 3 — Step-Level Artifact Emission
Each of the 4 sub-steps emits its own `artifact` event as soon as it completes, rather than the Manager waiting for all 4 to finish before responding — this is what "every step should be reviewable" means concretely, and sets up Day 6's streaming work directly (today this is proven with a list of artifacts returned at once; Day 6 makes it truly incremental over the wire).

### Step 4 — Non-Fabrication Constraint on the Optimize Step
The Optimizer step of this workflow is explicitly instructed: only propose additions/rewording for missing skills if the resume's existing content plausibly supports them (e.g., rewording an existing bullet to surface a skill that's implicitly there) — it must **never** propose adding a skill/technology the candidate's resume gives no evidence for, even to "help" close the gap. This is tested in Day 10's manual QA.

## Ready-to-Paste Antigravity Prompt
"In `agent-service/crew/manager.py`, add a task-planning step that checks whether the user's message + presence of a job description matches a compound 'help me apply to this job' intent. If so, sequentially delegate: ATS analysis, skill gap analysis, then optimizer suggestions constrained to only reword/surface skills already evidenced in the resume (never invent new ones), then a cover letter draft — emitting each result as its own artifact rather than waiting for all four before responding."

## Testing
- `test_workflow_sequencing.py`: given a fixture resume + JD and mocked tool responses, assert the 4 steps execute in the documented order and each produces its expected artifact type.
- Assert the optimize step's prompt includes the "only reword existing evidence, never invent" constraint text (guardrail-presence test, same style as `careerCoachSafety.test.ts`).

## Regression Testing
No existing code paths touched; single-intent delegation from Day 2 must still work unchanged for simple requests (regression-tested by re-running Day 2's 6 smoke-test prompts).

## Manual Verification
Run the full "help me apply to this job" prompt against a real fixture resume + real JD, inspect that all 4 artifacts are produced and each is individually sensible (not just structurally present).

## Expected Behaviour
A single compound user request produces 4 distinct, individually reviewable artifacts in a sensible order, without the Manager silently skipping any step or merging them into one un-reviewable blob.

## Failure Cases
- JD not provided but "apply to this job" intent detected → Manager should ask for the JD (`needs_input` status) rather than guessing or proceeding with a stale/absent JD.
- One sub-step fails (e.g., ATS tool call errors) → the workflow reports that specific step's failure and still attempts the remaining steps where they don't depend on the failed one, rather than aborting the entire chain silently.

## Debugging Guidance
If artifacts arrive out of the expected order, check whether the Manager is actually awaiting each delegate `Task` sequentially or firing them concurrently — concurrency here is not currently intended (Step 3 in particular depends on Step 2's output) and any concurrent execution is a bug, not an optimization.

## Security Considerations
No new security surface — this day only sequences existing, already-authorized tool calls.

## Checklist
- [ ] Compound-intent detection implemented (LLM-classified, not regex)
- [ ] 4-step application workflow sequences correctly with real tools
- [ ] Optimize step's non-fabrication constraint present and tested
- [ ] Day 2's single-intent smoke tests still pass unchanged

## Commit Message
`feat(sprint8-day5): Manager-orchestrated multi-step application workflow sequencing`

## Documentation Updates
`02_Architecture.md`'s "Optional / Future Agents" note on Application Planning Agent is confirmed accurate by today's implementation (Manager sequencing was sufficient; no new agent was needed).

## End-of-Day Review
The most complex user-facing flow in the brief now works end-to-end at the orchestration layer, still without streaming or a real UI — those are Days 6–8.

## Tomorrow Preview
Day 6 wires the NDJSON streaming event protocol so today's step-by-step artifact production actually reaches the browser incrementally, instead of only being testable via a Python script.
