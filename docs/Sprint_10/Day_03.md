# Sprint 10 — Day 3

## Day Title
Interview Session Engine — Persistence and Candidate/Role/JD Context Assembly

## Objective
Introduce the `users/{uid}/interviewTrainerSessions/{sessionId}` Firestore collection, define the `InterviewTrainerSession` contract, and assemble full candidate context (resume, optional JD, attachments, role intelligence) into a persisted session record that survives refresh and can be resumed.

## Why
A 10–20 minute voice interview is materially more costly to lose than Sprint 9's short text exchange — this is the stated cause for reversing Sprint 9's no-persistence decision (`20_Decision_Log.md`). Persistence also makes the landing page's "Past Sessions" list and later report review possible, which is what distinguishes a *trainer* from a one-shot coach.

## Repository Evidence
- `frontend/lib/historyService.ts`, `profileService.ts` — existing client-side Firestore access patterns to follow.
- `frontend/lib/agentUsageService.ts` — existing **server-side** Firebase Admin write pattern (used for the rate-limit counter) — the closer precedent for trusted session writes.
- `agent-service/schemas/interview_session.py` — Sprint 9's `InterviewSessionState`; Sprint 10's `InterviewTrainerSession` is a superset, defined separately so Sprint 9's flow is untouched.
- `agent-service/crew/interview_manager.py` — existing context resolution (`resume_text`/`job_description`/attachment fallback) to reuse rather than reinvent.
- Firestore usage confirmed: `users/{uid}/...` subcollection convention already established by `agentUsage`.

## Existing Functionality
Resume/JD/attachment context resolution, Firebase auth, `agentUsage` collection, `ResumeContext`.

## New Functionality
`InterviewTrainerSession` schema (Python + TypeScript), `interviewTrainerSessions` collection, session create/read/update/list service, resume-session capability, Past Sessions list on the landing page.

