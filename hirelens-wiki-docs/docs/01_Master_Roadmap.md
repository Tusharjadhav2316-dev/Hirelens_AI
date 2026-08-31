# HireLens 2.0 — Master Roadmap

> **Authoritative Roadmap.** Sprint names and sequence below are locked *except where an explicit, logged product-owner directive amends them* — see the **[Sprint 8 Scope Directive]** note below and `20_Decision_Log.md`. Update **Status** and **Actual Outcome** as sprints complete. Daily implementation detail lives in `Sprint_NN/Day_NN.md` — not in this file.

## ⚠️ Sprint 8 Scope Directive (Roadmap Amendment)

Prior to Sprint 8 planning, the product owner issued an explicit directive: *Sprint 8 must transform HireLens into an "AI Career Operating System" where the CrewAI-orchestrated Career Agent becomes the primary post-login experience, and must be able to orchestrate every existing HireLens capability plus the capabilities originally scoped for Sprint 7 (Job Search) and Sprint 9 (Interview Coach), since neither exists in the codebase yet and both are natural agent tool/agent surfaces.*

This is a **deliberate, logged amendment** to the "locked sequence" rule above, not silent scope creep (Project Rule 9 — see `20_Decision_Log.md`, ADR "Sprint 8 Scope Expansion"). Concretely:
- **Sprint 7 (Job Search & Application Tracker)** — the *job search* half is pulled forward and delivered inside Sprint 8 as the Job Search Agent + `JobSearchTool` (Day 4). The *application pipeline tracker* (kanban, Firestore-persisted application records) is **not** pulled forward — it remains a distinct future sprint since it is additive UI/data work, not agent-orchestration work, and is out of Sprint 8's stated boundaries (see `26_Risks.md` and the Sprint 8 "Future-Sprint Boundaries" note).
- **Sprint 9 (AI Interview Coach)** — pulled forward in full as the Interview Coach Agent (Day 4/5), scoped down to text-based Q&A and feedback (no audio/video recording), matching the original Sprint 9 description's "session-based... text input" framing.
- **Sprint 10 (Career Roadmap & Learning Engine)** is **not** pulled forward. Skill-gap detection ships in Sprint 8 as a deterministic tool (`analyze_skill_gap`, reusing `jdMatcher.ts`), but the full personalized learning-path/study-roadmap generator remains Sprint 10's scope.

The table below reflects this amendment.

## Sprint Overview

| # | Title | Est. Days | Difficulty | Status |
|---|---|---|---|---|
| 1 | Repository Discovery & Engineering Audit | 5 | Easy | ✅ Complete |
| 2 | Production Stabilization | 5 | Medium | ✅ Complete |
| 3 | AI Resume Intelligence | 5 | Medium | ✅ Complete |
| 4 | Advanced ATS Intelligence & Resume Quality Refinement | 5 | Medium | ✅ Complete |
| 5 | AI Resume Optimizer & Rewrite Engine | 5 | Medium | ✅ Complete |
| 6 | AI Career Coach | 8 | Hard | ✅ Complete |
| 7 | Job Search & Application Tracker | 7 | Medium-Hard | ⚠️ Partially Superseded — job search delivered in Sprint 8; application tracker remains ⬜ Not Started |
| 8 | CrewAI Multi-Agent System & AI-First Agent Workspace | 10 | Hard | ✅ Complete |
| 9 | AI Interview Coach | 7 | Medium-Hard | ⚠️ Superseded — delivered inside Sprint 8 as the Interview Coach Agent |
| 10 | Career Roadmap & Learning Engine | 6 | Medium | ⬜ Not Started |
| 11 | Premium UI/UX Redesign | 8 | Medium-Hard | ⬜ Not Started |
| 12 | Premium SaaS Features & Payments | 7 | Hard | ⬜ Not Started |
| 13 | Testing, Performance, Security & Optimization | 6 | Medium-Hard | ⬜ Not Started |
| 14 | Production Launch & Deployment | 6 | Hard | ⬜ Not Started |

---

## Completed Sprints

