# Sprint 8 — Day 3

## Day Title
Secure HireLens Tools — Resume, ATS, and Optimizer Integration

## Objective
Replace Day 2's stub tools with real implementations for the resume/ATS/optimizer/cover-letter surface: `get_resume`, `propose_resume_change`, `get_ats_analysis` (backed by a new `/api/internal/ats-score` endpoint wrapping `atsEngine.ts`/`atsAnalyzer.ts`), `optimize_resume_section` (calling the existing `/api/ai-improve`), and `generate_cover_letter` (calling the existing `/api/cover-letter`). Every tool call that touches user data must carry the authenticated `uid` and must be independently input-validated.

## Why This Day Exists
This is the day the architecture's central integrity promise gets built: the agent must never become a second, divergent implementation of scoring or optimization logic. Everything here is "call the existing thing," never "reimplement the existing thing."

## Repository Evidence / Current State
- `frontend/lib/atsEngine.ts` and `atsAnalyzer.ts` contain the deterministic scoring logic (`analyzeResumeQuality`, `analyzeResumeMatch`) already used by `ATSScorePanel.tsx` client-side — confirmed pure, synchronous, no I/O, safe to call from a new server route.
- `frontend/lib/jdMatcher.ts`'s `analyzeJobMatch` is likewise pure/deterministic — confirmed via inspection, used by `app/dashboard/job-matcher/page.tsx`.
- `frontend/app/api/ai-improve/route.ts` already accepts `{section, content, mode, jobDescription?}` and calls OpenRouter with mode-specific prompts from `promptTemplates.ts` — confirmed reusable as-is, requires only an internal-JWT-aware auth check added alongside its existing Firebase-token check (see Step 3).
- `frontend/app/api/cover-letter/route.ts` already accepts `{action, resumeText, jobTitle, companyName, tone, jobDescription?}` — confirmed reusable as-is.

## Concepts
- Wrapping a pure TypeScript function in an HTTP endpoint so a second-language caller can invoke it without duplicating its logic.
- Dual-auth routes: an endpoint that must accept both a real end-user Firebase token (existing client callers, if any) and the new internal JWT (Python caller) — today's internal endpoints accept *only* the internal JWT, since they have no existing client caller to preserve.

## Prerequisites
Day 2 complete: Crew delegates correctly to stubbed tools.

## Setup
No new dependencies.

## Resources
- `frontend/lib/atsAnalyzer.ts`, `frontend/lib/atsEngine.ts`, `frontend/lib/jdMatcher.ts`
- `frontend/app/api/ai-improve/route.ts`, `frontend/app/api/cover-letter/route.ts` (both read-only reference today — not modified beyond the auth-check addition in Step 3)

## Files to Inspect
- `frontend/lib/atsAnalyzer.ts`
- `frontend/lib/jdMatcher.ts`
- `frontend/app/api/ai-improve/route.ts`
- `frontend/app/api/cover-letter/route.ts`

## Files to Modify
- `frontend/app/api/ai-improve/route.ts` — accept `X-Internal-Auth` as an alternate valid auth method (Firebase token OR internal JWT), unchanged behavior otherwise
- `frontend/app/api/cover-letter/route.ts` — same

## Files to Create
- `frontend/app/api/internal/ats-score/route.ts`
- `frontend/app/api/internal/jd-match/route.ts`
- `agent-service/tools/resume_tools.py`
- `agent-service/tools/ats_tools.py`
- `agent-service/tools/optimizer_tools.py`
- `agent-service/tools/cover_letter_tools.py`
- `agent-service/tests/test_ats_tool_integration.py`

## Architecture Impact
Introduces the "tool calls back into Next.js" pattern that every remaining tool (Day 4's job search and interview tools follow a variant of it) is built on. This is the day the two-language boundary is proven safe to call across repeatedly, not just once (Day 1's proof-of-life).

## Data Flow
```
ATS Agent -> get_ats_analysis(resume, jd?)
  -> httpx.post(NEXT_INTERNAL_URL + "/api/internal/ats-score",
                headers={"X-Internal-Auth": <same JWT this request arrived with, or a fresh one>},
                json={"resume": resume, "jobDescription": jd})
  -> Next.js route verifies X-Internal-Auth, calls analyzeResumeQuality()/analyzeResumeMatch() directly (no network hop, in-process)
  -> returns ATSResult JSON, unchanged shape from what ATSScorePanel.tsx already renders
  -> Python returns this JSON verbatim as the tool's output (no reshaping, no recomputation)
```

## Implementation Plan

### Step 1 — `frontend/app/api/internal/ats-score/route.ts`
```typescript
export async function POST(req: Request) {
  const uid = verifyInternalJwt(req); // new helper, mirrors verifyAuth.ts shape
  const { resume, jobDescription } = await req.json();
  const result = jobDescription
    ? analyzeResumeMatch(resume, jobDescription)
    : analyzeResumeQuality(resume);
  return Response.json(result);
}
```
Note `uid` is extracted and available for logging/rate-limit purposes but is not otherwise needed here, since `atsEngine.ts` operates purely on the resume payload it's given — no per-user database lookup occurs in this call, consistent with the Day 1 "resume is a request-scoped payload" decision.

