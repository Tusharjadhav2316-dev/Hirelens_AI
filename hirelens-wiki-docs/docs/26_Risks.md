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

### ~~Job Matcher Insights Not Rendered~~ (Resolved)
**Description:** `JDMatcherPanel.tsx#L470` receives `{aiInsights}` from `/api/jd-refine` but never renders it in the UI.
**Impact:** A working backend feature is invisible to users — wasted API spend with zero user value delivered.
**Mitigation:** Resolved (Sprint 2, Day 4) by rendering `aiInsights` inside its container with support for loading state.
**Priority:** Resolved

### ~~Hardcoded Firebase Credentials~~ (Resolved)
**Description:** `lib/firebase.ts` hardcodes Firebase config values; `.env.example` lists the equivalent variables but they are unused by the code.
**Impact:** Config changes require a code edit + redeploy rather than an environment variable change; inconsistent with the rest of the env-variable-driven configuration (`OPENROUTER_API_KEY`).
**Mitigation:** Resolved (Sprint 2, Day 5) by moving Firebase client config to environment variables and wiring up the `NEXT_PUBLIC_FIREBASE_*` variables.
**Priority:** Resolved

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

### ~~Broken Settings Navigation Link~~ (Resolved)
**Description:** `Navbar.tsx#L120` links to `#profile` instead of `/dashboard/settings`.
**Impact:** Minor UX dead end — users can't reach settings via that entry point.
**Mitigation:** Resolved (Sprint 2, Day 4) by correcting link to `/dashboard/settings`.
**Priority:** Resolved

## Speculative / Not Yet Confirmed

### Firestore Security Rules
**Description:** Since all database access is client-side, Firestore's own security rules are the only authorization boundary on direct reads/writes. These rules have not been audited.
**Why speculative:** No audit of the actual Firestore rules file/configuration was performed during Sprint 1 — this needs a dedicated check before being treated as a confirmed risk or a confirmed non-issue.
**Recommended action:** Schedule a Firestore rules audit early in Sprint 3, before any further client-side database feature work.

### OpenRouter Billing Exposure Ceiling
**Description:** The unauthenticated API routes (Confirmed Risk above) could allow abuse — but whether `OPENROUTER_API_KEY` has any spend cap or alerting configured is unknown.
**Recommended action:** Verify billing alerts/caps on the OpenRouter account as a quick parallel check during Sprint 2, Day 3 (when auth is added) — not a blocker for that day's code work, but worth confirming the same week.

## Sprint 3 Specific Risks

### ~~Builder ATS Scoring Accuracy Deficiencies~~ (Resolved)
**Description:** `atsAnalyzer.ts` ignored certifications and achievements, ignored skill levels, used inconsistent weak verbs, and had a hardcoded `keywordDensityScore` placeholder (100).
**Impact:** Scores and suggestions in Resume Builder ATS panel were incomplete and static.
**Mitigation:** Resolved (Sprint 3, Day 1) by scoring certifications and achievements, adding skill level guidance, expanding weak verbs, and computing real keyword density score.
**Priority:** Resolved

### ~~ATS Score Changes May Surprise Users~~ (Addressed Sprint 3, Day 2)
**Description:** Removing the 35-point floor in `atsEngine.ts` means users who previously saw "35/100" for a poor resume will now see their actual (lower) score.
**Impact:** Potentially confusing for users who ran an analysis pre-Sprint 3 and get a lower score post-Sprint 3 for the same document.
**Mitigation:** Resolved (Sprint 3, Day 2). Floor removed, bigrams added, quantification improved, date ranges inferred. The score is now honest.
**Priority:** Resolved


### Bigram Keyword Extraction Changes Existing Match Scores
**Description:** Resumes that previously matched 0 keywords for a multi-word term ("machine learning") now match via bigram even if the full phrase is present.
**Impact:** Some resumes will show higher Match scores than before for the same input. This is an accuracy improvement, not a bug.
**Mitigation:** None needed — this is the intended outcome.
**Priority:** Low (inform users the algorithm is more sophisticated)

