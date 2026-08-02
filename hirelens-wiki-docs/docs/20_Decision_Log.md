# HireLens 2.0 — Decision Log

> Every major technical decision gets one entry here, in the order made. This is the permanent record of *why* the project looks the way it does — more durable than any single sprint's findings, and the canonical place to resolve "wait, why did we choose X" months from now.

## Entry Format
```
## [Sprint-Day] Decision Title
**Decision:** what was decided
**Reason:** why
**Alternatives Considered:** what else was on the table, and why it lost
**Status:** Accepted | Superseded by [link] | Reverted
```

## Entries

### [Sprint 1, Day 5] Sprint 1 findings confirmed; original redesign report's tech-stack assumptions superseded
**Decision:** Adopt the actual, verified stack (Next.js 16 App Router, React 19, TypeScript, Firebase Auth + Firestore via client SDK, OpenRouter/Gemini-2.0-flash-lite, no backend database) as the single source of truth, replacing every earlier placeholder/assumed stack reference in this wiki (FastAPI, PostgreSQL, Zustand, Axios, CrewAI, Docker — none confirmed present).
**Reason:** `PROJECT_DISCOVERY.md`, `BACKEND_AUDIT.md`, `FRONTEND_AUDIT.md`, and `ENVIRONMENT_VERIFICATION.md` provide direct, cited evidence of the real stack.
**Alternatives Considered:** None — this is a correction to ground truth, not a choice between options.
**Status:** Accepted

### [Sprint 1, Day 5] Sprint 2 scope locked to production stabilization only
**Decision:** Sprint 2 addresses only Critical/High confirmed issues that block production readiness (build failure, Firestore casing bug, unauthenticated API routes, broken Job Matcher display, hardcoded secrets). Prompt-injection hardening, Context re-render performance, Word export, and PDF-library deduplication are explicitly deferred to Sprint 3+, not dropped.
**Reason:** Per the original project rules, never combine unrelated work in one sprint, and never let "nice to fix" crowd out "must fix before shipping."
**Alternatives Considered:** Bundling all confirmed issues into Sprint 2 regardless of severity — rejected as it would dilute focus on the actual production blockers (build failure, data bug).
**Status:** Accepted

### [Sprint 1, Day 5] API authentication mechanism: Firebase Admin SDK token verification
**Decision:** Secure `/api/*` routes by verifying the Firebase ID token (sent from the already-authenticated client) server-side using the Firebase Admin SDK, rather than introducing a separate auth system.
**Reason:** The project already uses Firebase Auth client-side; introducing a second auth mechanism would duplicate infrastructure the project doesn't need. The Admin SDK is the standard, supported way to verify a Firebase ID token server-side.
**Alternatives Considered:** A custom JWT/session system (rejected — duplicates existing Firebase Auth for no benefit); API keys per client (rejected — doesn't authenticate the actual end user, only an app instance).
**Status:** Accepted (Implemented in Sprint 2, Day 3 - 2026-07-01)

### [Sprint 2, Day 1] Cover Letter PDF Export Type Casting: ArrayBuffer vs. any
**Decision:** Cast `pdfBytes.buffer as ArrayBuffer` in the `Blob` constructor instead of using `pdfBytes as any`.
**Reason:** `pdfBytes` (a `Uint8Array`)'s underlying `ArrayBuffer` is natively typed as `ArrayBufferLike` (which includes `SharedArrayBuffer` that is unsupported by `BlobPart` in this project's DOM types). Casting it as `ArrayBuffer` cleanly satisfies the DOM type checker while keeping the byte content identical and avoiding raw `any` casting.
**Alternatives Considered:** Leaving `pdfBytes as any` (rejected — failed strict type-checking checks); `Array.from(pdfBytes)` (rejected — causes memory copy overhead).
**Status:** Accepted

### [Sprint 2, Day 2] Firestore Collection Casing Standardization
**Decision:** Standardize on lowercase `"users"` for all Firestore queries, changing the `"Users"` signup write path to match.
**Reason:** Multiple independent read locations (in `profileService.ts` and `historyService.ts`) already fetch from `"users"`. Modifying the single write path in `signup/page.tsx` is far more localized and less risky than changing all read sites to use uppercase `"Users"`.
**Alternatives Considered:** Standardizing on uppercase `"Users"` (rejected — requires refactoring multiple files/queries, increasing regression surface area).
**Status:** Accepted



### [Sprint 3, Day 2] Remove artificial 35-point score floor from ATS Match mode
**Decision:** Remove the `if (finalScore < 35) finalScore = 35` line from `lib/atsEngine.ts`'s `analyzeResumeMatch()` function.
**Reason:** The floor misleads users into thinking a poorly matching resume scored 35 when it may have scored 12. Honest feedback is more valuable than inflated comfort.
**Alternatives Considered:** Lower the floor to 20 (rejected — still arbitrary inflation); add a UI label for low scores instead of inflating the number (correct long-term approach, but a UI change outside Sprint 3 scope).
**Status:** Accepted

