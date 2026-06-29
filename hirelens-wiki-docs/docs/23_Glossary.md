# HireLens 2.0 — Glossary

> Every term used elsewhere in this wiki that isn't self-explanatory. Add a term the first time it's used in a way that assumes prior knowledge.

| Term | Definition |
|---|---|
| **AI Career Coach** | The primary conversational interface for HireLens 2.0 — a chat-based shell that can trigger backend actions and surface results inline, replacing form-based navigation as the main way users interact with the product. |
| **Resume Canvas** | The schema-driven, split-pane interactive resume builder (editing panel + live preview), as opposed to the original static form-based builder. |
| **ATS** | Applicant Tracking System — the automated software employers use to filter and rank candidate applications. HireLens's "ATS Score" estimates how a resume would perform against this kind of system. |
| **Crew** | In CrewAI terminology (pending confirmation this framework is actually adopted — see `10_CrewAI_Guide.md`): a group of Agents working together toward a goal, coordinated by tasks and, optionally, a manager agent. |
| **Agent** | An LLM-driven role with a defined responsibility (e.g., "ATS Review Agent"), capable of using tools and producing structured output, as part of a Crew. |
| **Task** | A discrete unit of work assigned to an Agent within a Crew, with an expected output. |
| **Tool** | A function an Agent can call to perform a concrete action (e.g., querying a database, calling an external API) rather than relying purely on generated text. |
| **Flow** | A CrewAI construct for orchestrating multiple Crews/Tasks with explicit control flow (conditionals, loops), as opposed to a single Crew's more autonomous coordination. |
| **Memory** | In agent-orchestration terms: persisted context (conversation history, prior outputs, retrieved facts) made available to an Agent across turns or sessions. Distinct from "Career Memory" (the product feature) below. |
| **Career Memory** | The product feature (Sprint 10) giving the AI Career Coach persistent context about a specific candidate — their resume history, preferences, and prior interactions — across sessions. |
| **Knowledge Base** | A structured or semi-structured store of reference information (e.g., company research, study resources) that agents or tools can query, as distinct from a user's personal Career Memory. |
| **Planner Agent** | The agent role (per the redesign report's agent definitions) responsible for long-term career strategy coordination and milestone tracking, as opposed to the Manager Agent's per-request orchestration role. |
| **Technical Debt** | Per `04_Project_Rules.md` usage in this wiki: a *confirmed, cited* issue creating real risk — not a style preference. See `02_Architecture.md`'s "Known Issues" section for the active list. |