### Prompt Template Refactor Could Subtly Change AI Behavior
**Description:** Centralizing prompt strings means the composed system prompts must exactly match the original intent. Any wording change could subtly shift model behavior.
**Mitigation:** Day 5 includes a full regression pass across all AI features. The original inline strings are preserved as-is in the templates wherever possible.
**Priority:** Medium — regression pass is mandatory before calling Sprint 3 complete.

## Sprint 4 Specific Risks

### Day 3 Benchmark Score Drift
**Description:** Graduating binary impact/skills scores changes the Quality mode total scores for all benchmark profiles.
**Impact:** If any two benchmark profiles swap ordering after the change, quality hierarchy assertions will fail.
**Mitigation:** The benchmark resumes are well-differentiated (Education Only has zero metrics; 3+ Year Pro has 8+). Score ordering should be preserved. If an assertion fails, it will be caught immediately via the regression run and the expected values table in BENCHMARK_REGRESSION.md updated.
**Priority:** Low (expected to pass; regression suite will catch any issue immediately)

### Day 5 max_tokens Truncation Risk
**Description:** Setting max_tokens: 400 for ai-improve may truncate a very long section rewrite for complex experience entries.
**Impact:** The user sees an incomplete sentence in the AIImprovementModal.
**Mitigation:** If observed during Day 5 testing, raise AI_IMPROVE_MODEL_PARAMS.max_tokens to 500 — a one-line change in promptTemplates.ts.
**Priority:** Low (one-line fix if it occurs)

---

## Sprint 5 Specific Risks

### AI Fabrication in Optimizer Output — Primary Risk
**Description:** The optimizer's most critical risk is the AI model ignoring `HALLUCINATION_GUARDRAIL` and inventing metrics, skills, or experiences not present in the original content. This risk applies to all AI routes but is most visible in the optimizer because users directly compare original and improved text.
**Impact:** Candidates submit resumes with false information. Reputational damage to HireLens and legal exposure.
**Mitigation:** Three-layer enforcement: (1) `HALLUCINATION_GUARDRAIL` in every built prompt; (2) mode-specific non-fabrication instructions (especially `"impact"` and `"jd-align"`); (3) Manual truth-preservation tests T1–T4 verified in browser each sprint. The editable modal (Day 4) gives users the final editorial control — they can remove any fabricated content before accepting.
**Priority:** Critical — verified before Sprint 5 is marked complete

### `onAccept(finalText)` Signature Change Breaking Undiscovered Call Sites
**Description:** Changing `onAccept()` to `onAccept(finalText: string)` in `AIImprovementModal` is a breaking change. All five form files are updated in Day 4. If any other component calls `AIImprovementModal` with the old parameterless `onAccept`, TypeScript will catch it at build time.
**Impact:** Build failure if any undiscovered call site is missed.
**Mitigation:** TypeScript's strict function signature checking will surface any missed call site immediately on `npm run build`. Not a runtime risk.
**Priority:** Low (compile-time catch)

### Regenerate + AbortController Race Condition
**Description:** `lib/aiService.ts` uses `AbortController` to cancel in-flight requests when a new one starts. If a user clicks Regenerate very quickly (before the previous request completes), the AbortController correctly cancels the first and starts the second. However, if the component unmounts between Regenerate clicks (e.g., user navigates away), the in-flight request may attempt to set state on an unmounted component.
**Impact:** A React "can't perform state update on unmounted component" warning; no data loss; no user-visible error.
**Mitigation:** The AbortController in `aiService.ts` handles the most common case. If the warning surfaces, a standard `useEffect` cleanup that calls the abort can be added to the form component — a minor addition, not architecture work.
**Priority:** Low

