# HireLens 2.0 — Tech Stack

> Finalized on Sprint 1, Day 5. Every entry traces to `PROJECT_DISCOVERY.md`, `ENVIRONMENT_VERIFICATION.md`, `BACKEND_AUDIT.md`, or `FRONTEND_AUDIT.md`.

## Frontend
| Layer | Technology | Confirmed Via |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19 | `PROJECT_DISCOVERY.md` §1, §11 |
| Language | TypeScript | `PROJECT_DISCOVERY.md`, `tsconfig.json` present |
| Styling | Tailwind CSS v4 (CSS variables, `globals.css`) | `PROJECT_DISCOVERY.md` §18 |
| State management | React Context (`AuthContext.tsx`, `ResumeContext.tsx`) — unmemoized | `FRONTEND_AUDIT.md` §2 |
| Client-side validation | Zod (auth pages) | `PROJECT_DISCOVERY.md` §18 |
| Package manager | npm (`package-lock.json` present) | `ENVIRONMENT_VERIFICATION.md` §1 |
| Client-side PDF parsing | `pdfjs-dist` (web worker) | `FRONTEND_AUDIT.md` §3 |

## Backend
| Layer | Technology | Confirmed Via |
|---|---|---|
| Architecture | Next.js serverless API routes (`frontend/app/api/*`) — stateless AI proxy only, no DB access | `BACKEND_AUDIT.md` §1, §3 |
| Server-side PDF parsing | `pdf-parse` (npm) | `BACKEND_AUDIT.md` §1 |
| Auth on API routes | Firebase Admin SDK token verification (`firebase-admin`) | Sprint 2, Day 3 implementation |
| Request middleware | **None — `middleware.ts` does not exist** | `BACKEND_AUDIT.md` §4 |

## Database
| Layer | Technology | Confirmed Via |
|---|---|---|
| Engine | Google Cloud Firestore (NoSQL) | `ENVIRONMENT_VERIFICATION.md` §2 |
| Access pattern | Direct client-side access via Firebase Web SDK — no server-side DB client exists | `BACKEND_AUDIT.md` §3 |
| Config Sourcing | Environment-variable-driven (`NEXT_PUBLIC_FIREBASE_*`) | Sprint 2, Day 5 |
| Local dev setup | None (no Docker/local emulator found) — points directly at Firebase Cloud | `ENVIRONMENT_VERIFICATION.md` §2 |
| Known defect | Collection name casing mismatch: writes to `"Users"`, reads from `"users"` | `PROJECT_DISCOVERY.md` §19, §21 |

## Authentication
| Layer | Technology | Confirmed Via |
|---|---|---|
| Mechanism | Firebase Authentication, client-side session listener (`AuthContext.tsx`) | `FRONTEND_AUDIT.md` §2 |
| API route protection | Bearer token Authorization headers verified server-side | Sprint 2, Day 3 implementation |

## AI / External APIs
| Service | Purpose | Confirmed Via |
|---|---|---|
| OpenRouter (`google/gemini-2.5-flash`) | All AI completions: resume improvement, insights, JD refinement, cover letters, career coaching | `BACKEND_AUDIT.md` §1–2, Sprint 5 & 6 |
| Streaming Pattern | Native Serverless `ReadableStream` + client `TextDecoder` SSE token parsing (`/api/career-coach`) | Sprint 6 Day 2 & 4 implementation |
| Env variable | `OPENROUTER_API_KEY` (server-side only) | `ENVIRONMENT_VERIFICATION.md` §3 |

## Agent Orchestration
**Delivered in Sprint 8, confirmed via Sprint 9 Day 1 audit.** Per Project Rule 7, CrewAI is confirmed live in production. One important correction versus the original Sprint 8 planning documentation: production request routing is a **deterministic keyword router**, not LLM-driven CrewAI hierarchical delegation — see the row below and `20_Decision_Log.md`'s Sprint 9 ADR "Ground Sprint 9 in the actual Manager routing mechanism."

