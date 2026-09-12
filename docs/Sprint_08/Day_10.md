# Sprint 8 — Day 10

## Day Title
Safety Tests, Integration Tests, Full Regression, and Sprint 8 Close-Out

## Objective
Run and pass the complete Sprint 8 test matrix from `08_Testing_Guide.md` (Python + TypeScript automated suites, manual QA cases C1–C8), confirm zero regressions across every pre-Sprint-8 feature and test suite, and close out Sprint 8 with an updated `01_Master_Roadmap.md` status and a final Decision Log entry documenting any deltas discovered during the 9 days of implementation versus this planning document.

## Why This Day Exists
A 10-day sprint whose most safety-critical guarantees (never invent an ATS score, never silently mutate a resume, never fabricate a job listing or interview qualification) were each verified once, in isolation, on the day they were built is not the same as verifying they all still hold true together, under the full assembled system, after every other day's changes. Day 10 is that final, whole-system check — and the sprint is not "complete" until it passes.

## Repository Evidence / Current State
By end of Day 9, the full system described in `02_Architecture.md` exists and runs locally: `agent-service` with 7 total agents (1 Manager + 6 specialized) and 9 tools, streaming NDJSON events, a primary Agent Workspace UI with all 7 artifact renderers, Apply/Reject wired to `ResumeContext`, and server-side rate limiting. Today's job is verification, not new feature construction — no new capability should be added on Day 10.

## Concepts
- Whole-system regression testing vs. per-day unit verification.
- The distinction (already established in `10_CrewAI_Guide.md`) between what's asserted automatically (schemas, authorization, numeric equality with deterministic engines) and what requires manual QA (grounding, non-fabrication, tone).

## Prerequisites
Days 1–9 complete.

## Setup
No new dependencies. Ensure both `agent-service` and the Next.js dev server are running with production-like environment variables (real `INTERNAL_AGENT_JWT_SECRET`, real OpenRouter key) for the manual QA pass.

## Resources
- `08_Testing_Guide.md`'s full Sprint 8 Test Matrix and Manual QA Cases C1–C8 — the authoritative checklist for today.
- `26_Risks.md`'s Sprint 8 Specific Risks section — each risk's stated mitigation should be re-verified against final code today.

## Files to Inspect
All `agent-service/` and Sprint-8-created `frontend/` files, as the subject of testing — no new inspection targets beyond what's already been touched Days 1–9.

## Files to Create
- `agent-service/tests/test_full_regression.py` (end-to-end: real Crew, real (test-environment) OpenRouter calls, mocked-but-realistic Next.js internal endpoints)
- `frontend/tests/agentToolContracts.test.ts` (TypeScript/Python schema shape parity check)
- `Sprint_08/README_CLOSEOUT.md` is intentionally **not** created as a separate file — close-out notes belong in `01_Master_Roadmap.md` and `20_Decision_Log.md`, per this wiki's existing convention (confirmed via Sprint 6's close-out, which used the same pattern rather than a dedicated closeout file)

## Architecture Impact
None — Day 10 verifies, it does not change, the architecture.

## Data Flow
No new data flow; today exercises every data flow documented in `02_Architecture.md` end-to-end.

## Implementation Plan

### Step 1 — Run the Full Automated Suite
```
# Python
cd agent-service && pytest -v
# expect: test_internal_auth, test_tool_authorization, test_schemas,
#         test_ats_tool_integration, test_job_search_tool, test_cost_controls,
#         test_streaming_events, test_workflow_sequencing, test_interview_tools,
#         test_full_regression  -- all passing

# TypeScript
cd frontend && npm test
# expect: existing atsBenchmark, optimizerSafety, careerCoachSafety suites UNCHANGED and passing,
#         plus new agentToolContracts, agentSafety suites passing
npm run build
# expect: clean build, no type errors from the new Artifact discriminated union
```

### Step 2 — Manual QA Cases C1–C8
Execute each case from `08_Testing_Guide.md`'s Sprint 8 section by hand in a real browser session against real (or realistic sandbox) OpenRouter calls. Record pass/fail for each with a one-line note — this record becomes part of the Sprint 8 close-out entry in `01_Master_Roadmap.md`.

### Step 3 — Full Regression Pass of Every Pre-Sprint-8 Feature
| Feature | Verification |
|---|---|
| Resume Builder | Create/edit a resume end-to-end, confirm unaffected by `ResumeContext` being additionally consumed by the new Agent Workspace |
| ATS Analyzer (standalone page) | Run an analysis, confirm score matches what the ATS Agent's `get_ats_analysis` tool returns for the identical resume (cross-check, not just "still works") |
| Resume Optimizer (standalone forms) | All 5 modes still function exactly as before Sprint 8 |
| Cover Letter (standalone page) | Generate/refine flow unaffected by the internal-JWT branch added in Day 3 |
| Career Coach (standalone page) | Streaming chat still works, unaffected by the new Career Agent's ported (separate) persona |
| Firebase Auth | Login/logout/session handling unaffected |
| Firestore (history, profile) | Existing reads/writes unaffected by the new `agentUsage` collection |
| Existing 3 test suites | `atsBenchmark`, `optimizerSafety`, `careerCoachSafety` all pass unmodified |

