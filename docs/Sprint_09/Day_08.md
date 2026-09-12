# Sprint 9 — Day 8

## Day Title
Feedback and Report Artifact Renderers, Streaming Verification

## Objective
Implement `InterviewFeedbackCard.tsx` and `InterviewReportCard.tsx`, extend `ArtifactRenderer.tsx`'s switch to the full 10-type closed union (8 from Sprint 8 + 2 new), and verify the end-to-end streaming event sequence for a complete interview turn matches `02_Architecture.md`'s documented data flow using only the existing 9 event types.

## Why This Day Exists
Day 6 built the backend data these two artifacts carry; Day 7 built the interaction that triggers them; today makes them visible, completing the Generative UI contract for Sprint 9 the same way Sprint 8 Day 8 completed it for the original 8 artifact types. This is also the day the "no new event types" decision gets verified against real running code, not just asserted in the architecture doc.

## Repository Evidence / Current State
`ArtifactRenderer.tsx` (Sprint 8) has an exhaustive `switch` over 8 artifact types with a safe `default` case. `InterviewFeedbackArtifactData` and `InterviewReportArtifactData` schemas exist (Day 6) but have no corresponding React components yet.

## Concepts
- Extending a closed discriminated union safely — TypeScript's exhaustiveness checking means adding the 2 new cases to `ArtifactRenderer.tsx`'s switch (and the corresponding `Artifact` type in `types/agent.ts`) is a compiler-enforced checklist, not a manual one.

## Prerequisites
Day 7 complete: the UI can trigger a full interview turn end-to-end (previously unrenderable feedback/report data now exists in the response, just not yet displayed).

## Setup
No new dependencies.

## Resources
- `24_UI_Wireframes.md`'s Feedback State and Session Complete / Report State mockups
- `frontend/components/agent/ArtifactRenderer.tsx` (Sprint 8, to extend)

## Files to Inspect
- `frontend/components/agent/ArtifactRenderer.tsx`
- `frontend/types/agent.ts`

## Files to Modify
- `frontend/components/agent/ArtifactRenderer.tsx` — add 2 new switch cases
- `frontend/types/agent.ts` — add `InterviewFeedbackArtifact` and `InterviewReportArtifact` to the `Artifact` union (already sketched in `02_Architecture.md`'s Sprint 9 section)

## Files to Create
- `frontend/components/agent/artifacts/InterviewFeedbackCard.tsx`
- `frontend/components/agent/artifacts/InterviewReportCard.tsx`
- `frontend/tests/interviewFeedbackCard.test.ts`
- `frontend/tests/interviewReportCard.test.ts`
- `agent-service/tests/test_interview_streaming_sequence.py`

## Architecture Impact
Completes the artifact-type union at 10 total types. No new event types (verified today, not just designed).

## Data Flow
```
tool_completed (tool=evaluate_interview_answer) -> artifact (type=interview_feedback_card) -> ArtifactRenderer -> InterviewFeedbackCard
... (follow-up or next question) ...
tool_completed (tool=generate_interview_report) -> artifact (type=interview_report_card) -> ArtifactRenderer -> InterviewReportCard
completed
```

## Implementation Plan

### Step 1 — `InterviewFeedbackCard.tsx`
```tsx
export function InterviewFeedbackCard({ data }: { data: InterviewFeedbackArtifactData }) {
  return (
    <div>
      <h3>Answer Feedback</h3>
      <section>
        <h4>Strengths</h4>
        <ul>{data.strengths.map(s => <li key={s}>+ {s}</li>)}</ul>
      </section>
      <section>
        <h4>Improve</h4>
        <ul>{data.improvements.map(i => <li key={i}>! {i}</li>)}</ul>
      </section>
      <p>Suggested Structure: {data.suggested_answer_direction}</p>
      <button onClick={onContinue}>Continue Interview</button>
    </div>
  );
}
```
Matches `24_UI_Wireframes.md`'s Feedback State mockup exactly. No numeric score rendered anywhere, since none exists in the data shape (Day 6's schema enforcement).

