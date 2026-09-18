# Sprint 10 — Day 5

## Day Title
Voice Input — Microphone Capture, Authenticated STT Route, VAD Assist

## Objective
Build HireLens's first audio capability: a `useInterviewMicrophone` hook (permission state machine + `MediaRecorder` capture), an authenticated `/api/interview/stt` route behind `SpeechProviderAdapter`, and an energy-based VAD *assist*. Candidate answers can now be spoken and transcribed, feeding the Day 4 engine unchanged.

## Why
Voice is explicitly in Sprint 10 scope, not future scope. This is also the day JARVIS's reference implementation pays off most — and the day its two worst flaws (no auth, module-global state) must be corrected rather than inherited.

## Repository Evidence
- **HireLens has no audio code at all** — verified zero hits for `getUserMedia`/`MediaRecorder` in `frontend/`.
- **JARVIS `lib/voice-pipeline.ts`** (verified): `navigator.mediaDevices.getUserMedia({ audio: true })` → `new MediaRecorder(stream)` → `.start(200)`; `ondataavailable` accumulates chunks; `onstop` assembles a Blob and POSTs it. State held in module-level globals (`globalMediaRecorder`, `globalIsInitializing`, `isTransitioning`).
- **JARVIS `app/api/stt/route.ts`** (verified): multipart POST to `https://api.sarvam.ai/speech-to-text`, `model: "saaras:v3"`, `language_code: "en-IN"` hardcoded, **no authentication check, no size limit**.
- **JARVIS has no VAD** — verified: no `AudioContext`, no `AnalyserNode`, no silence threshold anywhere. VAD is new code with no reference.
- `frontend/lib/verifyAuth.ts` — the existing auth helper the new route must use.

## Existing Functionality
`verifyAuth`, existing API route conventions, Day 4's input-agnostic trainer engine.

## New Functionality
`useInterviewMicrophone` hook, mic permission state machine, `/api/interview/stt`, `SpeechProviderAdapter` + `SarvamSpeechProvider` + `NullSpeechProvider`, VAD assist, typing fallback wiring.

## Architecture
All capture is client-side in a hook with **hook-scoped refs** (no module globals). The route is a thin authenticated proxy; vendor choice is behind the adapter.

## Concepts
Permission state machine as explicit UI contract; provider adapter as vendor insulation (Sprint 8 `JobProviderAdapter` precedent); assistive vs. load-bearing VAD.

## Prerequisites
Day 4 complete. HTTPS (or localhost) required for `getUserMedia`.

## Dependencies
No npm package needed for capture (browser APIs). Requires `SPEECH_PROVIDER` / `SPEECH_PROVIDER_API_KEY` env vars; with neither set, `NullSpeechProvider` is used and the Trainer runs in text mode.

## Resources
JARVIS `lib/voice-pipeline.ts` (capture + transition lock), JARVIS `app/api/stt/route.ts` (provider call shape), `16_JARVIS_Reuse_Analysis.md` §3/§5, `frontend/lib/verifyAuth.ts`.

## Files to Inspect
- JARVIS `lib/voice-pipeline.ts`, `app/api/stt/route.ts`
- `frontend/lib/verifyAuth.ts`
- An existing HireLens API route for conventions (e.g. `app/api/agent/chat/route.ts`)

## Files to Modify
- `frontend/.env.local.example` — add `SPEECH_PROVIDER`, `SPEECH_PROVIDER_API_KEY`

## Files to Create
- `frontend/hooks/useInterviewMicrophone.ts`
- `frontend/hooks/useVoiceActivityDetection.ts`
- `frontend/lib/speech/SpeechProviderAdapter.ts`
- `frontend/lib/speech/SarvamSpeechProvider.ts`
- `frontend/lib/speech/NullSpeechProvider.ts`
- `frontend/app/api/interview/stt/route.ts`
- `frontend/components/interview-trainer/MicrophoneControl.tsx`
- `frontend/tests/useInterviewMicrophone.test.ts`
- `frontend/tests/interviewSttRoute.test.ts`

## Architecture Impact
First media capability in HireLens. Fully additive; nothing existing touched.

## Data Flow
```
[I'm Done] pressed (or VAD assist auto-submit if hands-free opted in)
  -> MediaRecorder.stop() -> chunks -> Blob (webm)
  -> POST /api/interview/stt (multipart)
       -> verifyAuth(req)            <-- MANDATORY; absent in JARVIS
       -> size/duration cap check
       -> SpeechProviderAdapter.transcribe(blob)
            SarvamSpeechProvider -> api.sarvam.ai/speech-to-text
            NullSpeechProvider   -> { status: "not_configured" }
       -> { transcript, durationSeconds }
  -> transcript handed to Day 4's process_trainer_answer via /api/agent/chat
  -> audio Blob discarded; never stored
```

## State Flow
Hook-scoped refs: `MediaRecorder`, `MediaStream`, chunk array, submit-transition lock, VAD analyser. Permission status is hook state surfaced to the UI. **No module-level globals** — the JARVIS pattern's main defect.