### JD Context Panel UX Confusion
**Description:** Users may misunderstand the JD panel as "HireLens will add these skills to your resume" rather than "alignment targeting only."
**Impact:** User distrust if they notice the optimizer didn't add a skill they expected.
**Mitigation:** The JD panel label is explicitly written: "The AI will align language and emphasis — it will not add skills you do not have." This is enforced in the Day 3 Antigravity prompt constraints.
**Priority:** Low (UX label solution implemented)

### Certification Name Field Overloading
**Description:** The accept action for certifications appends the professional context sentence to `item.name`, creating entries like "AWS Certified Developer — Validates cloud architecture expertise." This is a workaround for the missing `description`/`notes` field on `Certification` type.
**Impact:** Long certification names may render oddly in some resume PDF layouts.
**Mitigation:** Accepted as a pragmatic decision (logged in `20_Decision_Log.md`). Users can edit the name field after accepting. Proper fix: add `description?: string` to `Certification` type in a future sprint, along with UI and export updates.
**Priority:** Low (known workaround, not a defect)

---

## Sprint 6 Specific Risks

### Career Coach Hallucination — Primary Risk
**Description:** The Coach could fabricate ATS scores, skills, or qualifications despite `HALLUCINATION_GUARDRAIL` and mode-specific instructions.
**Impact:** Users receive false career advice that damages their job search or leads to misrepresentation on applications.
**Mitigation:** Three-layer enforcement: (1) `CAREER_COACH_SYSTEM_PROMPT` contains "NEVER fabricate" instructions; (2) Context blocks are labelled with provenance ("from the candidate's HireLens resume", "DETERMINISTIC ENGINE OUTPUT"); (3) 37 automated tests verify guardrail presence in all prompt combinations; (4) 5 manual QA cases (C1–C5) verified in browser before Sprint 6 is marked complete.
**Priority:** Critical — verified in Day 8 before Sprint 6 is closed

### ATS Score Contradiction
**Description:** The Coach could produce ATS score estimates that contradict the deterministic engine output shown in `ATSScorePanel`.
**Impact:** User sees "72/100" in the panel and "approximately 55/100" from the Coach — undermines trust in both.
**Mitigation:** `buildATSContextBlock()` includes the exact deterministic scores; `CAREER_COACH_SYSTEM_PROMPT` instructs the Coach to attribute scores with "According to your HireLens ATS analysis..." — tested by automated assertion `"System prompt teaches correct ATS score attribution phrasing"` in `careerCoachSafety.test.ts`.
**Priority:** High

### Streaming Edge Cases
**Description:** Mid-stream disconnections, partial SSE chunk splits, or rapid user resets could leave the UI in an inconsistent state.
**Impact:** Empty or partial messages visible; stale state updates on unmounted component.
**Mitigation:** `AbortController` handles resets; `TextDecoder` with `{ stream: true }` handles partial chunks; cleanup `useEffect` aborts on unmount. These are tested manually in Day 4's verification steps.
**Priority:** Medium

### Context Window Drift (Long Conversations)
**Description:** After 8+ turns, `trimConversationHistory` drops earliest messages. The Coach loses context about what the candidate said early in the conversation.
**Impact:** The Coach appears to "forget" information from earlier in the session.
**Mitigation:** A turn-count warning banner appears at ≥ 6 turns with a "New Conversation" link. `careerCoachSafety.test.ts` tests `trimConversationHistory` boundary behaviour. This is a fundamental limitation of stateless context windows, not a bug.
**Priority:** Low (expected behaviour; user is informed)

### Privacy: Resume Data in Client-Side Logs
**Description:** `buildResumeContextBlock` produces a plaintext summary of the resume that is sent to OpenRouter via the server. The server logs this in error cases.
**Impact:** Resume plaintext could appear in server logs.
**Mitigation:** The API route only logs errors (`console.error`), not request bodies. No resume content is logged on success. For production (Sprint 14), server-side log scrubbing should be implemented.
**Priority:** Low (pre-production; logged for Sprint 13/14)
