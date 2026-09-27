# Sprint 11 — Future Sprint Boundaries

> The reference PDF depicts a finished product. Several depicted features belong to **later sprints**. This sprint implements their **UI shell only** where the approved design requires it, and builds none of their functionality.

## Roadmap Position
Per `01_Master_Roadmap.md`: slot 11 is the UI/UX work (this sprint). After it come the Career Roadmap / Learning Engine, then payments/premium, then testing/performance and production launch.

## Boundary Table

| Feature in reference | Where it appears | This sprint | Future sprint |
|---|---|---|---|
| **Career Roadmap** | Landing feature card "Explore Roadmap →" (PDF 4); Dashboard "View Roadmap →" and the 4-node Career Journey stepper (PDF 5) | Render the card and the link; stepper renders from data that genuinely exists or shows an empty/indeterminate state. Link goes to a coming-soon affordance. **No `/career-roadmap` route is created.** | Career Roadmap / Learning Engine sprint |
| **Payments / Premium** | Sidebar "Upgrade to Pro" card + "Upgrade Now →" (all authenticated pages); public nav "Pricing"; landing "Get Started Free" | Render the upgrade card and Pricing nav item exactly as designed, pointing at a coming-soon affordance. **No Stripe, no checkout, no plan model, no entitlement checks, no feature gating.** | Payments / Premium SaaS sprint |
| **Job Search engine** | PDF 2 in full | UI layer only — see `05_Job_Search_Boundary.md` | Job Search provider integration sprint |
| **Application Tracker** | PDF 2 right rail; PDF 2 header "Track Applications" | Card shell with zero counts + empty note; button disabled/coming-soon. **No data model.** | Applications sprint (remainder of original Sprint 7 scope) |
| **Profile Views metric** | PDF 5 stat card "47 +20%" | Card shell with an empty/unavailable state — **no analytics pipeline exists** | Unscheduled |
| **Applications / Interviews counts** | PDF 5 stat cards "12", "3" | Same — empty state, no fabricated numbers | Applications sprint |
| **Activity Overview chart** | PDF 5 (30-day multi-series area chart) | Chart component may be built, but with **no timeseries data source** it renders an empty state. Charting-library decision logged on Day 05. | Unscheduled |
| **Practice-session score history / Your Progress analytics** | PDF 3 bottom row (77% overall, per-category bars, 3 past sessions with scores) | `interviewTrainerSessionService.ts` **does** persist sessions — verify at Day 10 whether stored reports contain per-category scores. Render from real sessions if available; otherwise empty state. **Do not fabricate 78/82/70.** | Trainer analytics, if wanted |
| **"AI Matched Jobs" tab** | PDF 2 | Tab renders; hosts the existing (real) JD-matcher capability | AI job matching engine sprint |
| **Notification centre** | Bell with red dot, all pages | Bell renders (it already exists in `Navbar.tsx`); **no notification backend, no dropdown content beyond an empty state** | Unscheduled |
| **Global search / Ctrl-K** | All authenticated pages | Build the input, the `Ctrl K` chip, and keyboard focus handling. **Search execution is out of scope** — no search index exists. Submitting shows an empty/coming-soon panel. Decision on Day 01. | Unscheduled |
| **Product / Solutions / Resources nav dropdowns** | Public pages | Render the nav items and dropdown affordance; **no marketing pages are created** | Marketing site work |
| **Forgot password** | PDF 9 "Forgot password?" link | Firebase Auth supports password reset — **verify** whether the repo already wires it. If yes, link it. If no, it is a small genuine gap: link renders, and the gap is logged rather than silently built. | Auth polish |
| **Social sign-in (Google/GitHub/LinkedIn)** | PDF 9, 10 | **Verify at Day 03** whether `AuthContext` already supports any OAuth provider. Render only the providers that genuinely work; do not render a button that does nothing. **Do not add new OAuth providers** — that is auth architecture work, not UI work. | Auth sprint |
| **Watch Demo** | Landing hero | Renders as designed; no video asset exists → points at a coming-soon affordance or is omitted pending an asset. Flagged to owner on Day 02. | Marketing |

## Hard Rules for Every Day
1. **Do not create routes.** If the design links somewhere that does not exist, use a disabled control or an in-page coming-soon affordance.
2. **Do not fabricate data** to populate a reference card. Empty state instead.
3. **Do not add feature gating** because an "Upgrade to Pro" card is now visible.
4. **Do not add dependencies** without logging the decision (only genuine candidate: a charting library on Day 05).
5. **Do not touch** `agent-service/`, `app/api/*`, `lib/atsEngine.ts`, `lib/atsAnalyzer.ts`, `lib/jdMatcher.ts`, `contexts/AuthContext.tsx`, or Firestore rules. If a day appears to need one of these, stop and log it.
