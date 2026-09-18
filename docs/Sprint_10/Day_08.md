# Sprint 10 — Day 8

## Day Title
Optional Camera and Client-Side Geometric Visual Signals

## Objective
Add optional camera support: a `useInterviewCamera` hook, client-side-only face **detection** via `face-api.js`, and a `VisualSignals` contract limited to geometric facts (face present, in/out of frame, coarse framing). Camera frames never leave the browser. `face-api.js`'s expression, age, gender, and recognition capabilities are deliberately left unused.

## Why
Camera practice genuinely helps on-screen presence, and the brief recommends it while requiring it stay optional. It is also the single highest-risk area for pseudoscience creep, so the constraints are enforced structurally today rather than by convention.

## Repository Evidence
- **JARVIS `components/auth/FaceScanner.tsx`** (verified): `getUserMedia({ video: true })` + `face-api.js`, used for **login face recognition**. The capture/permission/cleanup pattern is reusable; the recognition purpose is discarded entirely.
- **JARVIS `lib/emotion-detection.ts`** (verified, 68 lines): maps `face-api.js` expression probabilities to emotion labels. **Not reused** — see `16_JARVIS_Reuse_Analysis.md` §4.
- HireLens has no camera or vision code and no vision dependency — verified.
- `face-api.js` is the only vision library with a working reference in either repository, which is why it's chosen over alternatives.

## Existing Functionality
Day 2's camera consent UI (permission request only); Days 5–7's voice loop and signal pattern.

## New Functionality
`useInterviewCamera`, lazy `face-api.js` model loading, detection sampling loop, `VisualSignals` schema, framing coaching, camera state indicators, `face-api.js` dependency.

## Architecture
All inference is in-browser; only booleans/counts/one framing note are transmitted. Camera is fully optional — every downstream consumer treats visual signals as absent-by-default.

## Concepts
Client-side-only inference as the enabling condition for an honest privacy claim; geometric vs. inferential signals; lazy model loading so an optional feature doesn't tax the default path.

## Prerequisites
Days 5–7 complete.

## Dependencies
**New:** `face-api.js` (first vision dependency in HireLens). Model weights served from `frontend/public/models/` — only the face-detection model (e.g. TinyFaceDetector) is shipped; expression/age/gender/recognition model files are **not** included, which makes the restriction physical rather than merely policy.

## Resources
JARVIS `components/auth/FaceScanner.tsx`, `16_JARVIS_Reuse_Analysis.md` §3–§4, `02_Architecture.md` `VisualSignals` contract.

## Files to Inspect
- JARVIS `components/auth/FaceScanner.tsx` (capture, model loading, cleanup)
- JARVIS `lib/emotion-detection.ts` — **read to confirm what is being rejected and why**, not to port
- `frontend/components/interview-trainer/MediaConsentPanel.tsx` (Day 2)

## Files to Modify
- `frontend/package.json` — add `face-api.js`
- `frontend/components/interview-trainer/MediaConsentPanel.tsx` — wire real camera enable/disable
- `agent-service/crew/interview_manager.py` — `process_trainer_answer` accepts optional `visual_signals`; coaching may reference framing only
- `agent-service/tools/interview_tools.py` — guardrail extended: never infer attention, engagement, emotion, or confidence from visual data

## Files to Create
- `frontend/hooks/useInterviewCamera.ts`
- `frontend/lib/vision/faceDetection.ts` (model loading + sampling; detection only)
- `frontend/lib/vision/computeVisualSignals.ts`
- `frontend/components/interview-trainer/CameraPreview.tsx`
- `agent-service/schemas/visual_signals.py`
- `frontend/public/models/` (face-detection weights only)
- `frontend/tests/useInterviewCamera.test.ts`
- `frontend/tests/computeVisualSignals.test.ts`
- `agent-service/tests/test_visual_signals_schema.py`

## Architecture Impact
First vision capability. Strictly optional and strictly client-side; no server or `agent-service` change beyond accepting an optional derived-signals object.

## Data Flow
```
User enables camera (explicit, separate from mic consent)
  -> getUserMedia({ video: true }) -> MediaStream -> <video> preview
  -> lazy-load face-detection model from /public/models
  -> sampling loop (~1-2 Hz, NOT every frame) while the candidate answers:
       detectSingleFace(video)  [IN BROWSER]
       -> record: face present?, box position/size
  -> on answer submit: computeVisualSignals(samples)
       -> { camera_enabled, face_detected_ratio, out_of_frame_events,
            out_of_frame_total_seconds, framing_note }
  -> derived signals ONLY sent with the answer payload
  -> FRAMES ARE NEVER TRANSMITTED, NEVER STORED, NEVER LOGGED
```

## State Flow
`MediaStream`, `<video>` ref, model-loaded flag, and the sample buffer are all hook-scoped and discarded on stop. Only `VisualSignals` is persisted, on the answer record.

## Agent Responsibilities
None new.

## Service Responsibilities
`faceDetection.ts` owns model lifecycle and sampling; `computeVisualSignals.ts` owns the deterministic aggregation; the hook owns device lifecycle and cleanup.

