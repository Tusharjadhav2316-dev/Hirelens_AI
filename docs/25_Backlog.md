# HireLens 2.0 — Feature Backlog

> Tracks every individual feature, with sprint/dependency detail. Features get added here once they're confirmed in `22_Product_Requirements.md` as Must/Should/Could Have — this file is the operational tracker, that one is the prioritization rationale.

| Feature | Priority | Status | Sprint | Dependencies | Notes |
|---|---|---|---|---|---|
| Fix production build failure | Critical | Done (Sprint 2, Day 1) | Sprint 2 | — | `cover-letter/page.tsx:171` |
| Fix Firestore casing bug | Critical | Done (Sprint 2, Day 2) | Sprint 2 | — | `signup/page.tsx#L54` |
| API route authentication | High | Done (Sprint 2, Day 3) | Sprint 2 | — | Firebase Admin SDK token verification |
| Job Matcher insights render fix | High | Done (Sprint 2, Day 4) | Sprint 2 | — | `JDMatcherPanel.tsx#L470` |
| Settings navbar link fix | Low | Done (Sprint 2, Day 4) | Sprint 2 | — | `Navbar.tsx#L120` |
| Firebase config to env vars | Medium | Done (Sprint 2, Day 5) | Sprint 2 | — | `lib/firebase.ts` |
| Prompt injection input sanitization | High | Not Started | Sprint 3 (proposed) | — | Deferred from Sprint 2; see `26_Risks.md` |
| Firestore security rules audit | High (speculative until audited) | Not Started | Sprint 3 (proposed) | — | Never directly audited; see `26_Risks.md` Speculative section |
| `ResumeContext` re-render performance fix | Medium | Not Started | Sprint 3 (proposed) | — | Deferred from Sprint 2; see `26_Risks.md` |
| Word (.docx) export implementation | Medium | Not Started | Future feature sprint | — | Explicitly out of Sprint 2 scope — new feature, not a stabilization fix |
| Duplicate PDF library cleanup (`pdf-parse` + `pdfjs-dist`) | Low | Not Started | Future cleanup sprint | — | Bundle size only, not user-facing |
| Re-scope Sprint 3–14 roadmap against confirmed real stack | High | Not Started | Before Sprint 3 planning | Sprint 2 | See `01_Master_Roadmap.md` "Roadmap Corrections Needed" |

## How to Use This Document
Update **Status** as work progresses (Not Started → In Progress → Done → Blocked). If a feature's sprint changes, update `01_Master_Roadmap.md` in the same commit so the two files never disagree.

## Sprint 3 Items
| Feature | Priority | Status | Sprint | Dependencies | Notes |
|---|---|---|---|---|---|
| Score certifications and achievements in atsAnalyzer.ts | High | Done (Sprint 3, Day 1) | Sprint 3, Day 1 | Sprint 2 | `keywordDensityScore` also computed |
| Remove artificial 35-floor, add bigrams/better quantification in atsEngine.ts | High | Done (Sprint 3, Day 2) | Sprint 3, Day 2 | Sprint 3 Day 1 | |
| Frequency-weighted JD keywords + required/preferred scoring in jdMatcher.ts | High | Done (Sprint 3, Day 3) | Sprint 3, Day 3 | Sprint 3 Day 2 | |
| AI Improve: add achievements/certifications + optional JD context | High | Done (Sprint 3, Day 4) | Sprint 3, Day 4 | Sprint 3 Day 1 | Also updates `lib/aiService.ts` |
| Centralize prompts in lib/promptTemplates.ts; fix ai-insights system prompt | Medium | Done (Sprint 3, Day 5) | Sprint 3, Day 5 | Sprint 3 Day 4 | New file: `lib/promptTemplates.ts` |

## Deferred from Sprint 3 (candidates for Sprint 4)
| Feature | Reason Deferred |
|---|---|
| Semantic embedding-based ATS matching | Requires new API call or library; significant scope beyond Sprint 3 |
| Full cover-letter prompt centralization | 5 distinct prompt variants; deserves a dedicated day |
| Word (.docx) export implementation | Feature work, already in backlog from Sprint 2 |
| Firestore security rules audit | Security concern, not intelligence feature |
| `ResumeContext` re-render performance | Performance concern, not intelligence feature |

