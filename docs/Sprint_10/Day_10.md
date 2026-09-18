# Sprint 10 — Day 10

## Day Title
Full Integration, Security, Privacy, Performance, Testing, Regression, and Sprint Close-Out

## Objective
Run and pass the complete Sprint 10 test matrix (automated suites plus manual TEST A–AJ), verify every security/privacy/cost guarantee against the final code, measure voice latency, confirm zero regressions across Sprints 1–9, and close out Sprint 10 from **actually verified results** rather than from this plan's intentions.

## Why
Same discipline Sprints 8–9 established, with higher stakes: Sprint 10 introduces media capture, a paid third-party API, a new persistent collection holding transcripts, and the first vision dependency. Each is a category of risk that per-day verification alone doesn't cover. Sprint 9's Day 1 also proved that close-out text written from intentions rather than verification propagates errors into the next sprint — this day exists partly to not repeat that.

## Repository Evidence
By end of Day 9: dedicated Trainer route tree, `analyze_role` + `RoleIntelligence`, `interviewTrainerSessions` collection, extended `interview_manager.py` (modes/retry/pause/memory), mic capture + STT route + VAD assist, TTS route + playback queue + turn state, deterministic `SpeechSignals`, optional camera + `VisualSignals`, Interview Room + 4 artifacts (union at 14), final report. Agents still 7; streaming event types still 9.

## Existing Functionality
All of Sprints 1–9, which today's regression pass must prove untouched.

## New Functionality
None — verification only. No feature work on Day 10.

## Architecture
Unchanged. Today validates.

## Concepts
Whole-system verification vs. per-day unit checks; verified-outcome close-out writing.

## Prerequisites
Days 1–9 complete.

## Dependencies
None new. Requires a provisioned `SPEECH_PROVIDER_API_KEY` for voice QA; if unavailable, voice tests run against `NullSpeechProvider` and the voice-dependent manual tests are explicitly recorded as **blocked**, not silently marked passed.

## Resources
`08_Testing_Guide.md` Sprint 10 matrix and TEST A–AJ; `26_Risks.md` Sprint 10 risks; `16_JARVIS_Reuse_Analysis.md` §5 (the JARVIS defects that must be confirmed corrected).

## Files to Inspect
Everything created or modified in Days 2–9.

## Files to Modify
- `01_Master_Roadmap.md` — Sprint 10 status + actual outcome, written from verified results
- `20_Decision_Log.md` — any implementation-time deltas from this plan

## Files to Create
- `agent-service/tests/test_sprint10_full_regression.py`
- `frontend/tests/sprint10Regression.test.ts`

## Architecture Impact
None.

## Data Flow
Exercises every flow documented in `02_Architecture.md`'s Sprint 10 section end-to-end.

## State Flow
Verifies the Day 9 state-ownership map holds under real concurrency (rapid submits, mid-playback teardown, refresh mid-turn).

## Agent Responsibilities
Verify count is still **7** and no new `Agent` object was added anywhere.

## Service Responsibilities
Verify `interview_manager.py` is the only interview engine (no parallel trainer engine crept in) and that voice routes are the only new backend surface.

## Tool Responsibilities
Verify all interview tools share `INTERVIEW_GUARDRAIL` and that all signal/report schemas retain `extra="forbid"`.

## UI/UX Work
Verification across desktop/tablet/mobile, including the mobile full-width `[I'm Done]` control and collapsed camera thumbnail.

## Voice/Audio Work
Latency measurement (targets below); failure-path verification (denial, disconnect, timeout, empty transcript, autoplay block).

## Camera/Visual Work
Verify frames never leave the browser (inspect network traffic during an active camera session — this is a direct, checkable claim), and that OS indicators clear on every exit path.

## Security
| Guarantee | Verification |
|---|---|
| Voice routes authenticated | `interviewSttRoute.test.ts` / `interviewTtsRoute.test.ts` 401 cases — confirms JARVIS's no-auth defect was corrected |
| Input caps enforced | Oversized audio / over-length TTS text rejected |
| No cross-user session access | TEST AE with two accounts; security-rule denial |
| Transcripts treated as data | `test_transcript_injection.py` + TEST AH |
| Resume/JD injection | TEST AF / AG |
| No secrets or chain-of-thought exposed | Review every artifact payload and event emitted during a full session |

## Privacy
| Guarantee | Verification |
|---|---|
| Camera frames never transmitted | Network inspection during active camera session (no image/video payloads) |
| Raw audio never persisted | Confirm no storage write in the STT path; confirm no audio in Firestore |
| No audio/video in logs | Review server logs after a full voice session |
| Session deletable | Delete a session; confirm document and transcripts are gone |
| Visual section omitted when camera off | TEST AD |

## Cost Controls
Verify simultaneously active: 30-min session cap, 15-question cap, 1 follow-up/question, 1 retry/question, 3-min recording cap, TTS character cap, per-session STT/TTS call caps, daily `agentUsage` counter. Confirm an empty recording spends no STT call and a skipped question aborts in-flight TTS requests.

