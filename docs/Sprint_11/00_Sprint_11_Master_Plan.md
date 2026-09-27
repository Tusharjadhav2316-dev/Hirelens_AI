# Sprint 11 — Finalized UI Implementation (Master Plan)

> **Sprint number confirmed from repository**: `docs/` contains `Sprint_01`–`Sprint_06`, `Sprint_08`–`Sprint_10`, and `01_Master_Roadmap.md` lists slot 11 as **"Finalized UI Implementation (Premium UI/UX Redesign)"**.
> **Authoritative UI Reference**: The **13-page finalized reference PDF** (`pdf.net_3ab6b014-cf0b-4cae-a3eb-77e6336bfa58.pdf`). Every application page has an explicit, high-fidelity reference artboard.

## Sprint Objective
Bring the existing HireLens application pages to the **already-approved 13-page finalized UI reference**, page by page, without redesigning creatively, without rewriting working backend architecture, and without breaking existing functionality.

**One page / design = one implementation day.** 14 days total.

---

## 13-Page Reference PDF Map

Every single page in the application has a dedicated artboard in the 13-page reference PDF:

| Day | Page / Scope | Route | Ref PDF Page | Classification | Description |
|---|---|---|---|---|---|
| **01** | **Design System Foundation + AppShell** | *shared* | *all 13* | C — structural | Tokens, fonts, script flourishes, TopHeader, Sidebar (10 items + Pro card + user block), shared primitives |
| **02** | **Landing Page** | `/` | **Page 7** | **E — does not exist** | Public nav, hero + illustration + float pills, 6-card feature grid, 3-step process tracker, CTA promo band, footer |
| **03** | **Sign In** | `/login` | **Page 12** | B — visual rework | Two-column split: left product collage + trust stats; right sign-in card + social auth |
| **04** | **Sign Up** | `/signup` | **Page 13** | B — visual rework | Two-column split: left value prop + timeline; right sign-up card + terms + social auth |
| **05** | **Dashboard / Home** | `/dashboard` | **Page 8** | C — structural rework | Greeting + nudge, 4 stat cards, Career Journey stepper, 5 Quick Actions, Recent Resumes, AI Recommendations, Activity Chart |
| **06** | **AI Career Agent** | `/dashboard/agent` | **Page 10** | B — visual rework | Conversational thread + live checklist, composer + model selector, Artifact Canvas (ATS, Resume, Skill Gap, Jobs) |
| **07** | **Resume Builder** | `/dashboard/builder` | **Page 9** | C — structural rework | 4-column workspace: Sections rail (80%), Personal Info form, Live Preview (Desktop/Mobile), AI Suggestions & Score donut |
| **08** | **ATS Analyzer** | `/dashboard/resume-analyzer` | **Page 11** | C — structural rework | Top input row (Upload + `✓ Ready` file pill, 0/5000 char counter, sample chips, tips rail), full-width gradient bar, 4-column results |
| **09** | **Job Search** | `/dashboard/job-matcher` | **Page 1** | **F — UI layer only** | Search bar, 6 filter chips, Listings vs AI Matched tabs, 5 job cards with % match rings, Saved Jobs & Application Tracker rails |
| **10** | **Interview Trainer** | `/dashboard/interview-trainer` | **Page 6** | C — structural rework | 3 mode cards, 5 interview types, settings & focus area chips, full-width Start bar, Recent Sessions & Your Progress analytics |
| **11** | **Cover Letters** | `/dashboard/cover-letter` | **Page 5** | C — structural rework | 4 feature highlight cards, 3-step creation form (Job Details, Resume selector, Custom info), Live Cover Letter Preview |
| **12** | **Career Coach** | `/dashboard/career-coach` | **Page 2** | C — structural rework | 8 Coaching Topics rail, chat thread with embedded 6-step interactive Roadmap card, Progress donut, Quick Actions, Recommended guides |
| **13** | **Resume History** | `/dashboard/history` | **Page 3** | C — structural rework | 4 metric cards, filter/search/sort tabs bar, Resume version cards with ATS badges & stars, full Selected Resume Preview panel |
| **14** | **Profile Settings** | `/dashboard/settings` | **Page 4** | C — structural rework | 5 settings tabs, Profile Information form with photo upload & social links, Profile Completion donut & checklist, Skills cloud, Resume card |

---

## Key Re-Audit Findings & Clarifications

1. **No Missing Reference Designs**: Unlike earlier 10-page assumptions where Days 11–14 were assumed to have "no reference design", all 14 days now have exact, pixel-level reference artboards directly from the 13-page PDF.
2. **ATS Analyzer Conflict Resolved**: There are no conflicting Variants A and B. Page 11 of the 13-page PDF is the single canonical ATS Analyzer design (featuring the upload dropzone with uploaded file chip, 0/5000 character counter, sample JD chips, full-width gradient action bar, and 4-column results).
3. **Route Naming Preserved**: Routes remain identical to codebase structure (`/dashboard/job-matcher`, `/dashboard/resume-analyzer`, `/dashboard/settings`, etc.) while sidebar and page header labels match the reference ("Job Search", "ATS Analyzer", "Profile Settings").
4. **Preserve Existing Backend & Intelligence Services**: All existing backend routes (`/api/*`), agents (`agent-service/`), contexts (`AuthContext`, `ResumeContext`), and analysis engines (`atsAnalyzer.ts`, `atsEngine.ts`, `jdMatcher.ts`) remain 100% untouched and functional.

---

## Sprint 11 Document Index
| Document | Description |
|---|---|
| `00_Sprint_11_Master_Plan.md` | Master plan, 13-page PDF map, and sprint objectives (this file) |
| `01_Reference_Page_Inventory.md` | Comprehensive visual audit of all 13 pages of the reference PDF |
| `02_Repository_Audit.md` | Route, component, token, asset, and dependency audit of the codebase |
| `03_Reference_Conflicts.md` | Clarifications, data-truthfulness rules, and unconfirmed items |
| `04_Asset_and_Image_Requirements.md` | Register for SVGs, logos, script flourishes, and AI hero illustrations |
| `05_Job_Search_Boundary.md` | Scope fence for Job Search UI layer vs future provider integrations |
| `06_Decision_Log_UI.md` | Architectural and UI decisions for Sprint 11 |
| `07_Future_Sprint_Boundaries.md` | Features rendered as static/coming-soon UI (Roadmap, Payments, etc.) |
| `08_Design_System_Extraction.md` | Brand tokens, typography, radii, shadows, and spacing extracted from PDF |
| `09_Shared_Component_Strategy.md` | Comprehensive shared component inventory and folder structure |
| `10_Risk_Register_UI.md` | UI risk assessment, mitigations, and blast radius management |
| `11_Verification_Protocol.md` | 7-phase visual, responsive, and functional QA checklist |
| `Day_01_Design_System_Foundation/` through `Day_14_Profile_Settings/` | Detailed daily implementation guides |