## Sprint 4 Items
| Feature | Priority | Status | Sprint | Dependencies | Notes |
|---|---|---|---|---|---|
| Wire `resume` param to `analyzeJobMatch()` in JDMatcherPanel | Critical (bug) | Not Started | Sprint 4, Day 1 | Sprint 3 | Sprint 3's structured section scoring was never activated |
| Unify stop word sets (jdMatcher → MASTER_STOP_WORDS) | High | Not Started | Sprint 4, Day 1 | Sprint 3 | Inconsistency between engines |
| Display Resume Intelligence signals in ATSScorePanel | High | Not Started | Sprint 4, Day 2 | Sprint 3 | keywordDensityScore/impactScore/completenessScore computed but invisible |
| Graduate impact score in Quality mode (4 tiers) | High | Not Started | Sprint 4, Day 3 | Sprint 3 | Binary 100/20 → 20/55/80/100 |
| Graduate skills score in Quality mode (4 tiers) | High | Not Started | Sprint 4, Day 3 | Sprint 3 | Binary 100/20 → 20/60/80/100 |
| Extract calculateFormattingScore() shared helper | Medium | Not Started | Sprint 4, Day 3 | Sprint 3 | Identical code duplicated in Quality + Match modes |
| Word-boundary matching for short skill names in atsAnalyzer | Medium | Not Started | Sprint 4, Day 4 | Sprint 3 | "Go" false-matching "going"/"good" |
| Java Full Stack JD benchmark expansion | Medium | Not Started | Sprint 4, Day 4 | Sprint 3 | Defined but never tested in runBenchmarkSuite() |
| max_tokens + temperature on all AI routes | Medium | Not Started | Sprint 4, Day 5 | Sprint 3 | No response length control; no temperature set |
| Clean duplicate persona from ai-insights user prompt | Low | Not Started | Sprint 4, Day 5 | Sprint 3 | "You are an expert..." duplicated in user message |

## Deferred from Sprint 4 (candidates for Sprint 5)
| Feature | Reason Deferred |
|---|---|
| Cover letter prompt full centralization | Complex (5 distinct prompt variants); deferred from Sprint 3, still deferred |
| Semantic/embedding-based ATS matching | Requires new API or library; not client-side computable without new infrastructure |
| Firestore security rules audit | Security concern not in ATS/intelligence scope |
| ResumeContext memoization | Performance concern, not ATS/intelligence concern |

---

## Sprint 5 Items — AI Resume Optimizer & Rewrite Engine

| Feature | Priority | Status | Sprint/Day | Notes |
|---|---|---|---|---|
| Optimization modes architecture (`buildOptimizerPrompt`, `SECTION_BASE_PROMPTS`, `OPTIMIZER_MODE_PROMPTS`) | High | Done (Sprint 5, Day 1) | Sprint 5, Day 1 | `promptTemplates.ts`, `api/ai-improve`, `aiService.ts` |
| AI optimize button on `AchievementsForm` (Impact mode) | High | Done (Sprint 5, Day 2) | Sprint 5, Day 2 | API supported since Sprint 3; UI was missing |
| AI optimize button on `CertificationsForm` (no mode, context sentence) | High | Done (Sprint 5, Day 2) | Sprint 5, Day 2 | Same — API existed, UI missing |
| JD context panel in Resume Builder | High | Done (Sprint 5, Day 3) | Sprint 5, Day 3 | `ResumeEditor.tsx` local state; wired to all 5 forms |
| Wire `jobDescription` to all 5 AI-enabled form `improveSection()` calls | High | Done (Sprint 5, Day 3) | Sprint 5, Day 3 | Was always accepted by API, never passed by any form |
| `AIImprovementModal` — Regenerate button | Medium | Done (Sprint 5, Day 4) | Sprint 5, Day 4 | Re-run without closing modal |
| `AIImprovementModal` — editable improved-text textarea | Medium | Done (Sprint 5, Day 4) | Sprint 5, Day 4 | User can refine AI output before accepting |
| `AIImprovementModal` — mode indicator badge | Medium | Done (Sprint 5, Day 4) | Sprint 5, Day 4 | Shows which optimization strategy was applied |
| `AIImprovementModal` — JD Context badge | Low | Done (Sprint 5, Day 4) | Sprint 5, Day 4 | Shows when `jobDescription` was active |
| `tests/optimizerSafety.test.ts` — 49 automated assertions | High | Done (Sprint 5, Day 5) | Sprint 5, Day 5 | Guardrail presence, mode validation, JD injection, content preservation |
| Manual truth-preservation cases T1–T4 | High | Done (Sprint 5, Day 5) | Sprint 5, Day 5 | In-browser QA; fabrication, quantification, JD missing skill |

