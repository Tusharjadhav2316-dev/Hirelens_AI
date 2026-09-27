# Day 06 — AI Career Agent

## Objective
Visually rework `/dashboard/agent` to match PDF page 7 (header with "Multi-Agent System" pill, message bubbles, activity checklist, attachment chip, quick-action chips, model-label control, and the Artifact Canvas with filter chips and typed artifact cards), without changing the underlying agent/streaming architecture.

## Reference
PDF page: **7** · Route: `/dashboard/agent`

## Current Repository State
`app/dashboard/agent/page.tsx` (350 lines) plus `components/agent/{AgentActivityTrace,ArtifactCanvas,ArtifactRenderer,ConversationPane,InterviewSetup,QuickActions}.tsx` and 14 artifact renderers — **this is by far the most functionally complete page in the app** (Sprints 8–10). Classification is **B (visual rework)**, not structural — the two-pane conversation/canvas structure, streaming, quick actions, and artifact rendering **already exist and already match the reference's structure**. This day is styling, not architecture.

## Target UI
Left pane header: hex logo, "AI Career Agent", a pill reading "⊙ Multi-Agent System", subtitle, `ScriptAccent`. Message thread styled per the design system (assistant bubble left with logo avatar, user bubble right with `MonogramAvatar`, timestamps). `AgentActivityTrace` restyled as the reference's checklist (✓ done rows, a highlighted in-progress row, greyed pending rows). Attachment chip restyled (file-type icon, name, size/category, ✕). Composer restyled (paperclip, input, circular gradient send button). `QuickActions` chip row restyled as pill chips. Model control restyled — **see C-02: relabelled truthfully, not "GPT-4o"**. Right pane: "Artifact Canvas" header with sort control and expand icon; filter chip row (All/Resume/ATS/Jobs/Cover Letter/Interview/More); each of the 14 artifact renderers gets the Day 01 card treatment (title, timestamp, bookmark icon, `ScoreRing`/`MetricBar`/`Tag`/`InsightRow` primitives where applicable) without changing what data they render or how.

## Current vs Target Difference
- Current: functional two-pane layout with working streaming, artifacts, quick actions. Target: **same structure**, restyled surfaces/typography/spacing/icons to match the reference, plus the "Multi-Agent System" pill and filter chip row which may not currently exist (**verify**).
- Current: model control likely absent or generic. Target: present, truthful label, per C-02/D-08.

