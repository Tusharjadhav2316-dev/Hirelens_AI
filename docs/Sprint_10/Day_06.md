# Sprint 10 — Day 6

## Day Title
AI Interviewer Voice — TTS Route, Playback Queue, Turn-Taking

## Objective
Give the interviewer a voice: an authenticated `/api/interview/tts` route behind the existing `SpeechProviderAdapter`, a `useInterviewerVoice` hook with a sequential playback queue and safe cancellation, and the full turn-taking state machine (AI speaks → candidate answers → processing → AI speaks).

## Why
Voice output is what makes this feel like an interview rather than a form. The playback queue is also the one part of JARVIS's voice stack that is genuinely well-designed and worth porting closely — it already solves duplicate/overlapping playback, which is the main failure mode here.

## Repository Evidence
- **JARVIS `app/api/tts/route.ts`** (verified): POSTs to `https://api.sarvam.ai/text-to-speech`, `model: "bulbul:v3"`, configurable `speaker`; returns base64 audio. **No auth check, no text length limit.**
- **JARVIS `lib/voice-pipeline.ts`** (verified): `currentAudio = new Audio(\`data:audio/wav;base64,${base64}\`)`, a sequential queue, and a module-level `currentAudio` reference used to stop playback — the cancellation pattern being ported.
- HireLens has no audio playback code of any kind — verified.
- Day 5's `SpeechProviderAdapter` already declares `synthesize()`, so no new abstraction is needed.

## Existing Functionality
Day 5's adapter, auth helper, mic capture and turn-ending control; Day 4's engine.

## New Functionality
`/api/interview/tts`, `useInterviewerVoice` (queue + cancellation + skip), turn-taking state machine, sentence-aware chunking for lower time-to-first-audio.

## Architecture
TTS is client-initiated and client-played; the server only proxies. Turn state is client-local (see `20_Decision_Log.md` — voice state is not a server event).

## Concepts
Sequential queue with single-owner cancellation; sentence chunking as a latency strategy; turn state machine as the single source of truth for "whose turn is it."

## Prerequisites
Day 5 complete.

