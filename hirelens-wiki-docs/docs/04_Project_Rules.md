# HireLens 2.0 — Project Rules

These are non-negotiable. Every Antigravity prompt in this wiki is written to comply with them; if you ever write a prompt yourself, hold it to the same bar.

1. **Never rewrite unnecessarily.** Default action is to improve existing code in place. Full rewrites only happen where the architecture audit explicitly calls for replacement.
2. **Never break existing functionality.** Every day's work ends with the app running. If a change is large, branch it and merge only when verified.
3. **Never generate code without first stating which files it touches and why.** Every Antigravity prompt must list target files before asking for implementation.
4. **Every implementation is modular.** No new logic embedded directly in route handlers or page components when it belongs in a service/store.
5. **Every implementation is production-ready, not demo-quality.** Error handling, loading states, and edge cases are not optional, even on Day 1.
6. **Every implementation includes documentation.** Update the relevant `/docs` file same-day.
7. **The agent-orchestration framework (CrewAI, per the original redesign report — to be confirmed as still appropriate once Sprint 1 reveals the actual backend stack) is reserved for non-deterministic, multi-step reasoning.** Deterministic operations (file parsing, document generation, CRUD, file I/O) are never wrapped in an agent. If Sprint 1 reveals a backend stack where CrewAI doesn't fit cleanly (e.g., a non-Python backend), this rule's framework choice gets revisited in `20_Decision_Log.md` before Sprint 9 — the *principle* (deterministic work stays out of agents) does not change either way.
8. **Secrets never get committed.** All keys live in `.env`, which is gitignored; `.env.example` is kept up to date instead.
9. **No silent scope creep.** If a day's work reveals the plan needs to change, update `01_Master_Roadmap.md` first, then proceed.
10. **One day, one branch, one commit (squashed).** Keeps history readable and rollbacks trivial.
