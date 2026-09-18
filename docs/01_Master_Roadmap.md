# HireLens 2.0 — Master Roadmap

> **Authoritative Roadmap.** Sprint names and sequence below are locked *except where an explicit, logged product-owner directive amends them* — see the **[Sprint 8 Scope Directive]** note below and `20_Decision_Log.md`. Update **Status** and **Actual Outcome** as sprints complete. Daily implementation detail lives in `Sprint_NN/Day_NN.md` — not in this file.

## ⚠️ Sprint 8 Scope Directive (Roadmap Amendment)

Prior to Sprint 8 planning, the product owner issued an explicit directive: *Sprint 8 must transform HireLens into an "AI Career Operating System" where the CrewAI-orchestrated Career Agent becomes the primary post-login experience, and must be able to orchestrate every existing HireLens capability plus the capabilities originally scoped for Sprint 7 (Job Search) and Sprint 9 (Interview Coach), since neither exists in the codebase yet and both are natural agent tool/agent surfaces.*

This is a **deliberate, logged amendment** to the "locked sequence" rule above, not silent scope creep (Project Rule 9 — see `20_Decision_Log.md`, ADR "Sprint 8 Scope Expansion"). Concretely:
- **Sprint 7 (Job Search & Application Tracker)** — the *job search* half is pulled forward and delivered inside Sprint 8 as the Job Search Agent + `JobSearchTool` (Day 4). The *application pipeline tracker* (kanban, Firestore-persisted application records) is **not** pulled forward — it remains a distinct future sprint since it is additive UI/data work, not agent-orchestration work, and is out of Sprint 8's stated boundaries (see `26_Risks.md` and the Sprint 8 "Future-Sprint Boundaries" note).
- **Sprint 9 (AI Interview Coach)** — pulled forward in full as the Interview Coach Agent (Day 4/5), scoped down to text-based Q&A and feedback (no audio/video recording), matching the original Sprint 9 description's "session-based... text input" framing.
- **Sprint 10 (Career Roadmap & Learning Engine)** is **not** pulled forward. Skill-gap detection ships in Sprint 8 as a deterministic tool (`analyze_skill_gap`, reusing `jdMatcher.ts`), but the full personalized learning-path/study-roadmap generator remains Sprint 10's scope.

The table below reflects this amendment.

## ⚠️ Sprint 9 Reactivation (Roadmap Amendment)

Sprint 8's close-out (below) correctly retired the "Sprint 9" title, since Sprint 8 delivered a working baseline Interview Coach (`prepare_interview_questions` + `evaluate_interview_answer`, single-shot, no session). The product owner has since issued a new, explicit directive re-activating the Sprint 9 slot for a **deepening** of that capability — not a repeat of Sprint 8's work. Per repository audit (`Sprint_09/Day_01.md`), the Sprint 8 baseline has three concrete gaps this Sprint 9 exists to close:
1. `evaluate_interview_answer` is a fully-implemented, tested tool, but **no code path in `agent-service/crew/manager.py` ever calls it** — a candidate can receive questions but has no way to submit an answer and receive feedback today.
2. There is no interview **session** concept anywhere (no question index, no running Q&A history, no adaptive follow-up, no completion/report) — each interview-related request is independent and stateless.
3. `InterviewQuestionCard.tsx` only renders a static list of questions with expandable tips — there is no answer input, no submit action, no feedback display, and no progress/report UI.

This re-activation is logged the same way the Sprint 8 Scope Directive was logged (Project Rule 9 — no silent scope creep): see `20_Decision_Log.md`, ADR "Sprint 9 Reactivation." Sprint 9 is scoped narrowly to closing these three gaps plus the mock-interview/adaptive-follow-up/report capabilities the original brief always intended for this title — it does not redo anything Sprint 8 already delivered correctly.

## ⚠️ Sprint 10 Redefinition (Roadmap Amendment)

Slot 10 was originally **Career Roadmap & Learning Engine**. The product owner has issued an explicit directive redefining Sprint 10 as **AI Interview Trainer — Dedicated Multimodal, Voice-First Interview Training Experience**. Career Roadmap & Learning Engine is **displaced, not cancelled** — it is listed as slot 10b and remains fully in the roadmap, unscheduled.

Rationale for the redefinition (logged per Project Rule 9, no silent scope creep — see `20_Decision_Log.md`, ADR "Sprint 10 Redefinition"): Sprint 9 delivered a working text-based interview coach, and repository audit confirms it is complete and operational. The directive is to now make interview training a **first-class, dedicated product feature** with its own navigation entry and workspace, and to add voice (and optional camera) interaction — which HireLens has **zero** existing capability for (confirmed: no `getUserMedia`, no `MediaRecorder`, no STT/TTS provider, no media dependencies in `package.json`). This is a substantially larger and more architecturally novel body of work than the learning-path generator, and it builds directly on Sprint 9's just-completed foundation while that context is fresh.

