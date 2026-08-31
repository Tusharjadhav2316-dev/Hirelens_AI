# Sprint 8 — Day 4

## Day Title
New Capability Integration — Job Search, Skill Gap, and Interview Prep

## Objective
Build the three tools that back genuinely new HireLens capabilities (per the Sprint 8 Scope Directive): `search_jobs` (behind a `JobProviderAdapter`, shipping with a `NullJobProvider`), `analyze_skill_gap` (wrapping `/api/internal/jd-match` from Day 3), and `prepare_interview_questions`/`evaluate_interview_answer` (direct OpenRouter calls, no existing HireLens backend to reuse since none existed before this sprint).

## Why This Day Exists
These are the only tools in Sprint 8 with no pre-existing HireLens implementation to call back into — everything else this sprint connects existing features, but Job Search and Interview Prep are new. This day is where the brief's "do not assume a specific external job API is already available... design behind a provider abstraction" instruction gets implemented concretely, and where the same hallucination-prevention discipline already proven in the Career Coach (Sprint 6) gets applied to two brand-new surfaces.

## Repository Evidence / Current State
- Confirmed (Sprint 1 audit + direct inspection): `app/dashboard/job-matcher/page.tsx` performs single-JD-vs-resume matching via `jdMatcher.ts` — it has no concept of a job listing, employer, or search query, and calls no external API. There is no job search capability of any kind anywhere in the current codebase.
- Confirmed: no interview-related route, component, or type exists anywhere in the repository.
- Confirmed: no external job-board API key exists in any `.env.example` or `06_API_Keys_and_Setup.md` entry prior to Sprint 8.

## Concepts
- Provider abstraction / adapter pattern — isolating "how we search for jobs" from "what specific vendor we search with."
- Null Object pattern (`NullJobProvider`) as an honest "not configured" state, vs. an empty list that an agent might paper over with fabricated content.
- Grounded generation — interview questions/feedback must be traceable to resume/JD content actually present, mirroring the Career Coach's `HALLUCINATION_GUARDRAIL` pattern.

## Prerequisites
Day 3 complete: ATS/optimizer/cover-letter tools working against real backends.

## Setup
No new external dependencies for the `NullJobProvider` path. If/when a real provider is selected later, its SDK/HTTP client is added at that time (see `20_Decision_Log.md`).

## Resources
- `frontend/lib/jdMatcher.ts` — reused via the Day 3 `/api/internal/jd-match` endpoint for `analyze_skill_gap`.
- `frontend/lib/promptTemplates.ts`'s `HALLUCINATION_GUARDRAIL` constant — reference pattern for interview tool prompts.

## Files to Inspect
- `frontend/lib/jdMatcher.ts` (types: `JobMatchResult` or equivalent, to shape `SkillGapResult`)
- `frontend/lib/promptTemplates.ts` (guardrail phrasing conventions)

## Files to Create
- `agent-service/tools/job_search_tools.py`
- `agent-service/tools/providers/base.py` (`JobProviderAdapter` Protocol)
- `agent-service/tools/providers/null_provider.py`
- `agent-service/tools/skill_gap_tools.py`
- `agent-service/tools/interview_tools.py`
- `agent-service/tests/test_job_search_tool.py`
- `agent-service/tests/test_interview_tools.py`

## Architecture Impact
Establishes the pattern for how HireLens will eventually integrate a real job-listings vendor without any agent-layer code changing — swapping `NullJobProvider` for `RealProvider` behind the same `JobProviderAdapter` interface is a config + one new adapter class, not an architecture change.

## Data Flow
```
Job Search Agent -> search_jobs(query)
  -> JobProviderAdapter.search(query)   [NullJobProvider today]
  -> NullJobProvider returns JobSearchResult(status="not_configured", listings=[])
  -> Job Search Agent MUST relay status="not_configured" truthfully in its response
     (system prompt explicitly forbids inventing listings to fill the gap)

Job Search Agent / Career Agent -> analyze_skill_gap(job_description)
  -> calls /api/internal/jd-match (Day 3 endpoint, wraps jdMatcher.ts)
  -> returns SkillGapResult{matched_skills, missing_skills, evidence}
  -> agent explanation is grounded in this result only

Interview Coach Agent -> prepare_interview_questions(resume, jd?, focus?)
  -> direct OpenRouter call with HALLUCINATION_GUARDRAIL-style prompt
  -> evaluate_interview_answer(question, answer) -> same, feedback only, no verdict
```

## Implementation Plan

### Step 1 — `JobProviderAdapter` Protocol
```python
class JobSearchQuery(BaseModel):
    keywords: str
    location: str | None = None
    remote_only: bool = False

class NormalizedJobListing(BaseModel):
    title: str
    company: str
    location: str
    source: str
    url: str
    relevant_skills: list[str] = []

class JobSearchResult(BaseModel):
    status: Literal["ok", "not_configured", "provider_error"]
    listings: list[NormalizedJobListing] = []
    message: str | None = None

class JobProviderAdapter(Protocol):
    async def search(self, query: JobSearchQuery) -> JobSearchResult: ...
```

### Step 2 — `NullJobProvider`
```python
class NullJobProvider:
    async def search(self, query: JobSearchQuery) -> JobSearchResult:
        return JobSearchResult(
            status="not_configured",
            message="Job search isn't connected to a live job board yet.",
        )
```
This is the *only* provider registered in Sprint 8. Wiring a real provider is explicitly out of today's scope — see `20_Decision_Log.md`.