### Sprint 1 — Repository Discovery & Engineering Audit ✅ Complete
**Actual Outcome:** Confirmed stack: Next.js 16 App Router, React 19, TypeScript, Firebase Auth + Firestore (client SDK only, no server-side DB), OpenRouter (Gemini 2.0 Flash Lite). Identified 2 critical blockers (build failure, Firestore casing bug), 3 high-severity issues (unauthenticated API routes, no middleware, broken Job Matcher display). The original design-report-assumed stack (FastAPI, PostgreSQL, CrewAI) was confirmed absent.

### Sprint 2 — Production Stabilization ✅ Complete
**Actual Outcome:** Fixed production build failure (`cover-letter/page.tsx` Uint8Array/BlobPart), Firestore collection casing (`"Users"` → `"users"`), added Firebase Admin SDK token verification to all 5 `/api/*` routes, rendered Job Matcher AI insights, fixed settings navbar link, moved Firebase config to environment variables.

### Sprint 3 — AI Resume Intelligence ✅ Complete
**Actual Outcome:** `lib/atsAnalyzer.ts` — certifications/achievements scoring, real keyword density computation, expanded weak verbs, skill-level guidance. `lib/atsEngine.ts` — removed artificial 35-point floor, bigram keyword extraction, improved quantification regex, date-range year inference. `lib/jdMatcher.ts` — frequency-weighted keyword selection, required vs. preferred skill detection, structured section scoring. `api/ai-improve` — achievements/certifications support, optional JD context. `lib/promptTemplates.ts` created. `api/ai-insights` — system prompt added.

### Sprint 4 — Advanced ATS Intelligence & Resume Quality Refinement ✅ Complete
**Actual Outcome:** Fixed Sprint 3's structured section scoring (JDMatcherPanel never passed `resume` param — 1-line fix that activated a full sprint of work). Added "Resume Intelligence" section to `ATSScorePanel.tsx` surfacing `keywordDensityScore`, `impactScore`, `completenessScore`. Graduated binary impact/skills scores (4-tier). Extracted `calculateFormattingScore()` helper. Fixed keyword density false positives for short skill names (word-boundary regex). Expanded benchmark suite with Java Full Stack JD. Added `max_tokens` and `temperature` to all AI routes. Cleaned duplicate persona from `ai-insights` user prompt.

### Sprint 5 — AI Resume Optimizer & Rewrite Engine ✅ Complete
**Actual Outcome:** Built central prompt architecture in `promptTemplates.ts` supporting 5 optimization modes (`ats`, `impact`, `concise`, `action-verbs`, `jd-align`) with strict `HALLUCINATION_GUARDRAIL`. Extended `api/ai-improve` route and `aiService.ts` with `mode` parameter and length limit enforcement. Added AI optimize buttons across all 5 resume forms (Achievements, Certifications, Personal Summary, Experience, Projects). Added Job Description context panel in `ResumeEditor.tsx` feeding target JD to all optimizer calls. Upgraded `AIImprovementModal` with editable output `<textarea>`, `↺ Regenerate` action, mode badges, JD Context badges, and persistent `activeItemId` state lifecycle. Created `tests/optimizerSafety.test.ts` (49 automated assertions + 4 manual truth-preservation cases passed 100%).

### Sprint 6 — AI Career Coach ✅ Complete
**Actual Outcome:** Built an authenticated conversational Career Coach (`/dashboard/career-coach`) with real-time SSE token streaming via Next.js serverless route (`/api/career-coach`). Grounded the Coach across 3 intelligence layers: candidate resume (`buildResumeContextBlock`), deterministic ATS analysis (`buildATSContextBlock` from `analyzeResume`), and target job description context (`buildJDContextBlock`). Enforced non-negotiable truth-preservation guardrails (`CAREER_COACH_SYSTEM_PROMPT`). Created pure helper module `lib/careerCoachService.ts`, client UI shell with starter prompts, context status indicator bar, context inspector panel, input clamping, auto-resizing textarea, 8-turn context window trimming warning, and comprehensive safety test suite `tests/careerCoachSafety.test.ts` (34 automated assertions + 5 manual QA cases passed 100%).

