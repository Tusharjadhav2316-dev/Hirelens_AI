# HireLens 2.0 — JARVIS Technology Reuse Analysis

> Created in Sprint 10 Day 1 as the Architecture Gate's technology audit. JARVIS (repository: `swastik-main`) is a **technology reference source only** — it is not a source of truth for HireLens architecture. Every claim in this document was verified by direct inspection of the JARVIS repository; nothing here is inferred from its README alone.

## 1. JARVIS Architecture Audit (Verified)

| Aspect | Finding |
|---|---|
| Stack | Next.js + React + TypeScript, Tailwind, Firebase (client + admin), Zustand for state |
| Voice entry point | `lib/voice-pipeline.ts` (627 lines) — a single module owning mic capture, STT call, TTS call, and playback |
| Mic capture | `navigator.mediaDevices.getUserMedia({ audio: true })` → `new MediaRecorder(stream)`, `.start(200)` timeslice |
| Capture model | **Batch, manual push-to-talk.** `startRecording()` / `stopRecording()` are explicit calls; `onstop` assembles chunks into a Blob and POSTs it |
| Voice Activity Detection | **None.** No `AnalyserNode`, no `AudioContext` energy analysis, no silence threshold, no automatic end-of-speech detection anywhere in the repo |
| STT | `app/api/stt/route.ts` — Next.js route proxying to `https://api.sarvam.ai/speech-to-text`, `model: "saaras:v3"`, `language_code: "en-IN"`, multipart upload of the recorded blob |
| STT streaming | **Batch only.** No partial/interim transcripts; one request per completed recording |
| TTS | `app/api/tts/route.ts` — proxies to `https://api.sarvam.ai/text-to-speech`, `model: "bulbul:v3"`, configurable `speaker` |
| TTS playback | Returns base64 WAV; client plays via `new Audio(\`data:audio/wav;base64,${base64}\`)` with a sequential queue |
| Wake word | `lib/wake-word.ts` (43 lines) — simple string matching over a transcript, not acoustic wake-word detection |
| Interruption handling | Partial: a module-level `currentAudio` reference allows stopping playback, plus an `isTransitioning` lock to prevent overlapping start/stop |
| State management | **Module-level mutable globals** (`globalMediaRecorder`, `currentAudio`, `globalIsInitializing`, `isTransitioning`) plus a Zustand `useVoiceStore` |
| Camera | `components/auth/FaceScanner.tsx` — `getUserMedia({ video: true })` + `face-api.js` for face **detection/recognition, used for login**, not interview analysis |
| "Emotion detection" | `lib/emotion-detection.ts` (68 lines) — maps `face-api.js` expression probabilities to labels. **See §4 — explicitly NOT reused.** |
| Realtime transport | None relevant — no WebSocket/SSE voice transport; voice is request/response over standard Next.js routes |
| Licensing | No `LICENSE` file present in the repository. **No licensing claim is made in this document.** Since JARVIS is the same project owner's code, reuse is presumed permitted by ownership, not by an identified license. `face-api.js` and Sarvam AI have their own third-party terms that must be reviewed independently before production use. |

## 2. HireLens Current State (Verified — the "before" picture)

| Capability | Status in HireLens after Sprint 9 |
|---|---|
| Microphone / `getUserMedia` | **Does not exist.** Zero matches across `frontend/` |
| `MediaRecorder` | **Does not exist** |
| STT / TTS | **Does not exist.** No provider, no route, no API key entry in `06_API_Keys_and_Setup.md` |
| Web Speech API (`SpeechRecognition`, `speechSynthesis`) | **Does not exist** |
| Camera / video | **Does not exist** |
| `face-api.js` or any vision library | **Does not exist** |
| Audio/media dependencies in `package.json` | **None.** Dependencies are: `@hookform/resolvers`, `class-variance-authority`, `clsx`, `date-fns`, `docx`, `file-saver`, `firebase`, `firebase-admin`, `framer-motion`, `lucide-react`, `next`, `pdf-lib`, `pdf-parse`, `radix-ui`, `react`, `react-dom`, `react-hook-form`, `react-pdf`, `react-to-print`, `sonner`, `tailwind-merge`, `zod` |
| Interview capability | Text-only, delivered Sprint 9: `interview_manager.py` session lifecycle + 4 tools + 3 artifact renderers, routed via `manager.py` Route 4a/4b/4c |
| Agent routing | Deterministic keyword router (`process_manager_request_async`); `Crew.kickoff()` still has zero call sites — confirmed again in Sprint 10 Day 1 |