## Layout Specification
Unchanged two-pane split (verify current column proportions against the reference's ~55/45 conversation/canvas split; adjust only if clearly mismatched).

## Component Specification
Apply Day 01's `PageHeader`-adjacent header pattern (this page's header sits inside the conversation pane, not a full-width `PageHeader` — reference shows a lighter-weight in-pane header here, distinct from other pages' page headers; use `IconTile`/`ScriptAccent` but not the full `PageHeader` component). Restyle each of the 14 existing `components/agent/artifacts/*` files' **presentation only** — component props/data contracts unchanged. Add a filter-chip row to `ArtifactCanvas.tsx` if not already present (verify) using the Day 01 `Tag`/chip pattern.

## Typography / Colors / Spacing / Cards / Buttons / Icons
Per `08_Design_System_Extraction.md`; artifact cards use the standard card treatment; the in-progress activity row uses `--brand-primary` with a subtle pulse (the one deliberately-animated element per the Motion policy).

## Images / Assets
HireLens hex logo mark (A-01) used as the assistant avatar — first page requiring it in a chat-avatar context.

## Image Generation Requirement
Not applicable.

## Responsive Behavior
- **Desktop:** two-pane as designed.
- **Tablet:** panes may narrow proportionally; if genuinely too tight, canvas becomes a slide-over triggered by a toggle (verify current responsive handling before changing it — this page may already have a mobile pattern from its own sprint).
- **Mobile:** verify and preserve whatever tab/toggle mechanism already exists between conversation and canvas (per Sprint 8's own mobile design in `24_UI_Wireframes.md`); restyle, do not replace, that mechanism.

## Existing Functionality To Preserve
**Everything.** Streaming responses, all 14 artifact types rendering correctly, quick-action chip behaviour, attachment upload/removal, message send, `Ctrl`/`Enter` send-shortcut if present, scroll-to-latest behaviour, session/conversation state.

## Files To Inspect
`app/dashboard/agent/page.tsx`, `components/agent/*.tsx` (all 6 shell files), `components/agent/artifacts/*.tsx` (all 14), `lib/agentStreamClient.ts` (read-only, to confirm what data is actually available to render — e.g. does a "model" field exist in any response to label truthfully).

## Files To Modify
`app/dashboard/agent/page.tsx`, `components/agent/AgentActivityTrace.tsx`, `components/agent/ArtifactCanvas.tsx`, `components/agent/ConversationPane.tsx`, `components/agent/QuickActions.tsx`, and **presentation-only** edits to all 14 `components/agent/artifacts/*.tsx` files (apply Day 01 primitives; do not change props/interfaces).

## Files To Create
None expected — this day should be achievable entirely by restyling existing components with Day 01 primitives. If a genuinely new visual element (e.g. the "Multi-Agent System" pill, if absent) requires a new tiny component, keep it local to `components/agent/`.

## Files That Must NOT Be Changed
`lib/agentStreamClient.ts`, `app/api/agent/chat/route.ts`, `agent-service/**`, the `Artifact` type union in `types/agent.ts` (structure), any artifact component's props/interface.

## Implementation Steps
1. Inspect every one of the 20 listed files before changing anything — this page has the largest existing surface area of any day in the sprint.
2. Confirm whether the "Multi-Agent System" pill and canvas filter-chip row exist; add only if genuinely absent.
3. Restyle the conversation header, message bubbles, activity trace, attachment chip, composer, and quick-action chips using Day 01 primitives.
4. Restyle the canvas header and, one at a time, each of the 14 artifact renderers — verify each still renders its real data correctly after restyling.
5. Resolve C-02: relabel the model control truthfully; disable interaction unless multiple models are genuinely selectable (verify with the agent service).

## Antigravity Execution Instructions
Standard 20-step protocol, with extra weight on STEP 4 (understand existing functionality) given this page's complexity, and STEP 14 (test all interactions) which must include: sending a message and observing a real streamed response, triggering at least 3 different artifact types (e.g. ATS, resume diff, job result) and confirming each still renders correctly, uploading and removing an attachment, and clicking each quick-action chip.

## Live Server Verification
Phase 1 at `/dashboard/agent`, with a real backend conversation exercised, not just a static screenshot comparison.

## Visual Comparison Checklist
Full 20-point Phase 2 against PDF page 7, applied separately to the conversation pane and the artifact canvas.

## Functional QA
Full agent conversation flow end-to-end; all 14 artifact types spot-checked (at minimum the ones with real data available: ATS, resume diff/preview, skill gap, job result, interview question/feedback/report, cover letter preview); attachment upload/remove; quick actions.

## Accessibility QA
Message thread is a live region (`aria-live`) for streamed updates; activity trace rows are announced sensibly; attachment removal button has `aria-label`; artifact cards' action buttons are properly labelled; filter chips are a real tab/radio group (keyboard operable).

## Regression Tests
Full Phase 6, plus the existing agent-specific test suites (`agentQuickActions`, `agentActivityTrace`, `agentAttachments`, `agentToolContracts`, `agentStreamClient`, `agentSafety`, and any interview-artifact tests) — **all must still pass**, since this is the page most likely to have snapshot/DOM-structure assertions that a restyle could break.

## Failure Cases
If restyling an artifact component accidentally changes its prop shape or removes a data-bearing element, its test suite will catch this — treat any failing agent test as a hard stop, not a test to "fix" by loosening the assertion.

## Rollback Plan
Revert all 20+ touched files to their pre-Day-06 versions; because no props/interfaces changed, this is a clean, low-risk rollback.

## Definition Of Done
Page matches PDF page 7 per the 20-point checklist; all 14 artifact types verified still functionally correct; model-label conflict resolved per C-02; every existing agent test suite green; full regression suite green.
