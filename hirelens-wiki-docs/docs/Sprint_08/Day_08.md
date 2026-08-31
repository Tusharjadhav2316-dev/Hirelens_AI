# Sprint 8 — Day 8

## Day Title
Generative UI — Artifact Canvas Renderers

## Objective
Implement the closed set of Generative UI artifact renderers defined in `02_Architecture.md`: `ats_score_card`, `resume_diff`, `job_result_card`, `skill_gap_card`, `cover_letter_preview`, `interview_question_card`, and `task_progress` — each rendering a specific, known, typed artifact payload. Apply/Reject *buttons* are rendered today (visually complete); wiring their click handlers to actually mutate `ResumeContext` is Day 9's job.

## Why This Day Exists
This is the concrete mechanism behind the brief's "the frontend should render known structured components safely... the model must NOT be allowed to generate arbitrary executable UI." Day 8 proves that constraint in code: the switch over `artifact.type` is exhaustive and closed, with an explicit fallback for anything unrecognized.

## Repository Evidence / Current State
- Confirmed: `frontend/components/ATSScorePanel.tsx` (or equivalent, from Sprint 4) already renders the exact `ATSResult` shape `get_ats_analysis` returns — today's `ats_score_card` renderer wraps/reuses this existing component rather than rebuilding score visualization from scratch, keeping one visual source of truth for "what an ATS score looks like."
- No existing component renders a resume diff, job listing, skill gap, or interview question — all four are new to Sprint 8.

## Concepts
- Discriminated union rendering in React/TypeScript — `switch (artifact.type)` over the closed `Artifact` union from `02_Architecture.md`, with an unreachable/`default` case that logs and renders nothing, never raw HTML.
- Reusing an existing visual component (`ATSScorePanel`) inside a new artifact wrapper, rather than duplicating its markup.

## Prerequisites
Day 7 complete: Agent Workspace shell exists and renders the activity trace.

## Setup
No new dependencies.

## Resources
- `frontend/components/ATSScorePanel.tsx` (or the actual existing ATS-score-rendering component — confirm exact name during implementation) — reused, not rebuilt.
- `24_UI_Wireframes.md`'s per-artifact ASCII mockups (Resume Diff, ATS Score Card, Job Result Card states).

## Files to Inspect
- The existing ATS score display component in `frontend/components/`

## Files to Create
- `frontend/components/agent/ArtifactRenderer.tsx` (the closed switch/dispatcher)
- `frontend/components/agent/artifacts/ATSScoreCard.tsx`
- `frontend/components/agent/artifacts/ResumeDiffCard.tsx`
- `frontend/components/agent/artifacts/JobResultCard.tsx`
- `frontend/components/agent/artifacts/SkillGapCard.tsx`
- `frontend/components/agent/artifacts/CoverLetterPreview.tsx`
- `frontend/components/agent/artifacts/InterviewQuestionCard.tsx`
- `frontend/components/agent/artifacts/TaskProgress.tsx`

## Files to Modify
- `frontend/components/agent/ArtifactCanvas.tsx` (Day 7) — now renders via `ArtifactRenderer` instead of the placeholder activity-only view

## Architecture Impact
Completes the Generative UI contract end-to-end: Python emits a typed artifact → NDJSON carries it → TypeScript renders exactly one of a known, closed set of components. No markdown-to-HTML rendering, no `dangerouslySetInnerHTML`, anywhere in this pipeline.

## Data Flow
```
artifact event arrives (Day 6 stream)
  -> ArtifactCanvas appends artifact to its list
  -> ArtifactRenderer switches on artifact.type
       "ats_score_card"        -> <ATSScoreCard data={...} />  (wraps existing panel component)
       "resume_diff"           -> <ResumeDiffCard data={...} />  (Apply/Reject buttons rendered, not yet wired)
       "job_result_card"       -> <JobResultCard data={...} />  (handles empty/not_configured state per wireframe)
       "skill_gap_card"        -> <SkillGapCard data={...} />
       "cover_letter_preview"  -> <CoverLetterPreview data={...} />
       "interview_question_card" -> <InterviewQuestionCard data={...} />
       "task_progress"         -> <TaskProgress data={...} />
       default                 -> console.warn("unknown artifact type"), render nothing
```

## Implementation Plan

### Step 1 — `ArtifactRenderer.tsx`
```typescript
export function ArtifactRenderer({ artifact }: { artifact: Artifact }) {
  switch (artifact.type) {
    case "ats_score_card": return <ATSScoreCard data={artifact.data} />;
    case "resume_diff": return <ResumeDiffCard data={artifact.data} />;
    case "job_result_card": return <JobResultCard data={artifact.data} />;
    case "skill_gap_card": return <SkillGapCard data={artifact.data} />;
    case "cover_letter_preview": return <CoverLetterPreview data={artifact.data} />;
    case "interview_question_card": return <InterviewQuestionCard data={artifact.data} />;
    case "task_progress": return <TaskProgress data={artifact.data} />;
    default:
      console.warn("Unknown artifact type received - ignored", artifact);
      return null;
  }
}
```
TypeScript's exhaustiveness checking on the discriminated union (`Artifact` type from `types/agent.ts`) means adding a new artifact type without a corresponding case is a compile error, not a silent runtime gap — this is the strongest available guarantee against "the model generates a UI type we forgot to handle."

