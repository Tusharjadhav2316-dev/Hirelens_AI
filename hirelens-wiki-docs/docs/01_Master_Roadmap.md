# HireLens 2.0 — Master Roadmap

> **Structure preserved from the original draft per design review.** The sprint sequence, dependency graph, and status tracking stay as-is. One correction: several sprint titles below name a specific technology (e.g., "Streaming Chat (SSE)," "Career Memory (Context + Vector Store)") that was assumed from the original redesign report, not yet confirmed against this repository. Sprint 1, Day 5 explicitly checks each of these and adds a "Roadmap Corrections Needed" note below if a title's premise turns out to be wrong — for example, if the actual backend doesn't support SSE the way assumed, or the database confirmed in Sprint 1 doesn't support vector search the way "pgvector" implies. Until Sprint 1, Day 5, treat every technology named in a sprint title as a **placeholder for the underlying goal**, not a locked-in implementation choice.

## Roadmap Corrections Needed

**Confirmed Sprint 1, Day 5:** The original 14-sprint plan (Sprints 3–14: backend/frontend refactor, AI Career Coach, streaming chat, CrewAI, etc.) was written against the redesign report's *assumed* target architecture (FastAPI + PostgreSQL + CrewAI), not the verified stack (Next.js/React/Firebase, no backend DB, no agent framework). **Sprints 3–14 as originally titled are not yet valid and will need re-scoping once Sprint 2 (stabilization) is complete** — e.g., "Backend Refactoring" needs to target Next.js API routes, not FastAPI services; "CrewAI Integration" needs a Decision Log entry confirming whether CrewAI (a Python framework) is even the right choice for a Next.js/TypeScript backend, or whether a TypeScript-native orchestration approach fits better. This wiki intentionally does not silently rewrite those later sprints now — they get re-scoped when the project actually reaches them, grounded in Sprint 2's outcome, not before.

> This file is the index. It never contains daily implementation detail — that lives in `Sprint_NN/Day_NN.md`. Update the **Status** column as sprints complete. This file should always reflect ground truth.

## Roadmap Overview

| Sprint | Title | Est. Days | Difficulty | Depends On | Status |
|---|---|---|---|---|---|
| 1 | Project Discovery | 5 | Easy | — | ✅ Complete |
| 2 | Production Stabilization | 5 | Medium | Sprint 1 | ⬜ Not Started |
| 3 | Backend Refactoring | 8 | Medium-Hard | Sprint 2 | ⬜ Not Started |
| 4 | Frontend Refactoring | 8 | Medium | Sprint 2 | ⬜ Not Started |
| 5 | AI Career Coach UI | 6 | Medium | Sprint 4 | ⬜ Not Started |
| 6 | Streaming Chat (SSE) | 6 | Medium-Hard | Sprint 3, 5 | ⬜ Not Started |
| 7 | Resume Canvas (Schema-Driven Builder) | 8 | Hard | Sprint 4 | ⬜ Not Started |
| 8 | ATS Engine (Multi-Dimensional Scoring) | 6 | Hard | Sprint 3 | ⬜ Not Started |
| 9 | CrewAI Integration | 10 | Hard | Sprint 3, 6, 8 | ⬜ Not Started |
| 10 | Career Memory (Context + Vector Store) | 6 | Medium-Hard | Sprint 9 | ⬜ Not Started |
| 11 | Interview Coach Agent | 6 | Medium | Sprint 9 | ⬜ Not Started |
| 12 | Application Tracker | 5 | Medium | Sprint 4 | ⬜ Not Started |
| 13 | Deployment & Observability | 5 | Medium-Hard | All above | ⬜ Not Started |
| 14 | Testing & Portfolio Polish | 6 | Medium | All above | ⬜ Not Started |

**Total estimate: ~90 working days** (roughly 18 weeks at 5 days/week — pace yourself; this is a marathon, not a sprint in the literal sense, despite the naming convention).

---

## Sprint Detail

### Sprint 1 — Project Discovery ✅ Complete
**Goal:** Build a complete, *verified, citation-backed* mental model of the current codebase before changing anything.
**Actual Outcome:** Confirmed stack is Next.js 16 (App Router) + React 19 + TypeScript, Firebase Auth/Firestore (client-SDK only, no server-side DB), OpenRouter (Gemini 2.0 Flash Lite) for all AI completions. Identified 2 critical blockers (build failure, Firestore casing bug), 3 high-severity confirmed issues (unauthenticated API routes, no middleware, broken Job Matcher display), and several medium/low items — full list in `02_Architecture.md` and `26_Risks.md`. The original 14-sprint roadmap's tech assumptions were invalidated — see "Roadmap Corrections Needed" above.
**Deliverables:** `PROJECT_DISCOVERY.md`, `ENVIRONMENT_VERIFICATION.md`, `BACKEND_AUDIT.md`, `FRONTEND_AUDIT.md` (archived in `Sprint_01/_raw_findings/`), consolidated into `docs/02_Architecture.md`, `docs/21_Tech_Stack.md`, `docs/26_Risks.md`, `docs/20_Decision_Log.md`.

