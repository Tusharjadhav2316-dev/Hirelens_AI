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
**Confirmed for Sprint 8 (planned).** Per Project Rule 7, CrewAI is confirmed as still appropriate now that a dedicated sprint has been reached — see `20_Decision_Log.md`, ADR "CrewAI Deployment Boundary."

| Layer | Technology | Confirmed Via |
|---|---|---|
| Agent framework | CrewAI (Python) | `Sprint_08/Day_01.md` |
| Hosting boundary | Standalone FastAPI microservice (`agent-service/`), deployed separately from the Vercel-hosted Next.js app (Railway/Render/Fly — final host chosen at implementation time based on cost; not a code-level dependency) | `Sprint_08/Day_01.md` Decision Log entry |
| Inter-service auth | Next.js verifies the Firebase ID token, mints a short-lived internal JWT (`INTERNAL_AGENT_JWT_SECRET`, HS256, 60s expiry) carrying only `uid` + `iat`/`exp`; Python verifies that JWT on every request | `Sprint_08/Day_01.md` |
| LLM provider (agents) | OpenRouter, same `google/gemini-2.5-flash` model as existing routes, called directly from Python via `httpx` (not proxied back through Node) | `Sprint_08/Day_02.md` |
| Deterministic tool calls | Python tools call back into existing Next.js internal endpoints (`/api/internal/ats-score`, `/api/internal/jd-match`, `/api/ai-improve`, `/api/cover-letter`) — no scoring or optimization logic is reimplemented in Python | `Sprint_08/Day_03.md` |
| Streaming transport | FastAPI `StreamingResponse` emitting newline-delimited JSON (NDJSON) agent events; Next.js proxy re-streams the same bytes via native `ReadableStream` (no new frontend dependency, consistent with the Sprint 6 streaming pattern) | `Sprint_08/Day_06.md` |
| Cost/loop control | CrewAI `max_iter` per task, per-request wall-clock timeout enforced by the Next.js proxy's `AbortController`, and a Firestore-backed daily request counter per user (`users/{uid}/agentUsage/{date}`) | `Sprint_08/Day_09.md` |

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

## Sprint 8 Additions (Planned)

### New Backend Service
| Layer | Technology | Confirmed Via |
|---|---|---|
| Framework | FastAPI (Python 3.11+) | `Sprint_08/Day_01.md` — first Python component in the repository |
| Agent framework | CrewAI | `Sprint_08/Day_02.md` |
| HTTP client (tool → Next.js) | `httpx` (async) | `Sprint_08/Day_03.md` |
| Validation | Pydantic v2 models for every tool input/output and the structured `AgentResponse` envelope | `Sprint_08/Day_03.md` |
| Package/dependency management | `pip` + `requirements.txt` (or `uv`, confirmed at implementation time — no code-level impact either way) | `Sprint_08/Day_01.md` |
| Testing | Pytest + `httpx.AsyncClient`, matching the convention already reserved in `08_Testing_Guide.md` | `Sprint_08/Day_10.md` |

### New Frontend Surfaces
| Layer | Technology | Confirmed Via |
|---|---|---|
| Agent Workspace route | `app/dashboard/agent/page.tsx`, new default post-login redirect target | `Sprint_08/Day_07.md` |
| Generative UI components | React components under `components/agent/` rendering a closed set of known artifact types only — the model never generates arbitrary executable UI | `Sprint_08/Day_08.md` |
| New Firestore collection | `users/{uid}/agentUsage/{date}` — daily request-count document for cost control only; **no** persistent agent conversation memory is introduced | `Sprint_08/Day_09.md` Decision Log entry |