## Performance
Measure and record (targets, not guarantees): time from `[I'm Done]` to transcript; transcript to first TTS audio; total `[I'm Done]` to next question audible. Target for the full turnaround is under ~6s on a typical connection. If exceeded, record the measurement and add a `25_Backlog.md` item (e.g. streaming STT) rather than optimizing reactively on the last day of the sprint.

## Implementation Plan
1. Run full automated suites: `cd agent-service && pytest -v`; `cd frontend && npm test && npm run build`. All Sprint 8/9 suites must pass **unchanged**.
2. Execute manual TEST A–AJ (36 scenarios), recording pass/fail/blocked with a one-line note each.
3. Run the security table above.
4. Run the privacy table above, including live network inspection for camera frames.
5. Verify cost ceilings are all simultaneously active.
6. Measure the three latency figures.
7. Full regression pass over every pre-Sprint-10 feature (table below).
8. Write the close-out from verified results only.

### Regression Table
| Feature | Verification |
|---|---|
| All 7 agent routes (ATS, Optimize, Cover Letter, Job Search, Skill Gap, conversational, Sprint 9 interview 4a/4b/4c) | Behave identically to Sprint 9 |
| Sprint 9 in-Agent text interview | Full text mock interview still completes with its own report |
| 10 pre-existing artifact renderers | Unaffected by the union extension to 14 |
| Apply/Reject resume diff flow | Unaffected |
| `agentUsage` rate limiting | Still enforced; voice turns correctly counted |
| Resume Builder, ATS Analyzer, Optimizer, Cover Letter, Career Coach, Job Matcher, History | Unaffected |
| Firebase auth, existing Firestore collections | Unaffected |
| Streaming event types | Still exactly 9 |

## Testing
Today is the testing day — see Implementation Plan.

## Regression Testing
See Regression Table above.

## Manual Verification
TEST A–AJ in full. Voice-dependent tests (T, U, W, X) require a provisioned provider key; if absent, mark **blocked** and note that Sprint 10 cannot be closed as complete for voice until they run.

## Expected Behaviour
All automated tests pass; all 36 manual scenarios pass (or are explicitly recorded as blocked on provider provisioning); every security, privacy, and cost guarantee verified; zero regressions.

## Failure Cases
Any security or privacy failure (especially: unauthenticated voice route, camera frame transmission, cross-user access, or a media stream not released) **blocks close-out unconditionally**. Any pseudoscience-guard failure (an emotion/confidence field accepted by a schema) likewise blocks. Feature-level failures are recorded and triaged; Sprint 10 is not marked complete with known unresolved security or privacy failures.

## Debugging Guidance
Trace each failure to the specific day that owned that deliverable (each day's Checklist names its scope). For latency issues, measure the three stages separately before concluding which layer is slow.

## Rollback Considerations
Sprint 10 has three clean rollback boundaries, in increasing severity: remove camera (Day 8) → voice+text intact; remove voice (Days 5–6) → text trainer intact, since the Day 4 engine is input-agnostic; remove the Trainer feature entirely (Days 2–4, 9) → Sprint 9's in-Agent interview remains untouched. Any rollback that abandons persisted sessions must also delete those documents, since they contain candidate transcripts.

## Checklist
- [ ] All automated suites pass; Sprint 8/9 suites unchanged
- [ ] `npm run build` clean (union exhaustiveness verified)
- [ ] TEST A–AJ executed and recorded (pass/fail/blocked)
- [ ] Voice routes verified authenticated and capped
- [ ] Camera frames verified never transmitted (network inspection)
- [ ] No raw audio/video stored or logged
- [ ] Cross-user session access verified impossible
- [ ] All schema pseudoscience guards verified by injection tests
- [ ] All cost ceilings verified simultaneously active
- [ ] Latency measured and recorded
- [ ] Full regression table verified
- [ ] Agents still 7; event types still 9
- [ ] `01_Master_Roadmap.md` close-out written from verified results
- [ ] `20_Decision_Log.md` updated with implementation deltas

## Commit Message
`test(sprint10-day10): full trainer test matrix, security/privacy/performance verification, close out Sprint 10`

## Documentation Updates
`01_Master_Roadmap.md` (status + verified outcome) and `20_Decision_Log.md` (deltas) constitute Sprint 10's closing documentation.

## End-of-Day Review
Sprint 10 is complete only when every box above is genuinely checked. This document does not declare Sprint 10 done on its own authority — that determination comes from running these steps against the real implementation and recording the results. Where a result differs from this plan, the recorded result wins and the delta is logged.

## Tomorrow Preview
Per `01_Master_Roadmap.md`, remaining scheduled work is Sprint 10b (Career Roadmap & Learning Engine — displaced, explicitly not absorbed by Sprint 10), then Sprint 11 (Premium UI/UX Redesign, deliberately untouched here), Sprint 12 (Payments), Sprint 13 (Testing/Performance/Security), and Sprint 14 (Production Launch). Deferred Sprint 10 items — streaming STT, audio self-review playback, multi-language interviews, cross-session progress analytics — are logged in `25_Backlog.md`.