## Deferred From Sprint 5 (Candidates for Future Sprints)

| Feature | Reason Deferred | Target Sprint |
|---|---|---|
| `Certification.description` / `notes` field in type | Cascades into scoring, export, Firestore — out of scope for optimizer sprint | Future type-extension sprint |
| Whole-resume optimization in a single API call | Token usage, hallucination risk, accept/reject granularity concerns | Sprint 6+ (after Career Coach architecture is decided) |
| Mode selector in modal UI (user picks mode before optimizing) | Day 4 modal shows which mode was used; Day 1 sets default modes per section; user-selectable mode is a UX enhancement | Sprint 11 (Premium UI/UX) |
| Persist JD target per resume in Firestore | Session-only JD is sufficient for Sprint 5; persisted "saved JD targets" is a Job Tracker feature | Sprint 7 (Job Search & Application Tracker) |
| Cover letter prompt full centralization (5 variants) | Deferred from Sprint 3 and Sprint 4 | Sprint 6 or dedicated cleanup sprint |
| Firestore security rules audit | Deferred since Sprint 2 | Sprint 13 (Testing, Performance, Security) |

---

## Sprint 6 Items — AI Career Coach

| Feature | Priority | Status | Sprint/Day | Notes |
|---|---|---|---|---|
| `lib/careerCoachService.ts` — type defs + pure context builders | High | Done (Sprint 6, Day 1) | Sprint 6, Day 1 | Pure functions; fully testable |
| `CAREER_COACH_SYSTEM_PROMPT` + `CAREER_COACH_MODEL_PARAMS` in `promptTemplates.ts` | High | Done (Sprint 6, Day 1) | Sprint 6, Day 1 | Truth-preservation rules in system prompt |
| `app/api/career-coach/route.ts` — authenticated streaming endpoint | High | Done (Sprint 6, Day 2) | Sprint 6, Day 2 | First streaming route in codebase |
| Career Coach page shell + Sidebar entry | High | Done (Sprint 6, Day 3) | Sprint 6, Day 3 | `/dashboard/career-coach`, second in Sidebar |
| Real streaming fetch + multi-turn conversation state | High | Done (Sprint 6, Day 4) | Sprint 6, Day 4 | AbortController; streaming token accumulation |
| Resume context grounding (`useResume` + `buildResumeContextBlock`) | High | Done (Sprint 6, Day 5) | Sprint 6, Day 5 | Resume-aware personalized coaching |
| ATS intelligence grounding + JD context panel | High | Done (Sprint 6, Day 6) | Sprint 6, Day 6 | Deterministic engine output explained by Coach |
| UX hardening (error messages, input limits, context inspector, responsive) | Medium | Done (Sprint 6, Day 7) | Sprint 6, Day 7 | |
| `tests/careerCoachSafety.test.ts` — 34 automated assertions + 5 manual cases | High | Done (Sprint 6, Day 8) | Sprint 6, Day 8 | |

## Deferred From Sprint 6 (Candidates for Future Sprints)

| Feature | Reason Deferred | Target Sprint |
|---|---|---|
| Cross-session Career Memory (persist conversations to Firestore) | Requires a dedicated memory/retrieval architecture; Sprint 6 scope is the conversational layer | Sprint 10 (Career Roadmap & Learning Engine) or dedicated memory sprint |
| Coach-triggered tool actions (e.g., "Optimize my summary" from chat) | This is agent orchestration — Sprint 8 (CrewAI) territory | Sprint 8 |
| Mode selector within the Coach ("Analyze my resume for ATS issues") | Blurs into CrewAI multi-agent territory; requires tool-calling infrastructure | Sprint 8 |
| Cover letter prompt full centralization | Deferred since Sprint 3 | Remains deferred — low priority vs. Sprint 7+ features |
| External job search integration | Sprint 7 | Sprint 7 (Job Search & Application Tracker) |
| Interview simulation | Sprint 9 | Sprint 9 (AI Interview Coach) |

## Sprint 8 Items — CrewAI Multi-Agent System & AI-First Agent Workspace

