# Sprint 1 — Day 3: Backend Audit

## Objective
With the environment confirmed running, today builds a verified, detailed map of the backend specifically: every route, every service/business-logic module, every data-access pattern, and every place external APIs (AI providers, third-party services) are called. This is deeper than Day 1's surface-level inventory — today traces actual control flow, not just file lists.

## Concepts
- **Control flow vs. file inventory:** Day 1 told you *what files exist*. Today tells you *what happens when a request comes in* — which route calls which service, which service touches the database or an external API, and where error handling does or doesn't exist.
- **Verified risk-finding, not assumed risk-finding:** The earlier version of this wiki assumed specific issues (a CORS wildcard, sync I/O in async handlers, a particular session-management bug) based on a generic audit narrative. None of that is assumed today — if those issues exist in *this* codebase, today's audit finds and cites them directly; if they don't, today says so.

## Prerequisites
- Day 1 and Day 2 complete; the backend runs locally.

## Setup
No new installs. Today is read-and-trace, with the already-running backend available for live verification if needed (e.g., hitting an endpoint to confirm its actual behavior).

## Resources
- Whatever official framework documentation corresponds to the backend framework confirmed in Day 1 — consult it directly for anything unfamiliar in the code (e.g., that framework's specific async/middleware/dependency-injection patterns).

## Files to Modify
None — read-only audit. Output is `docs/Sprint_01/_raw_findings/BACKEND_AUDIT.md`.

## Architecture
Today's findings become the backend portion of `docs/02_Architecture.md`, written on Day 5 — not before, so it isn't written from assumption.

## Implementation Plan
1. List every route/endpoint actually defined in the backend, with method, path, and a one-line description based on reading its handler — not its filename alone.
2. For each route, trace which service/module it calls into, down to where it touches the database or an external API.
3. Identify every place the database is accessed: is access wrapped consistently (e.g., a context manager, dependency injection, a unit-of-work pattern), or is it ad hoc? Cite specific examples either way.
4. Identify every place an external API or AI provider is called: is user input passed into a prompt/request directly, or is it validated/sanitized first? Cite the exact code.
5. Identify any async/concurrency patterns: does any CPU-bound or blocking operation run inside an async handler without being offloaded? Cite the exact function if so.
6. Identify the authentication/authorization mechanism actually implemented (not assumed) and where it's enforced (per-route, middleware-wide, inconsistent?).
7. Identify CORS configuration as actually written, and state plainly whether it's permissive or restrictive, quoting the config.
8. Identify error-handling consistency: do handlers return structured errors, raw stack traces, or a mix?

## Ready-to-Paste Antigravity Prompt

```
Context: Verified backend audit, building on PROJECT_DISCOVERY.md and ENVIRONMENT_VERIFICATION.md from Sprint 1 Days 1–2. The backend now runs locally. This is still a read-only documentation task — do not modify backend source code today.

Task: Produce BACKEND_AUDIT.md with these sections, citing exact file paths and line numbers/function names for every claim:

1. "Route Inventory" — every route/endpoint actually defined, with method, path, and a description based on reading the handler body (not the filename).
2. "Route-to-Service Tracing" — for each route, the call chain down to its data access or external API call.
3. "Data Access Patterns" — how the database is accessed across the codebase: consistent pattern (name it) or ad hoc (show 2–3 differing examples). Quote the exact code for each example.
4. "External API / AI Provider Call Sites" — every location an external API or AI model is called, and for each, state explicitly whether user-supplied input is passed into the request/prompt directly or is sanitized/validated first, quoting the relevant code.
5. "Async / Concurrency Findings" — search specifically for blocking or CPU-bound operations (file parsing, image processing, heavy computation) running inside asynchronous request handlers without being offloaded to a background thread or task. Quote the exact function if found. If the codebase isn't using an async framework at all, state that plainly instead of forcing this section.
6. "Authentication & Authorization" — the actual mechanism implemented (session, JWT, OAuth, none, etc.), and whether it's enforced consistently across routes or only on some. Quote the relevant middleware/decorator/guard code.
7. "CORS / Cross-Origin Configuration" — quote the actual configuration as written, and state plainly whether it allows all origins or is restricted.
8. "Error Handling Consistency" — sample 4–5 different route handlers and report whether errors are returned in a consistent structured format or inconsistently (raw exceptions, mixed formats, silent failures).

Constraints:
- Every finding must cite an exact file and, wherever possible, a line number or function name.
- Do not assume any of the following exist unless you find direct evidence: a specific session-management bug, a specific CORS misconfiguration, a specific prompt-injection vulnerability, a specific blocking I/O issue. Find and cite real instances, or state "no instances of this pattern were found."
- Do not propose fixes today. This is observation only — fixes are planned on Day 5 and implemented in Sprint 2.
```

## Testing
**How to test:** For at least 2–3 routes the report describes, manually call the endpoint yourself (via the running backend) and confirm the described behavior matches reality.
**Expected result:** `BACKEND_AUDIT.md` accurately reflects what the code and the live server actually do, with no unverified claims carried over from prior wiki drafts.
**Edge cases:** A route that behaves differently depending on auth state, feature flags, or environment — note the conditional behavior explicitly rather than describing only one path.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| Audit reports a vulnerability pattern from the original engineering audit document that doesn't actually exist in this repo | Model pattern-matched to the earlier audit narrative instead of this specific codebase | Reject the finding; re-run the relevant search yourself (e.g., grep for the specific pattern) to confirm one way or the other |
| Route tracing dead-ends (handler calls something that can't be located) | Possible dynamic dispatch, plugin pattern, or dependency injection obscuring the call | Note it as "call target not staticly traceable — requires runtime confirmation" rather than guessing |

## Checklist
- [ ] Every backend route inventoried with a real, code-derived description
- [ ] Route-to-service-to-data-access tracing complete for each route
- [ ] Data access pattern(s) documented with real code examples
- [ ] Every external API/AI call site found, with input-sanitization status noted
- [ ] Async/blocking-I/O findings based on actual code search, not assumption
- [ ] Auth/authz mechanism documented from real evidence
- [ ] CORS configuration quoted exactly as written
- [ ] Error-handling consistency assessed from real samples
- [ ] `BACKEND_AUDIT.md` created and spot-verified against at least 2–3 live endpoint calls

## Commit Message
```
docs: complete verified backend audit (Sprint 1, Day 3)
```

## Documentation Update
No `/docs` numbered file changes yet — findings feed Day 5's architecture consolidation.

## End-of-Day Review
You now have a traced, cited map of how requests actually flow through the backend, and a list of real (not assumed) risk patterns, each backed by exact code references.

## Tomorrow Preview
Day 4 — Frontend Audit: the same depth of tracing, applied to the frontend — component data flow, state management as actually implemented, and real (not assumed) coupling/performance findings.
