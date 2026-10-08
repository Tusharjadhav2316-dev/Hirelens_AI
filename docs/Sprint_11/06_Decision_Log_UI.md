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

## ADR-UI-05: Dashboard (Day 05) Activity Chart & Collapsible Sidebar Rail
- **Context**: PDF Page 8 contains a timeseries Activity Overview chart and a collapsible sidebar interaction. The repository does not currently store timeseries activity data.
- **Decision**:
  1. Do not install heavy charting libraries to fabricate synthetic timeseries graphs. Instead, render a faithful Activity Overview card matching PDF Page 8 proportions with an honest empty state explaining that activity insights will appear once enough application and interview data is recorded.
  2. Implement collapsible sidebar state (`isCollapsed`) synchronized directly between `<Sidebar />` and the main dashboard content offset (`lg:pl-64` vs `lg:pl-20`) in `DashboardLayout`, ensuring zero layout mismatch or overlap.
  3. Strict 9 navigation items in the exact product order specified for Day 05.