| Feature | Priority | Status | Sprint/Day | Notes |
|---|---|---|---|---|
| `agent-service/` — new FastAPI + CrewAI Python microservice scaffold | High | Not Started | Sprint 8, Day 1 | First Python component in the repository |
| Internal JWT minting/verification (`INTERNAL_AGENT_JWT_SECRET`) | High | Not Started | Sprint 8, Day 1 | Never trust a client-supplied `userId` |
| `app/api/agent/chat/route.ts` — authenticated streaming proxy | High | Not Started | Sprint 8, Day 1 | Verifies Firebase token, forwards internal JWT |
| `AgentResponse` / `AgentEvent` Pydantic + TypeScript schemas | High | Not Started | Sprint 8, Day 1 | Shared contract, kept in sync manually across languages |
| Manager Agent + hierarchical Crew definition | High | Not Started | Sprint 8, Day 2 | `Process.hierarchical`, `max_iter` bounded |
| Resume, ATS, Optimizer, Career, Job Search, Interview Coach agents | High | Not Started | Sprint 8, Day 2 | 7 core agents; see `02_Architecture.md` classification |
| `/api/internal/ats-score` — wraps `atsEngine.ts`/`atsAnalyzer.ts` | High | Not Started | Sprint 8, Day 3 | Single source of truth preserved |
| `/api/internal/jd-match` — wraps `jdMatcher.ts` | High | Not Started | Sprint 8, Day 3 | Powers `analyze_skill_gap` tool |
| `optimize_resume_section`, `generate_cover_letter` tools | High | Not Started | Sprint 8, Day 3/4 | Call existing `/api/ai-improve`, `/api/cover-letter` unchanged |
| `JobSearchTool` + `JobProviderAdapter` + `NullJobProvider` | High | Not Started | Sprint 8, Day 4 | No vendor committed yet — see `20_Decision_Log.md` |
| `prepare_interview_questions` / `evaluate_interview_answer` tools | Medium | Not Started | Sprint 8, Day 4 | Text-based only, session-scoped |
| Application workflow sequencing (Manager-orchestrated) | Medium | Not Started | Sprint 8, Day 5 | Not a dedicated agent — see Decision Log |
| NDJSON streaming event protocol + Next.js passthrough | High | Not Started | Sprint 8, Day 6 | No new frontend dependency |
| `app/dashboard/agent/page.tsx` — Agent Workspace shell | High | Not Started | Sprint 8, Day 7 | New default post-login route |
| `components/agent/*` — Generative UI artifact renderers | High | Not Started | Sprint 8, Day 8 | Closed artifact-type union only |
| Resume diff Apply/Reject flow wired to `ResumeContext` | High | Not Started | Sprint 8, Day 9 | Client-side mutation only, never server-driven |
| `users/{uid}/agentUsage/{date}` rate-limit counter | Medium | Not Started | Sprint 8, Day 9 | The one new Firestore collection |
| `agent-service/tests/` — tool authorization, schema, ATS-equality tests | High | Not Started | Sprint 8, Day 10 | Python side |
| `tests/agentSafety.test.ts` / `tests/agentToolContracts.test.ts` | High | Not Started | Sprint 8, Day 10 | TypeScript side; existing 3 suites must still pass |

## Deferred From Sprint 8 (Candidates for Future Sprints)

| Feature | Reason Deferred | Target Sprint |
|---|---|---|
| Application pipeline tracker (Firestore-persisted kanban) | Additive UI/data-model work, not agent orchestration — explicitly out of Sprint 8's boundaries | Unscheduled (remainder of original Sprint 7 scope) |
| Real `JobProviderAdapter` implementation (JSearch/Adzuna/etc.) | No API key provisioned; ships behind `NullJobProvider` until a vendor is selected | Follow-up Decision Log entry once provisioned |
| Full personalized study-roadmap / learning-path generator | Sprint 8 ships only `analyze_skill_gap` as a tool, not the full roadmap generator | Sprint 10 (Career Roadmap & Learning Engine) |
| Company Research Agent | No verified data source; requires a web-search/company-data tool not currently in scope | Unscheduled |
| Application Planning Agent (dedicated) | Manager-orchestrated sequencing is sufficient for Sprint 8's needs | Revisit only if sequencing complexity grows |
| Cross-service prompt centralization (shared config for TS + Python personas) | Tracked as accepted tech debt from the Career Agent persona port | Unscheduled — flagged in `20_Decision_Log.md` |
| Audio/video interview recording | Original Sprint 9 scope explicitly limited to text input; Sprint 8 keeps that limitation | Unscheduled |
| CrewAI Flows / multi-crew orchestration | Single hierarchical Crew is sufficient for one-turn-at-a-time orchestration | Revisit only if Application Workflow sequencing needs explicit control flow |

