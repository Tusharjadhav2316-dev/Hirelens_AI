# HireLens 2.0 — Master Roadmap

> **Authoritative 14-Sprint Roadmap.** Sprint names and sequence below are locked. Do not add, remove, or reorder sprints. Update **Status** and **Actual Outcome** as sprints complete. Daily implementation detail lives in `Sprint_NN/Day_NN.md` — not in this file.

## Sprint Overview

| # | Title | Est. Days | Difficulty | Status |
|---|---|---|---|---|
| 1 | Repository Discovery & Engineering Audit | 5 | Easy | ✅ Complete |
| 2 | Production Stabilization | 5 | Medium | ✅ Complete |
| 3 | AI Resume Intelligence | 5 | Medium | ✅ Complete |
| 4 | Advanced ATS Intelligence & Resume Quality Refinement | 5 | Medium | ✅ Complete |
| 5 | AI Resume Optimizer & Rewrite Engine | 5 | Medium | ⬜ Not Started |
| 6 | AI Career Coach | 8 | Hard | ⬜ Not Started |
| 7 | Job Search & Application Tracker | 7 | Medium-Hard | ⬜ Not Started |
| 8 | CrewAI Multi-Agent System | 10 | Hard | ⬜ Not Started |
| 9 | AI Interview Coach | 7 | Medium-Hard | ⬜ Not Started |
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

---

## Active Sprint

### Sprint 6 — AI Career Coach ⬜ 0% Progress
**Goal:** Build an AI conversational assistant as a secondary interface within HireLens.

---

## Planned Sprints (High-Level)

An AI conversational assistant as a secondary interface within HireLens. The Career Coach can answer career questions, help interpret ATS scores, suggest resume improvements, and guide the user through job application strategy. Grounded in the existing resume data and ATS results. Architecture decision (language/framework/streaming mechanism) must be made in Sprint 6 Day 1 based on the confirmed Next.js stack — not assumed from the original CrewAI-first design. CrewAI is **not** in this sprint (see Sprint 8).

### Sprint 7 — Job Search & Application Tracker
Job search integration and an application pipeline tracker. The tracker lets users log applications, track status (Wishlist → Applied → Interviewing → Offered/Rejected), and add notes. Integration with external job search APIs (e.g., JSearch, Adzuna, or similar) to be decided based on available free-tier options at implementation time. Architecture: Firestore collections for application data; client-side kanban or list UI.

### Sprint 8 — CrewAI Multi-Agent System
Introduce multi-agent orchestration using CrewAI (Python framework). **Note:** The confirmed backend is Next.js/TypeScript. Sprint 8 must address this architectural mismatch before day 1 of implementation — options include: a Python sidecar service alongside Next.js, a migration to a Python-capable deployment target, or substituting a TypeScript-native agent framework. This decision must be logged in `20_Decision_Log.md` before any implementation begins. CrewAI agents from the original design: ATS Review, Company Research, Cover Letter, Interview Coach, Skill Gap, Study Roadmap, Application Tracker, Planner.

### Sprint 9 — AI Interview Coach
Simulated interview mode with tailored question generation, candidate response recording (or text input), and structured feedback. Question sets generated from the candidate's resume + target job description. Feedback on clarity, structure, and specificity. Architecture: session-based (not persisted by default); powered by the existing OpenRouter integration.

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