### Step 4 — Cross-Check Every Non-Negotiable Rule From the Brief
| Rule | Verification method |
|---|---|
| Never fabricate personal facts (Resume Agent) | Manual QA C-case + `HALLUCINATION_GUARDRAIL`-style prompt assertion |
| Never imply unverified interview qualifications (Interview Coach Agent — both `prepare_interview_questions` and `evaluate_interview_answer`) | `test_interview_tools.py` + manual QA C5, covering both tools |
| Never recalculate/invent an ATS score | `test_ats_tool_integration.py` numeric-equality assertion, re-run today against final code |
| Never scrape job sites directly | Code review: confirm `JobProviderAdapter`/`NullJobProvider` make no scraping calls |
| Never silently modify the resume | `agentSafety.test.ts` Apply/Reject assertions, re-run today |
| Never expose chain-of-thought | Code review of every `AgentEvent`-emitting call site: only high-level labels, no raw LLM reasoning text, are ever placed in an event payload |
| Cross-user data access impossible | `test_internal_auth.py`, re-run today against final code including Day 9's rate-limit insertion point |
| Cost/loop bounds enforced | `test_cost_controls.py` + manual verification of the daily ceiling from Day 9 |

### Step 5 — Close-Out Documentation
Update `01_Master_Roadmap.md`: change Sprint 8's status from "🟦 Planned" to the actual outcome (Complete / Partially Complete with named exceptions), following the exact style of the existing Sprint 1–6 entries. Add a final `20_Decision_Log.md` entry for any deviation discovered during implementation that wasn't anticipated in this planning document (if none, state that explicitly — a Sprint that matched its plan exactly is worth recording too).

## Ready-to-Paste Antigravity Prompt
"Run the full Python (`pytest -v` in `agent-service/`) and TypeScript (`npm test`, `npm run build` in `frontend/`) test suites. For any failure, do not modify a test's assertions to make it pass without first determining whether the failure reflects a real defect in Days 1-9's implementation — flag ambiguous cases for manual review rather than silently loosening an assertion. Then execute manual QA cases C1 through C8 from `08_Testing_Guide.md` and record pass/fail with a one-line justification for each."

## Testing
This entire day *is* the testing step — see Implementation Plan Steps 1–4.

## Regression Testing
See Implementation Plan Step 3 — this is the dedicated regression pass, the most thorough of the sprint.

## Manual Verification
See Implementation Plan Step 2 (C1–C8) and Step 3 (feature-by-feature walkthrough).

## Expected Behaviour
100% of automated tests pass (Python + TypeScript, existing + new); all 8 manual QA cases pass; every existing feature is confirmed unaffected; every non-negotiable rule from the original brief has a verified, working enforcement mechanism in the final code.

## Failure Cases
Any C1–C8 failure, any regression in an existing feature, or any non-negotiable-rule verification failure blocks Sprint 8 close-out — per this wiki's established convention (mirroring Sprint 6 Day 8's "Coach never fabricates... verified in Day 8 before Sprint 6 is closed"), Sprint 8 is not marked complete in `01_Master_Roadmap.md` until every item in Step 4's table is confirmed, not merely attempted.

## Debugging Guidance
For any Day 10 failure, first identify which of Days 1–9's specific deliverables it traces back to (each day's Checklist section names its exact scope) — this narrows debugging to a single day's code rather than the whole 10-day surface.

## Security Considerations
Today's Step 4 table is effectively the sprint's final security sign-off — treat it with the same rigor as Sprint 6 Day 8's Career Coach safety sign-off.

## Checklist
- [ ] All automated tests passing (Python + TypeScript)
- [ ] `npm run build` clean
- [ ] All 8 manual QA cases (C1–C8) passed and recorded
- [ ] Full regression pass of every pre-Sprint-8 feature confirmed unaffected
- [ ] Every non-negotiable rule from the brief cross-checked against final code
- [ ] `01_Master_Roadmap.md` updated with final Sprint 8 status
- [ ] `20_Decision_Log.md` updated with any implementation-time deltas from this plan

## Commit Message
`test(sprint8-day10): full safety/integration/regression suite; close out Sprint 8`

## Documentation Updates
`01_Master_Roadmap.md` (status), `20_Decision_Log.md` (final deltas, if any), and this file's own checklist constitute Sprint 8's complete closing documentation.

## End-of-Day Review
Sprint 8 — the sprint the brief called "the most important architectural sprint of HireLens" — is complete when, and only when, every box in today's checklist is genuinely checked, not assumed. This document intentionally does not declare Sprint 8 "done" on its own authority; that determination is made by actually running Day 10's steps against the real implementation and recording the results in `01_Master_Roadmap.md`.

## Tomorrow Preview
Sprint 8 is the last day of this planning package. Per `01_Master_Roadmap.md`, the next scheduled work is Sprint 10 (Career Roadmap & Learning Engine) — full personalized study-roadmap generation building on Sprint 8's `analyze_skill_gap` tool — followed by Sprint 11's Premium UI/UX Redesign. Both remain out of scope until their own dedicated planning documents are produced.
