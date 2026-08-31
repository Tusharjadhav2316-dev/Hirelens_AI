# HireLens 2.0 — Backend Framework Guide

> Filename kept as "FastAPI Guide" — confirmed correct in Sprint 8, since FastAPI is now the actual framework for the new `agent-service/`. Note the scope: this guide covers only the **new** Python service. The existing Next.js API routes (`frontend/app/api/*`) remain Next.js serverless route handlers, unchanged, and are documented under `21_Tech_Stack.md`'s "Backend" section, not here.

## Current State
Confirmed via Sprint 1 + Sprint 8 audit: the pre-Sprint-8 backend is exclusively Next.js App Router serverless functions (`frontend/app/api/*`), stateless, no direct database access (all Firestore access is client-side via the Firebase Web SDK, except Firebase Admin token verification). No Python, no FastAPI, no ORM anywhere in the codebase prior to Sprint 8.

## Target State (Sprint 8)
A single new FastAPI service, `agent-service/`, is added alongside (not instead of) the existing Next.js backend:

```
agent-service/
  main.py                 # FastAPI app, CORS/auth middleware, route registration
  auth.py                 # internal JWT verification (see 20_Decision_Log.md)
  routes/
    chat.py                # POST /chat - streaming agent endpoint
    health.py               # GET /health - liveness check
  crew/
    manager.py              # Manager Agent definition
    agents/                  # one file per specialized agent
    tasks.py                 # Task definitions
  tools/
    resume_tools.py          # get_resume, propose_resume_change
    ats_tools.py              # get_ats_analysis (calls Next.js internal endpoint)
    optimizer_tools.py        # optimize_resume_section
    cover_letter_tools.py     # generate_cover_letter
    job_search_tools.py       # search_jobs + provider adapters
    interview_tools.py        # prepare_interview_questions, evaluate_interview_answer
    skill_gap_tools.py        # analyze_skill_gap
  schemas/
    agent_response.py         # Pydantic AgentResponse envelope + artifact types
    events.py                 # NDJSON streaming event models
  tests/
  requirements.txt
```

- **Async throughout.** FastAPI's async request handling matches the I/O-bound nature of every tool (each tool call is an outbound HTTP request to Next.js or to OpenRouter) — no CPU-bound work runs on the request thread.
- **Pydantic v2** validates every tool's input and output, and the top-level `AgentResponse` envelope, before it's allowed to reach the streaming response or a downstream tool call.
- **No ORM, no direct database driver.** The agent-service has zero direct database access of any kind — it never talks to Firestore. The one Firestore write Sprint 8 needs (the `agentUsage` daily counter) is performed by the Next.js proxy, not by Python, keeping "who can write to Firestore" a single-runtime concern (see `13_Database_Guide.md`).
- **Routing separated from agent/tool logic**, matching the existing Next.js convention of routes calling into `lib/` service modules — `routes/chat.py` is a thin handler that authenticates, builds request-scoped context, and kicks off the Crew; all reasoning/tool logic lives under `crew/` and `tools/`.

## Deployment
Deployed independently of the Vercel-hosted Next.js app (see `20_Decision_Log.md`, "CrewAI Deployment Boundary"). Candidate hosts: Railway, Render, or Fly.io — any host that runs a long-lived Python process with outbound HTTPS is sufficient; this is a hosting decision made at implementation time based on cost, not an architectural dependency of this guide. `09_Deployment_Guide.md` gets a Sprint 8 addendum once a host is actually chosen.

## Open Items (resolve during `Sprint_08/Day_01.md`)
- Final host selection for `agent-service/` (no code-level impact; purely an ops decision).
- Whether `agent-service/` and `frontend/` live in this same repository (monorepo, separate deploy configs) or a second repository — recommended: same repository, separate deploy config, to keep the internal JWT secret and API contracts easy to keep in sync during Sprint 8's rapid iteration; revisit once the service is stable.
