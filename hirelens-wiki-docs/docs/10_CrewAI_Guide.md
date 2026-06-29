# HireLens 2.0 — CrewAI Guide

## Current State
**To be verified during Sprint 1.** Whether CrewAI (or any agent-orchestration framework) is already present in this codebase is unknown until `PROJECT_DISCOVERY.md` (Day 1) and `BACKEND_AUDIT.md` (Day 3) confirm it — search results for `crewai` imports, or their absence, go here. Most likely outcome: not yet present, since the redesign report describes it as a planned addition rather than existing functionality — but that itself is an assumption pending confirmation.

## Target State
The redesign report proposes CrewAI as the orchestration layer for non-deterministic, multi-step reasoning: a Manager Agent coordinating specialized agents (ATS Review, Company Research, Cover Letter, Interview Coach, Skill Gap, Study Roadmap, Application Tracker, Planner) via FastAPI-exposed tools. **This remains the target only if Sprint 1 confirms a backend stack CrewAI actually fits** (it's a Python framework — if Sprint 1 reveals a non-Python backend, this entire target needs revisiting in `20_Decision_Log.md` before proceeding, and the "Alternative Considered" entry there should weigh framework-native options, e.g. LangGraph for a different ecosystem, or a hand-rolled orchestrator).

Assuming Python is confirmed: the target architecture is —
```
FastAPI Orchestrator -> Manager Agent (LLM)
   -> specialized agents (ATS, Research, Cover Letter, Interview Coach, ...)
   -> Unified structured output
```
With agents, tasks, tools, crews, flows, and shared memory as described in the engineering audit's CrewAI section.

## Migration Strategy
1. **Confirm backend language/framework** (Sprint 1, Day 1) — gate on this before any further CrewAI planning.
2. **Confirm whether CrewAI (or anything else) is already partially present** (Sprint 1, Day 3) — if so, document what exists before planning additions.
3. **Record the framework decision explicitly** in `20_Decision_Log.md` once confirmed — "Use CrewAI" should be a logged decision with alternatives considered, not an inherited assumption.
4. **Do not install or scaffold CrewAI until Sprint 9.** Installing it earlier risks building against an orchestration layer before the deterministic services it will call (PDF parsing, ATS scoring, job matching) are themselves stable — per Project Rule 1 (never rewrite unnecessarily) and Rule 7 (CrewAI only for non-deterministic work).
5. **When Sprint 9 begins,** this guide gets a full rewrite covering: what CrewAI is, its core concepts (Agents, Tasks, Tools, Crews, Flows, Memory, Human-in-the-Loop, Tool Calling), the FastAPI integration pattern specific to this confirmed codebase, the actual folder structure to use (matching whatever convention Sprint 1 found), testing approach, debugging non-deterministic agent output, and production best practices — followed by Sprint 9's day-by-day implementation plan. None of that is written now, because writing it before the backend stack is confirmed would repeat the exact mistake this design review caught.

## Open Questions (resolve before Sprint 9)
- Is the backend confirmed to be Python? (Sprint 1, Day 1)
- Does anything resembling agent orchestration already exist? (Sprint 1, Day 3)
- Is Gemini (or another LLM provider) confirmed as the model backing agent reasoning? (Sprint 1, Day 1, `06_API_Keys_and_Setup.md`)
