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

### [Sprint 6, Post-Day 8 UX Hardening] Document Attachment Upload & Inline Stream Avatar Consolidation
**Decision:** 
1. Add an attachment button (`<Paperclip />`) to the Career Coach chat input supporting `.pdf`, `.txt`, `.md`, `.doc`, `.docx`. PDF files parse via `POST /api/parse-pdf` while text files read directly client-side. The extracted document text is injected into `resumeContext` payload sent to `/api/career-coach`.
2. Consolidate assistant streaming state directly inside `messages.map()` so the 3 bouncing dots render inside the active assistant message bubble, eliminating the separate `{isStreaming && ...}` block and ensuring **exactly one** robot avatar appears per turn.
**Reason:** Allows users to ask career questions about arbitrary uploaded resumes/cover letters without needing a pre-existing builder profile, while fixing UI duplicate avatar artifacts during token streaming.
**Alternatives Considered:** Persist uploaded documents to Firebase Storage (deferred — session-scoped context is lighter and sufficient for chat grounding); Multiple robot avatars during generation (rejected — confusing UI visual artifact).
**Status:** Accepted

---

## Sprint 8 Decisions

### [Sprint 8, Pre-Planning] Sprint 8 Scope Expansion — supersedes locked roadmap sequencing for Sprints 7 and 9
**Decision:** Sprint 8 absorbs the *job search* half of Sprint 7 (as a Job Search Agent + provider-abstracted tool) and the entirety of Sprint 9 (as an Interview Coach Agent), per explicit product-owner directive. Sprint 7's application-pipeline tracker is **not** absorbed and remains unscheduled. Sprint 10 (Career Roadmap & Learning Engine) is **not** absorbed; Sprint 8 ships only skill-gap detection as a tool, not the full study-roadmap generator.
**Reason:** Neither Job Search nor Interview Coach exists in the current codebase (confirmed via repository audit — `app/dashboard/job-matcher` is a single-JD matcher, not a job listings search, and no interview feature exists anywhere). Both are natural, low-marginal-cost additions once the agent/tool architecture exists, and building them as agent-native capabilities from day one avoids building a second, throwaway non-agent version in a hypothetical future Sprint 7/9 only to re-wrap it in Sprint 8 later.
**Alternatives Considered:** Keep Sprint 8 strictly to orchestrating pre-existing features only, deferring Job Search and Interview Coach to their original slots (rejected — the product owner's explicit brief frames Sprint 8 as "the most important architectural sprint" specifically because it should connect *all* career-agent capabilities, and building Job Search/Interview Coach as standalone non-agent features first would mean rebuilding them as agent tools shortly after — direct waste); Renumber Sprints 7/9 out of the roadmap entirely (rejected — `01_Master_Roadmap.md` marks them "Partially Superseded"/"Superseded" instead of deleting, preserving audit history per Project Rule 9).
**Status:** Accepted. Logged in `01_Master_Roadmap.md` under "Sprint 8 Scope Directive."

### [Sprint 8, Day 1] CrewAI Deployment Boundary — standalone Python/FastAPI microservice, not embedded in Next.js
**Decision:** CrewAI runs in a new, separately-deployed Python service (`agent-service/`), not inside a Next.js API route, not as a Vercel Python serverless function, and not replaced with a TypeScript-native agent framework.
**Reason:** CrewAI is Python-only — there is no code-level way to "install it inside" a Next.js/TypeScript app. Of the three real options: (a) a Python sidecar/microservice, (b) Vercel Python serverless functions, (c) a TypeScript-native agent framework substitute. Vercel's Python serverless functions have execution-time ceilings and cold-start characteristics poorly suited to a multi-step, potentially multi-tool-call CrewAI loop with streaming output, and mixing a Python serverless function family into an otherwise all-Node Vercel deployment adds real operational complexity without removing the "separate runtime" problem — it only changes *where* that runtime lives. A standalone FastAPI microservice, by contrast, is a well-understood, independently scalable, independently deployable unit that can run on any Python-friendly host (Railway, Render, Fly.io — final choice is a hosting decision, not an architecture one) with no execution-time ceiling surprises, and it matches the `10_CrewAI_Guide.md`/`12_FastAPI_Guide.md` file names this wiki already reserved when Sprint 1 first anticipated this exact fork.
**Alternatives Considered:** Vercel Python Functions (rejected — execution-time limits and cold starts are a poor fit for multi-agent loops with tool calls); TypeScript-native agent framework, e.g. a hand-rolled orchestrator or LangGraph.js (rejected — the product owner's brief specifically calls for CrewAI; a substitution would be a bigger unrequested architecture change than the Python boundary itself); Full backend rewrite of HireLens into Python (rejected — violates Project Rule 1, "never rewrite unnecessarily," and would break every existing, working Next.js API route for no benefit).
**Status:** Accepted

### [Sprint 8, Day 1] Inter-service authentication — short-lived internal JWT, never a raw client-supplied userId
**Decision:** The Next.js proxy route (`/api/agent/chat`) verifies the Firebase ID token via the existing `verifyAuth.ts`, then mints a short-lived (60s) internal service JWT (HS256, secret `INTERNAL_AGENT_JWT_SECRET`, payload `{uid, iat, exp}`) and sends it to the Python service in an `X-Internal-Auth` header. The Python service verifies this JWT on every request and uses the `uid` it contains as the sole source of truth for "who is this request for" — it never reads a `userId` field from the request body.
**Reason:** Directly satisfies the non-negotiable requirement that a user must never be able to invoke another user's resume or data. Re-verifying the original Firebase ID token inside Python (via the Firebase Admin Python SDK) was considered and would also work, but would require provisioning and rotating Firebase Admin service-account credentials in a second runtime/repo, doubling the credential-management surface for no additional security benefit over a short-lived internal JWT the two trusted first-party services already share.
**Alternatives Considered:** Re-verify the Firebase ID token directly in Python via `firebase-admin` (Python) (rejected — doubles service-account credential surface across two runtimes for no added guarantee, since the Next.js proxy already re-verifies on every request); Trust a client-supplied `userId` field (rejected outright — this is exactly the cross-user data access vulnerability the brief calls out).
**Status:** Accepted

### [Sprint 8, Day 1] Resume is a request-scoped payload, not a server-side "current resume" lookup
**Decision:** `ResumeContext` remains pure client-side React state (unchanged from its current implementation — confirmed no Firestore-backed "current resume" document exists anywhere in the codebase). The Agent Workspace sends the full current `Resume` JSON object in every `/api/agent/chat` request body. Python's `get_resume` tool is a context accessor over this request-scoped payload — it is not a database query and has no independent existence outside the request that carries it.
**Reason:** This is simply how the existing codebase already works — `historyService.ts` persists point-in-time *snapshots* of activity, but the live, editable resume a user is working on has never been server-persisted. Inventing a new server-side "current resume" concept for Sprint 8 alone would create two divergent sources of truth (the client's `ResumeContext` state vs. a server copy) and is exactly the kind of unrequested architecture change Project Rule 1 warns against.
**Alternatives Considered:** Persist a "current resume" document server-side so Python can query it directly (rejected — new divergent source-of-truth risk, and no existing sprint has introduced this pattern); Have the agent read `Resume` from a Firestore history snapshot (rejected — history snapshots are point-in-time and may be stale relative to unsaved in-progress edits).
**Status:** Accepted

### [Sprint 8, Day 1] ATS scoring, resume optimization, JD matching, and cover-letter generation are called via internal Next.js endpoints, never reimplemented in Python
**Decision:** New internal-only Next.js routes (`/api/internal/ats-score`, `/api/internal/jd-match`) wrap the existing `atsEngine.ts`/`atsAnalyzer.ts` and `jdMatcher.ts` respectively and are called by the corresponding Python CrewAI tools over HTTP (authenticated with the same internal JWT). The Optimizer and Cover Letter tools call the *existing* `/api/ai-improve` and `/api/cover-letter` routes directly — unchanged.
**Reason:** This is the architecture's single most important integrity constraint. If ATS scoring logic were reimplemented in Python (even "equivalently"), the two engines would drift over time and could disagree on the same resume — directly violating the non-negotiable rule that the CrewAI agent must never calculate or invent an ATS score. Calling back into the one existing deterministic engine guarantees there is exactly one source of truth, in exactly one language, forever.
**Alternatives Considered:** Port `atsEngine.ts`/`atsAnalyzer.ts`/`jdMatcher.ts` to Python for in-process speed (rejected — creates a second implementation that will silently drift from the TypeScript original the first time either is edited without the other); Have the Manager Agent estimate an ATS score itself via LLM reasoning when the deterministic engine is "close enough" (rejected outright — this is precisely the forbidden behavior called out in the brief).
**Status:** Accepted

### [Sprint 8, Day 2] Career Coach persona is ported into a CrewAI agent, not called through the existing streaming route
**Decision:** A new `Career Agent` in CrewAI carries its own copy of the truth-preservation system prompt, adapted from `CAREER_COACH_SYSTEM_PROMPT` in `promptTemplates.ts`, and calls OpenRouter directly. The existing `/dashboard/career-coach` page and `/api/career-coach` route are left completely unmodified and remain independently accessible from the Sidebar.
**Reason:** The existing Career Coach route is a single-hop Next.js → OpenRouter streaming pipeline; routing it through Next.js → Python → OpenRouter would add a network hop and a second point of failure to a feature that already works, for a Sprint 8 goal (agent orchestration of career-advice turns) that doesn't require it. Duplicating the *persona* (not the code — Python cannot import a `.ts` file) into the Career Agent lets the Manager Agent delegate open-ended coaching turns without touching the working streaming route.
**Alternatives Considered:** Have the Manager Agent call `/api/career-coach` as a tool (rejected — that route is designed for direct SSE streaming to a browser tab, not for a Python service to consume and re-emit as structured agent events; wrapping it would mean parsing its own streaming output only to re-stream it, adding latency for no benefit); Delete/replace the standalone Career Coach page (rejected — violates "existing features must remain available," and users mid-conversation should not lose the feature).
**Accepted tradeoff (tracked as tech debt):** The system-prompt persona now exists in two places (`promptTemplates.ts` for TypeScript, a Python constant for CrewAI) and must be kept in sync manually. A future sprint should centralize shared prompt text into a language-agnostic config (e.g., JSON/YAML) consumed by both runtimes — added to `25_Backlog.md`.
**Status:** Accepted

### [Sprint 8, Day 3] Cover Letter and Skill Gap ship as tools, not standalone CrewAI agents
**Decision:** Of the capability categories in the brief, only 7 become full CrewAI **agents** for Sprint 8 (1 Manager + 6 specialized): Manager, Resume, ATS, Optimizer, Career, Job Search, Interview Coach are agents; **Cover Letter** and **Skill Gap** are implemented as **typed tools** (`generate_cover_letter`, `analyze_skill_gap`) invoked directly by the Manager Agent or by Resume/Job Search agents, not as their own agents.
**Reason:** Per the architecture principle in the brief — "a capability should become an agent only when multi-step reasoning or specialized context justifies it; deterministic operations should remain tools/services." Cover letter generation is a single-shot call to an existing, already-well-prompted endpoint with no multi-step reasoning of its own — wrapping it in a full agent (with its own role/goal/backstory and reasoning loop) would add CrewAI orchestration overhead without adding capability. Skill-gap analysis is a deterministic combination of three already-available data sources (resume skills, JD keywords via `jdMatcher.ts`, ATS flags) with no independent reasoning step beyond formatting the comparison — the *explanation and prioritization* of the gap is handled by whichever agent invoked the tool (typically Career or Job Search), not by a dedicated Skill Gap agent.
**Alternatives Considered:** Full 9-agent hierarchy exactly as sketched in the brief's "Specialized Agents" diagram, including standalone Cover Letter and Skill Gap agents (rejected — brief explicitly says "do not blindly implement every item... determine which agents are actually necessary"); Company Research Agent and Application Planning Agent from the original redesign report's agent list (rejected for Sprint 8 — no verified data source exists for company research, and "application planning" is just the Manager sequencing existing agents, not a distinct reasoning role — both logged as Optional/Future in `Sprint_08/Day_02.md`).
**Status:** Accepted

### [Sprint 8, Day 4] Job Search ships behind a provider abstraction with no committed external API
**Decision:** `JobSearchTool` calls a `JobProviderAdapter` interface, not a specific vendor SDK. Sprint 8 ships with the interface, a `NullJobProvider` (returns a clear "not configured" structured response, no silent failure or fabricated listings), and a documented integration point for a real provider (e.g., JSearch/RapidAPI or Adzuna — both offer usable free tiers as of this writing). The concrete provider is selected and wired in a follow-up Decision Log entry once API credentials are actually provisioned — it is explicitly **not decided in this document** per Project Rule 9 (no scope creep — do not commit to a vendor account that doesn't exist yet).
**Reason:** The brief explicitly instructs: "do not assume a specific external job API is already available... design the safest architecture for a job-search provider... behind a provider abstraction." No job-search API key exists anywhere in the current `.env`/`06_API_Keys_and_Setup.md`. Shipping a clean adapter boundary now means whichever provider is chosen later is a config change plus one adapter implementation, not an architecture change.
**Alternatives Considered:** Commit to a specific vendor now (rejected — no account/key provisioned; would be inventing infrastructure that doesn't exist, which the source-of-truth rule for this exercise explicitly forbids); Scrape job boards directly (rejected outright — brief explicitly forbids this, and it is a ToS/legal risk regardless).
**Status:** Accepted

### [Sprint 8, Day 6] Streaming event transport — NDJSON over `StreamingResponse`, not SSE
**Decision:** The Python agent service streams structured agent events (not raw tokens) as newline-delimited JSON objects via FastAPI's `StreamingResponse`. The Next.js proxy re-streams the same bytes verbatim using the same native `ReadableStream` pattern already established in `/api/career-coach`. The browser parses each line as JSON to discriminate event `type`.
**Reason:** The existing Career Coach stream carries raw text tokens, where the SSE-flavored `data: ...` framing from OpenRouter is a reasonable fit. Sprint 8's agent stream carries *structured, typed* events (`agent_started`, `tool_started`, `artifact`, etc.) — NDJSON (one JSON object per line) is simpler to produce and parse for structured events than shoehorning them into SSE's `data:`/`event:` framing, and requires no new frontend dependency (still native `fetch` + `getReader()` + `TextDecoder`, consistent with Sprint 6's "no new packages" precedent).
**Alternatives Considered:** Server-Sent Events with named `event:` types (rejected — marginally more standard but adds parsing complexity for no benefit given the client is a custom `fetch` reader either way, not the browser's native `EventSource`); WebSockets (rejected — brief's own streaming section proposes a simple request/response-shaped event flow; a persistent bidirectional socket is unjustified infrastructure for a one-directional event stream).
**Status:** Accepted

### [Sprint 8, Day 9] No persistent agent memory; one new minimal Firestore collection for rate limiting only
**Decision:** Sprint 8 introduces exactly one new Firestore collection: `users/{uid}/agentUsage/{date}`, an atomic daily-request counter used solely for cost-control rate limiting. Agent conversation history remains client-side React state (same pattern as Sprint 6's Career Coach), not persisted. No "Career Memory" concept is introduced.
**Reason:** The brief explicitly instructs "do not introduce persistent memory automatically" and to classify state as request-scoped/conversation-scoped/session-scoped/persistent. Cross-session Career Memory is already correctly deferred to Sprint 10 in the existing Decision Log (Sprint 6 entry) — Sprint 8 should not quietly absorb that scope too. The one new collection is justified narrowly: without *some* server-side counter, per-user daily cost ceilings cannot be enforced across browser tabs/devices, which the brief's "Cost Control" section requires.
**Alternatives Considered:** No new Firestore collection; rely solely on client-side cooldowns like `aiService.ts`'s `COOLDOWN_MS` (rejected — client-side-only limits are trivially bypassed by refreshing the page or calling the API directly, and Sprint 8 explicitly calls for "maximum request limits" as a security/cost concern, which requires server-side enforcement); Full agent conversation persistence (rejected — explicitly out of scope per the brief, and belongs to a dedicated Career Memory sprint).
**Status:** Accepted

---

## Sprint 9 Decisions

### [Sprint 9, Pre-Planning] Sprint 8 Close-Out Audit Correction — agent list and artifact count
**Decision:** The Sprint 8 close-out entry in `01_Master_Roadmap.md` is corrected in place (not silently, per Project Rule 9): the 6 specialized agents are **Resume, ATS, Optimizer, Career, Job Search, Interview Coach** (not "Resume, ATS, Job Search, Cover Letter, Skill Gap, Interview Coach" as an earlier draft of that entry stated), and there are **8** typed artifact renderers, not 7 (the earlier count omitted `ResumePreviewCard`).
**Reason:** Direct inspection of `agent-service/crew/agents/` (7 files: `manager` role + `resume_agent.py`, `ats_agent.py`, `optimizer_agent.py`, `career_agent.py`, `job_search_agent.py`, `interview_coach_agent.py`) and `frontend/components/agent/artifacts/` (8 files, including `ResumePreviewCard.tsx` backing a `resume_preview` artifact type used by a grounded-resume-generation capability delivered alongside Sprint 8 but not originally documented) confirms the actual counts. This matches the *original* Sprint 8 architecture decision ("Cover Letter and Skill Gap ship as tools, not standalone CrewAI agents") — the close-out text had simply drifted from that decision when it was written.
**Alternatives Considered:** Leave the discrepancy uncorrected since Sprint 9's job is documentation, not Sprint 8 archaeology (rejected — Sprint 9's entire design depends on an accurate picture of what agents/tools/artifacts exist today; an inaccurate "existing state" baseline would propagate errors into every subsequent Sprint 9 decision).
**Status:** Accepted

### [Sprint 9, Day 1] Ground Sprint 9 in the actual Manager routing mechanism, not the documented one
**Decision:** Sprint 9's Interview Manager integrates with `agent-service/crew/manager.py`'s **actual** implementation — a deterministic, keyword-matched `if`/`elif` router (`process_manager_request_async`) that calls tool functions directly via `._run()` — not with the LLM-driven `Process.hierarchical` CrewAI delegation described in the Sprint 8 planning documentation (`Sprint_08/Day_02.md`, `Day_05.md`).
**Reason:** Direct inspection confirms `crew/manager.py` defines a `get_career_crew()` function assembling a real CrewAI `Crew(process=Process.hierarchical, ...)`, but a repository-wide search for `.kickoff(` returns zero call sites anywhere in `agent-service/`. Every one of the 7 existing routes (ATS, Optimize, Cover Letter, Interview, Job Search, Skill Gap, Conversational-fallback) is a `clean = message.lower(); elif "keyword" in clean:` branch calling a tool's `._run()` method directly, with `call_openrouter_api()` invoked directly for the conversational fallback. This is a materially different execution model than what Sprint 8's own documentation describes, and Sprint 9's design must be built on what is actually running, not what was originally planned — per this exercise's own source-of-truth rule ("do not assume something exists merely because it exists in the reference documentation").
**Alternatives Considered:** Silently document Sprint 9 as if the idealized hierarchical-delegation model were real, since that's what Sprint 8's docs say (rejected outright — this is precisely the "silently invent existing features" failure mode this exercise's instructions warn against); Use Sprint 9 to *retrofit* real `Crew.kickoff()` delegation before adding interview features (rejected — out of scope; the brief says "do not redesign working Sprint 8 architecture unnecessarily," and the deterministic router is demonstrably working in production today, just not as originally documented).
**Status:** Accepted

### [Sprint 9, Day 1] "Interview Manager" is a plain Python module, not a new CrewAI Agent
**Decision:** `agent-service/crew/interview_manager.py` is a plain Python module (functions, not a CrewAI `Agent` class) that owns interview session lifecycle: starting a session, presenting the next question, processing a submitted answer, deciding on a follow-up vs. moving on, and completing a session with a report. It is called directly from new sub-routes inside `manager.py`'s existing deterministic router — the same pattern every other capability already uses. No new agent is added to the roster; the total remains 7 (1 Manager + 6 specialized, unchanged from Sprint 8).
**Reason:** The brief's Interview Agent Hierarchy sketch (`Interview Manager -> Planner, Question Generation, Answer Evaluation, Interview Feedback`) describes 4 new specialized roles. Given the Day 1 finding that *no* existing agent is actually invoked via CrewAI delegation today, adding 4 new `Agent` objects that would *also* never be delegated to via `Crew.kickoff()` would create more of exactly the kind of documentation-vs-reality gap this Sprint's own Day 1 audit just corrected for Sprint 8. `crew/workflows.py` already establishes the precedent that not every unit of orchestration logic needs to be a CrewAI `Agent` — it is a plain module implementing the multi-step "apply to this job" sequencing from Sprint 8 Day 5, called directly from the router. `interview_manager.py` follows that exact precedent for interview session logic instead of introducing agent-shaped objects with no execution path to actually run as agents.
**Alternatives Considered:** Add 4 new specialized `Agent` objects (Interview Planner, Question Generation, Answer Evaluation, Interview Feedback) exactly as sketched in the brief (rejected — per the above, would multiply unused/undelegated CrewAI objects rather than closing the gap between documentation and reality; also violates "a separate agent should only exist when specialized reasoning/context justifies it," since none of these four roles do anything a plain function calling an LLM prompt doesn't already do in the current `interview_tools.py`); Retrofit real hierarchical delegation for interview logic only, leaving the other 6 capabilities on the deterministic router (rejected — an inconsistent execution model across capabilities is worse for maintainability than a consistently-deterministic router, and is a larger unrequested architecture change than Sprint 9's actual goal).
**Status:** Accepted

### [Sprint 9, Day 1] Interview session state is a client-held, request-scoped payload — no new Firestore collection
**Decision:** An interview session (`session_id`, `interview_type`, `target_role`, `difficulty`, `question_index`, the list of questions asked, answers given, and feedback returned so far) is held entirely in the browser (React state in the Agent Workspace, same tier as the existing chat conversation history) and sent back to `agent-service` as a new `interview_session` field on the existing `ChatRequest` schema on every turn during an active session — exactly the same pattern already used for `resume` and `attachments`. No `interviewSessions` Firestore collection is created.
**Reason:** Sprint 8 already established and tested this exact pattern for the resume payload (`20_Decision_Log.md`, "Resume is a request-scoped payload, not a server-side lookup") and deliberately avoided introducing persistent AI memory. An interview session is conceptually identical: a bounded, single-sitting piece of state that only needs to survive across consecutive turns of one conversation, not across page reloads or devices. Introducing a new Firestore collection would mean new security rules, a new ownership/access-pattern design, and a new retention policy for content that may include sensitive self-disclosures (weaknesses, past failures, personal anecdotes in answers) — complexity the brief explicitly says to avoid ("if persistence is not necessary for Sprint 9 MVP, do not introduce unnecessary database complexity"). Losing an in-progress mock interview on a hard page refresh is judged an acceptable MVP tradeoff, consistent with the existing Career Coach's conversation history also not surviving a refresh.
**Alternatives Considered:** `interviewSessions/{sessionId}` Firestore collection exactly as sketched in the brief (rejected for Sprint 9 MVP — no resume-across-devices requirement has been stated, and it would be the first collection in the entire project storing candidate-authored free-text answers, which raises retention/deletion questions the brief itself flags as needing careful design — deferred until a real requirement for resumable/persistent interview history is stated); Session state in a server-side in-memory cache keyed by `session_id` (rejected — `agent-service` is designed to be stateless and horizontally scalable per Sprint 8's architecture; introducing server-side session memory would break that property for a benefit the client-held-payload approach already provides).
**Status:** Accepted

### [Sprint 9, Day 2] No new streaming event types — interview moments map onto the existing 9 event types
**Decision:** Sprint 9 introduces zero new entries to the `AgentEvent` union. The brief's suggested interview-specific event names (`interview_started`, `question_generated`, `answer_submitted`, `evaluation_completed`, `follow_up_question`, `interview_completed`, etc.) are expressed using the existing vocabulary: `tool_started`/`tool_completed` (agent=`interview_coach_agent`, tool=`prepare_interview_questions`/`evaluate_interview_answer`/`generate_follow_up_question`/`generate_interview_report`) plus `artifact` events carrying the relevant new interview artifact type, and `completed` at session end.
**Reason:** Confirmed via inspection of `frontend/lib/agentStreamClient.ts` and `agent-service/schemas/events.py` that both sides of the wire protocol are hand-written, matched pairs — adding new event type strings means touching both files, every consumer of `AgentEvent`, and the Day 6 (Sprint 8) test suite's exhaustiveness assumptions. The existing 9 types are already sufficiently expressive: an "answer submitted" is not actually a server-to-client event at all (it's the client's own outbound request), and every other suggested event is a specific instance of an existing generic type. Reusing the existing vocabulary is a smaller, safer diff and matches the brief's own instruction to "reuse the existing streaming event architecture."
**Alternatives Considered:** Add the 9 suggested new event type strings from the brief verbatim (rejected — needlessly doubles the size of the event union for no new client capability, since every one of them is representable via an existing type + a `tool`/`artifact.type` discriminator).
**Status:** Accepted

### [Sprint 9, Day 4] Interview feedback stays qualitative — no numeric interview score introduced
**Decision:** `evaluate_interview_answer`'s existing output shape (qualitative text feedback across `clarity`, `structure`, `specificity`, `technical_depth`, `strengths`, `improvements`, `suggested_answer_direction` — already implemented and tested in Sprint 8) is kept as-is and is the basis for the new `InterviewFeedbackCard` artifact. Sprint 9 does not add a numeric interview score (e.g., "7.5/10") of any kind.
**Reason:** The brief is explicit and emphatic: "clearly distinguish AI feedback from authoritative ATS scoring... interview scores must NOT be confused with ATS scores." The existing qualitative-only feedback shape already avoids this risk entirely by construction — there is no number to confuse with the ATS score. Introducing one now, even a clearly-labeled "interview readiness score," would reintroduce exactly the ambiguity the brief warns against, for a capability (rank-ordering interview performance numerically) nothing in the current brief's use cases actually requires. The Session Summary/Report (Day 6) uses qualitative readiness labels ("Strong" / "Moderate" / "Needs Improvement") per topic area, matching the brief's own example report format, which are presented explicitly as coaching impressions, not measurements.
**Alternatives Considered:** A deterministic rubric-based numeric score (e.g., count of strengths minus improvements) (rejected — "deterministic" in name only, since it would still be scoring model-generated qualitative judgments, giving false precision); A clearly-labeled "AI Interview Impression Score, not an ATS score" (rejected for Sprint 9 — even with a disclaimer, a second number on the same screen as the real ATS score is a foreseeable source of user confusion the brief specifically warns about; can be revisited in a future sprint if explicitly requested with a concrete UX design for disambiguation).
**Status:** Accepted

### [Sprint 9, Day 4] Question-count and difficulty selection reuse existing fields; "modes" are a filter, not a separate agent path
**Decision:** Interview "mode" (HR / Behavioral / Technical / Mixed) is implemented as an `interview_type` parameter passed into the existing `prepare_interview_questions` tool (extended, not duplicated) and into the new `interview_manager.py` session logic — it is not a separate agent, tool, or code path per mode. Difficulty reuses the `difficulty: "Easy"|"Medium"|"Hard"` field already present on `InterviewQuestionItem` in `types/agent.ts` (already shipped in Sprint 8, currently just unpopulated by the fallback path) rather than introducing a new difficulty representation.
**Reason:** All four modes are, mechanically, "generate questions from this candidate context, weighted toward this category" — the difference is a prompt parameter, not a different reasoning process, so a single parameterized tool avoids duplicating four near-identical tools. Reusing the existing `difficulty` field means no `types/agent.ts` schema change is needed for difficulty at all — only that fallback/synthetic questions (used when no OpenRouter key is configured, per the existing pattern) also populate it, which they currently don't.
**Alternatives Considered:** A distinct tool per interview mode (`generate_hr_questions`, `generate_technical_questions`, etc.) (rejected — four tools differing only in a prompt-category string violates "only create tools that are actually necessary" and quadruples the tool-authorization/testing surface for no behavioral benefit); Coding/live problem-solving as a fifth Sprint 9 mode (rejected — no code-execution sandbox exists anywhere in `agent-service` or the frontend; a "coding interview" mode without the ability to actually run submitted code would just be a text-based technical question in disguise, so it is folded into the Technical mode rather than presented as a distinct, more capable mode it isn't).
**Status:** Accepted

### [Sprint 9, Day 9] Anti-fabrication guardrail is extended in place, not duplicated
**Decision:** The existing `INTERVIEW_GUARDRAIL` constant in `agent-service/tools/interview_tools.py` (already covers non-fabrication, resume-fact-vs-JD-requirement distinction, and no-hiring-verdicts) is reused verbatim as the shared guardrail text for the two new tools (`generate_follow_up_question`, `generate_interview_report`), with the report generator's prompt additionally instructed to explicitly flag any topic area where insufficient resume/JD evidence exists rather than silently omitting it or guessing.
**Reason:** A second, slightly-different guardrail string for the new tools would be exactly the kind of two-copies-that-can-drift problem already logged as accepted tech debt for the Career Agent persona in Sprint 8's Decision Log — avoidable here since all four interview tools live in the same Python file and can share one Python constant directly (no cross-language duplication problem exists within `interview_tools.py` itself).
**Status:** Accepted

### [Sprint 9, Day 10] Sprint 9 Close-Out — Full Verification and Architectural Parity Confirmed
**Decision:** Close out Sprint 9 with 101/101 automated Python tests passing, 0 TypeScript/Turbopack build errors, and full manual QA matrix (TEST A–O) verified. Final system structure matches the 10-day plan: `evaluate_interview_answer` is live and reachable via Manager sub-router Route 4b; `interview_manager.py` enforces session progression, adaptive follow-ups (`MAX_FOLLOW_UPS_PER_QUESTION=1`), and session completion (`MAX_QUESTIONS_PER_SESSION=15`); `InterviewFeedbackCard` and `InterviewReportCard` complete the closed 10-type Artifact union with zero numeric scores; and session-state tampering is bounded to the single client's ephemeral request payload.
**Reason:** Validates that the three Day 1 reachability and session gaps are completely closed without drift, establishing a robust baseline for Sprint 10.
**Status:** Accepted

---

## Sprint 10 Decisions

### [Sprint 10, Pre-Planning] Sprint 10 Redefinition — AI Interview Trainer displaces Career Roadmap in slot 10
**Decision:** Slot 10 becomes "AI Interview Trainer — Dedicated Multimodal, Voice-First Interview Training." The original slot-10 scope (Career Roadmap & Learning Engine) is displaced to slot 10b, unscheduled but fully retained in the roadmap.
**Reason:** Explicit product-owner directive. Repository audit confirms Sprint 9's text-based interview coach is complete and operational, making this a natural continuation while the context is fresh. Voice/camera interaction is architecturally novel work — HireLens has zero existing capability (no `getUserMedia`, no `MediaRecorder`, no STT/TTS provider, no media dependency in `package.json`) — and is a larger body of work than the learning-path generator.
**Alternatives Considered:** Keep Career Roadmap in slot 10 and defer the Trainer (rejected — contradicts an explicit directive); renumber Career Roadmap out of the roadmap entirely (rejected — it remains desired scope, so it is marked displaced rather than deleted, preserving audit history per Project Rule 9).
**Explicit boundary:** Sprint 10 does not generate study plans, map learning resources, or build skill-acquisition roadmaps. Its report recommends what to practice in the *next interview session* only.
**Status:** Accepted

### [Sprint 10, Day 1] Interview Trainer is a dedicated feature with its own route and navigation entry
**Decision:** The Trainer gets `frontend/app/dashboard/interview-trainer/` (landing → setup → Interview Room) and a new `Sidebar.tsx` entry "AI Interview Trainer." It does **not** live inside the Agent Workspace's Artifact Canvas. The AI Career Agent can *launch* it (a `launch_interview_trainer` action that deep-links into the Trainer), and Sprint 9's in-Agent text interview capability remains working and untouched.
**Reason:** The brief is explicit that the Trainer must not be buried inside the Career Agent UI. There is also a concrete technical reason: the Interview Room needs persistent media streams (a live `MediaStream`, an audio playback queue, a video element), long-lived permission state, and a full-viewport layout. The Agent Workspace's Artifact Canvas renders a *list of stateless, independently-rendered artifacts* inside a scrolling pane — confirmed via `ArtifactRenderer.tsx` — which is structurally wrong for a stateful, full-screen, media-holding experience. Forcing it in would mean an artifact that owns a microphone, which breaks the artifact model's core assumption.
**Alternatives Considered:** A new `interview_room` artifact type inside the existing Canvas (rejected — see above; artifacts are stateless renderers, not media-owning stateful components); replacing Sprint 9's in-Agent interview flow with the new Trainer (rejected — "existing features must remain working"; the text flow stays as a lightweight quick-practice path).
**Status:** Accepted

### [Sprint 10, Day 1] Voice runs through authenticated Next.js proxy routes behind a provider adapter
**Decision:** Two new Next.js routes, `frontend/app/api/interview/stt/route.ts` and `frontend/app/api/interview/tts/route.ts`, both calling `verifyAuth(req)` first, both delegating to a `SpeechProviderAdapter` interface. Sprint 10 ships a `SarvamSpeechProvider` (matching the provider JARVIS already uses successfully) plus a `NullSpeechProvider` that returns an explicit "voice not configured" state. Provider credentials live server-side only; the browser never sees a speech API key.
**Reason:** This mirrors the `JobProviderAdapter` pattern already proven in Sprint 8, keeping vendor choice a configuration concern rather than an architectural one. Routing through Next.js (rather than calling Sarvam directly from the browser, as would be simpler) is required because a browser-side call would expose the API key and allow unmetered third-party spend. Note that JARVIS's own STT/TTS routes have **no authentication whatsoever** — porting them as-is would create an open, unmetered proxy to a paid API, so adding `verifyAuth` is a mandatory correction, not an optional improvement (see `16_JARVIS_Reuse_Analysis.md` §5).
**Alternatives Considered:** Browser Web Speech API (`SpeechRecognition`/`speechSynthesis`) with no server involvement (rejected as the primary path — Safari/Firefox support for `SpeechRecognition` is unreliable and its quality/voice control is inconsistent across browsers; retained as a documented future fallback in `25_Backlog.md`); routing voice through the Python `agent-service` (rejected — media handling belongs at the Next.js/browser edge; adding audio payloads to the internal-JWT hop would double bandwidth for no benefit, and `agent-service` is deliberately stateless).
**Status:** Accepted

### [Sprint 10, Day 1] Manual turn control is primary; VAD is an assist, not the mechanism
**Decision:** The candidate ends their answer by pressing **"I'm Done"**. Energy-based VAD (`AudioContext` + `AnalyserNode` RMS + silence-duration threshold) runs alongside it as an *assist* that surfaces a "still there?" prompt after a sustained silence, and can auto-submit only if the user has opted into hands-free mode.
**Reason:** Audit found JARVIS has **no VAD at all** — it uses explicit push-to-talk. So VAD is entirely new code with no proven reference, and it is exactly the kind of device- and environment-dependent feature (background noise, mic gain, accents, thinking pauses) that fails unpredictably. In an interview trainer, a false end-of-speech detection that cuts off a candidate mid-answer is a severe UX failure that also wastes an STT call and corrupts the answer. Manual control is deterministic and testable; VAD layered on top can improve the experience without being load-bearing.
**Alternatives Considered:** VAD as the sole mechanism for a fully hands-free experience (rejected — unacceptable failure mode as above, and no reference implementation exists to derive it from); no VAD at all (rejected — leaves no recovery path when a user forgets to press Done, so the silence-prompt assist is worth having).
**Status:** Accepted

### [Sprint 10, Day 1] Batch STT, not streaming
**Decision:** One STT request per completed answer (record → stop → upload blob → transcript), matching JARVIS's proven model. No partial/interim transcripts in Sprint 10.
**Reason:** JARVIS's working implementation is batch (`MediaRecorder` → Blob → multipart POST), so batch is the path with an actual reference. Streaming STT would require a different provider integration (websocket or chunked protocol), a new realtime transport HireLens doesn't have, and partial-transcript UI state — a large amount of novel infrastructure for a latency improvement that matters less here than in a general assistant, because an interview answer is *expected* to be a long, uninterrupted monologue followed by a deliberate handoff.
**Alternatives Considered:** Streaming STT for lower perceived latency (deferred to `25_Backlog.md` — revisit if measured end-of-answer-to-next-question latency proves unacceptable in Day 10 performance testing).
**Status:** Accepted

### [Sprint 10, Day 1] No raw audio or video is ever persisted or logged
**Decision:** Audio blobs exist only in browser memory and in the single in-flight STT request; the STT route holds the blob only for the duration of the provider call and never writes it anywhere. Camera frames **never leave the browser** — all face detection runs client-side via `face-api.js` with models served from `/public/models`. Only derived text (transcripts) and derived numeric/boolean signals (speaking duration, filler-word counts, face-present booleans, framing flags) are sent to the reasoning layer. No audio, no video, no still frames, no face descriptors are stored in Firestore or anywhere else.
**Reason:** Voice and camera data are the most sensitive inputs HireLens has ever handled. Minimizing retention to "nothing" eliminates an entire category of privacy, retention-policy, deletion-request, and breach-exposure concerns outright, rather than managing them. Client-side-only vision is what makes the strong claim "your camera feed never leaves your device" truthful, which is also what makes an honest consent UI possible.
**Alternatives Considered:** Store audio for user playback/self-review (rejected for Sprint 10 — genuinely useful, but requires a retention policy, deletion flow, storage security rules, and consent design that is its own body of work; logged in `25_Backlog.md`); server-side vision processing for better accuracy (rejected — would require transmitting video frames, breaking the client-side-only privacy guarantee for a marginal accuracy gain on signals that are deliberately coarse anyway).
**Status:** Accepted

### [Sprint 10, Day 1] Visual analysis restricted to geometric signals; JARVIS emotion detection explicitly not reused
**Decision:** Camera analysis produces only: face detected (boolean), face within frame (boolean), approximate face box position/size (for framing guidance such as "camera is below eye level" or "you're quite far from the camera"), and out-of-frame duration. JARVIS's `lib/emotion-detection.ts` (expression-probability → emotion labels) is **not reused in any form**, and `face-api.js` expression, age, gender, and face-descriptor/recognition capabilities are all left unused even though the library provides them.
**Reason:** The brief explicitly forbids inferring emotion, confidence, honesty, personality, competence, or mental health from facial data and forbids pseudo-scientific facial scoring. A facial-expression classifier outputs a probability distribution over training-set expression categories — that is not a measurement of a person's emotional state, and telling a candidate "you appeared anxious" on that basis would be an unsupported claim about them. Geometric signals, by contrast, are directly verifiable: either a face was detected in the frame or it wasn't.
**Alternatives Considered:** Use expression probabilities but label them as "AI estimates" (rejected — a disclaimer does not make an invalid inference valid, and the brief specifically prohibits this category of claim rather than merely requiring it be hedged).
**Status:** Accepted

### [Sprint 10, Day 2] Universal role intelligence is prompt-driven, not a role taxonomy
**Decision:** `analyze_role` is a new tool that takes the user's free-text target role (plus optional JD and resume) and returns a structured `RoleIntelligence` object (likely competencies, interview categories with weights, technical vs. non-technical balance, suggested topics). There is **no hardcoded role list, no role taxonomy table, and no per-role question bank.**
**Reason:** The brief requires any legitimate user-entered role to work ("Teacher," "Financial Analyst," "Consultant" must work as well as "Software Engineer") and explicitly forbids hardcoding Software Engineer. Any enumerated taxonomy would be permanently incomplete and would fail exactly on the unusual roles where generic questions are least useful. A prompt-driven analysis generalizes to arbitrary roles by construction. Audit note: Sprint 9's `interview_manager.detect_target_role()` currently falls back to a hardcoded `"Software Engineer"` default — Sprint 10 replaces that default with an explicit user prompt ("What role are you interviewing for?") rather than a silent assumption.
**Alternatives Considered:** A curated role taxonomy with per-role competency maps for accuracy on common roles (rejected — permanently incomplete, high maintenance, and fails the universal-role requirement; a hybrid where common roles get curated data and others fall back to prompting was also rejected for Sprint 10 as it doubles the code paths to test for a quality gain that hasn't been shown to be needed).
**Status:** Accepted

### [Sprint 10, Day 3] Trainer session state is persisted in Firestore — a reversal of Sprint 9's decision, with stated cause
**Decision:** Sprint 10 introduces `users/{uid}/interviewTrainerSessions/{sessionId}` storing: role, interview type, difficulty, training mode, question history, transcripts, feedback, derived speech/visual signals, status, timestamps, and the final report. Raw audio/video is **never** included. Ownership is enforced by the `users/{uid}/` path plus existing Firestore security rules; `uid` always derives from verified auth, never from a client-supplied field.
**Reason:** This reverses Sprint 9's "no new Firestore collection" decision, and the reversal has a concrete cause rather than a change of taste. Sprint 9's sessions were short text exchanges where losing progress on refresh was an acceptable MVP tradeoff. A Sprint 10 voice interview is a 10–20 minute real-time session involving microphone permission, possibly camera permission, and spoken answers the candidate cannot cheaply reproduce. Losing that to an accidental refresh, a tab crash, or a phone call is a materially worse failure. Persistence also enables the report to be revisited later, which is the point of a *trainer* (reviewing past sessions is how improvement is observed) versus a one-shot coach.
**Alternatives Considered:** Keep client-held request-scoped state as in Sprint 9 (rejected — the failure mode is much more costly here, per above); `sessionStorage`/`IndexedDB` for refresh survival without a server collection (rejected — survives refresh but not device change, and provides no path to reviewing past sessions or to the cross-session progress view a trainer implies).
**Status:** Accepted

### [Sprint 10, Day 4] The Trainer reuses Sprint 9's `interview_manager.py` engine; no new CrewAI agents
**Decision:** Sprint 10 extends `agent-service/crew/interview_manager.py` (session lifecycle, adaptive follow-up, difficulty stepping — all already working from Sprint 9) rather than building a parallel trainer engine. New capability is added as new tools and new plain-module services, not new CrewAI `Agent` objects. Total agent count remains **7** (1 Manager + 6 specialized), unchanged since Sprint 8.
**Reason:** Sprint 9's engine already implements exactly the loop Sprint 10 needs (present question → evaluate answer → decide follow-up vs. advance → complete → report), with bounded ceilings and tested anti-fabrication guardrails. Rebuilding it would duplicate business logic, which Project Rule 1 and the brief both forbid. On agents: Sprint 9's Day 1 audit established that `Crew.kickoff()` has zero call sites and all routing is a deterministic keyword router — re-confirmed still true in Sprint 10's audit. Adding new `Agent` objects that would also never be delegated to would compound a documentation-vs-reality gap rather than closing it, and the brief explicitly warns "do not blindly activate unused CrewAI components."
**Alternatives Considered:** A dedicated `InterviewTrainerCrew` with Role Intelligence / Question Engine / Coaching Engine as CrewAI agents (rejected — see above; these are single-purpose prompt calls, not multi-step reasoning roles needing their own delegation loops); retrofitting real `Crew.kickoff()` delegation first (rejected — out of Sprint 10's scope; the deterministic router works in production, and this would be a large unrequested architecture change).
**Status:** Accepted

### [Sprint 10, Day 7] Speech analysis uses transcript- and timing-derived metrics only; no acoustic emotion or confidence scoring
**Decision:** Speech/delivery intelligence is computed from two sources only: (a) the transcript text (filler-word counts, repeated phrases, sentence length distribution, answer word count) and (b) recording timing (total speaking duration, words-per-minute, and — if the `MediaRecorder` timeslice data supports it — coarse pause detection from audio-energy gaps). No pitch analysis, no vocal-tone classification, no emotion inference, and **no numeric confidence score**.
**Reason:** The brief forbids claiming to measure true emotional state or confidence, and explicitly rejects outputs like "Your confidence is 43%." Transcript- and timing-derived metrics are directly verifiable and can be stated as observations the candidate can check ("you used 'um' 14 times", "you spoke at about 180 words per minute"), which is also what makes the coaching actionable. Confidence *coaching* is delivered as guidance grounded in those observations, never as a measurement.
**Alternatives Considered:** A model-derived "confidence indicator" clearly labelled as an AI estimate (rejected for Sprint 10 — the brief allows this only with "a defensible, documented measurement system," and no such system has been designed; an unlabelled-quality number would invite exactly the ATS-score confusion Sprint 9's Decision Log already guarded against).
**Status:** Accepted

### [Sprint 10, Day 9] Streaming reuses the existing 9 NDJSON event types; voice state is client-local
**Decision:** No new `AgentEvent` types are added. Trainer reasoning steps map onto existing `tool_started`/`tool_completed`/`artifact`/`completed`/`error` events exactly as Sprint 9's interview flow does. Voice/media states (AI SPEAKING, LISTENING, PROCESSING, permission states) are **client-local React state** in the Interview Room — they are not server events, because they describe browser-side media activity the server has no knowledge of and no authority over.
**Reason:** Consistent with Sprint 9's "no new streaming event types" ADR and the brief's "do not create a second unnecessary streaming architecture." Recognizing that voice state is inherently client-side avoids inventing a bidirectional realtime channel to report on things the browser already knows locally — TTS playback progress and mic permission status originate in the browser, so round-tripping them through the server would add latency and failure modes for zero information gain.
**Alternatives Considered:** A WebSocket channel for realtime voice state (rejected — nothing needs server→client push that the existing NDJSON stream doesn't already cover, and voice state doesn't originate server-side); adding ~10 new voice-specific event types as the brief's conceptual list suggests (rejected — each would need Python/TypeScript pairs, consumer updates, and exhaustiveness-test changes, for states the client already owns).
**Status:** Accepted
