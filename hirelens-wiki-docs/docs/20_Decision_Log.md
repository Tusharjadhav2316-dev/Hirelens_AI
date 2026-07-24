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
