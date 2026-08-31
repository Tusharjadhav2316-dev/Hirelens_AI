# HireLens 2.0 — CrewAI Guide

> Confirmed in Sprint 8. Framework choice logged in `20_Decision_Log.md` ("CrewAI Deployment Boundary"). Full day-by-day implementation detail lives in `Sprint_08/`.

## Current State (as of Sprint 8 planning)
CrewAI is **not yet installed** anywhere in the repository. `Hirelens_AI-main/frontend` is a pure Next.js/TypeScript application with zero Python files, no `requirements.txt`, and no Python-capable deployment config. This confirms the Sprint 1 finding that the original redesign report's CrewAI proposal was aspirational, not implemented. Sprint 8 is the first sprint to introduce it.

## Target State
A new, independently-deployed Python service, `agent-service/`, hosts CrewAI. It is called by the Next.js app through one authenticated proxy route and nothing else — no other part of the frontend talks to Python directly.

```
Browser
  |  fetch("/api/agent/chat", { body: { messages, resume, jobDescription? } })
  v
Next.js  (/api/agent/chat/route.ts)
  |  1. verifyAuth(req) - existing Firebase Admin SDK check
  |  2. mint short-lived internal JWT { uid, iat, exp }
  |  3. forward request body + JWT to agent-service
  v
agent-service (FastAPI)
  |  verify internal JWT -> uid
  |  kickoff CrewAI Crew with request-scoped context (resume JSON, ATS context, JD, uid)
  v
Manager Agent
  |  intent detection -> task planning -> delegates to specialized agents
  +-- Resume Agent -----+
  +-- ATS Agent --------|  each agent's tools call BACK into Next.js
  +-- Optimizer Agent --|  internal endpoints or existing public endpoints -
  +-- Career Agent -----|  see 02_Architecture.md "Sprint 8 Tool Contracts"
  +-- Job Search Agent -|
  +-- Interview Coach --+
  v
Structured AgentResponse (message, agent, status, actions[], artifacts[], ui)
  v
NDJSON event stream --> Next.js proxy (passthrough) --> Browser Agent Workspace
```

## Core CrewAI Concepts, as used in HireLens

| Concept | HireLens usage |
|---|---|
| **Agent** | A role with a system prompt (`role`, `goal`, `backstory`) and a bounded tool list. Never given tools outside its declared responsibility (see `Sprint_08/Day_02.md` tool-authorization table). |
| **Task** | One unit of work assigned to an agent for a single user turn — e.g. "explain the current ATS score and prioritize the top 3 fixes." |
| **Tool** | A typed Python function (Pydantic input/output models) an agent can call. Every tool that touches user data receives `uid` from the verified internal JWT context, never from agent-generated text. |
| **Crew** | The Manager Agent + its delegated specialized agents, assembled per-request. Sprint 8 uses a `Process.hierarchical` crew (Manager delegates) rather than `Process.sequential`, since intent varies per user turn. |
| **Flow** | Not used in Sprint 8. The single-crew hierarchical pattern is sufficient for one-turn-at-a-time orchestration; multi-crew Flows are deferred until a use case (e.g. the full Application Workflow in `Sprint_08/Day_05.md`) proves it's needed beyond what task delegation already covers. |
| **Memory** | CrewAI's built-in cross-task memory is **disabled**. Memory in HireLens 8 means "conversation history sent in the request body," matching the Sprint 6 precedent — not CrewAI's persistent memory feature, which would silently introduce cross-session state the brief explicitly says to avoid. |
| **Human-in-the-Loop** | Not implemented via CrewAI's native HITL hooks. Instead, "human in the loop" is enforced at the *tool output* level: any tool that would mutate the resume returns a proposed diff artifact and stops — the actual mutation only happens client-side after an explicit user Apply click. This is simpler to test and audit than an in-loop CrewAI pause/resume mechanism. |

## Cost & Loop Control
- `max_iter` set per-agent (default 6) in the Manager and each specialized agent's CrewAI config — prevents an agent from looping indefinitely trying to satisfy an ambiguous task.
- Per-request wall-clock timeout of 60s enforced by the Next.js proxy via `AbortController`; the agent-service also enforces its own 55s internal timeout so it can return a graceful partial response before the proxy simply cuts the connection.
- `max_tokens` bounded per agent call (400-800 depending on agent, mirroring the existing `AI_IMPROVE_MODEL_PARAMS`/`CAREER_COACH_MODEL_PARAMS` conventions).
- Daily per-user request ceiling enforced via the new `users/{uid}/agentUsage/{date}` Firestore counter (see `20_Decision_Log.md`).

## Testing Non-Deterministic Agent Output
LLM output itself is not asserted on exactly (same convention as `careerCoachSafety.test.ts`). What Sprint 8's Python test suite (`agent-service/tests/`) *does* assert deterministically:
- Tool authorization — an agent can only invoke tools on its declared allowlist (unit test, no LLM call).
- Tool input/output Pydantic schema validation — malformed tool calls are rejected before reaching a deterministic backend.
- The internal JWT is required and validated on every tool's outbound call to Next.js — a forged or missing JWT is rejected.
- The `AgentResponse` envelope always validates against its schema regardless of which agent produced it.
- ATS-related agent output never contains a numeric score that doesn't match the number returned by `/api/internal/ats-score` for the same input (integration test — asserts equality, not "reasonableness").

Full test matrix in `Sprint_08/Day_10.md`.

## Debugging Guidance
- Agent activity events (`agent_started`, `tool_started`, `tool_completed`, `agent_completed`) are logged server-side with the request's `uid` and a request-scoped trace ID — no resume content or chat text is logged (see `26_Risks.md`, "Privacy: Resume Data in Client-Side Logs" and its Sprint 8 counterpart).
- A stuck/looping agent is diagnosed via the `max_iter` ceiling being hit — this is surfaced to the user as a structured `error` event ("I wasn't able to complete that - try rephrasing"), never a silent hang.
- Tool-call failures against internal Next.js endpoints return a structured error the calling agent must handle (explain to the user, do not fabricate a fallback result).