### Step 2 — `frontend/app/api/internal/jd-match/route.ts`
Same shape, wrapping `analyzeJobMatch(resume, jobDescription)` from `jdMatcher.ts`.

### Step 3 — Dual-auth on existing routes
`ai-improve/route.ts` and `cover-letter/route.ts` gain a branch: if `X-Internal-Auth` is present, verify it as an internal JWT and proceed; otherwise, fall back to the existing Firebase-token check unchanged. This preserves every existing caller's behavior exactly while allowing the agent-service to call the same endpoints.

### Step 4 — Python tool wrappers
```python
async def get_ats_analysis(resume: ResumeSnapshot, job_description: str | None = None) -> ATSResult:
    resp = await client.post(f"{NEXT_INTERNAL_URL}/api/internal/ats-score",
                              headers={"X-Internal-Auth": current_jwt()},
                              json={"resume": resume.model_dump(), "jobDescription": job_description})
    resp.raise_for_status()
    return ATSResult.model_validate(resp.json())
```
`optimize_resume_section` and `generate_cover_letter` follow the same pattern against `/api/ai-improve` and `/api/cover-letter` respectively, using each route's existing request/response shape unchanged.

### Step 5 — `propose_resume_change`
Pure Python function, no network call — takes `(section, item_id, before, after, rationale)` and returns a `ResumeDiffArtifact`. This is the function the Resume Agent calls after receiving optimized text from the Optimizer Agent, and it is the only place a "resume change" object is ever constructed — it never touches Firestore or the client's `ResumeContext`.

## Ready-to-Paste Antigravity Prompt
"Create `app/api/internal/ats-score/route.ts` that accepts `{resume, jobDescription?}`, verifies the `X-Internal-Auth` header as an internal JWT (mirror the shape of `verifyAuth.ts` but validate against `INTERNAL_AGENT_JWT_SECRET`), calls the existing `analyzeResumeQuality`/`analyzeResumeMatch` from `lib/atsAnalyzer.ts` unchanged, and returns the result as JSON. Do not modify `atsAnalyzer.ts` or `atsEngine.ts`."

## Testing
- `test_ats_tool_integration.py`: call `get_ats_analysis` against a fixture resume, assert the returned score matches a direct call to `/api/internal/ats-score` for the identical payload — this is the literal "no drift" test from `26_Risks.md`.
- Unit test on the internal-JWT branch of `ai-improve/route.ts` and `cover-letter/route.ts`: existing Firebase-token callers still work; new internal-JWT callers also work; requests with neither are rejected.

## Regression Testing
Run the existing `optimizerSafety.test.ts` suite unmodified — confirm it still passes, proving the internal-JWT branch didn't change existing Firebase-token behavior.

## Manual Verification
From a Python REPL or test script, call each of the four new/wrapped tools against a real local Next.js dev server and confirm real ATS scores/optimized text come back — not stub data.

## Expected Behaviour
Every number and every piece of optimized/generated text an agent tool returns today is byte-for-byte the same as what the existing UI would show for the identical input.

## Failure Cases
- Next.js dev server not running → tool call fails; agent must surface this as an `error` event, not silently proceed with fabricated data (tested in Day 10's safety suite).
- Malformed resume payload → internal endpoint returns 400; Python tool propagates a clear validation error, not a stack trace to the user.

## Debugging Guidance
If a Python-computed ATS number ever differs from the UI's number for the same resume, treat this as a Priority-Critical bug per `26_Risks.md` — it means the internal endpoint's payload shape doesn't exactly match what the client sends, not a genuine scoring difference (the underlying function is identical).

## Security Considerations
Internal endpoints under `/api/internal/*` must reject any request without a valid internal JWT — confirmed via automated test today, not just Day 1's general boundary test.

## Checklist
- [ ] `/api/internal/ats-score` and `/api/internal/jd-match` created and tested
- [ ] `ai-improve` and `cover-letter` routes accept internal JWT without breaking existing auth
- [ ] All 5 tools (`get_resume`, `propose_resume_change`, `get_ats_analysis`, `optimize_resume_section`, `generate_cover_letter`) working against real backends
- [ ] `test_ats_tool_integration.py` passing with exact-match assertion
- [ ] Existing `optimizerSafety.test.ts` still passing

## Commit Message
`feat(sprint8-day3): wire ATS, optimizer, and cover-letter tools to existing deterministic/AI backends`

## Documentation Updates
`02_Architecture.md`'s "New Internal Next.js Endpoints" table documents these two new routes.

## End-of-Day Review
Five of nine tools are now real. The two most safety-critical ones (ATS, resume mutation) are provably non-divergent from the existing UI.

## Tomorrow Preview
Day 4 builds the two genuinely new capabilities — Job Search (behind a provider abstraction, no vendor committed) and Interview Prep — plus wires the last remaining tool, `analyze_skill_gap`.