| Layer | Technology | Confirmed Via |
|---|---|---|
| Agent framework | CrewAI (Python) — `Agent`/`Crew`/`Task` objects are defined for all 7 roles (structural/tool-authorization purposes) | `agent-service/crew/agents/`, `agent-service/crew/manager.py` |
| **Actual request routing (corrected)** | `agent-service/crew/manager.py`'s `process_manager_request_async` — a deterministic keyword-matched `if`/`elif` chain calling tool functions directly via `._run()`. `Crew.kickoff()` is defined (`get_career_crew()`) but has zero call sites anywhere in the codebase. | Sprint 9 Day 1 audit — confirmed via repository-wide search |
| Hosting boundary | Standalone FastAPI microservice (`agent-service/`), deployed separately from the Vercel-hosted Next.js app | `Sprint_08/Day_01.md` |
| Inter-service auth | Next.js verifies the Firebase ID token, mints a short-lived internal JWT (`INTERNAL_AGENT_JWT_SECRET`, HS256, 60s expiry) carrying only `uid`; Python verifies that JWT on every request | `Sprint_08/Day_01.md` |
| LLM provider (agents) | OpenRouter, called directly from Python (`tools/openrouter_client.py`) with a structured-fallback path when no API key is configured | `Sprint_08/Day_02.md` |
| Deterministic tool calls | Python tools call back into existing Next.js internal endpoints (`/api/internal/ats-score`, `/api/internal/jd-match`, `/api/ai-improve`, `/api/cover-letter`) — no scoring or optimization logic is reimplemented in Python | `Sprint_08/Day_03.md` |
| Streaming transport | FastAPI `StreamingResponse` emitting NDJSON agent events via a per-request `EventBus`; Next.js proxy re-streams the same bytes via native `ReadableStream` | `Sprint_08/Day_06.md` |
| Cost/loop control | Per-tool input clamps (e.g. question count `max(1, min(10, count))`), and a Firestore-transaction-backed daily request counter per user (`users/{uid}/agentUsage/{date}`, 50/day) | `Sprint_08/Day_09.md` |


## Deployment
| Layer | Technology | Confirmed Via |
|---|---|---|
| Target | Implied: Vercel (Next.js production build target referenced in `ENVIRONMENT_VERIFICATION.md` §1) — not explicitly confirmed via a deployment config file; treat as "likely, not certain" until a `vercel.json` or deployment pipeline file is found |
| Containerization | None found | `ENVIRONMENT_VERIFICATION.md` §2 |

## Testing
| Layer | Technology | Confirmed Via |
|---|---|---|
| Configured frameworks | None (Jest/Vitest not configured) | `PROJECT_DISCOVERY.md` §20 |
| Existing scripts | A Playwright script reference exists but is not a configured test suite | `PROJECT_DISCOVERY.md` §17 (Testing: 4/10) |

## DevOps
| Layer | Technology | Confirmed Via |
|---|---|---|
| CI/CD | None found | `PROJECT_DISCOVERY.md` |
| Build command | `npm run build` — currently **failing** | `ENVIRONMENT_VERIFICATION.md` §4 |

---

## Sprint 6 Additions

### New Streaming Pattern
| Layer | Technology | Confirmed Via |
|---|---|---|
| Server streaming | Native `ReadableStream` (Node 18+, no new package) | Sprint 6, Day 2 — `app/api/career-coach/route.ts` |
| Client stream reading | Native `fetch` + `response.body.getReader()` + `TextDecoder` | Sprint 6, Day 4 — `app/dashboard/career-coach/page.tsx` |
| Request cancellation | Native `AbortController` | Sprint 6, Day 4 |

