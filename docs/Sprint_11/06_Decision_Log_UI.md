# Sprint 11 — Decision Log (UI Architecture)

> Log of architectural and design decisions for Sprint 11, verified against the **13-page finalized reference PDF**.

---

## ADR-UI-01: 13-Page Reference Mapping & 14-Day Implementation Strategy
- **Context**: The finalized reference PDF contains 13 high-resolution artboards covering all core pages.
- **Decision**: 
  - Day 01 establishes the shared design system foundation, tokens, fonts, and AppShell.
  - Days 02–14 implement the 12 application routes in a 1:1 mapping against the 13-page reference PDF.
  - Days 11–14 (Cover Letters, Career Coach, Resume History, Profile Settings) are promoted to full structural implementations backed by PDF Pages 5, 2, 3, and 4.

## ADR-UI-02: Single Canonical ATS Analyzer (PDF Page 11)
- **Context**: The previous draft assumed two conflicting ATS variants.
- **Decision**: Page 11 of the 13-page PDF is confirmed as the single canonical ATS Analyzer layout. It contains the uploaded file chip with `✓ Ready` badge, 0/5000 character counter, sample JD chips, full-width gradient button, and 4-column results view.

## ADR-UI-03: Route Preservation & Label Modernization
- **Context**: Sidebar labels in the reference differ slightly from internal folder routes (`/dashboard/job-matcher` vs "Job Search", `/dashboard/resume-analyzer` vs "ATS Analyzer", etc.).
- **Decision**: Keep internal routes intact to avoid breaking deep links, bookmarks, and agent tool handlers. Update human-readable labels in the Sidebar, TopHeader, and PageHeader to match the approved design.

## ADR-UI-04: Data Truthfulness & Honest Empty States
- **Context**: Reference screens show mock populated data for unbacked features (e.g., third-party job listings).
- **Decision**: Render real user data from existing services (`atsAnalyzer.ts`, `historyService.ts`, `profileService.ts`, `ResumeContext`). For unbacked feature shells, render clean empty states without fabricating fake production databases.
