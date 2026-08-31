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

### [Sprint 8, Day 10] Sprint 8 Architectural Execution & Close-Out
**Decision:** Close out Sprint 8 as 100% Complete with zero deviations from the planned 10-day architecture.
- **Backend:** Python/FastAPI `agent-service/` hosting CrewAI Manager + 6 specialized domain agents and 9 typed tools. Internal JWT authentication (`verifyInternalJwt.ts` / `auth.py`) guarantees zero cross-user data access.
- **Deterministic Bridge:** Internal Next.js endpoints (`/api/internal/ats-score` & `/api/internal/jd-match`) preserve single-source-of-truth ATS scoring and keyword matching without Python code drift.
- **Generative UI:** Desktop split-pane Agent Workspace (`/dashboard/agent`) default landing, featuring live activity trace checklist (`AgentActivityTrace.tsx`), pre-filled quick action chips (`ConversationPane.tsx`), and Artifact Canvas (`ArtifactCanvas.tsx` & `ArtifactRenderer.tsx`) with 7 dedicated typed renderers.
- **Safety & Rate Limiting:** `ResumeDiffCard` Apply/Reject mutations are client-side-only via `ResumeContext`. Atomic server-side rate limiting via Firestore `FieldValue.increment` / transactions enforces `DAILY_AGENT_REQUEST_LIMIT = 50` before contacting `agent-service`, with fail-open soft-limit policy on transient DB errors.
- **Verification:** 100% automated test pass across 46 Python pytest cases, 11 TypeScript test scripts, clean Next.js production build (`npm run build`), and manual QA cases C1–C8.
**Status:** Accepted and locked.

