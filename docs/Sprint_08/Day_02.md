# Sprint 8 — Day 2

## Day Title
CrewAI Manager Agent + Specialized Agent Foundation

## Objective
Define the Manager Agent and the 7 core specialized agents (Resume, ATS, Optimizer, Career, Job Search, Interview Coach — 6 delegates plus the Manager itself) as a `Process.hierarchical` CrewAI Crew, each with a role/goal/backstory and a hard-coded tool allowlist. Tools are stubs today (return fixed sample data) — the goal is to prove intent detection and delegation work end-to-end before wiring real backends tomorrow.

## Why This Day Exists
The brief's central requirement — "do not blindly implement every agent... determine which agents are actually necessary" — has to be decided and justified *before* writing agent code, not discovered by trial and error. Today turns the classification already made in `02_Architecture.md` and `20_Decision_Log.md` into actual `Agent(...)` definitions, and proves the Manager can correctly route a handful of representative user turns to the right delegate.

## Repository Evidence / Current State
No agents, crews, or CrewAI dependency exist prior to today (confirmed Day 1). `frontend/lib/promptTemplates.ts` contains `CAREER_COACH_SYSTEM_PROMPT` and other existing prompt constants — these are read (not imported, Python can't import `.ts`) as the reference text for porting the Career Agent's persona, per `20_Decision_Log.md`'s "Career Coach persona is ported" ADR.

## Concepts
- CrewAI `Agent` (role, goal, backstory, tools, `max_iter`), `Task`, `Crew(process=Process.hierarchical, manager_llm=...)`.
- Tool allowlisting as a security boundary (not just an organizational convenience) — see `26_Risks.md`, "Unauthorized/Unbounded Tool Execution."
- Why Cover Letter and Skill Gap are *not* agents here (recap of the Day 3-relevant Decision Log ADR, since their absence from today's agent list is a deliberate omission, not an oversight).

## Prerequisites
Day 1 complete: authenticated boundary working, schemas defined.

## Setup
`pip install crewai` (adds to `agent-service/requirements.txt`).

## Resources
- `frontend/lib/promptTemplates.ts` — source text for the Career Agent's ported persona.
- `02_Architecture.md`, "Agent Hierarchy" table — the authoritative classification being implemented today.

## Files to Inspect
- `frontend/lib/promptTemplates.ts` (`CAREER_COACH_SYSTEM_PROMPT` and mode-specific instructions for the Optimizer's 5 modes — read for tone/guardrail reference, not copied verbatim where the agent's actual behavior differs).

## Files to Modify
- `agent-service/main.py` — wire the real `/chat` handler to kick off the Crew instead of returning a hardcoded event.

## Files to Create
- `agent-service/crew/manager.py`
- `agent-service/crew/agents/resume_agent.py`
- `agent-service/crew/agents/ats_agent.py`
- `agent-service/crew/agents/optimizer_agent.py`
- `agent-service/crew/agents/career_agent.py`
- `agent-service/crew/agents/job_search_agent.py`
- `agent-service/crew/agents/interview_coach_agent.py`
- `agent-service/crew/tasks.py`
- `agent-service/tools/__init__.py` (stub tools only today — real implementations Day 3–4)

## Architecture Impact
Establishes the intent-detection/delegation layer. No real backend integration yet (that's Day 3's job) — today's tools are hard-coded stub returns so delegation logic can be tested in isolation from network calls.

## Data Flow
```
POST /chat {messages, resume, jd?}
  -> Manager Agent receives Task("respond to the user's latest message")
  -> Manager reasons about intent, delegates to one or more specialized agents
  -> each delegate calls its (stubbed) tools, returns a partial result
  -> Manager assembles final AgentResponse
  -> (still non-streaming today; streaming wiring is Day 6)
```

## Implementation Plan

### Step 1 — Tool Authorization Table
| Agent | Allowed Tools (stubbed today, real Day 3–4) |
|---|---|
| Resume Agent | `get_resume`, `propose_resume_change` |
| ATS Agent | `get_ats_analysis` |
| Optimizer Agent | `optimize_resume_section` |
| Career Agent | `get_resume` (context only) |
| Job Search Agent | `search_jobs`, `analyze_skill_gap` |
| Interview Coach Agent | `prepare_interview_questions`, `evaluate_interview_answer` |
| Manager Agent | none directly — delegation only |

This table is the literal input to `test_tool_authorization.py` (Day 10) — an agent instantiated with a tool outside its row should be treated as a bug, not a feature.

### Step 2 — Agent Definitions (example: ATS Agent)
```python
ats_agent = Agent(
    role="ATS Analysis Explainer",
    goal="Explain the user's deterministic ATS analysis result clearly and prioritize the highest-impact fixes.",
    backstory=(
        "You explain ATS results produced by HireLens's deterministic scoring engine. "
        "You NEVER calculate, estimate, or invent a score yourself - you only use the "
        "number and category breakdown returned by the get_ats_analysis tool. If asked "
        "for a score before calling the tool, call the tool first."
    ),
    tools=[get_ats_analysis_tool],
    max_iter=6,
    allow_delegation=False,
)
```
Each of the other 5 delegate agents follows the same shape with role-appropriate goal/backstory, each explicitly stating its non-negotiable constraint (Resume Agent: never fabricate personal facts; Job Search Agent: never fabricate listings; Interview Coach: never imply unverified qualifications).

### Step 3 — Manager Agent and Hierarchical Crew
```python
manager = Agent(
    role="HireLens Career Agent Manager",
    goal="Understand what the user needs and delegate to the right specialist(s), then assemble a clear final response.",
    backstory="You coordinate specialists but never perform their work yourself. You never state an ATS score, resume content, or job listing you did not receive from a delegate this turn.",
    allow_delegation=True,
    max_iter=6,
)
crew = Crew(agents=[resume_agent, ats_agent, optimizer_agent, career_agent, job_search_agent, interview_coach_agent],
            manager_agent=manager,
            process=Process.hierarchical,
            memory=False)  # see 10_CrewAI_Guide.md - memory intentionally disabled
```

### Step 4 — Delegation Smoke Tests (manual, today)
Run each of these 6 representative prompts against the Crew locally and confirm the *right* agent is chosen (inspect via CrewAI's verbose logging, not yet via the real `agent_activity` events — that's Day 6):
1. "Improve my summary" → Optimizer Agent
2. "Why is my ATS score low?" → ATS Agent
3. "Find me React jobs" → Job Search Agent
4. "What should I focus on in my career right now?" → Career Agent
5. "Give me 5 interview questions for a backend role" → Interview Coach Agent
6. "Help me build my resume from scratch" → Resume Agent

## Ready-to-Paste Antigravity Prompt
"Create six CrewAI `Agent` definitions in `agent-service/crew/agents/` following the ATS Agent example in `Sprint_08/Day_02.md` — each with role, goal, backstory, a hard-coded tools list matching the Tool Authorization Table, `max_iter=6`, and `allow_delegation=False`. Then create the Manager Agent and a `Process.hierarchical` Crew in `agent-service/crew/manager.py` with `memory=False`."

## Testing
- `agent-service/tests/test_tool_authorization.py`: instantiate each agent, assert its `.tools` list exactly matches the authorization table row — no more, no fewer.
- Manual delegation smoke tests (Step 4) — logged as passed/failed in the Day 2 checklist, not yet automated (automating "did the LLM pick the right agent" deterministically isn't meaningful — see `10_CrewAI_Guide.md`'s "Testing Non-Deterministic Agent Output").

## Regression Testing
Existing suites unaffected — no existing files touched besides `agent-service/main.py`, which is new-Sprint-8-only code.

## Manual Verification
Run all 6 smoke-test prompts against the local Crew via a simple script (`agent-service/scripts/manual_smoke_test.py`), review verbose CrewAI logs for correct delegation.

## Expected Behaviour
Each representative prompt is delegated to the intended specialist agent at least 5/6 times across repeated runs (LLM routing isn't perfectly deterministic — document actual observed accuracy in the Day 2 review, don't assume 100%).

## Failure Cases
- Manager delegates to zero agents (fails silently) → must surface as an `error`/`needs_input` status, not an empty response.
- Manager delegates to multiple agents for a single-intent prompt → acceptable if the final assembled response is still coherent; flag as a prompt-tuning item if it happens consistently.

## Debugging Guidance
CrewAI's verbose mode (`Crew(..., verbose=True)`) prints each agent's reasoning and tool calls — invaluable today, should be **disabled** in any environment where request content might be logged (see `26_Risks.md` privacy notes).

## Security Considerations
Confirm today that even in this stubbed state, no agent's stub tool accepts a `uid` parameter from anywhere other than the request context threaded through by `main.py` from Day 1's `verify_internal_jwt`.

## Checklist
- [ ] All 7 agents defined with role/goal/backstory
- [ ] Tool Authorization Table matches code exactly
- [ ] Hierarchical Crew assembled, `memory=False`
- [ ] 6 delegation smoke tests run and results documented
- [ ] `test_tool_authorization.py` passing

## Commit Message
`feat(sprint8-day2): define Manager Agent and 6 specialized agents with tool allowlists`

## Documentation Updates
`02_Architecture.md`'s Agent Hierarchy table is the source this day implements against; no doc changes needed today beyond noting completion status in this file.

## End-of-Day Review
Delegation logic is proven to work in isolation, before any real tool does anything. This isolates "does the Manager route correctly" from "does the tool work correctly" as two independently debuggable concerns.

## Tomorrow Preview
Day 3 replaces every stub tool with a real implementation — `get_ats_analysis` actually calls `/api/internal/ats-score`, `optimize_resume_section` actually calls `/api/ai-improve`, etc. — reusing 100% of the existing deterministic/AI logic, per the Day 1 architecture decision.
