# Sprint 9 — Day 3

## Day Title
Interview Context Wiring — Resume, Job Description, and Attachment Integration

## Objective
Wire real candidate context (resume text, job description, and any uploaded attachment text already supported by Sprint 8's `ChatRequest.attachments`) into `interview_manager.start_session`, so a session begins with actual grounded context instead of Day 2's placeholder defaults. No question generation yet — today ensures the *right context* reaches the point where questions will be generated on Day 4.

## Why This Day Exists
The brief's anti-fabrication rule depends entirely on the interview tools actually receiving accurate, complete candidate context. Sprint 8's existing tools already accept `resume_text`/`job_description` parameters correctly — today's job is making sure `interview_manager.start_session` gathers and forwards that context the same way every other Sprint 8 route already does, not reinventing context-gathering from scratch.

## Repository Evidence / Current State
Confirmed: `agent-service/main.py`'s `/chat` handler already extracts `resume`/`resume_text`/`job_description`/`attachments` from the incoming `ChatRequest` before calling `process_manager_request_async` — this exact extraction logic is what every existing route (ATS, Optimizer, Cover Letter, Job Search) already relies on. `AttachmentContext` (in `types/agent.ts` and mirrored Python-side) already carries `extractedText` for uploaded documents (e.g., a pasted job description PDF) — confirmed via Sprint 8's `agentAttachments.test.ts`.

## Concepts
- Context assembly as an existing, proven pattern (not a new concern for Sprint 9) — today is integration, not invention.
- Distinguishing "job description supplied via `job_description` field" from "job description supplied as an uploaded attachment" — both must be honored, matching how the existing ATS/Optimizer tools already handle this dual path.

## Prerequisites
Day 2 complete: `InterviewSessionState` schema and `interview_manager.py` skeleton exist.

## Setup
No new dependencies.

## Resources
- `agent-service/main.py`'s existing `/chat` context-extraction logic
- `frontend/tests/agentAttachments.test.ts` (reference for expected attachment shape)

## Files to Inspect
- `agent-service/main.py`
- Existing attachment-handling logic wherever `AttachmentContext.extractedText` is consumed by another tool (e.g., how the ATS/Optimizer routes already fold attachment text into their prompts, if they do — confirm exact pattern before replicating it)

## Files to Modify
- `agent-service/crew/interview_manager.py` — `start_session` gains real parameters: `resume_text`, `job_description`, `attachments`
- `agent-service/main.py` — when Route 4 (Day 5) eventually calls `interview_manager.start_session`, it passes through the same context variables already extracted for every other route (no new extraction logic needed)

## Files to Create
- `agent-service/tests/test_interview_context_wiring.py`

## Architecture Impact
None structurally — this day proves the existing context-extraction pattern generalizes cleanly to the new interview_manager module, without adding a parallel context-gathering mechanism.

## Data Flow
```
main.py's existing extraction: resume_text, job_description, attachments  (UNCHANGED from Sprint 8)
  -> (Day 5 will call, but today just prepares the function signature:)
interview_manager.start_session(
    interview_type, target_role, difficulty,
    resume_text=resume_text,
    job_description=job_description or extracted_jd_from_attachments,
    attachment_texts=[a.extractedText for a in attachments]
) -> InterviewSessionState carrying a resolved context summary for use in Day 4's question generation
```

## Implementation Plan

### Step 1 — Confirm the Attachment-to-JD Fallback Pattern
Read how an existing route (e.g., ATS or Cover Letter) decides whether to use `job_description` or fall back to attachment text categorized as `job_description` (`AttachmentCategory === "job_description"`). Replicate this exact decision logic in `interview_manager.py` rather than inventing a new fallback order.

### Step 2 — Extend `start_session`
```python
def start_session(
    interview_type: str,
    target_role: str,
    difficulty: str,
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None,
    attachments: Optional[list[dict]] = None,
) -> InterviewSessionState:
    resolved_jd = job_description or _extract_jd_from_attachments(attachments)
    resolved_resume = resume_text or _extract_resume_from_attachments(attachments)
    session = InterviewSessionState(
        session_id=str(uuid.uuid4()),
        interview_type=interview_type,
        target_role=target_role,
        difficulty=difficulty,
    )
    # Context itself is not stored ON the session (it's re-sent by the client each turn,
    # per the Day 2 architecture decision) - start_session only validates it's usable.
    return session
```

### Step 3 — `_extract_jd_from_attachments` / `_extract_resume_from_attachments` Helpers
Small private helpers filtering `attachments` by `category` and concatenating `extractedText`, matching the existing pattern used elsewhere in the codebase (confirmed in Step 1) rather than a bespoke Sprint-9-only convention.

## Ready-to-Paste Antigravity Prompt
"Extend `interview_manager.start_session` in `agent-service/crew/interview_manager.py` to accept `resume_text`, `job_description`, and `attachments` parameters, falling back to attachment-extracted text when the direct fields are absent, using the exact same category-filtering pattern already used by [the existing route you find in Step 1] — do not invent a different fallback convention."

## Testing
- `test_interview_context_wiring.py`: `start_session` given only `job_description` uses it directly; given only a `job_description`-categorized attachment, correctly extracts and uses its text; given both, prefers the direct field (matching whatever precedence the existing pattern from Step 1 uses).

## Regression Testing
Confirm existing attachment-handling tests (`agentAttachments.test.ts` and its Python-side equivalent, if any) are unaffected — `interview_manager.py` reads attachment data, it does not modify how attachments are parsed/stored elsewhere.

## Manual Verification
Manually construct a request with a job-description attachment and no direct `job_description` field, call `start_session` with it, and confirm the resolved JD text is correct.

## Expected Behaviour
Interview sessions started with resume/JD supplied either directly or via attachment behave identically from the candidate's perspective.

## Failure Cases
Malformed or missing attachment text should not raise an unhandled exception — `start_session` should proceed with whatever context is actually available (even none) and let Day 4's question generation handle the "no context" case gracefully, exactly as `prepare_interview_questions` already does today for a fully absent resume/JD.

## Debugging Guidance
If resolved context seems wrong, first check `attachments[].category` values against what the frontend actually sends — a categorization mismatch (e.g., a resume attachment tagged as `document` instead of `resume`) is the most likely cause, not a bug in the extraction helper itself.

## Security Considerations
No new security surface — this reuses the existing, already-authenticated attachment pipeline; `interview_manager.py` never fetches attachment content itself, it only reads what `main.py` already extracted under the existing internal-JWT-authenticated request.

## Checklist
- [x] `start_session` accepts and correctly resolves resume/JD/attachment context
- [x] Fallback precedence matches the existing pattern used elsewhere in the codebase
- [x] `test_interview_context_wiring.py` passing
- [x] Existing attachment tests unaffected

## Commit Message
`feat(sprint9-day3): wire resume/JD/attachment context into interview session start`

## Documentation Updates
No new architecture decisions today — this day implements against Day 1's audit and Day 2's schema without introducing new design choices.

## End-of-Day Review
`start_session` can now resolve real candidate context from any of the paths the rest of HireLens already supports. Day 4 uses this resolved context to actually generate personalized questions.

## Tomorrow Preview
Day 4 extends `prepare_interview_questions` with `interview_type`/`difficulty` parameters and implements the difficulty-progression rule design (documented, not yet wired into live adaptive behavior — that's Day 5).
