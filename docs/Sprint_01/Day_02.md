# Sprint 1 — Day 2: Environment Verification

## Objective
Day 1 produced a verified, citation-backed picture of what this project actually is. Today, for the first time, the environment is set up and run — using exactly what Day 1 confirmed, not generic defaults. If Day 1 left anything as "Not determined," that gets resolved here through direct observation (running it and seeing what happens), not by guessing before trying.

## Concepts
- **Verification by running, not just reading:** Some facts (does the app actually boot, does the DB actually connect, is an env var actually required vs. optional-with-a-default) can only be confirmed by running the system, not by reading code alone. Day 1 was static analysis; today is dynamic verification.
- **Fix only what's broken, document the rest:** If something fails to start, fix the minimum needed to get a clean run — do not refactor or improve anything today. Note any code smell encountered for Day 3/4/5, but don't act on it yet.

## Prerequisites
- `docs/Sprint_01/_raw_findings/PROJECT_DISCOVERY.md` complete from Day 1, with backend/frontend/database technology confirmed (or explicitly flagged "Not determined").
- Whatever runtimes Day 1 actually confirmed are needed (e.g., a specific Python or Node version) — install/confirm only those, not a default assumed set.

## Setup
There is no single fixed setup script here, because the actual commands depend entirely on what Day 1 found. Use this decision process instead of a fixed command list:

1. Open `PROJECT_DISCOVERY.md`. For each confirmed technology, look up its official setup docs (not a generic tutorial) and follow them exactly.
2. If a dependency manifest exists (whatever Day 1 found — e.g., a Python requirements file, a Node package file, a Go module file), use that ecosystem's standard install command for that exact manifest. Do not substitute a different package manager than the one actually in use (check for a lockfile to confirm which one: e.g., a Node lockfile tells you npm vs. yarn vs. pnpm).
3. If a database was confirmed, set it up using whatever method is already implied by the repo (a Docker Compose file if one exists, a connection string format that implies a specific hosting approach, etc.) rather than introducing Docker if the project shows no sign of expecting it.
4. If Day 1 found no `.env.example` or equivalent, build a minimal one now containing only the variables Day 1 actually found referenced in code — not a speculative full list.

## Resources
- Whatever official documentation corresponds to the technologies confirmed in `PROJECT_DISCOVERY.md` — look these up fresh today rather than relying on this wiki to name them in advance.

## Files to Modify
- `.env` (local only, never committed) — created from whatever variables Day 1 found.
- `<backend>/.env.example` and `<frontend>/.env.example` (or equivalent, named per the actual project layout) — created or corrected based on real findings, replacing any placeholder examples from earlier wiki drafts.

## Architecture
No architecture changes today — this is purely "make the already-existing system run," using Day 1's verified facts as the only source of truth for how.

## Implementation Plan
1. Re-read `PROJECT_DISCOVERY.md` end to end before doing anything.
2. Install backend dependencies using the exact package manager/manifest confirmed in Day 1.
3. Install frontend dependencies the same way.
4. Set up the database using whatever method the repo itself implies (look for existing Docker Compose files, setup scripts, or README instructions already in the repo before inventing a new method).
5. Create a minimal `.env` with only the variables Day 1 found referenced in code.
6. Attempt to start the backend. Record the exact command that worked and any error encountered along the way.
7. Attempt to start the frontend. Same.
8. Confirm the two can talk to each other (load the app in a browser, watch for failed network requests).
9. For anything Day 1 marked "Not determined," resolve it now if running the app makes the answer obvious; otherwise leave it open for Day 3/4.

## Ready-to-Paste Antigravity Prompt