### Career Coach Module
| Layer | Technology | Confirmed Via |
|---|---|---|
| Coach API route | Next.js App Router POST handler | Sprint 6, Day 2 |
| Auth on Coach route | Firebase Admin SDK (existing `verifyAuth.ts`) | Sprint 6, Day 2 |
| Coach model | `google/gemini-2.5-flash` (same as `ai-improve`) | Sprint 6, Day 2 |
| Resume context | `useResume()` + `buildResumeContextBlock()` — client-side pure function | Sprint 6, Day 5 |
| ATS context | `analyzeResume()` (deterministic, client-side) + `buildATSContextBlock()` | Sprint 6, Day 6 |
| Conversation state | React `useState` — session-only, not persisted | Sprint 6 Decision Log |

## Sprint 8 Additions (Delivered)

### New Backend Service
| Layer | Technology | Confirmed Via |
|---|---|---|
| Framework | FastAPI (Python 3.11+) | `Sprint_08/Day_01.md` — first Python component in the repository |
| Agent framework | CrewAI (structural only — see Agent Orchestration section's routing correction above) | `Sprint_08/Day_02.md` |
| HTTP client (tool → Next.js) | `httpx` (async) | `Sprint_08/Day_03.md` |
| Validation | Pydantic v2 models for tool inputs/outputs; `AgentResponse`/`Artifact` envelope is a looser `{id, type, title, data}` shape (closed-set enforcement happens on the frontend TypeScript switch, not a Python discriminated union) | `Sprint_08/Day_03.md`; confirmed via Sprint 9 Day 1 audit of `schemas/agent_response.py` |
| Package/dependency management | `pip` + `requirements.txt` | `Sprint_08/Day_01.md` |
| Testing | Pytest + `httpx.AsyncClient` | `Sprint_08/Day_10.md` |

### New Frontend Surfaces
| Layer | Technology | Confirmed Via |
|---|---|---|
| Agent Workspace route | `app/dashboard/agent/page.tsx`, default post-login redirect target | `Sprint_08/Day_07.md` |
| Generative UI components | 8 typed renderers under `components/agent/artifacts/` (`ATSScoreCard`, `ResumeDiffCard`, `JobResultCard`, `SkillGapCard`, `CoverLetterPreview`, `InterviewQuestionCard`, `TaskProgress`, `ResumePreviewCard`), dispatched via `ArtifactRenderer.tsx`'s runtime-validated switch | `Sprint_08/Day_08.md` |
| Firestore collection | `users/{uid}/agentUsage/{date}` — daily request-count document for cost control only (transaction-based, 50/day), the only new collection Sprint 8 introduced | `Sprint_08/Day_09.md` |

## Sprint 9 Additions (Planned)

| Layer | Technology | Confirmed Via |
|---|---|---|
| Interview session lifecycle | New plain Python module `agent-service/crew/interview_manager.py` (not a CrewAI `Agent` — follows the `crew/workflows.py` precedent) | `Sprint_09/Day_02.md` |
| Interview session state | Client-held, request-scoped JSON on a new `interview_session` field of the existing `ChatRequest` schema — no new Firestore collection | `Sprint_09/Day_02.md` Decision Log entry |
| New tools | `generate_follow_up_question`, `generate_interview_report` (added to `interview_tools.py`, sharing the existing `INTERVIEW_GUARDRAIL` constant); `prepare_interview_questions` extended with `interview_type`/`difficulty` params | `Sprint_09/Day_03.md`–`Day_04.md` |
| New artifact types | `interview_feedback_card`, `interview_report_card` (10 total artifact types after Sprint 9); `interview_question_card` extended with optional session/active-question fields | `Sprint_09/Day_07.md` |
| Streaming events | Zero new event types — interview moments reuse the existing 9 `AgentEvent` types | `Sprint_09/Day_02.md` Decision Log entry |
| New UI | Answer input + Submit wired into `InterviewQuestionCard.tsx`; new `InterviewFeedbackCard.tsx`, `InterviewReportCard.tsx` | `Sprint_09/Day_07.md` |

## Sprint 10 Additions (Planned)

> Voice/camera technology patterns derived from the JARVIS reference repository — see `16_JARVIS_Reuse_Analysis.md` for the full audit and reuse matrix. **Pre-Sprint-10 HireLens has zero audio/video capability** (verified: no `getUserMedia`, no `MediaRecorder`, no STT/TTS provider, no media dependency in `package.json`).

### New Frontend Capability
| Layer | Technology | Confirmed Via |
|---|---|---|
| Dedicated Trainer route | `frontend/app/dashboard/interview-trainer/` (landing / setup / room) + new `Sidebar.tsx` entry | `Sprint_10/Day_02.md` |
| Microphone capture | Browser `navigator.mediaDevices.getUserMedia({audio:true})` + `MediaRecorder` in a `useInterviewMicrophone` hook (JARVIS pattern, module globals removed) | `Sprint_10/Day_05.md` |
| Voice Activity Detection (assist only) | `AudioContext` + `AnalyserNode` RMS energy + silence threshold — **built from scratch; no VAD exists in JARVIS** | `Sprint_10/Day_05.md` |
| Interviewer audio playback | `new Audio(data:audio/wav;base64,...)` with a sequential queue + cancellation in `useInterviewerVoice` (JARVIS pattern, adapted) | `Sprint_10/Day_06.md` |
| Optional camera | `getUserMedia({video:true})` in `useInterviewCamera` (JARVIS `FaceScanner.tsx` capture pattern) | `Sprint_10/Day_08.md` |
| Client-side face detection | `face-api.js` — **detection/bounding-box only**; models served from `/public/models`; inference entirely in-browser, frames never transmitted. Expression, age, gender, and descriptor/recognition features deliberately unused | `Sprint_10/Day_08.md`, `16_JARVIS_Reuse_Analysis.md` §4 |
| New dependency | `face-api.js` (first vision dependency in HireLens; bundle-size impact assessed Day 8) | `Sprint_10/Day_08.md` |

### New Backend Capability
| Layer | Technology | Confirmed Via |
|---|---|---|
| STT | `frontend/app/api/interview/stt/route.ts` — authenticated Next.js route behind `SpeechProviderAdapter`; ships `SarvamSpeechProvider` (`api.sarvam.ai/speech-to-text`, `saaras:v3`) + `NullSpeechProvider`. **Batch, not streaming.** | `Sprint_10/Day_05.md` |
| TTS | `frontend/app/api/interview/tts/route.ts` — same pattern; Sarvam `bulbul:v3`, configurable speaker | `Sprint_10/Day_06.md` |
| Provider abstraction | `SpeechProviderAdapter` interface, mirroring Sprint 8's proven `JobProviderAdapter` pattern | `Sprint_10/Day_01.md` |
| Auth on voice routes | Existing `verifyAuth(req)` — a mandatory correction, since JARVIS's equivalent routes have **no auth at all** | `16_JARVIS_Reuse_Analysis.md` §5 |
| Role intelligence | New `analyze_role` tool in `agent-service/tools/interview_tools.py`; prompt-driven, no role taxonomy | `Sprint_10/Day_02.md` |
| Session engine | **Reuses** Sprint 9's `agent-service/crew/interview_manager.py`, extended — not rebuilt | `Sprint_10/Day_04.md` |
| New Firestore collection | `users/{uid}/interviewTrainerSessions/{sessionId}` — text + derived signals only, never audio/video | `Sprint_10/Day_03.md` Decision Log entry |
| Agents | **Unchanged at 7** (1 Manager + 6 specialized). No new CrewAI agents. | `Sprint_10/Day_04.md` Decision Log entry |
| Streaming events | **Unchanged at 9 types.** Voice/media state is client-local React state, not server events. | `Sprint_10/Day_09.md` Decision Log entry |
| New env variables | `SPEECH_PROVIDER_API_KEY`, `SPEECH_PROVIDER` (server-side only; never exposed to the browser) | `Sprint_10/Day_05.md` |
