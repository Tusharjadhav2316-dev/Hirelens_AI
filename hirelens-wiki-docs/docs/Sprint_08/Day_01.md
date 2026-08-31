# Sprint 8 — Day 1

## Day Title
Architecture Foundation — Python/CrewAI Service Boundary, Internal Auth, and Shared Contracts

## Objective
Stand up the skeleton of the new `agent-service/` (FastAPI, Python) alongside the existing Next.js app, establish the authenticated proxy path from the browser through Next.js into the new service, and define the shared `AgentResponse`/`AgentEvent` contracts both runtimes will honor for the rest of Sprint 8. No CrewAI agent logic yet — today is the boundary and the wiring only.

## Why This Day Exists
Every subsequent Sprint 8 day depends on two things existing and being trustworthy: (1) a way for a Python process to run at all in this otherwise all-TypeScript project, and (2) a way for that process to know, with certainty, which HireLens user it's acting on behalf of. Building agent logic before this boundary is solid would mean re-plumbing auth through seven agents and a dozen tools later. This day is deliberately "boring" infrastructure so Days 2–10 can move fast without security debt.

## Repository Evidence / Current State
Confirmed via direct inspection of the uploaded repository (`Hirelens_AI-main/frontend`):
- Zero Python files, no `requirements.txt`, no `Dockerfile`, no Python-related config anywhere in the repo.
- `frontend/lib/verifyAuth.ts` already exists and correctly verifies a Firebase ID token server-side via the Firebase Admin SDK — this is reused, not rebuilt.
- `frontend/app/api/*` routes are all Next.js App Router Route Handlers (`route.ts`), stateless, calling OpenRouter or Firestore-adjacent logic directly — none of them proxy to another backend service today. `/api/agent/chat` is the first of its kind.
- `mcp_config.json` at the repo root is an unrelated Stitch-design MCP server config — confirmed irrelevant to this sprint's agent architecture, not a starting point for it.
- No environment variable resembling an internal service secret exists in `06_API_Keys_and_Setup.md` prior to this sprint.

## Concepts
- **Service boundary:** why CrewAI cannot run "inside" a Next.js API route (Python-only framework), and why a serverless Python function is a worse fit than a standalone microservice for a multi-step, tool-calling, streaming workload (see `20_Decision_Log.md`, "CrewAI Deployment Boundary").
- **Internal JWT vs. re-verifying Firebase tokens:** a short-lived, first-party-only token minted by a service that has *already* done the real auth check, versus re-doing that check in a second runtime.
- **NDJSON:** newline-delimited JSON, the streaming format chosen for structured (not raw-token) events.

## Prerequisites
- Sprint 6 complete and stable (Career Coach, Firebase Auth, `verifyAuth.ts` all working).
- Python 3.11+ available in the development environment.
- A hosting decision for `agent-service/` is **not** required to start today — local development runs it as a plain `uvicorn` process; hosting is finalized before Day 10's deployment checklist, not before Day 1's code.

## Setup
1. `python -m venv agent-service/.venv && source agent-service/.venv/bin/activate`
2. `pip install fastapi uvicorn[standard] pydantic pyjwt httpx python-dotenv`
3. Generate the shared secret: `openssl rand -hex 32` → set as `INTERNAL_AGENT_JWT_SECRET` in both `frontend/.env.local` and `agent-service/.env`.

## Resources
- `frontend/lib/verifyAuth.ts` — the exact pattern for "verify, then act" being extended today.
- `frontend/app/api/career-coach/route.ts` — reference for the existing streaming Route Handler pattern; today's `/api/agent/chat/route.ts` follows the same `ReadableStream` shape but re-streams bytes from Python instead of from OpenRouter directly.

## Files to Inspect
- `frontend/lib/verifyAuth.ts`
- `frontend/app/api/career-coach/route.ts`
- `frontend/middleware.ts` (if present) — confirm no conflicting route matcher for `/api/agent/*`