## Agent Responsibilities
None — voice is edge infrastructure, deliberately not routed through `agent-service`.

## Service Responsibilities
`SpeechProviderAdapter` owns vendor calls; the route owns auth and caps; the hook owns device lifecycle.

## Tool Responsibilities
None new.

## UI/UX Work
`MicrophoneControl`: states OFF / REQUESTING / READY / LISTENING / PROCESSING / ERROR / BLOCKED, with a live timer, a level meter, and a permanently available "Type instead" escape hatch.

## Voice/Audio Work
Capture, caps, transcription, VAD assist. **Batch STT only** — no partial transcripts (see `20_Decision_Log.md`).

## Camera/Visual Work
None.

## Security
`verifyAuth` first in the route — without it this is an open proxy to a paid API (`26_Risks.md` highest-cost risk). Audio payload size and duration capped server-side. Provider key server-side only. `language_code` configurable rather than hardcoded.

## Privacy
Audio exists in browser memory and one in-flight request; never written to disk, Firestore, or logs. Recording indicator visible whenever the mic is live. Stream tracks fully stopped on unmount, session end, and pause.

## Cost Controls
Max recording 3 min (hard `MediaRecorder` stop), payload size cap, per-session STT call cap, existing daily `agentUsage` counter. An empty/near-silent recording is rejected client-side before an STT call is spent.

## Implementation Plan
1. Define `SpeechProviderAdapter` (`transcribe(blob, opts)`, `synthesize(text, opts)`); implement `NullSpeechProvider` first so the text path works before any key exists.
2. Build `/api/interview/stt`: `verifyAuth` → size/duration cap → adapter → normalized response. Reject oversized payloads with a clear error.
3. Implement `SarvamSpeechProvider` following JARVIS's request shape, with configurable language.
4. Build `useInterviewMicrophone` with hook-scoped refs, the permission state machine, the 3-minute hard stop, and a ported transition lock preventing double submission.
5. Build `useVoiceActivityDetection` (`AudioContext` + `AnalyserNode` RMS, sustained-silence threshold) — emits a "silence detected" signal only; **never** stops the recorder unless hands-free mode is explicitly enabled.
6. Build `MicrophoneControl` with all states plus the typing fallback.

## Testing
- `interviewSttRoute.test.ts`: 401 with no/invalid token; oversized payload rejected; `NullSpeechProvider` returns explicit `not_configured` (never a fake transcript).
- `useInterviewMicrophone.test.ts`: permission-denied path surfaces BLOCKED and offers typing; two hook instances share no state (guards against the global-state defect); double-submit blocked by the lock; 3-minute cap stops recording; tracks released on unmount.

## Regression Testing
No existing file modified except `.env.local.example` — run the full Sprint 8/9 suites plus `npm run build` to confirm nothing broke.

## Manual Verification
Record a real spoken answer end-to-end and confirm a sensible transcript reaches the engine. Deny mic permission and confirm the typing fallback works immediately. Confirm the OS mic indicator turns **off** when the session ends.

## Expected Behaviour
Spoken answers transcribe and flow into the unchanged Day 4 engine; every failure path has a usable fallback.

## Failure Cases
Mic denied/unavailable → typing fallback. Empty/silent recording → rejected client-side with a retry prompt, no STT call. Provider error/timeout → answer preserved, retry and typing offered. Provider not configured → honest text-mode message.

## Debugging Guidance
If `getUserMedia` fails outright, check HTTPS/localhost before suspecting code. If two recordings interleave, the transition lock is the first suspect. If transcripts are empty but audio recorded, check the blob MIME type against what the provider accepts (JARVIS uploads `audio.webm`).

## Rollback Considerations
Delete the hooks, the route, and the adapter; the Trainer reverts to text-only input, which is fully functional since the Day 4 engine is input-agnostic. This is a genuinely clean rollback boundary — a deliberate benefit of keeping voice at the edge.

## Checklist
- [ ] `verifyAuth` present on the STT route (JARVIS defect corrected)
- [ ] Payload size/duration caps enforced server-side
- [ ] `SpeechProviderAdapter` + Null + Sarvam providers implemented
- [ ] `useInterviewMicrophone` uses hook-scoped refs, no module globals
- [ ] Permission state machine complete incl. BLOCKED
- [ ] VAD is assistive only; cannot cut off an answer by default
- [ ] 3-minute hard recording cap
- [ ] Typing fallback always available
- [ ] Tracks released on unmount/pause/end

## Commit Message
`feat(sprint10-day5): microphone capture, authenticated STT route with provider adapter, VAD assist`

## Documentation Updates
`21_Tech_Stack.md` and `06_API_Keys_and_Setup.md` voice entries are the specs implemented today.

## End-of-Day Review
HireLens can hear. The two JARVIS defects (no auth, global state) were corrected rather than inherited, and VAD was deliberately built as non-load-bearing.

## Tomorrow Preview
Day 6 gives the interviewer a voice — TTS route, playback queue with cancellation, and turn-taking.
