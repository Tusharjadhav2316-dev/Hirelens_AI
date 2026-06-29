# HireLens 2.0 — Coding Standards

> **Structure preserved from the original draft per design review — only the content was de-assumed.** This file's shape (a section per layer, a folder-conventions block, a commit/docs rule) stays. What changes: every previously-named tool (Black, Zustand, Tailwind `@apply`, specific folder names) is now conditional on what Sprint 1 actually confirms, not stated as fact in advance.

## How to Use This File
Each section below has a **Confirmed** block (filled in once Sprint 1, Day 1 verifies the relevant technology) and a **Principle** block (the standard that applies regardless of which specific tool is in use). Fill in the Confirmed blocks during Sprint 1, Day 5 — do not fill them in before that, even if a guess seems obvious.

## Backend Language & Style

**Confirmed:** _To be filled in after Sprint 1, Day 1 (backend language/framework) and Day 5 (consolidated decision on linting/formatting tools, which should match whatever convention — if any — already exists in the repo's own config files, e.g. an existing `.flake8`, `pyproject.toml` tool config, `.eslintrc`, etc.)._

**Principle (applies regardless of language):**
- Match whatever formatter/linter configuration already exists in the repo before introducing a new one. If none exists, propose one during Sprint 2 — don't silently introduce a style today's audit didn't ask for.
- All function signatures fully typed in whichever type system the language provides.
- Business logic lives in a dedicated module/service layer, not directly in request handlers — the exact folder name for that layer is confirmed in Sprint 1, not assumed here.

## Frontend Language & Style

**Confirmed:** _To be filled in after Sprint 1, Day 1 (frontend framework, build tool, styling approach) and Day 4 (real state-management pattern in use)._

**Principle (applies regardless of framework):**
- Match the repo's existing formatter/linter config before introducing a new one.
- State management: use whatever is already confirmed in use (Day 1/Day 4 findings) consistently — don't introduce a second, competing state mechanism without a documented decision in `20_Decision_Log.md`.
- Components/files named consistently with whatever convention the existing codebase already follows — confirm the existing convention before "correcting" it.
- Every interactive element has a visible focus state and appropriate accessible labeling, regardless of framework.

## Folder Conventions

**Confirmed:** _To be filled in after Sprint 1, Day 1 — the actual top-level structure, captured verbatim from `PROJECT_DISCOVERY.md`. Do not assume `backend/`, `frontend/`, `api/v1/`, or any other specific naming until confirmed._

**Principle:** New files follow whatever organizational pattern the existing codebase already demonstrates. If the existing pattern is inconsistent, note it in `02_Architecture.md`'s technical debt findings rather than picking a new pattern unilaterally.

## Commit & Branch Conventions
See `15_Git_Workflow.md` for full detail — that file's conventions (Conventional Commits, one branch per day) are stack-agnostic and require no changes.

## Documentation-as-Code Rule
Unchanged: any change to architecture, API contracts, or agent behavior must be reflected in the relevant `/docs` file in the **same commit** as the code change. A PR that changes behavior without a docs update is incomplete.