### Sprint 8 — CrewAI Multi-Agent System & AI-First Agent Workspace ✅ Complete
**Actual Outcome:** Delivered a full 10-day architectural transformation into an AI Career Operating System. Built Python/FastAPI `agent-service/` featuring a Manager Agent + 6 specialized domain agents (Resume, ATS, Job Search, Cover Letter, Skill Gap, Interview Coach) using CrewAI and 9 typed tools. Connected Next.js frontend to Python backend via authenticated streaming proxy (`/api/agent/chat`) with internal JWT verification (`verifyInternalJwt.ts`) and atomic server-side daily rate limiting (`agentUsageService.ts` with 50 req/day cap). Built internal Next.js bridge endpoints (`/api/internal/ats-score` & `/api/internal/jd-match`) ensuring single-source-of-truth preservation for deterministic ATS calculations. Created default post-login desktop split-pane Agent Workspace (`/dashboard/agent`) featuring live activity trace checklist (`AgentActivityTrace.tsx`), quick-action chip pre-filling (`ConversationPane.tsx`), and Generative UI Artifact Canvas (`ArtifactCanvas.tsx` & `ArtifactRenderer.tsx`) with 7 dedicated typed renderers (`ATSScoreCard`, `ResumeDiffCard`, `JobResultCard`, `SkillGapCard`, `CoverLetterPreview`, `InterviewQuestionCard`, `TaskProgress`). Enforced client-side-only `ResumeDiffCard` Apply/Reject mutations via `ResumeContext`. Verified 100% pass across 46 Python pytest cases, 11 TypeScript test suites, zero Next.js build errors, and manual QA cases C1–C8.

---

## Active Sprint

### Sprint 8 — CrewAI Multi-Agent System & AI-First Agent Workspace 🟦 Planned — 0% Progress
**Goal:** Introduce a Python/FastAPI + CrewAI agent-orchestration service, fronted by an authenticated Next.js proxy, and make the resulting **AI Career Agent** the primary post-login experience. The agent orchestrates all existing HireLens capabilities (Resume Builder/Optimizer, deterministic ATS Engine, Cover Letter, Career Coach persona) plus two new capabilities pulled forward from Sprints 7 and 9 (Job Search, Interview Prep) via typed tools — it never re-implements or bypasses them. See `Sprint_08/Day_01.md` through `Day_10.md` for full implementation detail, and the **Sprint 8 Scope Directive** above for why Job Search and Interview Coach appear here instead of their originally-numbered sprints.

---

## Planned Sprints (High-Level)

### Sprint 7 — Job Search & Application Tracker (Partially Superseded)
Originally scoped as job search integration + an application pipeline tracker. **Job search is now delivered in Sprint 8** (Job Search Agent + provider-abstracted `JobSearchTool`). The **application pipeline tracker** (Firestore-persisted application records; Wishlist → Applied → Interviewing → Offered/Rejected kanban) remains unscheduled future work — it is UI/data-model work, not agent orchestration, and stays out of Sprint 8's boundaries.

### Sprint 8 — CrewAI Multi-Agent System & AI-First Agent Workspace
See "Active Sprint" above and `Sprint_08/` for full detail.

### Sprint 9 — AI Interview Coach (Superseded)
Originally scoped as simulated interview mode with question generation and structured feedback. **Delivered inside Sprint 8** as the Interview Coach Agent (text-based Q&A + feedback, session-scoped, no audio/video — matching the original "text input... session-based" framing). This sprint number is retired; no further Sprint 9 work is planned under this title.

### Sprint 10 — Career Roadmap & Learning Engine
Skill gap analysis extended into a personalized learning path generator. Identifies missing skills against a target role, maps them to recommended resources (courses, projects, certifications), and generates a chronological study plan. Architecture: extends existing `jdMatcher.ts` skill-gap detection; learning resource suggestions via AI prompting (no external learning API dependency by default — can be added if a suitable free tier is identified).

### Sprint 11 — Premium UI/UX Redesign
Full design system refresh: design tokens, component library, accessibility pass (WCAG AA), responsive layout improvements, animation polish. This is the sprint where the "AI Career Operating System" visual identity is locked in. Constraint: no feature work in this sprint — UI only.

### Sprint 12 — Premium SaaS Features & Payments
Subscription tiers (Free/Pro/Team), Stripe integration, usage metering, rate limiting by tier, feature gating. Architecture: requires a server-side billing layer; likely introduces a Firebase Cloud Function or Next.js API route for webhook handling.

### Sprint 13 — Testing, Performance, Security & Optimization
Full test suite (Vitest + Playwright E2E), Lighthouse performance audit, Firestore security rules audit, bundle analysis and code splitting, dependency audit, security review of all auth boundaries.