### Step 3 — `search_jobs` tool + Job Search Agent prompt constraint
The Job Search Agent's backstory (Day 2) already states it must relay `not_configured` truthfully — today's test (`test_job_search_tool.py`) asserts the tool itself never silently substitutes fabricated listings for a `not_configured` result, which is the layer beneath the prompt-level guardrail (defense in depth).

### Step 4 — `analyze_skill_gap`
```python
async def analyze_skill_gap(resume: ResumeSnapshot, job_description: str) -> SkillGapResult:
    resp = await client.post(f"{NEXT_INTERNAL_URL}/api/internal/jd-match",
                              headers={"X-Internal-Auth": current_jwt()},
                              json={"resume": resume.model_dump(), "jobDescription": job_description})
    resp.raise_for_status()
    return SkillGapResult.model_validate(resp.json())
```

### Step 5 — Interview tools
```python
INTERVIEW_GUARDRAIL = (
    "Base every question and every piece of feedback ONLY on skills, experience, and "
    "projects explicitly present in the provided resume and job description. Never imply "
    "the candidate has experience or skills not stated in their resume. Never issue a "
    "pass/fail verdict - feedback addresses clarity, structure, and specificity only."
)

async def prepare_interview_questions(resume: ResumeSnapshot, job_description: str | None, focus: str | None) -> list[InterviewQuestion]:
    # direct OpenRouter call, system prompt = INTERVIEW_GUARDRAIL + resume/jd context blocks
    ...

async def evaluate_interview_answer(question: str, answer: str, resume: ResumeSnapshot) -> InterviewFeedback:
    # direct OpenRouter call, same guardrail, no verdict field in the output schema
    ...
```

## Ready-to-Paste Antigravity Prompt
"Create `agent-service/tools/providers/base.py` defining a `JobProviderAdapter` Protocol with an async `search(query: JobSearchQuery) -> JobSearchResult` method, and `null_provider.py` implementing it as a `NullJobProvider` that always returns `status='not_configured'` with an explanatory message and an empty listings array. Wire `search_jobs` in `job_search_tools.py` to call whichever provider is configured (default: `NullJobProvider`), and ensure the function never fabricates a listing when the provider returns `not_configured`."

## Testing
- `test_job_search_tool.py`: `NullJobProvider` returns `status="not_configured"`; `search_jobs` tool output for that status contains zero listings, always.
- `test_interview_tools.py`: assert the guardrail text is present in the constructed system prompt for both interview tools (mirrors `careerCoachSafety.test.ts`'s "assert guardrail phrasing present" pattern, not an LLM-output assertion).
- Manual: run `prepare_interview_questions` against a fixture resume missing a JD-required skill; confirm the generated questions don't presuppose that skill.

## Regression Testing
No existing files modified today except reading `jdMatcher.ts` (unchanged) via the Day 3 endpoint — full existing suite still passes.

## Manual Verification
1. Ask the (still non-streaming, Day 6 wires streaming) Crew "find me React jobs" → confirm the response clearly states job search isn't configured yet, with no invented company names.
2. Ask for interview questions for a role requiring a skill absent from a test resume → confirm no question implies the candidate has that skill.

## Expected Behaviour
Skill gap analysis numbers/lists match what `/api/internal/jd-match` returns exactly. Job search always honestly reports its unconfigured state. Interview questions are grounded and non-presumptive.

## Failure Cases
- A future real provider integration returns malformed data → `JobSearchResult` Pydantic validation should reject it before it reaches the agent, surfacing `provider_error` status rather than a crash or fabricated fallback.
- OpenRouter call for interview tools times out → propagate as a structured error, not a partial/garbled question list.

## Debugging Guidance
If the Job Search Agent ever states a specific company/job title in a "not configured" scenario, that is a guardrail failure — the tool-level test in Step 3 exists specifically to catch this class of bug before it reaches the prompt layer.

## Security Considerations
No external network calls beyond OpenRouter and the existing Next.js internal endpoints happen today — the `NullJobProvider` makes no outbound requests at all.

## Checklist
- [ ] `JobProviderAdapter` interface + `NullJobProvider` implemented
- [ ] `search_jobs` never fabricates listings when unconfigured
- [ ] `analyze_skill_gap` wired to `/api/internal/jd-match`
- [ ] Interview tools include and test for the grounding guardrail
- [ ] All new tests passing; existing suite unaffected

## Commit Message
`feat(sprint8-day4): job search provider abstraction, skill gap tool, interview prep tools`

## Documentation Updates
`20_Decision_Log.md`'s "Job Search ships behind a provider abstraction" ADR and `26_Risks.md`'s corresponding risk entry are the authoritative record of today's design; no further doc changes needed.

## End-of-Day Review
All 9 tools from the architecture doc now exist with real (or honestly-null) implementations. Every non-negotiable guardrail from the brief (ATS, resume mutation, job listings, interview grounding) now has both a prompt-level and a code-level enforcement point.

## Tomorrow Preview
Day 5 builds the Manager's multi-step workflow sequencing (e.g., the "help me apply to this job" chain: Resume → ATS → Job → Skill Gap → Optimizer → Cover Letter) as Manager-orchestrated delegation, not a new dedicated agent.
