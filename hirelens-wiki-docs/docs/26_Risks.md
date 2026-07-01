# HireLens 2.0 — Engineering Risks

> Finalized on Sprint 1, Day 5. Confirmed risks trace directly to `BACKEND_AUDIT.md`, `FRONTEND_AUDIT.md`, `ENVIRONMENT_VERIFICATION.md`, or `PROJECT_DISCOVERY.md`.

## Confirmed Risks

### ~~Production Build Failure~~ (Resolved)
**Description:** `npm run build` fails with a TypeScript error — `Uint8Array` is not assignable to `BlobPart` in `cover-letter/page.tsx:171`.
**Impact:** The application cannot be deployed to production at all in its current state.
**Mitigation:** Resolved (Sprint 2, Day 1) by casting `pdfBytes.buffer as ArrayBuffer` inside the `Blob` constructor in `cover-letter/page.tsx`.
**Priority:** Resolved

### ~~Firestore Collection Casing Mismatch~~ (Resolved)
**Description:** `signup/page.tsx#L54` writes new profiles to a `"Users"` collection; settings/profile reads query the lowercase `"users"` collection.
**Impact:** New user profile data silently fails to load — a real, user-facing data bug, not theoretical.
**Mitigation:** Resolved (Sprint 2, Day 2) by standardizing collection casing on lowercase `"users"` in the `signup/page.tsx` write path.
**Priority:** Resolved

### ~~Unauthenticated API Routes~~ (Resolved)
**Description:** None of `/api/parse-pdf`, `/api/ai-improve`, `/api/ai-insights`, `/api/jd-refine`, `/api/cover-letter` perform any session/token check.
**Impact:** Any external client can call these routes directly, incurring OpenRouter billing costs or uploading arbitrary files, with no rate limiting or origin restriction.
**Mitigation:** Resolved (Sprint 2, Day 3) by integrating Firebase Admin SDK ID-token verification on all five routes.
**Priority:** Resolved

### Prompt Injection via Unsanitized Input
**Description:** Job descriptions and custom text fields are concatenated directly into LLM system/user prompts without sanitization or structural wrapping.
**Impact:** A malicious input could attempt to override system instructions or extract unintended behavior from the AI completions.
**Mitigation:** Structural prompt wrapping / input sanitization — explicitly deferred to Sprint 3 (Sprint 2 is auth-focused; combining auth and prompt-hardening in one day would violate the "one focused task per day" rule). Logged here so it isn't lost.
**Priority:** High (deferred, not dismissed)

### Job Matcher Insights Not Rendered
**Description:** `JDMatcherPanel.tsx#L470` receives `{aiInsights}` from `/api/jd-refine` but never renders it in the UI.
**Impact:** A working backend feature is invisible to users — wasted API spend with zero user value delivered.
**Mitigation:** Render the existing `aiInsights` value in its container. Addressed Sprint 2, Day 4.
**Priority:** High

### Hardcoded Firebase Credentials
**Description:** `lib/firebase.ts` hardcodes Firebase config values; `.env.example` lists the equivalent variables but they are unused by the code.
**Impact:** Config changes require a code edit + redeploy rather than an environment variable change; inconsistent with the rest of the env-variable-driven configuration (`OPENROUTER_API_KEY`).
**Mitigation:** Move Firebase config to environment variables, actually wire up the existing `.env.example` entries. Addressed Sprint 2, Day 5.
**Priority:** Medium

### Re-render Performance — Unmemoized Resume Context
**Description:** `ResumeContext.tsx`'s provider value is recreated on every render; any keystroke in a builder form re-renders the entire editor + preview tree.
**Impact:** Noticeable keyboard lag in the resume builder, the product's core workflow.
**Mitigation:** Memoize the context value. **Explicitly deferred to Sprint 3** — this is a real, confirmed issue, but Sprint 2's mandate is production-blocking stabilization (build, security, data correctness, broken UI), and this is a performance issue on an already-functional feature, not a blocker. Logged here, not dropped.
**Priority:** Medium (deferred, not dismissed)

### Missing Word Export
**Description:** `lib/exportService.ts` has an empty placeholder for `.docx` export; the button shows a placeholder alert.
**Impact:** Advertised feature doesn't work.
**Mitigation:** Out of scope for Sprint 2 (implementing a new export format is feature work, not stabilization, per Sprint 2's mandate). Tracked in `25_Backlog.md` for a future feature sprint.
**Priority:** Medium (explicitly out of Sprint 2 scope)

### Duplicate PDF Parsing Libraries
**Description:** `pdf-parse` (server) and `pdfjs-dist` (client) both ship in the bundle for overlapping purposes.
**Impact:** Unnecessary bundle size; minor, not user-facing today.
**Mitigation:** Deferred to a future cleanup sprint — not production-blocking.
**Priority:** Low

### Broken Settings Navigation Link
**Description:** `Navbar.tsx#L120` links to `#profile` instead of `/dashboard/settings`.
**Impact:** Minor UX dead end — users can't reach settings via that entry point.
**Mitigation:** One-line fix. Addressed Sprint 2, Day 4 (bundled with the Job Matcher insights fix as two small, isolated, low-risk UI corrections).
**Priority:** Low

## Speculative / Not Yet Confirmed

### Firestore Security Rules
**Description:** Since all database access is client-side, Firestore's own security rules are the only authorization boundary on direct reads/writes. These rules have not been audited.
**Why speculative:** No audit of the actual Firestore rules file/configuration was performed during Sprint 1 — this needs a dedicated check before being treated as a confirmed risk or a confirmed non-issue.
**Recommended action:** Schedule a Firestore rules audit early in Sprint 3, before any further client-side database feature work.

### OpenRouter Billing Exposure Ceiling
**Description:** The unauthenticated API routes (Confirmed Risk above) could allow abuse — but whether `OPENROUTER_API_KEY` has any spend cap or alerting configured is unknown.
**Recommended action:** Verify billing alerts/caps on the OpenRouter account as a quick parallel check during Sprint 2, Day 3 (when auth is added) — not a blocker for that day's code work, but worth confirming the same week.
