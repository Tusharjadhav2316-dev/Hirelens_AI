# Frontend Audit Report

This document records the results of the frontend audit performed during Sprint 1, Day 4, outlining page views, component hierarchies, state models, and optimization issues.

---

## 1. Page-Level Routing
The application uses the Next.js App Router. Mounted views include:
*   `/login` & `/signup`: Authentication entries.
*   `/dashboard`: User home directory.
*   `/dashboard/builder`: The resume editor interface.
*   `/dashboard/resume-analyzer`: Uploads PDF resumes for scoring and AI analysis.
*   `/dashboard/job-matcher`: Evaluates resume keywords against target job ads.
*   `/dashboard/cover-letter`: Rich text editor generating and optimizing cover letters.
*   `/dashboard/history`: Visualizes 7-day auto-expiring snapshot logs.
*   `/dashboard/settings`: Display names and user profile parameters.

---

## 2. State Management & Data Flow
*   **Authentication State**: Handled via `contexts/AuthContext.tsx` listening to Firebase Auth state change events.
*   **Resume State**: Handled via `contexts/ResumeContext.tsx` maintaining the global nested resume JSON data object.
*   **Issue identified**: The Context provider values are not memoized. Any single keypress inside a resume builder form input (e.g. typing letters in PersonalInfoForm) recreates the provider's state object and triggers a full tree re-render of all editor sections and the preview canvas, causing keyboard lag.

---

## 3. Local Evaluation & Parsing Engines
*   **Deterministic scoring**: The resume scorer is client-side. `lib/atsAnalyzer.ts` and `lib/atsEngine.ts` calculate the ATS score (out of 100) instantly without network requests by checking character count, bullet inclusion, weak verbs, and quantifications.
*   **Duplicate PDF parsing packages**: The client uses `pdfjs-dist` (loaded from Unpkg web worker) in `PdfEditableViewer.tsx` to extract text from uploads, while the server uses `pdf-parse` in `/api/parse-pdf`. This increases the application bundle footprint.

---

## 4. UI & UX Deficiencies
*   **Broken settings redirect**: Clicking "Your Profile" inside the header dropdown (`Navbar.tsx#L120`) targets a dead hash link (`href="#profile"`) instead of redirecting the user to `/dashboard/settings`.
*   **Missing Matcher insights**: `JDMatcherPanel.tsx#L470` performs a POST request to `/api/jd-refine` but forgets to render the returned `{aiInsights}` inside the UI container.
*   **Incomplete export implementation**: `lib/exportService.ts` contains empty placeholders for Word (.docx) export.
*   **Accessibility gaps**: Form inputs in `PersonalInfoForm.tsx` and custom inputs inside `SkillsForm.tsx` miss matching labels or explicitly associated focus borders.
