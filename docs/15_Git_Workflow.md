# HireLens 2.0 — Git Workflow

## Branching
- `main` — always deployable.
- One branch per day: `sprint-NN/day-NN-short-description`.
- Squash-merge into `main` when a day's checklist is complete.

## Commit Messages (Conventional Commits)
Format: `type(scope): short description`

Types used in this project: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`.

Examples:
```
feat(backend): add async PDF extraction via thread-pool executor
fix(frontend): resolve axios refresh-token race condition
docs(architecture): record decision to use pgvector over Pinecone
```

## PR Checklist (self-review, since this is a solo project)
- [ ] App runs locally without errors
- [ ] Relevant `/docs` file updated in the same commit
- [ ] No secrets committed
- [ ] Tests added/updated for new logic
- [ ] Linter passes
