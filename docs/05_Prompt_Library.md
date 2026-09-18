# HireLens 2.0 — Antigravity Prompt Library

Index of every Antigravity prompt generated for this project. Each prompt lives in full inside its `Sprint_NN/Day_NN.md` file under the **"Ready-to-Paste Antigravity Prompt"** heading — this file is a lookup table so a past prompt can be found without searching every day file.

| Sprint | Day | Prompt Topic | File |
|---|---|---|---|
| 1 | 1 | Read-only project discovery — zero assumptions, citation-backed inventory | `Sprint_01/Day_01.md` |
| 1 | 2 | Environment verification using confirmed (not assumed) stack | `Sprint_01/Day_02.md` |
| 1 | 3 | Verified backend audit — route/service/data-access tracing | `Sprint_01/Day_03.md` |
| 1 | 4 | Verified frontend audit — data flow, state, coupling | `Sprint_01/Day_04.md` |
| 1 | 5 | Architecture consolidation, real diagrams, Sprint 2 planning | `Sprint_01/Day_05.md` |
| 2 | 1 | Fix production build failure — Uint8Array/BlobPart type error | `Sprint_02/Day_01.md` |
| 2 | 2 | Fix Firestore collection casing mismatch ("Users" vs. "users") | `Sprint_02/Day_02.md` |
| 2 | 3 | Add Firebase Admin SDK token verification to all `/api/*` routes | `Sprint_02/Day_03.md` |
| 2 | 4 | Render Job Matcher AI insights; fix settings navbar link | `Sprint_02/Day_04.md` |
| 2 | 5 | Move Firebase config to env vars; full Sprint 2 regression pass | `Sprint_02/Day_05.md` |