### [Sprint 3, Day 3] Use frequency-weighted keyword selection in jdMatcher.ts
**Decision:** Sort JD keywords by frequency in the raw JD text before applying the 80-keyword cap, rather than taking the first 80 unique keywords by order of occurrence.
**Reason:** Frequently-mentioned terms in a JD signal greater importance to the role. First-occurrence ordering is arbitrary and loses this signal entirely.
**Alternatives Considered:** Use TF-IDF weighting (rejected — overkill for a client-side algorithm; simple frequency count achieves 80% of the benefit).
**Status:** Accepted

### [Sprint 3, Day 5] Create lib/promptTemplates.ts as centralized prompt module
**Decision:** Extract shared prompt strings (personas, guardrails, output format instructions) into a new `lib/promptTemplates.ts` module, imported by API routes.
**Reason:** Prevents prompt drift across routes; makes hallucination guardrails and persona descriptions consistent and testable in one place.
**Alternatives Considered:** Keep prompts inline but add JSDoc comments (rejected — doesn't prevent drift); create a database-backed prompt management system (rejected — massive over-engineering for current scale).
**Status:** Accepted

### [Sprint 3, Regression] Introduce Configurable Scoring System (lib/atsConfig.ts) & Centralized ATS Engine
**Decision:** Create `lib/atsConfig.ts` exporting `ATS_SCORING_CONFIG` with zero magic numbers, and refactor `lib/atsAnalyzer.ts` to delegate scoring rules to `lib/atsEngine.ts`.
**Reason:** Eliminates hardcoded magic numbers scattered across business logic, unifies scoring across Resume Builder and Resume Analyzer into a single source of truth, filters out non-technical HR boilerplate from missing keywords, and calibrates non-employment experience scoring.
**Alternatives Considered:** Maintain inline constants in each function (rejected — prone to drift and duplication); external JSON config loaded via network fetch (rejected — unnecessary network overhead for client-side synchronous engine).
**Status:** Accepted


### [Sprint 4, Day 1] Activate Sprint 3's structured section scoring by fixing JDMatcherPanel call site
**Decision:** Fix `JDMatcherPanel.tsx` to pass the `resume` object to `analyzeJobMatch()` as the third (optional) parameter that Sprint 3 added.
**Reason:** The structured section scoring (skills/experience/projects bars showing real content analysis) was computed but never activated because the call site was never updated.
**Alternatives Considered:** Remove the optional parameter and always use the resume object (rejected — the fallback is still useful for the PDF-only mode in JDMatcherPanel where the Resume object isn't available).
**Status:** Accepted

### [Sprint 4, Day 1] Replace jdMatcher.ts local STOP_WORDS with MASTER_STOP_WORDS from atsConfig.ts
**Decision:** Remove the local `STOP_WORDS` set from `jdMatcher.ts` and import `MASTER_STOP_WORDS` from `atsConfig.ts`.
**Reason:** Eliminates inconsistent keyword extraction behavior between the Resume Analyzer (atsEngine.ts using MASTER_STOP_WORDS) and the Job Matcher (jdMatcher.ts using its own smaller set).
**Alternatives Considered:** Merge both sets into one and export from atsConfig.ts (this is exactly what was done — MASTER_STOP_WORDS was already the merged set).
**Status:** Accepted

### [Sprint 4, Day 3] Graduate impact and skills scores from binary to 4-tier
**Decision:** Replace binary impact (100/20) and skills (100/20) scoring in Quality mode with 4-tier graduated scales.
**Reason:** Binary scoring fails to differentiate a resume with 1 metric from one with 8, or a skills section with 2 skills from one with 15. Recruiters make these distinctions easily.
**Alternatives Considered:** 3-tier scale (low/medium/high) — rejected in favour of 4-tier which maps more precisely to the Concepts section benchmarks and avoids the 1-metric resume scoring identically to the 3-metric one.
**Status:** Accepted

### [Sprint 4, Day 4] Word-boundary regex for skill names ≤ 3 characters in keyword density
**Decision:** Use `new RegExp('\\b' + escapeRegexChars(name) + '\\b', 'i')` for short skill names and `.includes()` for longer ones.
**Reason:** Short names ("Go", "R", "C", "AWS") false-positive via substring matching against common English words. Longer names (4+ chars) are safe with substring.
**Alternatives Considered:** Use word-boundary regex for ALL skill names (rejected — unnecessary overhead and risk of regex edge cases for very long strings; .includes() is safe and fast for names ≥ 4 chars).
**Status:** Accepted

### [Sprint 4, Day 5] Add max_tokens and temperature to all AI routes via shared promptTemplates.ts constants
**Decision:** Add route-specific `max_tokens` and `temperature` constants to `promptTemplates.ts`; spread into each route's OpenRouter fetch body.
**Reason:** No max_tokens = potentially runaway responses; no temperature = model default (often 1.0) = more random, less deterministic output for tasks requiring factual accuracy.
**Values:** improve: max_tokens 400, temp 0.3; insights: max_tokens 500, temp 0.4; jd-refine: max_tokens 700, temp 0.4.
**Alternatives Considered:** Hardcode in each route (rejected — centralization via promptTemplates.ts maintains the pattern established in Sprint 3).
**Status:** Accepted

---

## Sprint 5 Decisions

### [Sprint 5, Day 1] Introduce optimization modes as an orthogonal axis from section type
**Decision:** Add an optional `mode` parameter (`"ats" | "impact" | "concise" | "action-verbs" | "jd-align"`) to `/api/ai-improve`, `aiService.ts`, and `promptTemplates.ts`. Mode is orthogonal to section — any mode can be applied to any section.
**Reason:** The current single-strategy "improve this text" approach gives users no control over what kind of improvement they want. Five distinct, non-overlapping modes cover the most common optimization goals without creating a menu of paraphrasers.
**Alternatives Considered:** Per-section mode defaults only (rejected — removes user agency); A single "optimize" button with no mode concept (rejected — produces inconsistent output quality).
**Status:** Accepted

### [Sprint 5, Day 1] Centralize all section prompts in `promptTemplates.ts` via `buildOptimizerPrompt()`
**Decision:** Move the 5-branch `if/else if` section prompt chain from `route.ts` into `SECTION_BASE_PROMPTS` and `OPTIMIZER_MODE_PROMPTS` in `promptTemplates.ts`. The route calls `buildOptimizerPrompt()` — a pure, testable function.
**Reason:** Prompt strings scattered across route handlers are untestable and prone to silent drift. Centralizing them enables the optimizer safety test suite (Sprint 5 Day 5) to verify guardrail presence without making API calls.
**Alternatives Considered:** Keep prompts in route, add comments (rejected — no testability); Separate prompt management service (rejected — over-engineering for current scale).
**Status:** Accepted

### [Sprint 5, Day 1] `HALLUCINATION_GUARDRAIL` appended inside `buildOptimizerPrompt`, not at the route level
**Decision:** The guardrail is appended unconditionally inside `buildOptimizerPrompt()`, not in the route's system prompt or at the call site.
**Reason:** Ensures every composed prompt contains the guardrail regardless of which caller invokes `buildOptimizerPrompt`. A future caller that bypasses the route still gets guardrail protection. Automated tests verify this for all 30 section/mode combinations.
**Status:** Accepted

### [Sprint 5, Day 2] Certification accept action appends professional context to `name` field
**Decision:** Since `types/resume.ts`'s `Certification` type has no `description` or `notes` field, the accept action for certification AI suggestions appends the suggestion to `item.name` as `"${item.name} — ${improvedText}"`.
**Reason:** Adding a new field to `Certification` would cascade into `atsAnalyzer.ts`, `exportService.ts`, history snapshots, and Firestore data — too broad for Day 2's scope. The name-append approach is pragmatic and reversible.
**Alternatives Considered:** Add `description?: string` to `Certification` type (deferred — appropriate for a future sprint when a planned `notes` field is introduced); Copy to clipboard instead of updating a field (rejected — no confirmation the user received the suggestion).
**Status:** Accepted (with note: revisit in a future sprint when Certification type is extended)

### [Sprint 5, Day 3] JD stored in `ResumeEditor` local state, not in `ResumeContext`
**Decision:** The job description for optimization targeting is stored as `useState` in `ResumeEditor.tsx`, not persisted in `ResumeContext` or Firestore.
**Reason:** The JD is session context for the optimization workflow, not part of the candidate's resume data. Persisting it would pollute the resume model and require Firestore schema changes. Session-only is appropriate — users re-enter the JD when needed.
**Alternatives Considered:** Store JD in `ResumeContext` (rejected — pollutes resume data model); Persist JD per-resume in Firestore (deferred — valid for a future "saved JD targets" feature in Sprint 7+).
**Status:** Accepted

### [Sprint 5, Day 4] `onAccept(finalText: string)` — modal returns edited text to calling form
**Decision:** Change `onAccept()` to `onAccept(finalText: string)` so the modal returns its internal (potentially user-edited) text to the calling form, rather than the calling form reading from its own `improvedText` state.
**Reason:** The modal now has an editable textarea (`localImprovedText`). The calling form must receive the final edited value, not the original AI suggestion.
**Alternatives Considered:** Expose `localImprovedText` via a ref (rejected — refs for state management are an anti-pattern in React functional components); Keep `onAccept()` parameterless and lift `localImprovedText` to parent (rejected — breaks the modal's encapsulation).
**Status:** Accepted

### [Sprint 5, Post-Completion Correction] Expose User-Selectable Optimizer Modes in Resume Builder UI
**Decision:** Create a reusable `OptimizerModeSelector.tsx` component and integrate it into all five AI-enabled form components (`PersonalInfoForm`, `ExperienceForm`, `ProjectsForm`, `AchievementsForm`, `CertificationsForm`).
**Reason:** Sprint 5 Day 1 implemented five optimization modes (`ats`, `impact`, `concise`, `action-verbs`, `jd-align`) in prompt architecture and backend API, but form components hardcoded or omitted mode selection, preventing users from intentionally choosing their rewrite strategy.
**Alternatives Considered:** Adding mode selection inside `AIImprovementModal` after generation (rejected — mode controls the generation prompt itself, so strategy selection belongs before/during the generation trigger). Adding a generic "Proceed" button to the JD context panel (rejected — JD panel provides context, section provides content, mode selector provides strategy).
**Status:** Accepted

---

## Sprint 6 Decisions

### [Sprint 6, Day 1] Stateless API + client-side conversation state, no Firestore persistence
**Decision:** Career Coach conversation history lives in React `useState` on the client. No session storage, no Firestore writes in Sprint 6. Each request sends the trimmed history in the body.
**Reason:** Simpler architecture; avoids Firestore schema changes; cross-session memory is a richer feature (requires a "Career Memory" concept, indexing, retrieval) that belongs in a dedicated sprint, not bolted onto Sprint 6.
**Alternatives Considered:** Persist conversations to Firestore per user (deferred — significant scope increase); Use `sessionStorage` (rejected — lost on tab close, no value over React state for same-session use).
**Status:** Accepted. Deferred: cross-session Career Memory added to backlog for Sprint 10+.

### [Sprint 6, Day 2] Use native ReadableStream streaming — no new packages
**Decision:** Implement streaming via native `ReadableStream` on the server and `response.body.getReader()` on the client. No `EventSource`, no SSE client library, no WebSockets, no `socket.io`.
**Reason:** Next.js 16 App Router with Node 18+ supports native streaming without any additional dependencies. The Career Coach is the first and only streaming feature — introducing a streaming library for one feature would be over-engineering.
**Alternatives Considered:** SSE with `EventSource` client (rejected — requires specific SSE format enforcement; raw text streaming is simpler for this use case); WebSockets (rejected — significant infrastructure addition for a request-response pattern that happens to stream).
**Status:** Accepted

### [Sprint 6, Day 2] Reuse `google/gemini-2.5-flash` — no model change for Career Coach
**Decision:** Use the same model as `api/ai-improve` (confirmed as `google/gemini-2.5-flash` post-Sprint-5). No separate model configuration for the Career Coach.
**Reason:** Consistency; the model already handles resume-domain tasks well; separate model selection would require a new environment variable and testing overhead.
**Alternatives Considered:** Use a different model for conversation (e.g., a chat-optimized model) — deferred to a future sprint if quality proves insufficient.
**Status:** Accepted

### [Sprint 6, Day 5/6] ATS scores remain deterministic — Coach explains, never recalculates
**Decision:** `analyzeResume(resume, false)` is called client-side; the result is formatted by `buildATSContextBlock()` with explicit "DETERMINISTIC ENGINE OUTPUT" labelling and sent to the Coach as context. The Coach's system prompt instructs it to attribute scores with "According to your HireLens ATS analysis..." — never "I calculated..."
**Reason:** This is the most important integrity constraint in Sprint 6. If the Coach recalculated scores itself using AI estimation, it would produce inconsistent, hallucinated scores that contradict the deterministic engine output shown in `ATSScorePanel`. Users would receive contradictory information from the same product.
**Alternatives Considered:** Let the Coach calculate its own ATS assessment (rejected — definitively violates the deterministic/AI boundary principle established in Sprints 3-4).
**Status:** Accepted

### [Sprint 6, Day 3] "AI Career Coach" positioned second in Sidebar (after Dashboard)
**Decision:** The Career Coach nav entry is the second item in the Sidebar, immediately after Dashboard and before Resume Builder.
**Reason:** The Coach is the most distinctive, highest-value differentiator of HireLens 2.0 vs. competing tools. Positioning it prominently signals to users that this is a primary feature, not a hidden utility.
**Alternatives Considered:** Place it after Resume Analyzer (more logical tool grouping but de-emphasizes the Coach's importance); Place it first above Dashboard (too aggressive — Dashboard is the natural entry point).
**Status:** Accepted
