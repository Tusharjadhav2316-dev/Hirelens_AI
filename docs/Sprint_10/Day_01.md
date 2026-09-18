# Sprint 10 — Day 1

## Day Title
ARCHITECTURE GATE — HireLens Audit, JARVIS Audit, Reuse Matrix, and Sprint 10 Architecture Approval

## Objective
Produce the complete, reviewable Sprint 10 architecture before any code is written: audit HireLens's post-Sprint-9 state, audit the JARVIS repository for reusable voice/camera technology, produce a classified reuse matrix, and propose the voice, camera, session-state, security, privacy, and cost architectures. **This day is a gate — implementation on Day 2 does not begin until this architecture is reviewed and approved.**

## Why
Sprint 10 adds capability HireLens has never had (audio and video). The Sprint 9 audit established a hard lesson: Sprint 8's documentation described an execution model (`Crew.kickoff()` hierarchical delegation) that was never actually wired, and that inaccuracy propagated into planning. This gate exists so Sprint 10's voice architecture is grounded in what JARVIS *actually* implements — not what its README implies — and in what HireLens *actually* runs today.

## Repository Evidence
**HireLens (verified by direct inspection):**
- Zero audio/video capability: no `getUserMedia`, no `MediaRecorder`, no `SpeechRecognition`, no `speechSynthesis`, no camera code anywhere in `frontend/`.
- `frontend/package.json` dependencies contain no media/audio/vision library (`@hookform/resolvers`, `class-variance-authority`, `clsx`, `date-fns`, `docx`, `file-saver`, `firebase`, `firebase-admin`, `framer-motion`, `lucide-react`, `next`, `pdf-lib`, `pdf-parse`, `radix-ui`, `react`, `react-dom`, `react-hook-form`, `react-pdf`, `react-to-print`, `sonner`, `tailwind-merge`, `zod`).
- Sprint 9 interview capability confirmed present and complete: `agent-service/crew/interview_manager.py` (with `MAX_QUESTIONS_PER_SESSION`, `MAX_FOLLOW_UPS_PER_QUESTION`, `start_session`, `present_question`, `process_answer`, `complete_session`, `detect_interview_type`, `detect_target_role`), 4 tools in `tools/interview_tools.py`, Route 4a/4b/4c in `crew/manager.py` (~lines 386–525), and 3 interview artifact renderers.
- `crew/manager.py` routing is still a deterministic keyword router; `.kickoff(` still has **zero** call sites — re-confirmed this sprint.
- `frontend/components/Sidebar.tsx` navigation confirmed: AI Career Agent (primary), Dashboard, AI Career Coach, Resume Builder, Resume Analyzer, Job Matcher, Cover Letter, Resume History.
- `interview_manager.detect_target_role()` falls back to a hardcoded `"Software Engineer"` — the specific thing Sprint 10's universal-role requirement must replace.

**JARVIS (verified by direct inspection):** see `16_JARVIS_Reuse_Analysis.md` for the full audit. Headline findings: `lib/voice-pipeline.ts` (627 lines) implements `getUserMedia` + `MediaRecorder` batch capture with manual push-to-talk; STT and TTS are Next.js routes proxying Sarvam AI (`saaras:v3` / `bulbul:v3`); TTS playback is a base64-WAV `new Audio()` queue with cancellation; **no VAD exists anywhere**; state is held in module-level mutable globals; camera exists only in `components/auth/FaceScanner.tsx` using `face-api.js` for login face recognition; `lib/emotion-detection.ts` maps expressions to emotion labels; **the STT/TTS routes have no authentication and no input size limits**.

## Existing Functionality
Everything in Sprints 1–9 — notably the complete text-based interview session engine, the Firebase/internal-JWT security boundary, the Artifact Canvas, and NDJSON streaming.

## New Functionality
Nothing is built today. Today produces the architecture documents that Days 2–10 implement.

## Architecture
The 12 required gate deliverables, all recorded in this documentation package:
1. HireLens audit → this file's Repository Evidence + `02_Architecture.md` classification table
2. JARVIS audit → `16_JARVIS_Reuse_Analysis.md` §1
3. HireLens vs JARVIS comparison → `16_JARVIS_Reuse_Analysis.md` §2
4. Reuse matrix (5-way classification) → `16_JARVIS_Reuse_Analysis.md` §3
5. Dependency analysis → `21_Tech_Stack.md` Sprint 10 Additions
6. Voice architecture → `02_Architecture.md` (authenticated proxy routes + `SpeechProviderAdapter`, batch STT, manual turn control)
7. Camera architecture → `02_Architecture.md` (client-side-only, geometric signals only)
8. Interview Trainer architecture → `02_Architecture.md` high-level diagram
9. Security/privacy architecture → `02_Architecture.md` Security & Privacy sections
10. Cost architecture → `02_Architecture.md` Cost Control section
11. Session-state architecture → `02_Architecture.md` state scope table + `InterviewTrainerSession` contract
12. 10-day plan → this `Sprint_10/` folder
13. Explicit non-reuse decisions → `16_JARVIS_Reuse_Analysis.md` §4 and the reuse matrix's `[5] DO NOT REUSE` rows

## Concepts
- Technology reference vs. source of truth — JARVIS supplies patterns; HireLens supplies architecture, auth, state conventions, and design system.
- Provider abstraction as vendor insulation (the proven Sprint 8 `JobProviderAdapter` pattern applied to speech).
- Load-bearing vs. assistive features — why VAD must not be load-bearing when no reference implementation exists.

## Prerequisites
Sprint 9 complete and operational (verified above).

## Dependencies
None installed today. Day 5/6/8 introduce `face-api.js` and a speech provider key; nothing is added during the gate.