## Sprint 9 Items — AI Interview Coach: Mock Interview Sessions, Adaptive Follow-Up & Feedback

| Feature | Priority | Status | Sprint/Day | Notes |
|---|---|---|---|---|
| `interview_manager.py` — session lifecycle module | High | Not Started | Sprint 9, Day 2 | Plain Python module, not a CrewAI Agent |
| `InterviewSessionState` schema (Python + TS) | High | Not Started | Sprint 9, Day 2 | Client-held, request-scoped — no new Firestore collection |
| `prepare_interview_questions` extended (`interview_type`, `difficulty`) | High | Not Started | Sprint 9, Day 4 | Backward-compatible defaults preserve Sprint 8's Route 4 call site |
| `evaluate_interview_answer` wired into a real answer-submission route | Critical | Not Started | Sprint 9, Day 6 | Tool already exists and is tested — this closes the "never actually reachable" gap found in Day 1 audit |
| `generate_follow_up_question` tool | High | Not Started | Sprint 9, Day 5 | Adaptive follow-up, transparent decision rule (not hidden ML) |
| `generate_interview_report` tool | High | Not Started | Sprint 9, Day 6 | Qualitative labels only — no numeric interview score |
| `InterviewQuestionCard.tsx` extended (answer input + Submit for active question) | High | Not Started | Sprint 9, Day 7 | Read-only list view (Sprint 8 behavior) preserved when no active session |
| `InterviewFeedbackCard.tsx`, `InterviewReportCard.tsx` | High | Not Started | Sprint 9, Day 8 | 2 new artifact types (10 total after Sprint 9) |
| Interview setup UI (type/difficulty/question-count selection) | Medium | Not Started | Sprint 9, Day 7 | Feedback-timing mode NOT included — always after-each-answer for MVP |
| `MAX_QUESTIONS_PER_SESSION` / `MAX_FOLLOW_UPS_PER_QUESTION` ceilings | High | Not Started | Sprint 9, Day 9 | Cost/loop control, on top of existing `agentUsage` daily counter |
| `test_interview_session.py`, `test_interview_anti_fabrication.py`, `test_interview_report_no_score.py` | High | Not Started | Sprint 9, Day 10 | New; `test_interview_tools.py` extended, not replaced |
| Sprint 8 close-out audit correction (agent list, artifact count) | High | Done (this documentation pass) | Sprint 9, Day 1 | See `01_Master_Roadmap.md` and `20_Decision_Log.md` |

## Deferred From Sprint 9 (Candidates for Future Sprints)

| Feature | Reason Deferred | Target Sprint |
|---|---|---|
| Persistent, cross-device interview session storage (`interviewSessions` Firestore collection) | No stated requirement to resume a session across devices/reloads; would introduce new security-rule/retention design for sensitive candidate answer text | Unscheduled — revisit if explicitly requested |
| Numeric interview readiness score | Deliberately avoided — risk of confusion with the authoritative ATS score per the brief's explicit warning | Unscheduled — revisit only with an explicit disambiguation UX design |
| Coding / live problem-solving interview mode with code execution | No code-execution sandbox exists anywhere in the stack; a fake "coding mode" without real execution would be technical-question-in-disguise | Unscheduled |
| "End of interview only" feedback-timing mode | Sprint 9 MVP always shows feedback after each answer | Unscheduled — small addition if requested |
| Voice/video mock interview (speech-to-text, tone/facial analysis) | Explicitly out per the brief's Voice/Video Boundary — no microphone/video capability exists in the repository | Unscheduled — future multimodal sprint |
| Full personalized study-roadmap generation from interview weaknesses | Sprint 9 surfaces priority topics in the report only; the complete learning-path/resource-mapping engine belongs to Sprint 10 | Sprint 10 (Career Roadmap & Learning Engine) |
| Company-specific interview preparation (real company process/culture data) | No verified company-data source exists — same boundary already logged for the Company Research Agent in Sprint 8 | Unscheduled |
| Retrofitting real CrewAI `Crew.kickoff()` hierarchical delegation across all 7 agents | Out of Sprint 9's stated scope; the deterministic router is working in production | Unscheduled — would need its own dedicated sprint and justification |