## Files to Modify
- `frontend/.env.local.example` — add `INTERNAL_AGENT_JWT_SECRET`, `AGENT_SERVICE_URL`
- `06_API_Keys_and_Setup.md` — already updated with the Internal Agent Service Auth entry (see this ZIP's docs)

## Files to Create
- `agent-service/main.py`
- `agent-service/auth.py`
- `agent-service/routes/health.py`
- `agent-service/schemas/agent_response.py`
- `agent-service/schemas/events.py`
- `agent-service/requirements.txt`
- `frontend/app/api/agent/chat/route.ts` (proxy skeleton — returns a hardcoded single NDJSON event today, real Crew wiring is Day 2+)
- `frontend/types/agent.ts` (TypeScript mirror of the Pydantic schemas)

## Architecture Impact
Introduces the first non-Next.js runtime into the project. Does not touch any existing route, page, or Firestore collection. Purely additive.

## Data Flow
```
Browser --POST--> /api/agent/chat (Next.js)
   verifyAuth(req) -> uid
   mint JWT {uid, iat, exp=+60s} signed with INTERNAL_AGENT_JWT_SECRET
   POST AGENT_SERVICE_URL/chat, header X-Internal-Auth: <jwt>, body passthrough
   stream response bytes back to browser unmodified
--> agent-service /chat
   verify X-Internal-Auth -> uid (401 if missing/invalid/expired)
   (Day 1: emit one hardcoded {"type":"completed"} NDJSON line to prove the pipe works)
```

## Implementation Plan

### Step 1 — `agent-service/schemas/agent_response.py` and `events.py`
Define Pydantic v2 models for `AgentResponse`, the closed `Artifact` union, `AgentAction`, and `AgentEvent` exactly as specified in `02_Architecture.md`'s "Generative UI" and "Streaming Event Schema" sections. These are the contract every later day's code is validated against — get the shapes right today.

### Step 2 — `agent-service/auth.py`
```python
import jwt, time, os
from fastapi import HTTPException, Header

SECRET = os.environ["INTERNAL_AGENT_JWT_SECRET"]

def verify_internal_jwt(x_internal_auth: str = Header(...)) -> str:
    try:
        payload = jwt.decode(x_internal_auth, SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="invalid internal token")
    if "uid" not in payload:
        raise HTTPException(status_code=401, detail="malformed internal token")
    return payload["uid"]
```
Note the function signature: `uid` is the *only* thing any downstream code receives from auth — there is no code path where a request body's `userId` field can substitute for this.

### Step 3 — `agent-service/main.py`
Wire FastAPI app, register `routes/health.py` (`GET /health` → `{"status": "ok"}`, no auth required, used for deploy-target liveness checks) and a placeholder `POST /chat` that depends on `verify_internal_jwt` and streams a single `{"type": "completed"}` NDJSON line.

### Step 4 — `frontend/app/api/agent/chat/route.ts`
```typescript
export async function POST(req: Request) {
  const decoded = await verifyAuth(req); // existing helper, throws/401s internally on failure
  const jwtToken = signInternalJwt({ uid: decoded.uid }); // new small helper, jsonwebtoken, 60s expiry
  const upstream = await fetch(`${process.env.AGENT_SERVICE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Internal-Auth": jwtToken },
    body: await req.text(),
  });
  return new Response(upstream.body, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
```

### Step 5 — `frontend/types/agent.ts`
Hand-mirror the Pydantic models as TypeScript types/interfaces. These two files (Python + TS) are the two halves of one contract — Day 10's test suite asserts they stay in sync via a shape-comparison test using representative fixtures.

## Ready-to-Paste Antigravity Prompt
"Using the existing `verifyAuth.ts` pattern and the streaming `ReadableStream` pattern in `app/api/career-coach/route.ts`, create `app/api/agent/chat/route.ts` that verifies the caller's Firebase ID token, mints a 60-second HS256 JWT containing only `{uid}` signed with `process.env.INTERNAL_AGENT_JWT_SECRET`, forwards the original request body to `process.env.AGENT_SERVICE_URL/chat` with that JWT in an `X-Internal-Auth` header, and streams the response back to the client unmodified. Do not modify `verifyAuth.ts` itself."

## Testing
- `agent-service/tests/test_internal_auth.py` (new): missing header → 401; malformed JWT → 401; expired JWT → 401; valid JWT → `uid` extracted correctly.
- Manual: `curl -X POST localhost:8000/chat -H "X-Internal-Auth: garbage"` → 401.
- Manual: full round-trip through the Next.js dev server with a real logged-in session → single `{"type":"completed"}` line received in the browser Network tab.

## Regression Testing
Run `npm run build` and all three existing test suites (`atsBenchmark`, `optimizerSafety`, `careerCoachSafety`) — none should be affected since nothing existing was modified.

## Manual Verification
1. Start `agent-service` locally (`uvicorn main:app --reload --port 8000`).
2. Start Next.js dev server with `AGENT_SERVICE_URL=http://localhost:8000`.
3. Log in, open browser dev tools Network tab, `fetch("/api/agent/chat", {method:"POST", body:"{}"})` from the console.
4. Confirm a 200 response with one NDJSON line.
5. Confirm calling `agent-service` directly without the proxy (no `X-Internal-Auth` header) returns 401.

## Expected Behaviour
An authenticated browser request reaches Python and gets a response; an unauthenticated or directly-targeted request to Python is rejected.

## Failure Cases
- Missing `INTERNAL_AGENT_JWT_SECRET` in either environment → route should fail loudly at startup/first-request, not silently skip auth.
- `AGENT_SERVICE_URL` unreachable → proxy route returns a structured 502/error, not a hang.

## Debugging Guidance
Check both processes' logs independently — a 401 from Python and a 500 from Next.js look identical to the browser but have different causes; the Next.js proxy should log (server-side only, never resume content) which upstream call failed and why.

## Security Considerations
This is the day the entire Sprint 8 trust boundary is established — see `20_Decision_Log.md`'s two Day 1 ADRs and `26_Risks.md`'s "Cross-Service Authentication Bypass" entry. Do not proceed to Day 2 until `test_internal_auth.py` passes and the manual 401 check is confirmed by hand.

## Checklist
- [ ] `agent-service/` scaffold created and runs locally
- [ ] Internal JWT minted by Next.js, verified by Python
- [ ] Direct calls to `agent-service` without the JWT are rejected
- [ ] `AgentResponse`/`AgentEvent` schemas defined in both Python and TypeScript
- [ ] `test_internal_auth.py` passing
- [ ] No existing route, page, or test modified or broken

## Commit Message
`feat(sprint8-day1): scaffold agent-service (FastAPI) and authenticated Next.js proxy boundary`

## Documentation Updates
`21_Tech_Stack.md`, `12_FastAPI_Guide.md`, `06_API_Keys_and_Setup.md`, `20_Decision_Log.md` already reflect this day's decisions in this documentation package.

## End-of-Day Review
The boundary exists, is authenticated, and is provably rejecting unauthorized callers. No agent reasoning exists yet — that's Day 2.

## Tomorrow Preview
Day 2 defines the Manager Agent and the 6 specialized agents' roles/goals/backstories and wires them into a CrewAI hierarchical Crew, still without any real tools (tools are Day 3) — the Crew will reason and delegate but every tool call returns a stub.