### Sprint 2 — Production Stabilization
**Goal:** Resolve the Critical and High-severity issues confirmed in Sprint 1 — production build failure, Firestore casing bug, unauthenticated API routes, broken Job Matcher insights display, hardcoded secrets. No new features, no UI redesign, no agent orchestration.
**Dependencies:** Sprint 1.
**Deliverables:** See `Sprint_02/Day_01.md` through `Day_05.md`.

### Sprint 3 — Backend Refactoring
**Goal:** Move CPU-bound PDF parsing off the event loop, restructure services per the audit's target `backend/app/` layout, introduce Pydantic-validated request/response schemas everywhere.
**Deliverables:** `AsyncDocumentParser` with thread-pool executor, `schemas/` fully typed, prompt-injection mitigation on all LLM-facing string construction.

### Sprint 4 — Frontend Refactoring
**Goal:** Replace prop-drilling/Context with Zustand, fix the Axios refresh-token race condition, establish component library conventions.
**Deliverables:** `store/` with selector-based Zustand stores, single-flight token refresh, shared UI primitives.

### Sprint 5 — AI Career Coach UI
**Goal:** Build the conversational shell (chat pane, suggestions, upload affordances) — UI only, no live agent yet.
**Deliverables:** `AiCoachPane.jsx`, `useCoachStore.js` skeleton, side-panel navigation to existing tool pages.

### Sprint 6 — Streaming Chat (SSE)
**Goal:** Wire the Coach UI to a real streaming backend endpoint.
**Deliverables:** `/api/v1/coach/query-stream`, SSE client in Zustand, non-agentic echo/LLM passthrough first (CrewAI comes later).

### Sprint 7 — Resume Canvas
**Goal:** Schema-driven, split-pane resume builder against the JSON Resume schema, with live PDF preview.
**Deliverables:** Zustand schema store, section editor components, `@react-pdf/renderer` preview pane, PDF/DOCX export.

### Sprint 8 — ATS Engine
**Goal:** Implement the weighted multi-dimensional scoring model (semantic, coverage, structure, readability) from the audit.
**Deliverables:** `ats_service.py`, embedding-based semantic score, NER-based keyword coverage, structural checkpoint scanner, BPQ readability scorer.

### Sprint 9 — CrewAI Integration
**Goal:** Stand up the agent framework and wire the first real multi-agent workflow (ATS Review + Company Research → Cover Letter).
**Deliverables:** `crew_manager.py`, Manager/ATS/Research/Cover-Letter agents, internal tool endpoints. See `10_CrewAI_Guide.md` — this sprint does not start until that guide is read.

### Sprint 10 — Career Memory
**Goal:** Give the Coach persistent context across sessions (vector store + structured profile memory).
**Deliverables:** pgvector setup, embedding pipeline, memory retrieval tool exposed to CrewAI agents.

### Sprint 11 — Interview Coach Agent
**Goal:** Simulated interview mode with tailored question generation and feedback.
**Deliverables:** Interview Coach Agent, `interview_service.py`, `InterviewSession` flows.

### Sprint 12 — Application Tracker
**Goal:** Kanban-style application pipeline, state-synced with chat-driven updates.
**Deliverables:** `JobApplication` CRUD UI, Application Tracker Agent hook-in.

### Sprint 13 — Deployment & Observability
**Goal:** Production deployment with caching, secrets management, tracing.
**Deliverables:** Multi-stage Docker builds, CI/CD pipeline, Redis cache, OpenTelemetry + Prometheus.

### Sprint 14 — Testing & Portfolio Polish
**Goal:** Test coverage, accessibility pass (WCAG AA), README/demo polish for showcasing the project.
**Deliverables:** Pytest + frontend test suite, accessibility audit fixes, demo script.

---

## How to Use This File

- Don't expand sprint detail here — open `Sprint_NN/Day_01.md` when a sprint starts.
- When a sprint completes, change its Status emoji and add a one-line "Actual outcome" note beneath its row.
- If scope changes mid-project, edit this file first, then regenerate only the affected `Sprint_NN/` days — never silently drift from this document.
