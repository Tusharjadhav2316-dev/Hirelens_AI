# HireLens 2.0 — Project Vision

## What HireLens Is Becoming

HireLens is evolving from a resume builder/analyzer into an **AI Career Operating System** — a conversational, agentic platform where an AI Career Coach is the primary interface, and specialized tools (Resume Builder, ATS Engine, Job Matcher, Cover Letter Designer, Interview Coach, Application Tracker) operate as background modules the Coach can call on.

**Reference inspiration:** ChatGPT/Claude (conversational-first UX), Cursor (agentic execution), Notion AI (embedded intelligence inside existing workflows), Perplexity (research synthesis), TealHQ/Rezi/Enhancv (career-specific feature depth).

**What it is NOT:** a static form-based resume tool, a single-feature analyzer, or a portfolio toy project. Every engineering decision should be evaluated against: *"Does this make HireLens feel more like an intelligent coach, or more like a form?"*

## Source-of-Truth Documents

This wiki is built on top of three documents already produced for this project. They are not duplicated here — they are referenced:

1. **Engineering Audit & Architectural Redesign** (`HireLens_2.0_Engineering_Audit.docx`) — current-state codebase review, anti-patterns, ATS scoring model, CrewAI agent definitions, database schema, roadmap phases.
2. **GitHub Repository** — the actual current codebase (`backend/`, `frontend/`).
3. **This wiki** (`/docs`) — the living execution layer. Everything here is actionable; the audit is the rationale.

## Core Engineering Principles

- **Never rewrite unnecessarily.** Improve existing code in place. Only replace a module when the audit explicitly calls for replacement (e.g., sync PDF parsing → async).
- **Never break existing functionality.** Every sprint ends with the app in a runnable, demoable state.
- **Conversational-first, but not conversational-only.** The Coach orchestrates; dedicated pages remain available for deep editing.
- **CrewAI is for non-deterministic, multi-step reasoning only.** Deterministic operations (PDF parsing, PDF generation, CRUD) stay in plain FastAPI services. See `10_CrewAI_Guide.md`.
- **Documentation is part of the definition of done.** A task isn't finished until the relevant `/docs` file reflects the change.

## How This Wiki Is Organized

| Path | Purpose |
|---|---|
| `docs/00_Project_Vision.md` | This file. The "why." |
| `docs/01_Master_Roadmap.md` | All sprints, at a glance. |
| `docs/02_Architecture.md` | Current + target system architecture. |
| `docs/03_Coding_Standards.md` | Naming, style, folder conventions. |
| `docs/04_Project_Rules.md` | Non-negotiable engineering rules. |
| `docs/05_Prompt_Library.md` | Index of every Antigravity prompt ever generated, by sprint/day. |
| `docs/06_API_Keys_and_Setup.md` | Every external service: keys, pricing, setup. |
| `docs/07_Debugging_Guide.md` → `docs/15_Git_Workflow.md` | Reference guides — populated as the relevant sprint arrives, not all at once. |
| `docs/20_Decision_Log.md` | Permanent record of every major technical decision, with alternatives considered. |
| `docs/21_Tech_Stack.md` | Single source of truth for confirmed technologies — updated here only, referenced everywhere else. |
| `docs/22_Product_Requirements.md` | MoSCoW product backlog — defines what HireLens must become. |
| `docs/23_Glossary.md` | Definitions for every project-specific or domain term used elsewhere in this wiki. |
| `docs/24_UI_Wireframes.md` | ASCII wireframes for key screens, used to align on UI before implementation. |
| `docs/25_Backlog.md` | Operational feature tracker (sprint/dependency/status), distinct from the prioritization rationale in `22_Product_Requirements.md`. |
| `docs/26_Risks.md` | Confirmed and speculative engineering risks, clearly separated. |
| `Sprint_NN/Day_NN.md` | One file per working day. This is what you open each morning. |

## Definition of "Done" for This Project

HireLens 2.0 is complete when:
- The AI Career Coach can hold a multi-turn conversation that triggers real backend actions (resume analysis, job matching, cover letter generation) and shows results inline.
- CrewAI orchestrates at least: ATS review, company research, cover letter generation, interview prep, and skill-gap → study roadmap generation.
- The app is deployed, observable, and passes its own test suite.
- A new engineer could clone the repo, read `/docs`, and contribute without asking a question.