**Conclusion:** every voice and camera capability in Sprint 10 is genuinely new to HireLens. JARVIS is the only place in either repository where working audio/camera code exists.

## 3. Reuse Matrix

Classification key: **[1] DIRECT REUSE** · **[2] ADAPT/PORT** · **[3] WRAP BEHIND HIRELENS INTERFACE** · **[4] REIMPLEMENT USING SAME APPROACH** · **[5] DO NOT REUSE**

| JARVIS Capability | Existing Implementation | HireLens Need | Reuse Strategy | Changes Required | Risk |
|---|---|---|---|---|---|
| Mic permission + capture | `getUserMedia` + `MediaRecorder` in `voice-pipeline.ts` | Candidate answer capture | **[2] ADAPT/PORT** | Extract into `useInterviewMicrophone` React hook; replace module-level globals with hook-scoped `useRef` state; add explicit permission-state machine (OFF/REQUESTING/READY/LISTENING/PROCESSING/ERROR) | Medium — global-state removal is the main work |
| STT provider call | `app/api/stt/route.ts` → Sarvam `saaras:v3` | Transcribe candidate answers | **[3] WRAP** | Re-create as `frontend/app/api/interview/stt/route.ts` behind a `SpeechProviderAdapter` interface (mirroring Sprint 8's proven `JobProviderAdapter` pattern); add `verifyAuth` (JARVIS's route has **no auth check** — see §5); change `language_code` from hardcoded `en-IN` to configurable | Medium |
| TTS provider call | `app/api/tts/route.ts` → Sarvam `bulbul:v3` | AI interviewer voice | **[3] WRAP** | Same: `frontend/app/api/interview/tts/route.ts`, same adapter interface, add `verifyAuth`, add per-request text length cap | Medium |
| TTS sequential playback queue | `currentAudio` + queue in `voice-pipeline.ts` | Interviewer speaks one question at a time without overlap | **[2] ADAPT/PORT** | Port the queue + cancellation concept into `useInterviewerVoice` hook; keep the "single `currentAudio` ref, cancel before play" discipline — this part is genuinely well-designed and directly solves the duplicate-playback problem | Low |
| Transition lock (`isTransitioning`) | Boolean guard preventing overlapping start/stop | Prevent double-submit of an answer | **[2] ADAPT/PORT** | Port the concept as a hook-scoped ref, not a module global | Low |
| Voice Activity Detection | **Does not exist in JARVIS** | Automatic end-of-answer detection | **[4] REIMPLEMENT** | Must be built new: `AudioContext` + `AnalyserNode` RMS energy + silence-duration threshold. **Sprint 10 ships manual "I'm Done" as the primary control with VAD as an assist** — see `20_Decision_Log.md` | Medium-High (new code, device-dependent tuning) |
| Streaming/partial transcripts | **Does not exist in JARVIS** (batch only) | Lower perceived latency | **[5] DO NOT REUSE / defer** | Sprint 10 uses batch STT, matching JARVIS's proven model. Streaming STT deferred — see `25_Backlog.md` | N/A |
| Wake word | `lib/wake-word.ts` string matching | Not needed — interview turns are explicit | **[5] DO NOT REUSE** | An interview has a known turn structure; a wake word adds nothing | N/A |
| Camera capture | `getUserMedia({ video: true })` in `FaceScanner.tsx` | Optional camera presence/framing coaching | **[2] ADAPT/PORT** | Extract the capture/permission/cleanup pattern into `useInterviewCamera`; discard the login/recognition purpose entirely | Medium |
| `face-api.js` face **detection** (bounding box only) | Used in `FaceScanner.tsx` | Face-present / framing / out-of-frame signals | **[2] ADAPT/PORT, detection only** | Use only `detectSingleFace` bounding-box output for presence + framing. Models load client-side from `/public/models`; all inference stays in-browser | Medium (bundle size, model loading) |
| `face-api.js` face **recognition/descriptors** | Used for login identity in JARVIS | Not needed | **[5] DO NOT REUSE** | Biometric identity matching is out of scope and a privacy liability HireLens has no reason to take on | N/A |
| `lib/emotion-detection.ts` expression→emotion labels | Maps expression probabilities to emotion labels | **Nothing** | **[5] DO NOT REUSE** | See §4 | N/A |
| Zustand `useVoiceStore` | Global voice state store | Interview session voice state | **[5] DO NOT REUSE the library choice** | HireLens has no Zustand dependency and uses React state + Context throughout (`ResumeContext`, `ConversationPane` state). Adding a state library for one feature is unjustified; use the existing pattern | Low |
| Firebase auth | `lib/firebase.ts`, `lib/firebase-admin.ts` | Already exists in HireLens | **[5] DO NOT REUSE** | HireLens's `verifyAuth.ts` + internal-JWT boundary is more mature than JARVIS's; no reason to touch it | N/A |
| `app-launcher.ts`, `morning-brief.ts`, `visual-router.ts`, `offline-store.ts`, `usePlasmaColor.ts`, `server/` (Python) | JARVIS-specific assistant features | Irrelevant | **[5] DO NOT REUSE** | Unrelated to interview training | N/A |