### Sprint 14 — Production Launch & Deployment
Vercel production deployment, custom domain, CI/CD pipeline (GitHub Actions), environment separation (dev/staging/prod), monitoring and alerting (OpenTelemetry/Sentry), performance baseline, launch checklist.

---

## How to Use This File
- Update **Status** column when a sprint changes state
- Add a real "Actual Outcome" paragraph when a sprint completes — do not invent details, only write what was actually verified
- Never expand future sprint descriptions here — detail lives in `Sprint_NN/Day_NN.md`
- If a sprint's technical premises change (e.g., a framework decision), log the change in `20_Decision_Log.md` first, then update this file

### Sprint 6 — AI Career Coach ✅ Complete
**Goal:** Introduce a conversational AI Career Coach as an additional interface layer — grounded in the candidate's resume, HireLens ATS analysis, and optional JD context. The Coach explains existing intelligence rather than replacing it.
**Architecture decision:** Stateless API (client-side React state conversation window), native ReadableStream streaming, Firebase auth verified, `google/gemini-2.5-flash` model, deterministic ATS engine explanation, client-side PDF/TXT document attachment upload capability.
**Key deliverables:**
- `lib/careerCoachService.ts` — pure context builders and type definitions
- `app/api/career-coach/route.ts` — authenticated streaming endpoint
- `app/api/parse-pdf/route.ts` — PDF parsing endpoint returning extracted text
- `app/dashboard/career-coach/page.tsx` — full chat UI with document attachment upload, single robot avatar streaming, starter prompts, context inspector
- `components/Sidebar.tsx` — "AI Career Coach" navigation entry added
- `tests/careerCoachSafety.test.ts` — 34 automated assertions + 5 manual QA cases passed 100%
**Non-negotiable:** Coach never fabricates ATS scores, skills, experience, or qualifications. ATS scores remain deterministic engine output — the Coach explains them.
**See:** `Sprint_06/Day_01.md` through `Day_08.md`

### Sprint 8 — CrewAI Multi-Agent System & AI-First Agent Workspace 🟦 Planned
**Goal:** Make an orchestrating AI Career Agent the primary interface after login, backed by a new Python/FastAPI + CrewAI microservice that calls back into the *existing* Next.js deterministic services (ATS engine, resume optimizer, cover letter generator, JD matcher) rather than duplicating them, plus two new agent-native capabilities (Job Search, Interview Prep) pulled forward per the Sprint 8 Scope Directive.
**Architecture decision:** Separate Python/FastAPI microservice (`agent-service/`) hosting CrewAI, deployed independently of the Vercel-hosted Next.js app; Next.js exposes an authenticated proxy route (`/api/agent/*`) that verifies the Firebase ID token, mints a short-lived internal service JWT carrying the verified `uid`, and forwards the request — the Python service never receives or trusts a raw client-supplied `userId`. Full rationale in `20_Decision_Log.md` and `Sprint_08/Day_01.md`.
**Key deliverables (planned):**
- `agent-service/` — new FastAPI + CrewAI Python microservice (Manager Agent + 7 specialized agents + typed tools)
- `frontend/app/api/agent/chat/route.ts` — authenticated streaming proxy, NDJSON agent-event passthrough
- `frontend/app/api/internal/*` — new internal-only Next.js endpoints wrapping `atsEngine.ts`/`atsAnalyzer.ts`, `jdMatcher.ts`, and the resume/cover-letter prompt logic for the agent service to call (single source of truth preserved, nothing reimplemented in Python)
- `frontend/app/dashboard/agent/page.tsx` — new Agent Workspace (conversation pane + Artifact Canvas), becomes the default post-login destination
- `frontend/components/agent/*` — new Generative UI artifact renderers (ATS score card, resume diff, job result card, skill-gap card, cover-letter preview, interview question card, agent activity trace)
- `tests/agentToolContracts.test.ts`, `tests/agentSafety.test.ts`, and Python-side `agent-service/tests/` — safety, authorization, and structured-response test suites
**Non-negotiable:** The agent never recalculates or invents an ATS score, never writes to Firestore or `ResumeContext` directly, and never applies a resume change without an explicit user Apply action. All resume-changing tool output is a structured, reviewable diff.
**See:** `Sprint_08/Day_01.md` through `Day_10.md`
