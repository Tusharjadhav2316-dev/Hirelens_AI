# Sprint 10 — Day 7

## Day Title
Speech & Delivery Intelligence and Grounded Confidence Coaching

## Objective
Compute observable delivery metrics from the transcript and recording timing (`SpeechSignals`), feed them into the trainer's coaching output, and implement confidence coaching that is grounded in countable observations — with **no** numeric confidence score, no tone analysis, and no emotion inference.

## Why
The brief requires the trainer to help candidates become more confident while explicitly forbidding claims to measure confidence, emotion, or honesty. The resolution is to state only what can be counted ("you said 'um' 14 times", "about 190 words per minute") and coach from that, which is both defensible and more actionable than a score.

## Repository Evidence
- Day 5's `useInterviewMicrophone` provides recording duration; the STT route returns `durationSeconds`.
- Day 5's `useVoiceActivityDetection` already computes RMS energy — reusable for coarse pause detection with no new audio analysis code.
- `tools/interview_tools.py`'s `evaluate_interview_answer` (Sprint 8/9, verified) already returns content feedback across clarity/structure/specificity/technical_depth — speech signals are **additive**, kept in a separate schema so content and delivery never blur.
- JARVIS `lib/emotion-detection.ts` exists and is **explicitly not reused** (`16_JARVIS_Reuse_Analysis.md` §4).

## Existing Functionality
Content evaluation (`evaluate_interview_answer`), the Day 4 coaching decision, Day 5 timing/energy data.

## New Functionality
`SpeechSignals` schema, `analyze_speech_signals` (deterministic, client-side computation + a server-side schema), filler-word/repetition detection, WPM, answer-length banding, coarse long-pause counting, coaching prompt extension.

## Architecture
Metrics are computed **deterministically** — filler counts, word counts, WPM, and length bands are arithmetic, not model output, so they are exactly reproducible and testable. Only the *coaching language* around them is model-generated.

## Concepts
Separation of content intelligence from delivery intelligence; deterministic metrics vs. generated advice; observation-based coaching instead of inferred-state claims.

## Prerequisites
Days 5–6 complete (transcript + duration available).

## Dependencies
None new — no audio-analysis library; filler detection is string matching over the transcript.

## Resources
`02_Architecture.md` `SpeechSignals` contract, `20_Decision_Log.md` Day 7 ADR, `tools/interview_tools.py`.

## Files to Inspect
- `frontend/hooks/useVoiceActivityDetection.ts` (Day 5) — reuse its energy sampling for pause gaps
- `agent-service/tools/interview_tools.py` — `evaluate_interview_answer` output shape

## Files to Modify
- `agent-service/crew/interview_manager.py` — `process_trainer_answer` accepts optional `speech_signals` and includes them in the coaching prompt
- `agent-service/tools/interview_tools.py` — coaching/feedback prompt extended to reference delivery observations; guardrail extended with an explicit "never infer emotional state or confidence from delivery" clause

## Files to Create
- `frontend/lib/speech/computeSpeechSignals.ts` (deterministic metric computation)
- `agent-service/schemas/speech_signals.py`
- `frontend/tests/computeSpeechSignals.test.ts`
- `agent-service/tests/test_speech_signals_schema.py`

## Architecture Impact
Additive. Content evaluation is unchanged; delivery is a parallel, separately-schema'd signal set.

## Data Flow
```
Recording stops -> durationSeconds + RMS energy samples (client)
Transcript returns from STT (client)
  -> computeSpeechSignals(transcript, durationSeconds, energySamples)
       deterministic: word_count, words_per_minute, filler_word_counts,
                      repeated_phrases, long_pause_count, answer_length_band
  -> included in the answer payload to /api/agent/chat
  -> process_trainer_answer(session, transcript, speech_signals)
       -> evaluate_interview_answer (content, UNCHANGED)
       -> coaching prompt receives BOTH content feedback and speech signals
  -> artifact: trainer_answer_feedback (content + "How you delivered it" section)
```

## State Flow
`SpeechSignals` is computed per answer and persisted on that answer's session record (derived data only — no audio).

## Agent Responsibilities
None new.

