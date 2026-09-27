# Sprint 11 — Reference Conflicts and Repository Clarifications

> Authoritative reference audit against the **13-page finalized reference PDF**. Where the visual design depicts UI elements that interface with existing data models, the exact handling strategy is recorded here.

---

## C-01 — ATS Analyzer: Single Canonical Design Confirmed (Resolved)
- **Previous 10-Page Assumption**: The previous draft assumed two conflicting designs (Variant A vs Variant B).
- **13-Page PDF Reality**: Page 11 of the 13-page PDF is the **single canonical design** for ATS Analyzer. It includes the upload dropzone with attached file pill (`✓ Ready`), character counter `0 / 5000 characters`, sample JD chips, full-width gradient action bar, and 4-column results layout (ATS score donut, 3-color keyword tag clouds, resume preview, insights stack).
- **Resolution**: Implemented canonically on Day 08 matching PDF Page 11.

---

## C-02 — Pages 11–14 Have Full Dedicated Artboards (Resolved)
- **Previous 10-Page Assumption**: The previous draft assumed Days 11–14 (Cover Letters, Career Coach, Resume History, Profile Settings) had no reference designs and were "design system alignment only".
- **13-Page PDF Reality**: All 4 pages have rich, dedicated artboards in the 13-page reference PDF:
  - **Cover Letters** (`/dashboard/cover-letter`) $\rightarrow$ **PDF Page 5**
  - **Career Coach** (`/dashboard/career-coach`) $\rightarrow$ **PDF Page 2**
  - **Resume History** (`/dashboard/history`) $\rightarrow$ **PDF Page 3**
  - **Profile Settings** (`/dashboard/settings`) $\rightarrow$ **PDF Page 4**
- **Resolution**: Days 11–14 are now full, dedicated structural implementations matching their exact PDF artboards.

---

## C-03 — Model Selector on AI Career Agent (Day 06)
- **PDF Page 10 Appearance**: Displays a model selector chip labelled `"GPT-4o ⌄"`.
- **Repository Reality**: HireLens routes through OpenRouter with Gemini flash models. No OpenAI integration is configured.
- **Handling**: Render the model chip displaying the actual active model truthfully (`"Gemini 2.0 Flash"`), avoiding hardcoding unbacked provider claims.

---

## C-04 — User Profile Role Subtitle ("Student • CSE")
- **PDF Appearance**: Authenticated header shows `"Tushar Jadhav / Student • CSE"`.
- **Repository Reality**: Firestore `users` profile schema contains user details but may not have a populated headline for new or guest accounts.
- **Handling**: Render the headline from `profileService.ts` if present; fallback gracefully to email or omit subtitle if unconfigured. Never hardcode static strings across dynamic user sessions.

---

## C-05 — Data Truthfulness & Honest Empty States
- **PDF Appearance**: Artboards show populated sample states (e.g. 12 applications, 3 interviews, 47 profile views, 5 job listings, saved jobs).
- **Repository Reality**: Certain metrics (e.g. live third-party job listings, job application kanban) are unscheduled future backend integrations.
- **Handling**: Always render real user data where backed by existing services (`atsAnalyzer.ts`, `historyService.ts`, `profileService.ts`, `ResumeContext`). Where a service is not yet backed (e.g. external job board search API), render the complete, polished UI shell with honest empty states and preserve working tools (such as `JDMatcherPanel`).

---

## C-06 — Dark Mode Preservation
- **PDF Appearance**: Artboards are light-mode.
- **Repository Reality**: The codebase supports full dark mode via `ThemeProvider`, `ThemeToggle`, and `.dark` CSS tokens.
- **Handling**: Dark mode is strictly preserved. Day 01 defines complementary dark-mode tokens for all new brand and surface colors.

---

## C-07 — Route Preservation
- **Rule**: All existing Next.js App Router route paths are strictly preserved:
  - `/`
  - `/login`
  - `/signup`
  - `/dashboard`
  - `/dashboard/agent`
  - `/dashboard/builder`
  - `/dashboard/resume-analyzer`
  - `/dashboard/job-matcher`
  - `/dashboard/interview-trainer`
  - `/dashboard/cover-letter`
  - `/dashboard/career-coach`
  - `/dashboard/history`
  - `/dashboard/settings`
- All navigation links in the Sidebar and TopHeader are mapped to these existing routes with updated human-readable labels.