### Step 2 — `InterviewReportCard.tsx`
```tsx
export function InterviewReportCard({ data }: { data: InterviewReportArtifactData }) {
  return (
    <div>
      <h3>Interview Readiness Summary</h3>
      {Object.entries(data.readinessByCategory).map(([category, label]) => (
        <div key={category}>{category}: {label}</div>
      ))}
      <h4>Priority Areas</h4>
      <ol>{data.priorityTopics.map(t => <li key={t}>{t}</li>)}</ol>
      <p className="text-muted">{data.note}</p>
      <button onClick={onPracticeAgain}>Practice Again</button>
      <button onClick={onBackToAgent}>Back to Agent</button>
    </div>
  );
}
```

### Step 3 — Extend `ArtifactRenderer.tsx`
```tsx
switch (artifact.type) {
  // ... existing 8 cases unchanged ...
  case "interview_feedback_card": return <InterviewFeedbackCard data={artifact.data} />;
  case "interview_report_card": return <InterviewReportCard data={artifact.data} />;
  default:
    console.warn("Unknown artifact type received - ignored", artifact);
    return null;
}
```
TypeScript's exhaustiveness checking on the now-10-member `Artifact` union means omitting either case here is a compile error.

### Step 4 — Verify the Streaming Sequence
```python
# test_interview_streaming_sequence.py
async def test_full_interview_turn_uses_only_existing_event_types():
    events = await collect_events_for_a_full_turn(...)
    seen_types = {e["type"] for e in events}
    assert seen_types.issubset(EXISTING_9_EVENT_TYPES)  # imported from schemas/events.py's Literal definition
```
This test is the concrete enforcement of the "no new event types" Decision Log ADR — it will fail loudly if a future change accidentally introduces a 10th event type.

## Ready-to-Paste Antigravity Prompt
"Create `InterviewFeedbackCard.tsx` and `InterviewReportCard.tsx` per the mockups in `24_UI_Wireframes.md`'s Sprint 9 section, matching the data shapes in `02_Architecture.md`. Extend `ArtifactRenderer.tsx`'s switch and the `Artifact` union in `types/agent.ts` to include these two new types, keeping the existing 8 cases and the safe `default` case unchanged. Write `test_interview_streaming_sequence.py` asserting that a full interview turn's event stream only ever uses the 9 event types already defined in `schemas/events.py`."

## Testing
- `interviewFeedbackCard.test.ts` / `interviewReportCard.test.ts`: render correctly given valid data; render nothing/gracefully given a malformed payload (matches Sprint 8's Day 8 "unknown artifact type" safety precedent).
- `test_interview_streaming_sequence.py`: as described in Step 4.

## Regression Testing
Confirm the existing 8 artifact renderers and their tests are completely unaffected by the union's extension.

## Manual Verification
Trigger a feedback card and a report card through a real end-to-end session and visually confirm both match their wireframe mockups.

## Expected Behaviour
All 10 artifact types render correctly; the streaming protocol is confirmed, not just designed, to use no new event types.

## Failure Cases
If `test_interview_streaming_sequence.py` ever fails (a new event type sneaks in), this must be treated as a Decision Log violation requiring either a documented amendment to that ADR or a fix to remove the new event type, not a silent test update.

## Debugging Guidance
If a card renders with missing fields, check the artifact's `data` shape against the Day 6 Pydantic models first — a Python/TypeScript shape mismatch is the most likely cause, consistent with the general Sprint 8 debugging guidance for this class of issue.

## Security Considerations
No new security surface — presentation-layer work only, over data already validated by Day 6's schemas.

## Checklist
- [x] `InterviewFeedbackCard.tsx` and `InterviewReportCard.tsx` implemented and matching wireframes
- [x] `ArtifactRenderer.tsx` extended to 10 total artifact types, exhaustiveness-checked
- [x] Streaming sequence test confirms zero new event types
- [x] Existing 8 artifact renderers unaffected

## Commit Message
`feat(sprint9-day8): interview feedback/report artifact renderers, 10-type closed artifact union, streaming verification`

## Documentation Updates
`02_Architecture.md`'s New Artifact Types section is the spec implemented today; no further changes needed.

## End-of-Day Review
Every piece of Sprint 9's core loop — start, question, answer, feedback, follow-up, advance, complete, report — is now both functionally working (Days 1–6) and visually complete (Days 7–8).

## Tomorrow Preview
Day 9 hardens the system: enforces `MAX_QUESTIONS_PER_SESSION`/`MAX_FOLLOW_UPS_PER_QUESTION` under adversarial testing, verifies anti-fabrication guardrails on the two new tools, and reviews the session-state-tampering risk documented in `26_Risks.md`.