### Step 2 — `ATSScoreCard.tsx`
Thin wrapper composing the existing ATS panel component with the artifact's `ATSResult` data plus a short agent-generated explanation string rendered as plain text above it (never as raw HTML).

### Step 3 — `ResumeDiffCard.tsx`
Renders `before`/`after`/`rationale` per the wireframe's "Proposed Change" mockup, with `[Apply Change]` and `[Reject]` buttons present and styled, `onClick` handlers stubbed as no-ops with a `// TODO Day 9` comment — visually complete, functionally inert until tomorrow.

### Step 4 — `JobResultCard.tsx`
Explicitly branches on the underlying `JobSearchResult.status`: a `not_configured` status renders the single explanatory card from the wireframe spec, never an empty list styled to look like "zero results found" (which would misleadingly imply a real search happened and found nothing).

### Step 5 — Remaining Cards
`SkillGapCard`, `CoverLetterPreview`, `InterviewQuestionCard`, `TaskProgress` follow the same "typed data in, no raw HTML, matches the wireframe mockup" pattern.

## Ready-to-Paste Antigravity Prompt
"Create `components/agent/ArtifactRenderer.tsx` with an exhaustive `switch` over the `Artifact` discriminated union from `types/agent.ts`, dispatching to one typed component per artifact type, with a `default` case that only logs a warning and renders nothing. Create `components/agent/artifacts/JobResultCard.tsx` that explicitly checks `data.status === 'not_configured'` and renders the explanatory 'not connected yet' card from `24_UI_Wireframes.md` rather than an empty results list in that case."

## Testing
- Component test: `ArtifactRenderer` given each of the 7 artifact types renders the corresponding component (snapshot or type-based assertion, not pixel comparison).
- Component test: `ArtifactRenderer` given an artifact with an unrecognized `type` string renders `null` and does not throw.
- Component test: `JobResultCard` given `status: "not_configured"` never renders a "0 results" or empty-list state — asserts the specific explanatory copy is present instead.

## Regression Testing
Confirm the existing ATS score component, wherever else it's used in the app (e.g. the standalone ATS Analyzer page), is completely unaffected by being reused inside `ATSScoreCard.tsx` — it should be composed, not modified.

## Manual Verification
Trigger each of the 7 artifact types via real agent turns (ATS check, resume improvement, job search, skill gap via the application workflow, cover letter, interview prep) and visually confirm each renders per its wireframe mockup.

## Expected Behaviour
Every artifact type the backend can emit has a corresponding, correct visual representation; nothing renders as raw unstyled JSON or markdown dump.

## Failure Cases
- A malformed artifact payload (fails Pydantic/TS schema validation somewhere upstream) should never reach `ArtifactRenderer` at all — Day 6/Day 1's schema validation is the actual backstop; today's `default` case is a defense-in-depth safety net, not the primary guarantee.

## Debugging Guidance
If a card renders with missing/undefined fields, check the artifact's `data` shape against `types/agent.ts` first — a shape mismatch between Python's Pydantic model and the TypeScript interface is the most likely cause, and is exactly the kind of drift `26_Risks.md` flags as a known Sprint 8 tech-debt risk.

## Security Considerations
Confirm no artifact renderer ever uses `dangerouslySetInnerHTML` or evaluates any string as code/markup — every field is rendered as plain React text/props.

## Checklist
- [ ] All 7 artifact renderers implemented and matching wireframe mockups
- [ ] `ArtifactRenderer`'s switch is exhaustive (TypeScript compiler enforced)
- [ ] Unknown artifact types are safely ignored, never crash the UI
- [ ] `JobResultCard` correctly distinguishes "not configured" from "zero real results"
- [ ] Existing ATS component reused, not duplicated or modified

## Commit Message
`feat(sprint8-day8): Generative UI artifact renderers, closed type-safe artifact union`

## Documentation Updates
`02_Architecture.md`'s Generative UI section is the spec implemented today; no further changes needed.

## End-of-Day Review
Every capability in the brief now has a real, visible result in the Agent Workspace. The one missing piece is that clicking "Apply" doesn't do anything yet — Day 9.

## Tomorrow Preview
Day 9 wires Apply/Reject to actually mutate `ResumeContext`, adds the daily rate-limit counter, and performs the security/cost hardening pass before Day 10's full test suite.
