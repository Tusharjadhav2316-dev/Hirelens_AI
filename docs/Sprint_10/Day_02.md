# Sprint 10 — Day 2

## Day Title
Dedicated Trainer Feature, Navigation, Universal Role Intelligence, and Interview Setup

## Objective
Create the dedicated `/dashboard/interview-trainer` route tree and its Sidebar entry, build the `analyze_role` tool and `RoleIntelligence` schema so any user-entered role works, and build the setup + consent flow. No voice or camera yet — today establishes the feature's home and its role-agnostic brain.

## Why
The brief's two hardest non-negotiables land today: the Trainer must be a first-class feature rather than a Career Agent mode, and it must not hardcode "Software Engineer." The second is a concrete code fix — `interview_manager.detect_target_role()` currently defaults to exactly that string.

## Repository Evidence
- `frontend/components/Sidebar.tsx` — nav array confirmed; "AI Career Agent" carries `isPrimary: true`, establishing the pattern for a visually-promoted entry.
- `frontend/app/dashboard/` — existing per-feature route folders confirm the convention a new `interview-trainer/` folder follows.
- `agent-service/crew/interview_manager.py` — `detect_target_role(clean, resume)` confirmed to fall back to `"Software Engineer"`.
- `frontend/contexts/ResumeContext.tsx` — existing resume state to reuse; no duplicate resume storage is created.
- `agent-service/tools/interview_tools.py` — `INTERVIEW_GUARDRAIL` constant to share with the new tool.

## Existing Functionality
Sidebar, dashboard layout + auth guard, `ResumeContext`, attachment handling, Sprint 9's in-Agent text interview (remains working, untouched).

## New Functionality
Trainer landing page, setup page, Sidebar entry, `analyze_role` tool, `RoleIntelligence` schema, consent UI (mic/camera requested but not yet used).

## Architecture
New route tree; new tool on the existing `interview_coach_agent`'s tool list (agent count unchanged at 7). Setup state is client-side React state until Day 3 adds persistence.

## Concepts
Prompt-driven generalization over enumerated taxonomies; evidence provenance (`evidence_basis` / `assumptions`) as a first-class output field rather than a disclaimer.

## Prerequisites
**Day 1 architecture approved.**

## Dependencies
None new.

## Resources
`Sidebar.tsx`, `app/dashboard/agent/page.tsx` (route/layout conventions), `24_UI_Wireframes.md` Sprint 10 section, `tools/interview_tools.py`.

## Files to Inspect
- `frontend/components/Sidebar.tsx`
- `frontend/app/dashboard/layout.tsx`
- `frontend/contexts/ResumeContext.tsx`
- `agent-service/crew/interview_manager.py` (`detect_target_role`)

## Files to Modify
- `frontend/components/Sidebar.tsx` — add "AI Interview Trainer" after "AI Career Agent"
- `agent-service/tools/interview_tools.py` — add `analyze_role`
- `agent-service/crew/agents/interview_coach_agent.py` — add `analyze_role` to its tool allowlist
- `agent-service/crew/interview_manager.py` — `detect_target_role` no longer silently defaults; returns `None` so the caller prompts the user

## Files to Create
- `frontend/app/dashboard/interview-trainer/page.tsx` (landing)
- `frontend/app/dashboard/interview-trainer/setup/page.tsx`
- `frontend/components/interview-trainer/RoleInput.tsx`
- `frontend/components/interview-trainer/InterviewConfigForm.tsx`
- `frontend/components/interview-trainer/MediaConsentPanel.tsx`
- `agent-service/schemas/role_intelligence.py`
- `agent-service/tests/test_role_intelligence.py`

## Architecture Impact
First HireLens feature with its own multi-page route tree under `dashboard/`. Additive only.

## Data Flow
```
Setup form (role, JD?, type, difficulty, mode) + ResumeContext resume
  -> POST /api/agent/chat { message: "analyze role", target_role, job_description?, resume }
  -> manager.py trainer branch -> analyze_role tool
  -> RoleIntelligence JSON -> artifact: interview_setup_summary
  -> rendered as the Interview Strategy Preview (24_UI_Wireframes.md)
```

## State Flow
All setup state is component-scoped React state today. `RoleIntelligence` is held client-side and will be written into the persisted session on Day 3.

## Agent Responsibilities
`interview_coach_agent` gains `analyze_role`. No new agents.