## Tool Responsibilities
Coaching prompt may reference framing and out-of-frame counts only. Guardrail forbids inferring attention, engagement, nervousness, honesty, or competence from visual data.

## UI/UX Work
`CameraPreview` tile with an always-visible ACTIVE indicator; placeholder tile when off; states OFF / REQUESTING / READY / ACTIVE / BLOCKED / DISCONNECTED / ERROR; a clear "camera feed never leaves your device" statement at the consent point and on the preview tile.

## Voice/Audio Work
None.

## Camera/Visual Work
The whole of today. Explicitly not implemented: expression/emotion classification, age/gender estimation, face recognition or descriptors, gaze tracking, posture scoring, attention scoring. Only the detection model's weights are shipped.

## Security
Camera requires explicit opt-in. Since no frames are transmitted, there is no server-side camera attack surface at all. Derived signals are bounded numbers validated by `extra="forbid"`.

## Privacy
Strongest guarantee in the sprint: frames never leave the browser. Nothing is recorded — no video, no stills, no descriptors. Camera can be disabled mid-session; tracks are released immediately and the OS indicator must turn off. If camera was off, the report omits the visual section entirely rather than showing "not measured."

## Cost Controls
Zero marginal model/API cost (inference is local). Sampling at 1–2 Hz rather than per-frame keeps CPU/battery impact modest — important on mobile. Models load only when camera is actually enabled.

## Implementation Plan
1. Add `face-api.js`; place **only** face-detection weights in `public/models/`.
2. Build `faceDetection.ts`: lazy `loadModels()`, `detectOnce(video)` returning presence + box only (discard any other detector output).
3. Build `useInterviewCamera`: permission state machine, preview stream, sampling loop tied to turn state (sample only while LISTENING), full track release on stop/unmount/pause/session end.
4. Build `computeVisualSignals.ts`: deterministic aggregation; `framing_note` from box position/size heuristics (e.g. box centre well above/below centre → "camera appears above/below eye level"; very small box → "you're quite far from the camera").
5. Define `VisualSignals` with `extra="forbid"`.
6. Extend the guardrail; render the camera line in the feedback card only when enabled.
7. Measure bundle/page-load impact and confirm models don't load on Trainer entry.

## Testing
- `useInterviewCamera.test.ts`: denial → BLOCKED with interview continuing; disconnect handled; **tracks released on unmount** (the leakage risk in `26_Risks.md`).
- `computeVisualSignals.test.ts`: ratio/out-of-frame arithmetic exact; no-samples input yields `camera_enabled: false` rather than fabricated zeros.
- `test_visual_signals_schema.py`: `extra="forbid"` rejects injected `expression`, `emotion`, `attention_score`, `age`, `gender`, `descriptor`.

## Regression Testing
Full Sprint 8/9/Day 1–7 suites; confirm voice-only interviews are entirely unaffected when camera is never enabled, and that page-load time for the Trainer is unchanged with camera off.

## Manual Verification
Enable camera, answer a question, move out of frame twice (TEST AB) — confirm the count is accurate and the coaching is about framing only. Disable mid-session (TEST Z) and confirm the OS camera indicator turns off. Deny permission (TEST AA) and confirm the interview proceeds normally.

## Expected Behaviour
Camera adds useful, modest framing coaching with a privacy guarantee that is literally true, and is entirely skippable.

## Failure Cases
Model load failure → camera feature degrades to a plain preview with no signals, interview continues (never blocks). Permission denied/revoked mid-session → visual signals stop, section omitted from the report. No face ever detected → reported as a framing/lighting hint, never as an inference about the candidate.

## Debugging Guidance
If the OS camera indicator stays on after stopping, a track isn't being stopped — check every cleanup path, not just unmount. If detection never succeeds, verify the model files are actually present at the served path before suspecting the sampling loop.

## Rollback Considerations
Remove the hook, vision lib, model files, and the dependency; camera consent UI reverts to disabled. Because every consumer treats visual signals as optional, rollback leaves voice and text interviews fully functional — the cleanest rollback boundary in the sprint.

## Checklist
- [ ] Camera strictly opt-in; interview fully usable without it
- [ ] Frames never transmitted; inference verified client-side only
- [ ] Only face-detection weights shipped (no expression/age/gender/recognition models)
- [ ] `VisualSignals` with `extra="forbid"`; emotion/attention fields rejected by test
- [ ] Guardrail forbids visual inference of attention/emotion/confidence
- [ ] Tracks released on every stop path; OS indicator verified off
- [ ] Models lazy-loaded only when camera is enabled
- [ ] Report omits visual section entirely when camera was off

## Commit Message
`feat(sprint10-day8): optional camera with client-side geometric visual signals only`

## Documentation Updates
`21_Tech_Stack.md` camera rows, `02_Architecture.md` `VisualSignals` contract, and `16_JARVIS_Reuse_Analysis.md` §4 are the governing specs.

## End-of-Day Review
The multimodal pipeline is complete, with the pseudoscience boundary enforced by which model files exist on disk — not just by policy.

## Tomorrow Preview
Day 9 builds the full Interview Room UI, the 4 new artifact renderers, the final trainer report, and documents state ownership to eliminate the concurrency risks.