## 4. Explicitly Rejected: JARVIS Emotion Detection

`lib/emotion-detection.ts` maps `face-api.js` expression probabilities (happy/sad/angry/surprised/neutral/fearful/disgusted) to emotion labels. **This is not reused in any form.**

Reason: the Sprint 10 brief forbids inferring emotional state, confidence, honesty, personality, competence, or mental health from facial data, and forbids pseudo-scientific facial scoring. Facial-expression classifiers output a probability over training-set expression categories — that is not a measurement of a person's actual emotional state, and presenting it to a candidate as interview feedback ("you looked anxious") would be exactly the unsupported claim the brief prohibits. Sprint 10's visual analysis is therefore restricted to **geometric, verifiable signals only**: is a face detected, is it within frame, and roughly where is it positioned. See `20_Decision_Log.md`, ADR "Visual analysis restricted to geometric signals."

## 5. Security Findings in JARVIS Code (must be fixed during port)

Direct inspection found issues that must **not** be carried into HireLens:

1. **No authentication on the STT/TTS routes.** `app/api/stt/route.ts` and `app/api/tts/route.ts` accept requests without any auth check. In HireLens, both new routes must call the existing `verifyAuth(req)` before doing anything — an unauthenticated STT/TTS endpoint is a direct, unmetered path to a paid third-party API.
2. **No input size limits.** The STT route forwards whatever blob it receives. HireLens's ports must cap audio duration/payload size and TTS text length (cost control — see `26_Risks.md`).
3. **Module-level mutable global state.** Fine for a single-user desktop assistant; unacceptable in HireLens, where per-request/per-component isolation is an established architectural property (compare the per-request `EventBus` in `agent-service`). All ported state becomes hook-scoped refs.
4. **Hardcoded `language_code: "en-IN"`.** Must become configurable rather than silently assuming one locale for all users.

## 6. Net Assessment

JARVIS provides genuinely valuable, working reference implementations for the four things HireLens has none of: mic capture, STT provider integration, TTS provider integration, and sequential audio playback with cancellation. Roughly **60–70% of Sprint 10's voice plumbing can be derived from JARVIS patterns**, but essentially none of it can be copied file-for-file, because every reusable piece needs auth added, global state removed, size limits imposed, and a provider abstraction placed around it. Voice Activity Detection — arguably the hardest part of a natural interview turn — **does not exist in JARVIS at all** and must be built from scratch, which is why Sprint 10 ships manual turn control as the reliable primary path.