## Dependencies
None new (reuses Day 5's env vars and adapter).

## Resources
JARVIS `app/api/tts/route.ts`, JARVIS `lib/voice-pipeline.ts` playback section, `16_JARVIS_Reuse_Analysis.md` §3.

## Files to Inspect
- JARVIS `app/api/tts/route.ts` and the playback/queue region of `lib/voice-pipeline.ts`
- `frontend/lib/speech/SpeechProviderAdapter.ts` (Day 5)

## Files to Modify
- `frontend/lib/speech/SarvamSpeechProvider.ts` — implement `synthesize()`
- `frontend/lib/speech/NullSpeechProvider.ts` — `synthesize()` returns `not_configured`
- `frontend/hooks/useInterviewMicrophone.ts` — coordinate with turn state so the mic never opens while the AI is speaking

## Files to Create
- `frontend/app/api/interview/tts/route.ts`
- `frontend/hooks/useInterviewerVoice.ts`
- `frontend/hooks/useInterviewTurnState.ts`
- `frontend/components/interview-trainer/InterviewerVoiceIndicator.tsx`
- `frontend/tests/interviewTtsRoute.test.ts`
- `frontend/tests/useInterviewerVoice.test.ts`
- `frontend/tests/useInterviewTurnState.test.ts`

## Architecture Impact
Completes the voice loop. Still entirely at the Next.js/browser edge; `agent-service` remains unaware of audio.

## Data Flow
```
Question text (from engine artifact)
  -> split into sentence-ish chunks
  -> for each chunk: POST /api/interview/tts { text, speaker }
       -> verifyAuth(req)          <-- MANDATORY; absent in JARVIS
       -> text length cap check
       -> adapter.synthesize() -> base64 audio
  -> enqueue; play sequentially via a single Audio ref
  -> on queue drain: turn state -> LISTENING; mic opens
  -> [Skip] / session end / unmount -> cancel(): stop current audio, clear queue, abort in-flight requests
```

## State Flow
Turn state: `AI_THINKING → AI_SPEAKING → LISTENING → PROCESSING_ANSWER → (COACHING) → AI_THINKING`, plus `PAUSED` and `ERROR`. All client-local. Playback queue and the single `Audio` ref are hook-scoped (not module globals, unlike JARVIS).

## Agent Responsibilities
None.

## Service Responsibilities
Route: auth + caps + proxy. Hook: queue, playback, cancellation. Turn-state hook: the single authority on whose turn it is.

## Tool Responsibilities
None new.

## UI/UX Work
`InterviewerVoiceIndicator` showing AI THINKING / AI SPEAKING with a `[Skip]` control; mic controls disabled (with a clear reason) while the AI speaks.

## Voice/Audio Work
The core of today. Note the deliberate constraint: the mic does not open until the playback queue drains, which prevents the AI's own voice being recorded as the candidate's answer — a failure mode JARVIS's push-to-talk model avoids by construction but a voice-first interview must handle explicitly.

## Camera/Visual Work
None.

## Security
`verifyAuth` first (correcting JARVIS); TTS text length capped; provider key server-side only. Question text sent to TTS is engine-generated, but the cap still applies as defence against a malformed long payload.

## Privacy
Generated audio is played and discarded; never stored. No audio is logged.

## Cost Controls
Per-utterance character cap; per-session TTS call cap; in-flight requests aborted on cancel so a skipped question doesn't keep paying for synthesis; chunking bounded to avoid pathological request counts on long text.

## Implementation Plan
1. Build `/api/interview/tts` (auth → cap → adapter).
2. Implement `synthesize()` on both providers.
3. Build `useInterviewerVoice`: queue, single `Audio` ref, `speak(text)`, `cancel()`, `skip()`, and an `onQueueDrained` callback.
4. Build `useInterviewTurnState` as the authority; `useInterviewerVoice` and `useInterviewMicrophone` both subscribe rather than coordinating directly with each other.
5. Add sentence-aware chunking so the first sentence plays while later ones synthesize.
6. Guard: `cancel()` on unmount, session end, pause, and navigation.

## Testing
- `interviewTtsRoute.test.ts`: 401 unauthenticated; over-length text rejected; `not_configured` path returns cleanly.
- `useInterviewerVoice.test.ts`: two rapid `speak()` calls never overlap; `cancel()` stops immediately and clears the queue; playback after session end is suppressed; in-flight fetches aborted on cancel.
- `useInterviewTurnState.test.ts`: mic cannot open in `AI_SPEAKING`; invalid transitions rejected.

## Regression Testing
Full Sprint 8/9 suites + `npm run build`. Day 5's mic tests must still pass after the turn-state coordination change.

## Manual Verification
Run a full voice turn: hear the question, answer aloud, hear the next question. Press `[Skip]` mid-sentence and confirm audio stops instantly and the mic then opens. End the session mid-playback and confirm audio stops and does not resume.

## Expected Behaviour
Natural-feeling alternating turns with no overlapping audio and no self-recording.

## Failure Cases
TTS failure/timeout → question displayed as text with a clear notice; the interview never blocks on audio. Provider not configured → text-mode question display. Audio playback blocked by browser autoplay policy → surfaced with a one-tap "Enable sound" prompt rather than silent failure.

## Debugging Guidance
Overlapping audio means more than one `Audio` ref exists — check the hook isn't being instantiated twice in the tree. Audio continuing after session end means a missing `cancel()` in a cleanup path. If the mic records the AI's voice, the turn-state gate is not being respected.

## Rollback Considerations
Remove the TTS route and the two hooks; the Trainer degrades to displaying questions as text with voice *input* still working (Day 5 is independent). Clean, partial rollback.

## Checklist
- [ ] `verifyAuth` on the TTS route
- [ ] Text length cap enforced
- [ ] Queue never overlaps; single `Audio` ref, hook-scoped
- [ ] `cancel()` on skip/end/pause/unmount, with request abort
- [ ] Mic cannot open while AI is speaking
- [ ] TTS failure degrades to text, never blocks
- [ ] Autoplay-policy failure surfaced, not silent

## Commit Message
`feat(sprint10-day6): AI interviewer TTS, playback queue with cancellation, turn-taking state machine`

## Documentation Updates
`21_Tech_Stack.md` TTS rows and `24_UI_Wireframes.md` voice-state table are the specs implemented today.

## End-of-Day Review
The voice loop is closed — the trainer speaks and listens, with turn conflicts structurally prevented.

## Tomorrow Preview
Day 7 adds speech/delivery intelligence (transcript + timing metrics) and grounded confidence coaching — with no emotion or confidence scoring.
