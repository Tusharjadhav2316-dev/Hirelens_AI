# Sprint 1 — Day 4: Frontend Audit

## Objective
Mirror Day 3's depth, applied to the frontend: real component-data-flow tracing, the actual state-management pattern as implemented (not whatever this wiki previously assumed), and real, cited findings about coupling, re-render risk, and API-client behavior (e.g., token refresh handling, if auth is token-based — confirmed on Day 3, not assumed here).

## Concepts
- **Data flow tracing:** Which component owns a piece of state, which components read it, and how it gets from an API response into the UI. This is more useful than a flat component list because it reveals actual coupling, not just file count.
- **Re-render risk is a real, checkable thing, not a guess:** Whether a Context provider's value is memoized, whether a list renders with stable keys, whether a component re-subscribes to global state unnecessarily — all of this is directly visible in code, not inferred from a generic "this stack tends to have this problem" assumption.

## Prerequisites
- Days 1–3 complete; frontend runs locally; backend route map available from Day 3 for cross-reference.

## Setup
No new installs.

## Resources
- Official documentation for whatever frontend framework and state-management approach Day 1 actually confirmed — consult it directly rather than relying on generic React/Vue/Svelte assumptions.

## Files to Modify
None — read-only. Output is `docs/Sprint_01/_raw_findings/FRONTEND_AUDIT.md`.

## Architecture
Feeds Day 5's consolidated `docs/02_Architecture.md` update.

## Implementation Plan
1. List every page/route-level view actually defined, with its mounted path (read from the actual router configuration, whatever that turns out to be).
2. For each page, trace which components it renders and which of those components fetch data, own state, or call the backend directly.
3. Identify the real state-management pattern in use (confirmed on Day 1) and find concrete examples of how it's used — quote real code, not a hypothetical pattern.
4. If a shared/global state mechanism exists, check whether values passed to consumers are memoized or recreated every render; cite specific examples.
5. Identify the actual HTTP client and how it's configured — base URL handling, auth header attachment, error/retry handling, and (if token-based auth was confirmed on Day 3) how token refresh is actually implemented, if at all.
6. Identify any component receiving an unusually high number of props or context values, as a real signal of coupling — but verify by reading the component, not just counting blindly.
7. Identify obvious accessibility gaps by reading actual markup (missing labels, non-semantic interactive elements) — a few real examples are more useful than a sweeping claim.

## Ready-to-Paste Antigravity Prompt

```
Context: Verified frontend audit, building on PROJECT_DISCOVERY.md, ENVIRONMENT_VERIFICATION.md, and BACKEND_AUDIT.md from Sprint 1 Days 1–3. The frontend now runs locally. This is read-only — do not modify frontend source code today.

Task: Produce FRONTEND_AUDIT.md with these sections, citing exact file paths and relevant line numbers/function or component names for every claim:

1. "Page / Route Inventory" — every page-level view actually defined, with its mounted path from the real router configuration (whatever routing approach is actually in use), and which components it renders.
2. "Data Flow Tracing" — for at least the 3–4 most significant pages, trace where their data comes from (API call, global state, local state) down to which component actually owns and updates that state.
3. "State Management — Real Implementation" — based on the state-management approach confirmed in PROJECT_DISCOVERY.md, find and quote 2–3 real examples of it in use. If a global/shared state mechanism exists, check whether values passed to consumers (e.g., a context provider value) are memoized; quote the exact code and state plainly whether each example is memoized or not.
4. "HTTP Client Configuration" — quote how the actual HTTP client is set up: base URL, headers, error handling, and (only if Day 3 confirmed token-based auth) how token refresh is implemented, if at all. Explicitly state whether multiple simultaneous requests receiving an auth failure could trigger multiple independent refresh attempts, based on the actual code — not a generic assumption about this being a known Axios pattern.
5. "Component Coupling Signals" — identify 3–5 components with the highest prop/context count, and for each, briefly assess (from reading the component) whether the coupling is justified (e.g., a generic reusable component with many display props) or a real refactor candidate (e.g., a component reaching into multiple unrelated pieces of global state).
6. "Accessibility Spot-Check" — read 4–5 interactive components (buttons, forms, modals) and report concrete findings: missing aria-labels, non-semantic clickable divs, missing focus states — with exact file/line references. Do not generalize beyond what was actually checked.

Constraints:
- Every finding must cite an exact file and component/function name.
- Do not assume Axios, Zustand, React Context, or any other specific library is in use unless Day 1's PROJECT_DISCOVERY.md already confirmed it — if it did, use that confirmed fact; if it's still "Not determined," resolve it here by checking imports directly before proceeding with this audit.
- No fixes today. Observation only.
```

## Testing
**How to test:** Pick 2–3 of the audit's data-flow traces and manually verify them by using the app yourself (e.g., trigger the action described and watch the network tab / state in browser devtools) to confirm the trace is accurate.
**Expected result:** `FRONTEND_AUDIT.md` reflects real, verified behavior — including an honest, evidence-based answer (not an assumption) about whether the token-refresh race condition pattern actually exists in this codebase, if token-based auth is even in use here at all.
**Edge cases:** A frontend using server-side rendering or a meta-framework (Next.js, Remix, SvelteKit, Nuxt) changes what "page" and "route" mean — let the actual framework's conventions define these terms rather than forcing an SPA mental model if that's not what this project is.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| Report assumes Axios-style interceptors but the project uses native `fetch` | Carried-over assumption from earlier wiki draft | Reject and re-run against the actual HTTP client confirmed in Day 1 |
| Report claims a Context re-render issue but no Context API is used in this project at all | Same root cause | Confirm actual state mechanism first; rewrite section against reality |

## Checklist
- [ ] Every page/route inventoried from the real router config
- [ ] Data flow traced for the most significant pages
- [ ] State management documented from real, confirmed implementation — no assumed library
- [ ] HTTP client configuration documented; token-refresh race condition assessed only if token auth is actually confirmed in use
- [ ] Coupling signals identified from real component reads, not prop-count alone
- [ ] Accessibility spot-check based on real markup
- [ ] `FRONTEND_AUDIT.md` created and spot-verified in-browser

## Commit Message
```
docs: complete verified frontend audit (Sprint 1, Day 4)
```

## Documentation Update
No numbered `/docs` file changes yet — consolidation happens Day 5.

## End-of-Day Review
You now have a traced, cited map of how the frontend actually manages state and talks to the backend — confirmed against the real codebase and, where useful, against the running app itself.

## Tomorrow Preview
Day 5 — Architecture Review: consolidating Days 1–4 into the permanent `docs/02_Architecture.md`, producing real diagrams of *this* system, identifying genuine technical debt (only what was actually found, not assumed), and drafting the Sprint 2 refactor plan — with no implementation yet.
