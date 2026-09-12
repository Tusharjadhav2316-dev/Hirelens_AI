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
| **AI Career Agent** (Sprint 8) | The orchestrating CrewAI Manager Agent, exposed to users as the primary post-login conversational experience in the Agent Workspace. Distinct from the standalone "AI Career Coach" (Sprint 6), which remains a separate, simpler streaming chat feature. |
| **Agent Workspace** (Sprint 8) | The new `/dashboard/agent` route: a split view of a conversation pane (left) and an Artifact Canvas (right) showing structured results (resume diffs, ATS score cards, job results, etc.) the user can review and act on. |
| **Manager Agent** (Sprint 8) | The CrewAI orchestrator agent that performs intent detection and delegates to specialized agents. Not the same as the deferred "Planner Agent" concept from the original redesign report, which described longer-horizon career-strategy coordination — out of scope for Sprint 8. |
| **Artifact** (Sprint 8) | A structured, typed piece of UI-renderable data returned by an agent (e.g. `resume_diff`, `ats_score_card`, `job_result_card`). The frontend renders a closed set of known artifact types only — the model cannot generate arbitrary executable UI. |
| **Apply / Reject** (Sprint 8) | The mandatory user confirmation step for any agent-proposed resume change. No resume mutation happens until the user clicks Apply on a specific proposed diff. |
| **Internal JWT** (Sprint 8) | The short-lived (60s) service-to-service token the Next.js proxy mints, carrying only a verified `uid`, used to authenticate its calls to `agent-service`. Never generated from or trusting client-supplied data. |
| **JobProviderAdapter** (Sprint 8) | The interface `JobSearchTool` calls against, decoupling job-search orchestration from any specific external job-listings API. Ships with a `NullJobProvider` until a real provider is selected. |
| **NDJSON** (Sprint 8) | Newline-delimited JSON — the streaming transport format for structured agent events between `agent-service` and the Next.js proxy, and between the proxy and the browser. One JSON object per line. |
