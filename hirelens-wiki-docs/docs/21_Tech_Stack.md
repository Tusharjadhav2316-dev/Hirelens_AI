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
| OpenRouter (`google/gemini-2.0-flash-lite-001`) | All AI completions: resume improvement, insights, JD refinement, cover letters | `BACKEND_AUDIT.md` §1–2 |
| Env variable | `OPENROUTER_API_KEY` (server-side only) | `ENVIRONMENT_VERIFICATION.md` §3 |

## Agent Orchestration
**Not present. Not in scope for Sprint 2 or the near-term roadmap** — per `04_Project_Rules.md`, this section stays empty until a sprint dedicated to it is actually reached; the earlier CrewAI proposal from the original redesign report remains unconfirmed and unscheduled.

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