## Architecture
Sessions are written server-side from the authenticated Next.js proxy (following `agentUsageService.ts`'s Admin-write precedent) so a client cannot forge session contents. The client holds a mirror for rendering. `uid` always comes from the verified token.

## Concepts
Session ownership by path (`users/{uid}/`) as structural authorization; superset-schema-in-a-new-file to avoid destabilizing a working Sprint 9 contract.

## Prerequisites
Day 2 complete (role intelligence available to store on the session).

## Dependencies
None new — Firebase Admin already present.

## Resources
`lib/agentUsageService.ts`, `lib/historyService.ts`, `13_Database_Guide.md`, `02_Architecture.md` state-scope table.

## Files to Inspect
- `frontend/lib/agentUsageService.ts`
- `frontend/lib/historyService.ts`
- `agent-service/crew/interview_manager.py` (context resolution helpers)
- Firestore security rules file (confirm the `users/{uid}/` ownership rule pattern before extending it)

## Files to Modify
- `frontend/types/agent.ts` — add `InterviewTrainerSession` and related record types
- `frontend/app/dashboard/interview-trainer/page.tsx` — render real Past Sessions

## Files to Create
- `agent-service/schemas/trainer_session.py`
- `frontend/lib/interviewTrainerSessionService.ts`
- `frontend/app/api/interview/session/route.ts` (create/update/list, all `verifyAuth`-gated)
- `agent-service/tests/test_trainer_session.py`
- `frontend/tests/interviewTrainerSessionService.test.ts`
- Firestore security rule addition for `interviewTrainerSessions`

## Architecture Impact
Second new Firestore collection in the project's history (after `agentUsage`). Deliberate, scope-minimised, and logged.

## Data Flow
```
Setup complete -> POST /api/interview/session { config, roleIntelligence }
  -> verifyAuth -> uid
  -> Admin write: users/{uid}/interviewTrainerSessions/{sessionId}  (status="setup")
  -> sessionId returned to client
Each turn -> PATCH with the new question/answer/feedback record (append-only)
Landing page -> GET list (most recent first, bounded page size)
Resume -> GET by sessionId; room rehydrates from the last persisted turn
```

## State Flow
| Field | Scope |
|---|---|
| Media streams, permission state, TTS queue | Component-scoped (never persisted) |
| Raw audio, camera frames | Transient (never persisted, never transmitted for video) |
| Current question, turn phase | Session-scoped (persisted) |
| Transcripts, feedback, derived signals, report | Persistent |

## Agent Responsibilities
None new.

## Service Responsibilities
`interviewTrainerSessionService.ts` owns all session reads/writes; nothing else touches the collection. `interview_manager.py` remains stateless and receives session data per request.

## Tool Responsibilities
No new tools. Context assembly reuses Sprint 9's existing resolution helpers.

## UI/UX Work
Past Sessions list with real data; empty state; "Resume session" affordance for `in_progress`/`paused` sessions.

## Voice/Audio Work
None.

## Camera/Visual Work
None.

## Security
`verifyAuth` on every session route; `uid` never from the request body; the `users/{uid}/` path plus rules make a guessed `sessionId` useless to another user (TEST AE). Session writes are Admin-side so contents can't be forged client-side — a meaningful improvement over Sprint 9's client-held state, whose tampering risk had to be explicitly accepted.

## Privacy
Schema explicitly contains no `audio_url`, `video_url`, or frame data. Transcripts are stored and are user-deletable; a delete affordance and retention note are required (completed Day 9).

## Cost Controls
Bounded page size on the list query; append-only updates rather than whole-document rewrites; session document size capped by the existing max-questions ceiling.

## Implementation Plan
1. Define `InterviewTrainerSession` (Pydantic, `extra="forbid"`) and its TypeScript mirror.
2. Write the Firestore security rule restricting access to the owning `uid`; verify by attempting a cross-uid read.
3. Build `/api/interview/session` (POST create, PATCH append, GET list/read), all `verifyAuth`-gated.
4. Build `interviewTrainerSessionService.ts`.
5. Store `RoleIntelligence` from Day 2 onto the session at creation.
6. Wire Past Sessions + Resume on the landing page.

## Testing
- `test_trainer_session.py`: schema round-trips; `extra="forbid"` rejects an injected `audio_url`; status transitions valid (`setup`→`in_progress`→`paused`→`in_progress`→`completed`), invalid jumps rejected.
- `interviewTrainerSessionService.test.ts`: 401 without token; a session created under uid A is not readable by uid B.

## Regression Testing
Confirm `agentUsage` rate limiting and all existing Firestore reads/writes are unaffected; confirm Sprint 9's interview flow (which uses no persistence) still works untouched.

## Manual Verification
Create a session, refresh the page mid-setup, confirm it appears in Past Sessions and can be resumed. With a second test account, attempt to read the first account's session ID directly and confirm denial.

## Expected Behaviour
Sessions survive refresh, are listable, resumable, and strictly owner-scoped.

## Failure Cases
Firestore write failure at session create → surface a clear error and do not enter the Interview Room with an unpersisted session. Write failure mid-session → keep the client mirror, warn that progress may not be saved, allow the interview to continue (don't destroy an in-progress interview over a transient write error).

## Debugging Guidance
Cross-user access test failing is a security-rule problem, not a route problem — check the rule before the code.

## Rollback Considerations
The collection is additive; rolling back means reverting the routes/service and leaving orphaned documents, which are harmless and owner-scoped. Note in the rollback plan that documents already created should be deleted rather than left indefinitely, since they contain transcripts.

## Checklist
- [ ] `InterviewTrainerSession` schema (both languages) with `extra="forbid"`
- [ ] No audio/video field in the schema
- [ ] Security rule restricts to owning uid; cross-uid read verified denied
- [ ] Session routes `verifyAuth`-gated; `uid` never from body
- [ ] Past Sessions + resume working
- [ ] Sprint 9 flow and `agentUsage` regression-verified

## Commit Message
`feat(sprint10-day3): persistent interview trainer sessions with owner-scoped access`

## Documentation Updates
`13_Database_Guide.md` gains the new collection's schema/ownership/retention entry; `02_Architecture.md` state table is the spec implemented.

## End-of-Day Review
Sessions are durable and safely owner-scoped, closing the "lose a 20-minute voice interview to a refresh" risk before voice is even built.

## Tomorrow Preview
Day 4 extends Sprint 9's `interview_manager.py` with training modes, the retry loop, pause/resume, and in-session interviewer memory.