```
Context: PROJECT_DISCOVERY.md (Day 1's verified findings) is available in this repository. Use it as the only source of truth for what technologies this project uses — do not introduce a technology, package manager, or tool that isn't either confirmed in PROJECT_DISCOVERY.md or directly evidenced by a file already in the repo (e.g., an existing Docker Compose file, an existing setup script).

Task:
1. Based on PROJECT_DISCOVERY.md, determine the exact commands needed to install backend dependencies and frontend dependencies, using the package manager implied by whatever lockfile or manifest actually exists in the repo (don't default to npm if a yarn.lock or pnpm-lock.yaml is present, for example).
2. Determine the exact database setup approach by checking for any existing Docker Compose file, setup script, or README instructions already in the repo. If none exist, propose the minimal approach consistent with the confirmed database technology, and clearly label it as "proposed, not found in repo" so I know it's a recommendation rather than an existing convention.
3. Generate or correct .env.example file(s) for whichever directories actually contain a backend/frontend (per the real folder names from PROJECT_DISCOVERY.md, not assumed names), listing only environment variables actually referenced in code per Day 1's findings, each with a placeholder value and a one-line purpose comment. Never include real secrets.
4. Attempt to start the backend and frontend (you may run install and start commands today — this is the one day environment changes are expected). Report the exact commands used and their output, including any errors.
5. If an error occurs, diagnose and apply the minimal fix needed to get a clean start — do not refactor, restructure, or "improve" anything beyond what's needed to run successfully. Document every fix applied in a new section "Fixes Applied" in a report named ENVIRONMENT_VERIFICATION.md.
6. For any item Day 1 marked "Not determined," attempt to resolve it now through direct observation (e.g., if database technology was unclear, the connection succeeding or failing with a specific driver will confirm it) and update accordingly.

Constraints:
- Do not introduce any technology not already evidenced in the repository or explicitly confirmed by me.
- Today's fixes are setup-only. No feature work, no refactors, no style changes.
- Every fix applied must be documented with before/after and reasoning.
```

## Testing
**How to test:** Load the running app in a browser and click through whatever currently exists, the same way you would for any new checkout. Confirm no console errors unrelated to known incomplete features.
**Expected result:** Backend starts cleanly, frontend starts cleanly, and they can communicate (at least one real request succeeds end-to-end).
**Edge cases:** A project that requires a specific OS-level dependency (e.g., a particular database client library, a system package) not obvious from the manifest alone — if you hit this, document it explicitly rather than silently working around it in a way that won't reproduce for someone else.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| Install fails with a version conflict | Manifest specifies versions incompatible with your installed runtime version | Check Day 1's confirmed runtime version requirement; install the matching version rather than forcing the existing one |
| Server starts but immediately errors on a missing env var | `.env` is missing a variable that Day 1's static search didn't catch (e.g., it's read indirectly through a config object) | Add the variable to `.env` and to the relevant `.env.example`, and note it as a Day 1 gap in `ENVIRONMENT_VERIFICATION.md` |
| Database connection refused | Wrong host/port, or the database isn't actually running yet | Confirm the database service is up before blaming application config |

## Checklist
- [ ] Backend dependencies installed using the confirmed package manager
- [ ] Frontend dependencies installed using the confirmed package manager
- [ ] Database running, using a method consistent with the repo's own existing conventions where possible
- [ ] `.env` created with only verified-necessary variables
- [ ] `.env.example` file(s) created/corrected for each real backend/frontend directory
- [ ] Backend starts cleanly; exact working command recorded
- [ ] Frontend starts cleanly; exact working command recorded
- [ ] End-to-end request confirmed working between frontend and backend
- [ ] All Day 1 "Not determined" items either resolved or explicitly still open
- [ ] `ENVIRONMENT_VERIFICATION.md` created documenting any fixes applied

## Commit Message
```
chore: verify and document working local environment (Sprint 1, Day 2)
```

## Documentation Update
Update `docs/21_Tech_Stack.md` — move any remaining "To be verified" entries to confirmed status if resolved today. Do not yet update `docs/02_Architecture.md`.

## End-of-Day Review
The project now runs locally, using exactly the technologies it actually uses — not a generic stack. Every fix applied today is documented, and anything still unresolved is explicitly flagged rather than silently assumed away.

## Tomorrow Preview
Day 3 — Backend Audit: a deep, verified read of the backend's actual architecture (routing, services, data access patterns), building on a codebase now confirmed to run.