> Update this table every time a new `Day_NN.md` is created. Keep "Prompt Topic" to one line — detail lives in the day file.
| 3 | 1 | Enhance `lib/atsAnalyzer.ts` — certifications/achievements scoring, keyword density, skill levels | `Sprint_03/Day_01.md` |
| 3 | 2 | Enhance `lib/atsEngine.ts` — remove floor, bigram extraction, quantification, date ranges | `Sprint_03/Day_02.md` |
| 3 | 3 | Enhance `lib/jdMatcher.ts` — frequency-weighted keywords, required vs preferred, section scoring | `Sprint_03/Day_03.md` |
| 3 | 4 | Enhance `api/ai-improve/route.ts` — achievements/certifications support, JD context | `Sprint_03/Day_04.md` |
| 3 | 5 | Create `lib/promptTemplates.ts`, add ai-insights system prompt, centralize shared prompts | `Sprint_03/Day_05.md` |
| 4 | 1 | Wire `resume` param in `JDMatcherPanel.tsx`; unify stop words with `MASTER_STOP_WORDS` | `Sprint_04/Day_01.md` |
| 4 | 2 | Display `keywordDensityScore`, `impactScore`, `completenessScore` in `ATSScorePanel.tsx` | `Sprint_04/Day_02.md` |
| 4 | 3 | Graduate binary impact/skills scores; extract `calculateFormattingScore()` from `atsEngine.ts` | `Sprint_04/Day_03.md` |
| 4 | 4 | Fix keyword density false positives (word-boundary); expand Java Full Stack benchmark | `Sprint_04/Day_04.md` |
| 4 | 5 | Add `max_tokens`/`temperature` to all AI routes; clean `ai-insights` user prompt | `Sprint_04/Day_05.md` |
| 5 | 1 | Introduce optimization modes + centralize section prompts in `promptTemplates.ts` | `Sprint_05/Day_01.md` |
| 5 | 2 | Wire AI optimize buttons to `AchievementsForm` and `CertificationsForm` | `Sprint_05/Day_02.md` |
| 5 | 3 | Add JD context panel to `ResumeEditor`; wire `jobDescription` to all 5 forms | `Sprint_05/Day_03.md` |
| 5 | 4 | Upgrade `AIImprovementModal` with Regenerate, editable output, mode + JD badges | `Sprint_05/Day_04.md` |
| 5 | 5 | Create `tests/optimizerSafety.test.ts`; full Sprint 5 regression | `Sprint_05/Day_05.md` |
| 6 | 1 | Add `CAREER_COACH_SYSTEM_PROMPT`, `CAREER_COACH_MODEL_PARAMS`; create `careerCoachService.ts` | `Sprint_06/Day_01.md` |
| 6 | 2 | Authenticated streaming Career Coach API route | `Sprint_06/Day_02.md` |
| 6 | 3 | Career Coach page shell + Sidebar navigation entry | `Sprint_06/Day_03.md` |
| 6 | 4 | Real streaming fetch + multi-turn conversation state | `Sprint_06/Day_04.md` |
| 6 | 5 | Resume context grounding via `buildResumeContextBlock` | `Sprint_06/Day_05.md` |
| 6 | 6 | ATS intelligence grounding + JD context panel | `Sprint_06/Day_06.md` |
| 6 | 7 | UX hardening — errors, input limits, context inspector, responsive | `Sprint_06/Day_07.md` |
| 6 | 8 | `tests/careerCoachSafety.test.ts` — 37 assertions + 5 manual QA | `Sprint_06/Day_08.md` |
| 8 | 1 | Scaffold `agent-service/` (FastAPI), internal JWT auth, `/api/agent/chat` proxy route | `Sprint_08/Day_01.md` |
| 8 | 2 | Manager Agent + 6 specialized agent role/goal/backstory definitions, hierarchical Crew | `Sprint_08/Day_02.md` |
| 8 | 3 | `/api/internal/ats-score`, `/api/internal/jd-match`, resume/ATS/optimizer/cover-letter tools | `Sprint_08/Day_03.md` |
| 8 | 4 | `JobSearchTool` + `JobProviderAdapter`, interview prep tools, existing-feature wiring | `Sprint_08/Day_04.md` |
| 8 | 5 | Application workflow sequencing, Manager delegation logic, task planning | `Sprint_08/Day_05.md` |
| 8 | 6 | NDJSON streaming event protocol, Next.js proxy passthrough | `Sprint_08/Day_06.md` |
| 8 | 7 | Agent Workspace shell (`/dashboard/agent`), Sidebar entry, default post-login route | `Sprint_08/Day_07.md` |
| 8 | 8 | Generative UI artifact renderers, closed artifact-type union | `Sprint_08/Day_08.md` |
| 8 | 9 | Apply/Reject resume-diff flow, `agentUsage` rate-limit counter, cost/security hardening | `Sprint_08/Day_09.md` |
| 8 | 10 | Safety/authorization/schema test suites, full regression pass, Sprint 8 close-out | `Sprint_08/Day_10.md` |
| 9 | 1 | Repository/Sprint 8 audit, routing-mechanism correction, Sprint 9 architecture | `Sprint_09/Day_01.md` |
| 9 | 2 | `interview_manager.py` module, session state schema, streaming-reuse decision | `Sprint_09/Day_02.md` |
| 9 | 3 | Interview context wiring (resume/JD/attachments into session start) | `Sprint_09/Day_03.md` |
| 9 | 4 | `interview_type`/`difficulty` params, question personalization, difficulty progression rule | `Sprint_09/Day_04.md` |
| 9 | 5 | Mock interview session flow, adaptive follow-up decision logic | `Sprint_09/Day_05.md` |
| 9 | 6 | `evaluate_interview_answer` wired live, `generate_interview_report`, feedback structuring | `Sprint_09/Day_06.md` |
| 9 | 7 | Interview Coach UI — answer input, feedback display, progress, setup | `Sprint_09/Day_07.md` |
| 9 | 8 | `interview_feedback_card`/`interview_report_card` artifacts, streaming wiring | `Sprint_09/Day_08.md` |
| 9 | 9 | Session-tampering/anti-fabrication hardening, cost/loop ceilings | `Sprint_09/Day_09.md` |
| 9 | 10 | Full interview test matrix (TEST A–O), regression, Sprint 9 close-out | `Sprint_09/Day_10.md` |
| 10 | 1 | Architecture Gate — HireLens + JARVIS audit, reuse matrix, voice/camera/session proposals | `Sprint_10/Day_01.md` |
| 10 | 2 | Dedicated Trainer feature + navigation + universal role intelligence + setup | `Sprint_10/Day_02.md` |
| 10 | 3 | Trainer session persistence + candidate/role/JD context assembly | `Sprint_10/Day_03.md` |
| 10 | 4 | Adaptive trainer engine, training modes, retry loop, session memory | `Sprint_10/Day_04.md` |
| 10 | 5 | Microphone capture, STT route + provider adapter, VAD assist | `Sprint_10/Day_05.md` |
| 10 | 6 | AI interviewer TTS, playback queue, turn-taking, interruption | `Sprint_10/Day_06.md` |
| 10 | 7 | Speech/delivery intelligence, grounded confidence coaching | `Sprint_10/Day_07.md` |
| 10 | 8 | Optional camera, client-side geometric visual signals | `Sprint_10/Day_08.md` |
| 10 | 9 | Interview Room UI, trainer artifacts, final report, state ownership | `Sprint_10/Day_09.md` |
| 10 | 10 | Full test matrix (TEST A–AJ), security/privacy/perf, regression, close-out | `Sprint_10/Day_10.md` |
