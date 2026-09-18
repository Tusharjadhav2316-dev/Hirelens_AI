# Sprint 10 — Day 9

## Day Title
Interview Room UI, Trainer Artifacts, Final Report, and State Ownership

## Objective
Assemble the full Interview Room experience: the room layout with all voice/media state indicators, the 4 new artifact renderers (extending the Canvas union to 14 types), the final trainer report, session deletion, and an explicit state-ownership map that eliminates the concurrency risks identified in `26_Risks.md`.

## Why
Days 2–8 built capability in layers; today is where a candidate can actually sit down and do a complete, coherent voice interview from setup to report. The state-ownership work is what prevents the class of bug that voice inevitably invites — duplicate submissions, audio outliving a session, stale questions.

## Repository Evidence
- `frontend/components/agent/ArtifactRenderer.tsx` (verified): exhaustive `switch` over artifact types with a safe `default` that logs and renders nothing. Extending it is a compiler-enforced checklist.
- Sprint 9's `InterviewQuestionCard`/feedback/report renderers exist and remain in use for the in-Agent text flow; Sprint 10's trainer artifacts are separate types so Sprint 9's flow is untouched.
- `agent-service/tools/interview_tools.py` — `generate_interview_report` (Sprint 9) exists and is extended, not replaced.
- Day 3's session service provides persistence, listing, and resume.

## Existing Functionality
Artifact Canvas + renderer, Sprint 9 report tool, Day 2–8 capability, session persistence.

## New Functionality
Interview Room page, 4 artifact renderers (`interview_setup_summary`, `trainer_question_card`, `trainer_answer_feedback`, `trainer_interview_report`), extended report generation including delivery/visual sections, session delete, state-ownership map, resume-from-persisted-turn.

## Architecture
The Room owns a single turn-state machine (Day 6) that every media hook subscribes to. Artifacts render trainer state; they never own media.

## Concepts
Single source of truth per state field; artifacts as presentation over a state machine; conditional report sections based on what was actually captured.

## Prerequisites
Days 2–8 complete.

## Dependencies
None new.

## Resources
`24_UI_Wireframes.md` Sprint 10 section (Room, states, feedback, report), `02_Architecture.md` report structure and artifact list.

## Files to Inspect
- `frontend/components/agent/ArtifactRenderer.tsx`
- `frontend/components/agent/artifacts/` (existing renderers for styling conventions)
- `agent-service/tools/interview_tools.py` (`generate_interview_report`)

## Files to Modify
- `frontend/components/agent/ArtifactRenderer.tsx` — add 4 cases (union → 14 types)
- `frontend/types/agent.ts` — add the 4 artifact types
- `agent-service/tools/interview_tools.py` — `generate_interview_report` accepts delivery + visual signals; omits the visual section when camera was off; retains `extra="forbid"` (no numeric score)
- `agent-service/schemas/` — extend the trainer report schema with communication/visual sections

## Files to Create
- `frontend/app/dashboard/interview-trainer/room/page.tsx`
- `frontend/components/interview-trainer/InterviewRoom.tsx`
- `frontend/components/interview-trainer/InterviewProgressPanel.tsx`
- `frontend/components/agent/artifacts/InterviewSetupSummary.tsx`
- `frontend/components/agent/artifacts/TrainerQuestionCard.tsx`
- `frontend/components/agent/artifacts/TrainerAnswerFeedback.tsx`
- `frontend/components/agent/artifacts/TrainerInterviewReport.tsx`
- `frontend/tests/trainerArtifacts.test.ts`
- `frontend/tests/interviewRoomStateOwnership.test.ts`
- `agent-service/tests/test_trainer_report_no_score.py`

## Architecture Impact
Canvas union grows to 14 types. The Room is the first HireLens page that owns long-lived media streams.

## Data Flow
```
Room mounts with sessionId
  -> GET session (Day 3) -> rehydrate turn state from the last persisted turn
  -> turn state AI_THINKING -> question artifact -> TTS speak (Day 6)
  -> queue drains -> LISTENING -> mic opens (Day 5) + camera sampling if enabled (Day 8)
  -> [I'm Done] -> PROCESSING -> STT -> computeSpeechSignals + computeVisualSignals
  -> POST /api/agent/chat with transcript + signals + trainer_session
  -> engine (Day 4) -> feedback/follow-up/advance -> artifact
  -> PATCH session (append turn)
  -> loop until complete -> generate_interview_report -> trainer_interview_report artifact
```

## State Flow — Explicit Ownership Map
| State | Owner | Notes |
|---|---|---|
| Turn phase | `useInterviewTurnState` (Room) | Single authority; media hooks subscribe, never set it directly |
| Mic stream/permission | `useInterviewMicrophone` | Released on any turn exit to PAUSED/ended |
| TTS queue + `Audio` ref | `useInterviewerVoice` | Checks session status before and during playback |
| Camera stream + samples | `useInterviewCamera` | Samples only while LISTENING |
| Current question / index / counters | Persisted session (server) | Client mirror is read-only for rendering |
| Transcripts / feedback / signals | Persisted session (server) | Append-only |
| Submit guard | `useInterviewMicrophone` (ported JARVIS transition lock) | Prevents duplicate answer submission |