## Service Responsibilities
`interview_manager.detect_target_role` changes from "guess a default" to "report unknown," pushing the decision to an explicit user prompt.

## Tool Responsibilities
`analyze_role(target_role, job_description?, resume_text?) -> RoleIntelligence` — shares `INTERVIEW_GUARDRAIL`; must set `evidence_basis` honestly and list `assumptions` when no JD is present; must never invent employer/project facts about the candidate.

## UI/UX Work
Landing page (start new + past sessions empty state), setup form with free-text role input, JD optional with an explicit note about inference, training-mode explanation, and separate mic/camera consent panels with the privacy statement ("your camera feed never leaves your device").

## Voice/Audio Work
Permission *request* UI only — capture is Day 5.

## Camera/Visual Work
Permission *request* UI only — capture is Day 8.

## Security
Trainer pages sit inside the existing authenticated `dashboard/layout.tsx` guard. `analyze_role` receives role/JD/resume as data under the existing internal-JWT boundary.

## Privacy
Consent copy written today must be accurate about what Days 5–8 will actually do — no overclaiming.

## Cost Controls
`analyze_role` runs once per session setup, with a bounded token cap; JD text truncated as existing tools already do.

## Implementation Plan
1. Add the Sidebar entry (non-primary styling; "AI Career Agent" keeps `isPrimary`).
2. Build landing page with empty state.
3. Build setup page: `RoleInput` (free text, required, no default), `InterviewConfigForm`, `MediaConsentPanel`.
4. Define `RoleIntelligence` with `model_config = {"extra": "forbid"}`.
5. Implement `analyze_role` sharing `INTERVIEW_GUARDRAIL`; prompt must classify `evidence_basis` and enumerate `assumptions`.
6. Change `detect_target_role` to return `None` rather than `"Software Engineer"`; the trainer branch asks the user when it's `None`.
7. Render the strategy preview artifact.

## Testing
- `test_role_intelligence.py`: returns plausible role-appropriate categories for "Business Analyst", "Teacher", "Financial Analyst", "Museum Curator" — and never emits "Software Engineer" content for a non-engineering role; `evidence_basis == "role_inference"` and `assumptions` non-empty when no JD; `extra="forbid"` rejects injected fields.
- Component tests: setup form blocks submission with an empty role (no silent default).

## Regression Testing
Full Sprint 8 + 9 suites unchanged. Critically: Sprint 9's Route 4a/4b/4c text interview must still work, which requires checking every caller of `detect_target_role` handles the new `None` return.

## Manual Verification
Navigate to the new Sidebar entry; run setup for a non-technical role; confirm the strategy preview is role-appropriate and labels its inferences.

## Expected Behaviour
Any typed role produces a sensible interview strategy; no role is ever assumed.

## Failure Cases
Empty role → form blocks with a clear message, never defaults. `analyze_role` malformed output → schema validation fails → fall back to a generic-but-honest strategy that states it couldn't analyze the role in depth.

## Debugging Guidance
If a non-engineering role yields engineering questions, check that `target_role` is actually reaching the prompt — a dropped parameter is likelier than a model failure. If Sprint 9's text interview breaks, the `detect_target_role` `None` change is the first suspect.

## Rollback Considerations
Revert the Sidebar entry and delete the route folder; revert `detect_target_role` to its Sprint 9 form. The `analyze_role` tool is additive and can remain unused without harm.

## Checklist
- [ ] Sidebar entry added; no existing entry altered
- [ ] Landing + setup pages built per wireframes
- [ ] Free-text role input with no default, required
- [ ] `RoleIntelligence` schema with `extra="forbid"`
- [ ] `analyze_role` implemented, sharing `INTERVIEW_GUARDRAIL`
- [ ] `detect_target_role` no longer defaults to "Software Engineer"
- [ ] All `detect_target_role` callers handle `None`
- [ ] Sprint 9 text interview regression-verified

## Commit Message
`feat(sprint10-day2): dedicated Interview Trainer feature, navigation, universal role intelligence`

## Documentation Updates
`02_Architecture.md` role intelligence section and `24_UI_Wireframes.md` setup screens are the specs implemented today.

## End-of-Day Review
The Trainer has its own home in the product and a role-agnostic brain. The hardcoded-role problem is fixed at its source.

## Tomorrow Preview
Day 3 adds the persistent trainer session collection and assembles full candidate context (resume, JD, attachments, role intelligence) into a session record.
