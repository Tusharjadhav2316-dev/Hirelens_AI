# Day 05 — Dashboard / Home

## Objective
Restructure `/dashboard` to match PDF page 5: greeting header with a "Stay consistent" nudge, 4-stat row + Career Journey card, 5-item Quick Actions row, and a 3-column bottom section (Recent Resumes / Recommended for You / Activity Overview chart), closing with a promo band.

## Reference
PDF page: **5** · Route: `/dashboard`

## Current Repository State
`app/dashboard/page.tsx` (112 lines) — simple greeting ("Welcome back, {name}") + a **3-card** quick-actions grid (Create Resume, Analyze Resume, Generate Cover Letter) with placeholder-labelled data (`quickActions` comment reads "placeholder data"). No stat row, no Career Journey stepper, no Recent Resumes/Recommended/Activity Overview.

## Target UI
Greeting ("Good morning, {name}! 👋" — verify whether time-of-day logic exists or must be added simply) + subtitle + date + `PromoBand`-style "Stay consistent" nudge card + `ScriptAccent`. 4 `StatCard`s (Resume Score / Applications / Interviews / Profile Views) beside a "Your Career Journey" card with a 4-node `StepTracker` (vertical mini-variant or horizontal compact). "Quick Actions" — 5 `ActionCard`s (reuse Day 02's component: Create Resume, Analyze Resume, Generate Cover Letter, Find Jobs, Interview Practice). Bottom 3-column: Recent Resumes list, Recommended for You list, Activity Overview area chart. Closing `PromoBand` ("Let AI be your career companion.").

## Current vs Target Difference
- Current: 3 quick actions with explicitly-labelled placeholder data. Target: 5 actions, and the underlying data question resolved honestly (see Data Truthfulness below) rather than expanded with more placeholders.
- Current: no stat row at all. Target: 4 stats, of which **Resume Score** has a real source (`atsAnalyzer.ts` via history) and **Applications/Interviews/Profile Views** have **no data source** (confirmed in `02_Repository_Audit.md`/`07_Future_Sprint_Boundaries.md`).
- Current: no Career Journey, Recent Resumes, Recommended, or Activity chart sections exist.

## Layout Specification
Header block full width. Stat row: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for the 4 stats, with the Career Journey card as a 5th, wider cell spanning proportionally more width on large screens (reference shows it roughly stat-card-width ×1.5–2). Quick Actions: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`. Bottom row: `grid-cols-1 lg:grid-cols-3`.

## Component Specification
`StatCard` (icon tile, large number, delta pill, caption) — **new**, justified by 4 near-identical instances (`09_Shared_Component_Strategy.md`). `ActionCard` — reused from Day 02. `StepTracker` — reused from Day 02, new "4-node with progress fill" configuration. New list-row components: a generic `ListRow` (thumbnail/icon + title + meta + trailing control) covers Recent Resumes and Recommended For You without a bespoke component per list. Activity chart — see Data/Dependency decision below.

## Typography
Greeting H1 ~28–32px; stat numbers ~32–36px per `08_Design_System_Extraction.md`.

## Colors
Delta pills green (positive) — verify whether a negative-delta treatment is ever needed; if so add a red variant even though the reference only shows positive deltas.

## Spacing / Cards / Buttons / Icons
Per `08_Design_System_Extraction.md`; `StatCard` uses the compact rail-card padding.

## Images / Assets
Resume thumbnails (A-11): render a small scaled preview of the actual resume template component if feasible within a day's scope, otherwise a generic document icon — **do not** generate a static image per resume.

## Image Generation Requirement
Not applicable.

## Responsive Behavior
- **Desktop:** as designed.
- **Tablet:** stat row 2×2 wrapping, Career Journey card moves below the stat grid rather than beside it; Quick Actions 2–3 columns; bottom row stacks 3→2→1 depending on width.
- **Mobile:** everything single column, stat cards full width, chart becomes horizontally scrollable within its own card if it can't compress further (never causes page-level horizontal scroll).

## Existing Functionality To Preserve
Whatever the current 3 quick-action links actually do (verify — likely simple `<Link>` navigation); the greeting's use of `user?.displayName`.

## Data Truthfulness — Explicit Per-Metric Resolution
| Metric | Source available? | Day 05 behaviour |
|---|---|---|
| Resume Score | **Yes** — via existing ATS/history services | Render real value; verify exact source during implementation |
| Applications | No | `StatCard` renders an empty/"—" state with a one-line explanatory caption, not a fabricated number |
| Interviews | Partial — `interviewTrainerSessionService.ts` may provide a count of completed sessions; **verify** | Render real count if derivable; otherwise empty state |
| Profile Views | No | Empty state |
| Career Journey stepper | Derive node 1 (Resume) completion from whether a resume exists in `ResumeContext`/history; nodes 2–4 have no data source | Show node 1 as completed if genuinely true; nodes 2–4 render as their default/inactive state, not fabricated "in progress" |
| Recent Resumes | **Yes** — `historyService.ts` | Real data; empty state if the user has none |
| Recommended for You | No AI-recommendation engine confirmed | Render as static, clearly-labelled suggestions pointing at real features (e.g. "Improve your resume →", "Practice an interview →") rather than personalized claims the app can't back |
| Activity Overview chart | No timeseries data source | Empty state with a short explanation; chart component still built (see below) so it's ready once data exists |

## Files To Inspect
`app/dashboard/page.tsx` (full), `lib/historyService.ts`, `lib/atsAnalyzer.ts`, `lib/interviewTrainerSessionService.ts`, `contexts/ResumeContext.tsx`.

## Files To Modify
`app/dashboard/page.tsx` — substantial rework.

## Files To Create
`components/common/StatCard.tsx`, `components/common/ListRow.tsx`, `components/dashboard/CareerJourneyCard.tsx`, `components/dashboard/ActivityChart.tsx` (or `ActivityChartEmpty.tsx` if the dependency decision below defers the real chart).

## Files That Must NOT Be Changed
`lib/historyService.ts`, `lib/atsAnalyzer.ts`, `contexts/ResumeContext.tsx` (read-only consumption).

## Implementation Steps
1. Inspect current `dashboard/page.tsx` and every listed data source fully; produce the per-metric table above with confirmed (not assumed) answers.
2. Build `StatCard`, `ListRow`, `CareerJourneyCard`.
3. **Dependency decision (log per D-11):** evaluate hand-rolled SVG area chart vs. adding a charting library for Activity Overview. Given the metric has **no data source today**, recommend building the empty-state card now and deferring the actual chart implementation/dependency choice to whenever real timeseries data exists — this avoids adding a dependency to render an empty state. Log this explicitly rather than silently skipping the section.
4. Assemble the page: header, stat row + Career Journey, Quick Actions (5 cards, reusing `ActionCard`), bottom 3-column with real Recent Resumes, static-but-honest Recommended list, and the Activity Overview empty state.
5. Add the closing `PromoBand`.

## Antigravity Execution Instructions
Standard 20-step protocol. STEP 3 review PDF page 5 closely including exact stat/caption wording. STEP 4 is unusually important here — confirm with certainty which metrics are real before writing any UI, per the Data Truthfulness table. STEP 6 reuse `ActionCard`/`ScriptAccent`/`PromoBand`/`StepTracker` from Days 01–02. STEP 14 functional QA includes clicking through every Quick Action and every Recent Resume row.

## Live Server Verification
Phase 1 at `/dashboard`, tested against both an account with resume history and a fresh account with none.

## Visual Comparison Checklist
Full 20-point Phase 2 against PDF page 5.

## Functional QA
Quick Actions navigate to their real destinations; Recent Resumes rows link to/open the correct resume; empty states render correctly for a fresh account; Career Journey node 1 reflects real resume-existence state.

## Accessibility QA
Stat cards are not colour-only for their delta (include a `+`/`-` glyph or text, not just green/red); chart (when built) has a text-equivalent summary or table fallback; list rows are proper links/buttons, not divs with click handlers.

## Regression Tests
Full Phase 6; confirm `historyService`/`atsAnalyzer` calls are read-only and unchanged in behaviour, only in presentation.

## Failure Cases
If `historyService.ts` throws for a user with zero history, the page must show the empty state, not crash — verify this explicitly with a fresh test account.

## Rollback Plan
Revert `app/dashboard/page.tsx`; delete new dashboard-specific components; `StatCard`/`ListRow` may be left in place if unused elsewhere causes no harm, or removed for cleanliness.

## Definition Of Done
Dashboard matches PDF page 5 per the 20-point checklist with every metric traced to a real source or an honest empty state (no fabricated numbers), full regression suite green, charting dependency decision logged in `06_Decision_Log_UI.md`.
