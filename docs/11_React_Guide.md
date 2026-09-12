# HireLens 2.0 — Frontend Framework Guide

> Filename kept as "React Guide" per design review (avoid unnecessary restructuring), but treat the title itself as unconfirmed until Sprint 1, Day 1. If the frontend turns out to use a different framework, rename this file in Sprint 2 and note the rename in `20_Decision_Log.md` — don't silently keep a misleading filename.

## Current State
**To be verified during Sprint 1, Day 1 (framework identification) and Day 4 (real component/state architecture).** Do not assume React, Vite, Tailwind, or any specific state-management library until `PROJECT_DISCOVERY.md` and `FRONTEND_AUDIT.md` confirm them with file citations.

## Target State
The redesign report's target frontend architecture: a conversational AI Career Coach as the primary shell, with dedicated tool pages (Resume Canvas, ATS Analyzer, Job Matcher, Cover Letter Designer, Application Tracker) accessible via a side panel, state synchronized between the chat layer and active tool pages. This target is framework-agnostic in principle — it describes a UX/architecture pattern, not a specific library choice. The *specific* state-management approach used to implement it (a particular library vs. the framework's built-in state primitives) is a decision for `20_Decision_Log.md`, made only after Sprint 1, Day 4 confirms what's already in use and whether it's sufficient for the cross-component synchronization the Coach pattern requires.

## Migration Strategy
1. Confirm actual framework, build tool, and styling approach (Sprint 1, Day 1).
2. Confirm actual state-management implementation and real coupling/re-render findings (Sprint 1, Day 4).
3. Sprint 2 addresses only technical debt actually found (e.g., a confirmed unmemoized provider, a confirmed race condition) — not hypothetical issues from a generic audit.
4. Sprint 4 (Frontend Refactoring) is where any deliberate state-management change happens, if Day 4's findings show the current approach can't support the Coach's cross-page synchronization needs — and only after that decision is logged in `20_Decision_Log.md` with alternatives considered.
5. Sprint 5 (AI Career Coach UI) builds the conversational shell on top of whatever foundation Sprint 2–4 confirmed and stabilized.

## Open Questions (resolve before Sprint 4)
- What frontend framework and build tool are actually in use?
- What state-management mechanism is actually in use, and is it sufficient for cross-page state sync, or does the Coach pattern require introducing something new?
- What styling approach is actually in use?