## Service Responsibilities
`computeSpeechSignals.ts` is the sole owner of metric arithmetic (client-side, so no audio needs transmitting). `interview_manager.py` decides how signals influence coaching.

## Tool Responsibilities
The feedback/coaching prompt may reference delivery observations verbatim but must not editorialize them into inferred states. Guardrail addition: delivery observations may be described and coached; the candidate's confidence, emotion, honesty, or personality must never be characterized.

## UI/UX Work
"How you delivered it" block in the feedback card (see `24_UI_Wireframes.md`), showing counts and pace as plain facts, followed by one concrete behavioural suggestion.

## Voice/Audio Work
Coarse pause detection from Day 5's existing energy samples. Explicitly **not** implemented: pitch tracking, tone classification, vocal-energy scoring, emotion inference.

## Camera/Visual Work
None (Day 8).

## Security
Speech signals are numbers and counts derived from the user's own answer; no new surface. Transcript remains data, not instructions.

## Privacy
Only derived metrics are transmitted and stored — energy samples are used client-side and discarded, and raw audio never leaves the STT request.

## Cost Controls
Metric computation is free (no model call). The coaching prompt grows by a bounded signals summary, not a transcript duplicate.

## Implementation Plan
1. Define `SpeechSignals` with `model_config = {"extra": "forbid"}` — the structural guard against future emotion/confidence fields.
2. Implement `computeSpeechSignals`: word count; WPM = words / (duration/60); filler counts over a configurable list ("um", "uh", "like", "you know", "basically", "actually"); repeated-phrase detection; `answer_length_band` thresholds documented in code; `long_pause_count` from sustained low-energy gaps.
3. Extend the guardrail with the no-inferred-state clause.
4. Extend the coaching prompt to receive signals and produce one concrete suggestion per notable observation.
5. Render the delivery block in the feedback card.

## Testing
- `computeSpeechSignals.test.ts`: WPM arithmetic exact for known inputs; filler counting case-insensitive and not matching inside other words ("like" in "likely" must not count); length bands hit documented thresholds; zero-duration input doesn't divide by zero.
- `test_speech_signals_schema.py`: `extra="forbid"` rejects injected `confidence_score`, `emotion`, `tone`, `pitch` fields.
- Guardrail-presence test asserting the no-inferred-state clause is in the coaching prompt.

## Regression Testing
`evaluate_interview_answer`'s content output must be byte-identical to Sprint 9 for the same input — speech signals must not alter content evaluation. Run Sprint 9's interview suites unchanged.

## Manual Verification
Give a deliberately filler-heavy, fast answer; confirm counts are accurate and coaching addresses pace/fillers concretely. Give a slow, heavily-paused answer; confirm coaching is about structuring thought, **not** about confidence (TEST Q).

## Expected Behaviour
Delivery feedback consists of verifiable observations plus actionable suggestions, never characterizations of the person.

## Failure Cases
Missing/zero duration (e.g. typed answer) → WPM and pause metrics omitted entirely rather than computed as 0 or guessed; the delivery block is skipped for typed answers rather than shown as empty.

## Debugging Guidance
If WPM looks implausible, check whether duration includes pre-speech silence — recording duration is not speaking duration, and the metric should be labelled as overall pace to stay honest.

## Rollback Considerations
Remove the signals payload and the delivery block; content feedback is unaffected because the two paths were kept separate by design.

## Checklist
- [ ] `SpeechSignals` with `extra="forbid"`; no emotion/confidence/pitch field
- [ ] All metrics deterministic and unit-tested
- [ ] Guardrail extended with the no-inferred-state clause
- [ ] Coaching references observations, never inferred states
- [ ] Delivery block omitted (not blank) for typed answers
- [ ] Content evaluation output unchanged from Sprint 9

## Commit Message
`feat(sprint10-day7): deterministic speech/delivery signals and grounded confidence coaching`

## Documentation Updates
`02_Architecture.md` `SpeechSignals` contract and the Day 7 ADR are implemented today.

## End-of-Day Review
The trainer can coach delivery credibly — every claim it makes about how the candidate spoke is a number the candidate could verify themselves.

## Tomorrow Preview
Day 8 adds optional camera with client-side-only geometric visual signals — and deliberately leaves `face-api.js`'s expression classifiers unused.
