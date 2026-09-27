# Day 07 — Resume Builder

## Objective
Rework `/dashboard/builder` into the reference's 4-column workspace (Sections rail / active form / live preview with device toggle / AI Suggestions+Score rail), preserving all editing, save, preview, export, and AI-suggestion functionality.

## Reference
PDF page: **6** · Route: `/dashboard/builder`

## Current Repository State
`app/dashboard/builder/page.tsx` is a **23-line thin wrapper** rendering `components/resume-builder/ResumeEditor.tsx`, which composes: a sections rail, per-section forms (`forms/*.tsx` — 7 files), a live `ResumePreview.tsx` with `TemplateSwitcher.tsx` (3 templates), `ATSScorePanel.tsx`, `AIImprovementModal.tsx`, `JDMatcherPanel.tsx`, `OptimizerModeSelector.tsx`. **The functional 4-region structure already substantially exists** — this is classification **C (structural rework)** for proportions/styling, not a rebuild.

## Target UI
Header: blue doc `IconTile`, "Resume Builder", subtitle, `ScriptAccent`, right actions (outlined Save with disk icon, outlined Preview with eye icon, gradient "Download PDF ⌄"). 4 columns: ① **Resume Sections** rail with an overall completion bar and a vertical list where each item has an icon + status dot (active/complete/incomplete — 3 states, verify current status model supports 3, not just boolean). ② active section form ("Personal Information" example) with a Pro Tip row at the bottom. ③ **Resume Preview** with a Desktop/Mobile `SegmentedToggle`. ④ **AI Suggestions** (badged count, 3 rows each with an action link), **Resume Score** (`ScoreRing` + "Good" pill + 5 `InsightRow`s), **Need Help?** card linking to the AI Agent.

## Current vs Target Difference
- Current: **verify actual current column count/proportions** — if `ResumeEditor.tsx` already uses a 3- or 4-column grid, this is a proportion/styling change; if it's a different structure (e.g. tabs instead of side-by-side), this is a genuine structural change requiring more care. **Do not assume 4 columns already exist — confirm during inspection.**
- Current: template switching exists (`TemplateSwitcher`) but the reference doesn't visibly show a template picker — **verify** whether it's meant to be folded into the Preview card's controls (alongside Desktop/Mobile) or left as-is elsewhere; do not remove it either way.

## Layout Specification
`grid-cols-1 xl:grid-cols-[240px_320px_1fr_300px]`-style 4-column layout at desktop (approximate proportions — confirm against the reference's actual column widths), collapsing per Responsive Behavior below.

## Component Specification
Sections rail item: icon + label + trailing status (dot/check), active item gets the tinted-pill treatment consistent with Sidebar's active state (visual echo, not code sharing). `AIImprovementModal`'s suggestions restyled as `InsightRow`-with-action rows in the right rail rather than only appearing in a modal — **verify**: does the reference's "AI Suggestions" rail duplicate or replace the existing modal trigger? Likely both: rail rows as a summary/entry point, modal for the full interaction — preserve the modal, add the rail summary.

## Typography / Colors / Spacing / Cards / Buttons / Icons
Per `08_Design_System_Extraction.md`. `ScoreRing` reused from Day 01 for Resume Score.

## Images / Assets
None new — `MonogramAvatar`/template rendering already exist via `ResumePreview.tsx`.

## Responsive Behavior
- **Desktop:** 4 columns as designed.
- **Tablet:** collapse to 2 columns — Sections rail becomes a horizontal scrollable strip or a collapsible drawer above the form; Preview and right rail stack.
- **Mobile:** single column, sequential: Sections (as a dropdown/accordion) → active form → Preview (behind a "Preview" tab/button rather than always-visible, since it cannot usefully coexist with a form on a narrow screen) → AI Suggestions/Score below.

## Existing Functionality To Preserve
Section navigation and completion tracking; all 7 form types' editing and validation; live preview updates on every keystroke; template switching; Save; Preview modal/route; Download PDF (via `pdf-lib`/`react-to-print` — verify which); ATS score computation (`ATSScorePanel`); AI Improvement modal and its suggestions; JD Matcher panel if it's reachable from this page (verify — it may be Job Matcher-page-only).

## Files To Inspect
`app/dashboard/builder/page.tsx`, `components/resume-builder/ResumeEditor.tsx` (the real target of most changes), all 7 `forms/*.tsx`, `preview/ResumePreview.tsx`, `preview/TemplateSwitcher.tsx`, `ATSScorePanel.tsx`, `AIImprovementModal.tsx`, `OptimizerModeSelector.tsx`, `contexts/ResumeContext.tsx`.

## Files To Modify
`components/resume-builder/ResumeEditor.tsx` (primary target), `ATSScorePanel.tsx` (restyle to use `ScoreRing`/`InsightRow`), section-rail markup (likely inline in `ResumeEditor.tsx` — confirm), `preview/ResumePreview.tsx` header (add/restyle Desktop/Mobile toggle).

## Files To Create
Likely none structurally new — a `SectionRailItem` sub-component may be extracted from `ResumeEditor.tsx` if it clarifies the 3-state status rework, at implementer's discretion, but is not mandated.

## Files That Must NOT Be Changed
Any `forms/*.tsx` field logic/validation (styling only), `contexts/ResumeContext.tsx`, export/save API calls, `lib/atsEngine.ts`/`atsAnalyzer.ts`.

## Implementation Steps
1. Inspect `ResumeEditor.tsx` fully to establish ground truth on current structure before assuming a rework scope.
2. Restyle the sections rail to the 3-state icon+dot pattern and the reference's completion bar.
3. Restyle the active form region and add the Pro Tip row pattern (reusable across sections where relevant content exists — do not invent tips with no basis).
4. Add/restyle the Desktop/Mobile `SegmentedToggle` on the Preview card.
5. Rework the right rail: `AIImprovementModal` summary rows via `InsightRow`, `ATSScorePanel` via `ScoreRing` + checklist, add a "Need Help?" card linking to `/dashboard/agent`.
6. Verify column proportions against the reference and adjust the grid.

## Antigravity Execution Instructions
Standard 20-step protocol. STEP 4 is critical here — do not assume the 4-column structure needs building from scratch; confirm what already exists. STEP 14 functional QA: edit a field and confirm live preview updates; switch templates; run ATS analysis; open the AI Improvement modal; save; download PDF; switch device preview.

## Live Server Verification
Phase 1 at `/dashboard/builder`, with an in-progress resume (some sections complete, some not) to properly exercise the rail's 3 states.

## Visual Comparison Checklist
Full 20-point Phase 2 against PDF page 6, column by column.

## Functional QA
All items in Existing Functionality To Preserve, exercised directly, not just observed.

## Accessibility QA
Section rail items are a real nav/list with accessible current-section indication; form fields keep their existing labels/validation messaging (restyled, not removed); Desktop/Mobile toggle is a real Radix tabs/radiogroup; Download PDF menu (⌄) is keyboard operable.

## Regression Tests
Full Phase 6, plus any existing resume-builder-specific tests.

## Failure Cases
If the reference's 4-column proportions don't leave enough room for a long-form field's validation message, widen that column rather than truncating the message.

## Rollback Plan
Revert `ResumeEditor.tsx` and the touched sub-components; forms/templates/context are untouched so the rollback surface is contained.

## Definition Of Done
Page matches PDF page 6 per the 20-point checklist; all editing/preview/save/export/ATS/AI-suggestion functionality verified working; full regression suite green.
