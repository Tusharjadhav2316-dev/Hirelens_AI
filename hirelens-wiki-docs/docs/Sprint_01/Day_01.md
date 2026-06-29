# Sprint 1 — Day 1: Project Discovery

## Objective
Before anything is installed, run, or changed, the actual repository must be observed and understood. Every technology named anywhere else in this wiki — database, frontend framework, state management, AI provider, folder layout — is currently a **placeholder pending verification**, not a fact. Today produces the first verified facts. Nothing is installed. Nothing is run. Nothing is assumed.

This day exists because of one rule, applied for the rest of the project:

```
Observe → Inspect → Verify → Document → Plan → Implement
```

Never `Assume → Implement`.

## Concepts
- **Discovery before action:** You cannot safely set up, fix, or extend a system you haven't read. Running an install or a database container before knowing what the project actually needs risks installing the wrong thing, or masking a real setup problem with a coincidentally-working one.
- **Inventory vs. interpretation:** Today is inventory only — "this file exists, this package is in this list, this string appears in this config." Interpretation ("this means the project uses X pattern") is allowed only when directly supported by what was read, and must be flagged if inferred rather than explicit.

## Prerequisites
- Read access to the repository. Nothing else. No accounts, no API keys, no installed runtimes are required for today specifically.

## Setup
**None.** This is the one day in the entire project with no setup section, by design. Do not run an install command, a container, a migration, or a build command today, even if it looks convenient. If you're unsure whether an action counts as "changing the environment," don't do it today — defer to Day 2.

## Resources
- No external resources needed today — everything required is already in the repository.

## Files to Modify
None. Output is a new file, `docs/Sprint_01/_raw_findings/PROJECT_DISCOVERY.md`, plus updates to `docs/21_Tech_Stack.md` (filled in with verified facts only).

## Architecture
Today has no architecture section to follow — today is what *produces* the first verified architecture facts, which land in `docs/02_Architecture.md` on Day 5, not before.

## Implementation Plan
1. List the full top-level folder structure of the repository (do not assume any particular folder names — confirm the actual ones).
2. Identify the backend language/framework by reading actual dependency manifests (whichever ones actually exist — read only what's present).
3. Identify the frontend framework/tooling the same way — from its actual manifest/config file, not from naming conventions alone.
4. Identify the database technology by searching for connection strings, ORM imports, or migration folders — do not assume any specific database engine until a connection string or driver import is found in code.
5. Identify every external API/AI provider referenced in code (search for SDK imports, `_API_KEY`-style environment variable names, base URLs to known providers).
6. Identify the frontend state-management approach by reading actual imports — not by assuming any particular library.
7. Identify the HTTP client used by reading imports, not assuming.
8. Note anything that doesn't fit a clean category — flag it rather than forcing it into an assumption.

## Ready-to-Paste Antigravity Prompt

```
Context: This is a pure discovery task on an existing repository I have not yet documented. Do not install anything, do not run any command that modifies files, do not start any server, do not run any database operation. This is read-only inspection of the source tree only.

Task: Produce a markdown report named PROJECT_DISCOVERY.md with these exact sections, and for every claim, cite the file you found it in. If something cannot be determined from the files present, write "Not determined — requires manual verification" instead of guessing.

1. "Top-Level Structure" — the actual folder/file tree at the repository root, two levels deep.
2. "Backend Technology" — read whichever dependency manifest files actually exist (requirements.txt, pyproject.toml, package.json, go.mod, Gemfile, pom.xml, etc. — only the ones present) and identify the language and web framework in use, quoting the specific line(s) that prove it.
3. "Frontend Technology" — same approach: identify framework, build tool, and styling approach from actual manifest/config files (package.json, vite.config, next.config, angular.json, etc. — whichever exist), quoting evidence.
4. "Database Technology" — search the codebase for database connection strings, ORM/driver imports (e.g., psycopg2, pymongo, mongoose, sqlite3, a Prisma client, sqlalchemy), or migration directories. State exactly what was found and where. Do not name a database technology unless you found direct evidence.
5. "State Management (Frontend)" — search frontend source for actual imports related to state (any state library, React Context, plain useState/useReducer patterns) and report what's actually imported and used, with file references.
6. "HTTP Client" — search for any HTTP client library or generated API client imports, with file references.
7. "External APIs / AI Providers" — search for SDK imports (e.g., openai, google-generativeai, anthropic, or others) and any environment variable names referenced via getenv/process.env/import.meta.env that look like API keys or service URLs.
8. "Authentication Approach" — search for JWT libraries, session middleware, OAuth libraries, or auth-related imports; report exactly what's found, do not assume any particular auth mechanism.
9. "Unclassified / Notable Findings" — anything that doesn't fit the above categories but seems architecturally significant (e.g., a queue system, a caching layer, a second backend service).

Constraints:
- Zero assumptions. Every claim must trace to a specific file and, where reasonable, a specific line or import statement.
- If two technologies appear to coexist (e.g., two different ORM config files exist), report both and flag it for clarification rather than picking one.
- Do not recommend anything today. Do not suggest changes. This file is observation only.
```

## Testing
**How to test:** There is no code to test. "Testing" today means: read the generated `PROJECT_DISCOVERY.md` yourself and spot-check at least 3 claims against the actual file referenced — confirm the citation is accurate, not just plausible-sounding.
**Expected result:** Every section is filled with either a cited fact or an explicit "Not determined" — there should be zero unlabeled guesses.
**Edge cases:** A monorepo with multiple backends/frontends, or a framework not anticipated by the prompt's examples — the prompt is written to discover *whatever is actually there*, not to fit your project into a preset list.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| Report contains a confident claim with no file citation | Model defaulted to a common pattern instead of verifying | Reject that line; ask specifically "what file did you find this in?" before accepting it |
| Two conflicting technologies reported for the same layer | Project may genuinely be mid-migration, or stale config files exist | Don't resolve the conflict yourself today — flag it explicitly in `PROJECT_DISCOVERY.md` for Day 5's architecture review |

## Checklist
- [ ] Top-level structure documented from the actual repo, not assumed
- [ ] Backend language/framework confirmed from a real manifest file, with citation
- [ ] Frontend framework confirmed from a real manifest file, with citation
- [ ] Database technology confirmed from real evidence, or explicitly marked "Not determined"
- [ ] State management and HTTP client confirmed from real imports
- [ ] Every external API/AI provider found and listed
- [ ] Auth approach confirmed from real evidence, not assumed
- [ ] No installs, no server starts, no database operations performed today
- [ ] `docs/21_Tech_Stack.md` updated with only verified facts (leave "To be verified" for anything not yet confirmed)

## Commit Message
```
docs: complete read-only project discovery (Sprint 1, Day 1)
```

## Documentation Update
Populate `docs/21_Tech_Stack.md` with verified facts only. Do **not** yet touch `docs/02_Architecture.md` — that happens on Day 5, after Days 2–4 add verified depth to today's surface-level findings.

## End-of-Day Review
You now have a citation-backed inventory of what this project actually is, with zero installs and zero assumptions. Anything not confirmed today is explicitly marked "Not determined" rather than silently assumed — that label is itself useful information for Day 2.

## Tomorrow Preview
Day 2 — Environment Verification: now that the stack is known (not assumed), set up and run the project for the first time, using the actual technologies confirmed today instead of generic instructions.