## Resources
JARVIS: `lib/voice-pipeline.ts`, `app/api/stt/route.ts`, `app/api/tts/route.ts`, `components/auth/FaceScanner.tsx`, `lib/emotion-detection.ts`, `lib/wake-word.ts`, `package.json`.
HireLens: `agent-service/crew/interview_manager.py`, `agent-service/crew/manager.py`, `frontend/components/Sidebar.tsx`, `frontend/components/agent/ArtifactRenderer.tsx`, `frontend/lib/verifyAuth.ts`, `frontend/package.json`.

## Files to Inspect
All Resources above. Reproduce independently: `grep -rn "getUserMedia\|MediaRecorder\|SpeechRecognition\|face-api" frontend/` (expect zero hits) and `grep -rn "\.kickoff(" agent-service/` (expect zero hits).

## Files to Modify
- `01_Master_Roadmap.md` (Sprint 10 Redefinition amendment)
- `02_Architecture.md`, `20_Decision_Log.md`, `21_Tech_Stack.md`, `24_UI_Wireframes.md`, `08_Testing_Guide.md`, `25_Backlog.md`, `26_Risks.md`, `05_Prompt_Library.md`, `06_API_Keys_and_Setup.md`

## Files to Create
- `16_JARVIS_Reuse_Analysis.md`
- `Sprint_10/Day_01.md` … `Day_10.md`
- **No application source files.**

## Architecture Impact
None to running code. This day changes only documentation.

## Data Flow
No new data flow. Today documents the *target* flows (see `02_Architecture.md`).

## State Flow
Today classifies all Sprint 10 state into transient / component-scoped / interview-session-scoped / persistent (see `02_Architecture.md` state table) — the classification Days 3 and 9 implement against.

## Agent Responsibilities
Decided today: **no new agents.** Count stays at 7 (1 Manager + 6 specialized). Rationale in `20_Decision_Log.md`.

## Service Responsibilities
`interview_manager.py` (extended, not replaced) owns session lifecycle; new `SpeechProviderAdapter` owns vendor calls; new React hooks own media capture.

## Tool Responsibilities
One new tool decided today (`analyze_role`); two more (`analyze_speech_signals`, and the trainer report extension) scoped on Days 7 and 9. Existing 4 interview tools reused.

## UI/UX Work
Dedicated route tree and Interview Room designed today in `24_UI_Wireframes.md`; no components built.

## Voice/Audio Work
Architecture only: authenticated proxy routes, `SpeechProviderAdapter`, batch STT, TTS queue with cancellation, manual `[I'm Done]` primary turn control, VAD as assist.

## Camera/Visual Work
Architecture only: optional, client-side-only, geometric signals; `face-api.js` detection subset; expression/emotion/recognition explicitly rejected.

## Security
Decided: both voice routes call existing `verifyAuth(req)` — correcting JARVIS's unauthenticated routes; session ownership via `users/{uid}/` path; transcripts join resumes/JDs as untrusted data; no secrets in events.

## Privacy
Decided: camera frames never leave the browser; raw audio never persisted; only transcripts and derived signals stored; separate explicit mic/camera consent; always-visible capture indicators.

## Cost Controls
Decided: max duration 30 min, max 15 questions, 1 follow-up/question, 1 retry/question, 3 min max per recording, TTS character cap, per-session call caps, existing daily `agentUsage` counter.

## Implementation Plan
1. Reproduce both audits independently (commands above) and confirm this document's findings.
2. Write `16_JARVIS_Reuse_Analysis.md` with the 5-way classified reuse matrix.
3. Record all 11 Sprint 10 ADRs in `20_Decision_Log.md`.
4. Write the Sprint 10 architecture section in `02_Architecture.md`.
5. Write the UI spec, test matrix, backlog, and risk entries.
6. **Stop. Submit for review. Do not proceed to Day 2 until approved.**

## Testing
No code tests today. Verification is that every audit claim is reproducible by the commands listed under Files to Inspect.

## Regression Testing
Not applicable — no code changed.

## Manual Verification
Run the two `grep` commands and confirm zero hits each. Open the Trainer's intended Sidebar position and confirm no existing entry conflicts.

## Expected Behaviour
A complete, reviewable architecture in which every file path and capability claim traces to verified repository evidence.

## Failure Cases
If any audit command returns different results (e.g. a `.kickoff(` call now exists, or a media dependency has been added), this document is stale and the gate must be re-run before Day 2.

## Debugging Guidance
Treat this document itself with the skepticism Sprint 9's audit applied to Sprint 8's docs: verify, don't assume.

## Rollback Considerations
None — documentation only. Rolling back means discarding the doc changes; no application state is affected.

## Checklist
- [ ] HireLens zero-audio/video finding reproduced
- [ ] `.kickoff(` zero-call-sites finding reproduced
- [ ] JARVIS voice pipeline, STT/TTS routes, camera code inspected directly
- [ ] JARVIS no-VAD and no-auth findings confirmed
- [ ] `16_JARVIS_Reuse_Analysis.md` written with classified reuse matrix
- [ ] All 11 Sprint 10 ADRs logged
- [ ] Explicit non-reuse decisions documented with reasons
- [ ] **Architecture submitted for review; Day 2 not started**

## Commit Message
`docs(sprint10-day1): architecture gate - HireLens/JARVIS audit, reuse matrix, Sprint 10 architecture`

## Documentation Updates
All files listed under Files to Modify and Files to Create.

## End-of-Day Review
Sprint 10 has a reviewable architecture grounded in verified evidence from both repositories, with every reuse and non-reuse decision justified. Nothing has been built.

## Tomorrow Preview
**Only after approval:** Day 2 creates the dedicated Trainer route and Sidebar entry, and builds universal role intelligence (`analyze_role`), replacing Sprint 9's hardcoded "Software Engineer" fallback.