**Explicit boundary:** Sprint 10 does **not** absorb the Career Roadmap / Learning Engine. Sprint 10's final trainer report surfaces practice recommendations for the *next interview session* only — it does not generate study plans, map learning resources, or build a chronological skill-acquisition roadmap. That remains slot 10b's scope.

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
| 9 | AI Interview Coach — Mock Interview Sessions, Adaptive Follow-Up & Feedback | 10 | Hard | ✅ Complete |
| 10 | **AI Interview Trainer — Dedicated Multimodal, Voice-First Interview Training** | 10 | Hard | 🟦 Planned (this document) — see "Sprint 10 Redefinition" note below |
| 10b | Career Roadmap & Learning Engine (displaced from slot 10) | 6 | Medium | ⬜ Not Started |
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

---

### Sprint 9 — AI Interview Coach: Mock Interview Sessions, Adaptive Follow-Up & Feedback ✅ Complete
**Actual Outcome:** Delivered interactive mock interview coach and evaluation engine across a complete 10-day lifecycle. Wired `evaluate_interview_answer` tool into live Manager Agent sub-routing (`manager.py` Route 4b), eliminating the Sprint 8 reachability gap. Built client-held, request-scoped interview session state (`InterviewSessionState`, snake_case Python schemas, camelCase TypeScript frontend) without requiring persistent Firestore database changes. Implemented `agent-service/crew/interview_manager.py` with multi-tier context resolution (direct fields + PDF/TXT attachment fallback), adaptive follow-up decision rules (`MAX_FOLLOW_UPS_PER_QUESTION = 1`), adaptive difficulty stepping (`beginner` -> `intermediate` -> `advanced`), and session completion capping (`MAX_QUESTIONS_PER_SESSION = 15`). Extended generative UI Artifact Canvas with `InterviewFeedbackCard.tsx` and `InterviewReportCard.tsx`, completing the closed 10-type Artifact union. Enforced zero-numeric-score and non-fabrication constraints (`InterviewReportArtifactData` with `extra="forbid"`). Hardened against prompt injection and session-state tampering with 101/101 automated Python tests passing and 0 TypeScript build errors.
**See:** `Sprint_09/Day_01.md` through `Day_10.md`

---

## Next Sprint (Upcoming)

### Sprint 10 — AI Interview Trainer: Dedicated Multimodal, Voice-First Interview Training 🟦 Planned — 0% Progress
**Goal:** Promote interview training from a capability inside the AI Career Agent into a dedicated, first-class HireLens feature with its own navigation entry (`/dashboard/interview-trainer`) and dedicated Interview Room workspace, and add voice-first interaction (AI interviewer speaks via TTS; candidate answers by microphone via STT) plus optional camera-based presence/framing coaching. Universal role support — any user-entered target role, no hardcoded "Software Engineer." Reuses Sprint 9's `interview_manager.py` session engine and the existing Firebase/internal-JWT security boundary rather than rebuilding them. Voice and camera technology patterns are adapted from the JARVIS reference repository — see `16_JARVIS_Reuse_Analysis.md`.
**Architecture decision:** Voice runs through two new authenticated Next.js routes (`/api/interview/stt`, `/api/interview/tts`) behind a `SpeechProviderAdapter` abstraction; all media capture stays client-side in React hooks; no raw audio or video is ever persisted. Manual "I'm Done" turn control is the primary, reliable path with energy-based VAD as an assist. Full rationale in `20_Decision_Log.md` and `Sprint_10/Day_01.md` (Architecture Gate).
**See:** `Sprint_10/Day_01.md` through `Day_10.md`, plus `16_JARVIS_Reuse_Analysis.md`

### Sprint 10b — Career Roadmap & Learning Engine ⬜ Not Started (displaced from slot 10)
Skill gap analysis extended into a personalized learning path generator. Identifies missing skills against a target role, maps them to recommended resources (courses, projects, certifications), and generates a chronological study plan. Architecture: extends existing `jdMatcher.ts` skill-gap detection; learning resource suggestions via AI prompting (no external learning API dependency by default — can be added if a suitable free tier is identified). **Explicitly not absorbed by Sprint 10** — see the Sprint 10 Redefinition note above.

---

## Planned Sprints (High-Level)

### Sprint 7 — Job Search & Application Tracker (Partially Superseded)
Originally scoped as job search integration + an application pipeline tracker. **Job search is now delivered in Sprint 8** (Job Search Agent + provider-abstracted `JobSearchTool`). The **application pipeline tracker** (Firestore-persisted application records; Wishlist → Applied → Interviewing → Offered/Rejected kanban) remains unscheduled future work — it is UI/data-model work, not agent orchestration, and stays out of Sprint 8's boundaries.

### Sprint 8 — CrewAI Multi-Agent System & AI-First Agent Workspace (Complete)
See "Completed Sprints" above and `Sprint_08/` for full detail.

### Sprint 9 — AI Interview Coach: Mock Interview Sessions, Adaptive Follow-Up & Feedback (Complete)
See "Completed Sprints" above and `Sprint_09/` for full detail.

### Sprint 10 — AI Interview Trainer: Dedicated Multimodal, Voice-First Interview Training
See "Next Sprint" above and `Sprint_10/` for full detail. Redefined from the original slot-10 scope per the Sprint 10 Redefinition note above.

### Sprint 10b — Career Roadmap & Learning Engine (displaced)
See "Next Sprint" above. Still fully in the roadmap; displaced from slot 10, not cancelled.

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