## Agent Responsibilities
None new.

## Service Responsibilities
Report generation extended server-side; session service owns all persistence; Room owns orchestration only.

## Tool Responsibilities
`generate_interview_report` must: use qualitative labels only; include observed delivery numbers; include the visual section **only** if camera was enabled; state explicitly where evidence was insufficient; carry the not-a-measurement / not-a-hiring-prediction note; never emit a numeric score (`extra="forbid"`).

## UI/UX Work
The bulk of today: Room layout (desktop/tablet/mobile per wireframes), all voice/media state indicators, progress panel, `[I'm Done]`/`[Type instead]`/`[Pause]`/`[End Interview]`, feedback card with delivery block, report with conditional sections and continuation actions, session delete affordance with a clear confirmation.

## Voice/Audio Work
Integration and teardown correctness: playback must stop on End Interview, Pause, navigation, and unmount.

## Camera/Visual Work
Preview tile integration; sampling gated to LISTENING; indicator always visible while active.

## Security
Room loads only sessions owned by the authenticated user (Day 3 rules). Report generation receives only that session's data. No secrets or internal identifiers in any artifact payload; no chain-of-thought in any event or artifact.

## Privacy
Session delete implemented today (removes the Firestore document and its transcripts). Retention note surfaced in the UI. Report omits the visual section entirely when camera was off — no "not measured" placeholder, which would imply something was attempted.

## Cost Controls
Report generated once per session (guard against double-generation on re-render — a real risk with React effects). Continuation actions start a *new* session rather than silently extending a completed one past its ceilings.

## Implementation Plan
1. Build the Room shell subscribing to turn state; wire Day 5/6/8 hooks as subscribers.
2. Add the 4 artifact types and renderers; extend the switch (compiler will enforce exhaustiveness).
3. Extend the report tool/schema with communication and conditional visual sections.
4. Implement report-generation idempotency (generate only on the `in_progress → completed` transition, never on re-render).
5. Implement rehydrate-on-mount from the last persisted turn.
6. Implement Pause (release mic/camera, persist status) and End Interview (cancel TTS, release media, mark completed or abandoned).
7. Implement session delete with confirmation.
8. Build responsive layouts per wireframes.

## Testing
- `trainerArtifacts.test.ts`: all 4 renderers render valid data; malformed data fails safe; unknown type still renders nothing; union exhaustiveness holds at 14.
- `interviewRoomStateOwnership.test.ts`: duplicate `[I'm Done]` submits once; TTS cannot play after End Interview; question cannot advance while PROCESSING; report generated exactly once across re-renders.
- `test_trainer_report_no_score.py`: injected numeric score rejected; visual section absent when `camera_enabled: false`.

## Regression Testing
Full Sprint 8/9 suites, including Sprint 9's own artifact tests (the union extension must not disturb them), plus `npm run build` for exhaustiveness errors.

## Manual Verification
Complete an end-to-end voice interview with camera on, then one with camera off; confirm the report differs only by the visual section. Refresh mid-interview and confirm resume works. Press End Interview mid-playback and confirm audio stops and media indicators clear.

## Expected Behaviour
A complete, coherent trainer experience from setup to report, with no duplicate or orphaned state.

## Failure Cases
Report generation failure → session still marked completed, with an explicit "report couldn't be generated, here are your per-question notes" fallback assembled from already-persisted feedback (no fabricated summary). Session not found/not owned → clear error, redirect to landing.

## Debugging Guidance
Duplicate feedback or double reports almost always trace to a React effect firing twice — check the `in_progress → completed` transition guard before suspecting the engine. Audio after session end means a missing `cancel()` in a teardown path.

## Rollback Considerations
Removing the Room page and the 4 renderers leaves persisted sessions intact but unviewable; if rolled back, either restore a minimal read-only report view or delete the orphaned session documents, since they contain transcripts.

## Checklist
- [ ] Room built per wireframes across desktop/tablet/mobile
- [ ] 4 artifact renderers added; union exhaustive at 14; malformed data fails safe
- [ ] State-ownership map implemented; duplicate submit impossible
- [ ] TTS cannot outlive the session
- [ ] Report generated exactly once; visual section conditional
- [ ] No numeric score anywhere in the report
- [ ] Resume-from-refresh works
- [ ] Session delete works; media released on every exit path
- [ ] Sprint 9 artifacts and flow regression-verified

## Commit Message
`feat(sprint10-day9): Interview Room UI, trainer artifacts, final report, explicit state ownership`

## Documentation Updates
`24_UI_Wireframes.md` and `02_Architecture.md` report structure are implemented today.

## End-of-Day Review
The Interview Trainer is a complete product experience. Everything remaining is verification.

## Tomorrow Preview
Day 10 runs the full TEST A–AJ matrix, security/privacy/performance verification, full regression, and Sprint close-out.
