# Sprint 9 — Day 7

## Day Title
Interview Coach UI — Setup, Active Question, and Feedback Experience

## Objective
Extend `InterviewQuestionCard.tsx` with an answer `<textarea>` and Submit action for the "active" current question, build the Interview Setup UI (type/difficulty/question-count selection), and wire the Agent Workspace's conversation loop to hold and resend `InterviewSessionState` across turns — implementing the desktop/mobile experience specified in `24_UI_Wireframes.md`'s Sprint 9 section.

## Why This Day Exists
Days 1–6 built a fully working backend loop, but per Day 1's audit, the UI is the third of the three original gaps ("no answer input, no submit, no feedback display"). Today closes it — without this day, everything built so far remains reachable only via direct API calls, not by an actual candidate using the product.

## Repository Evidence / Current State
`InterviewQuestionCard.tsx` (Sprint 8) renders a static, read-only list. The Agent Workspace's `ConversationPane.tsx` (Sprint 8) already holds conversation history in React state and resends it each turn — today extends this same state-holding pattern to also carry `InterviewSessionState`, rather than inventing a new state-management approach.

## Concepts
- Extending an existing component's rendering branch (`isActive` prop) rather than creating a parallel "LiveInterviewCard" component that would duplicate most of `InterviewQuestionCard`'s existing display logic.
- Session state living in the same React state tier as conversation history, per the Day 2 architecture decision — no new state library, no new Context provider.

## Prerequisites
Day 6 complete: full backend loop (start, answer, feedback, follow-up, complete, report) working.

## Setup
No new dependencies.

## Resources
- `24_UI_Wireframes.md`'s Sprint 9 section — the layout spec for today
- `frontend/components/agent/ConversationPane.tsx` (Sprint 8) — the existing state-holding pattern to extend

## Files to Inspect
- `frontend/components/agent/artifacts/InterviewQuestionCard.tsx`
- `frontend/components/agent/ConversationPane.tsx`
- `frontend/app/dashboard/agent/page.tsx`

## Files to Modify
- `frontend/components/agent/artifacts/InterviewQuestionCard.tsx` — add answer `<textarea>` + Submit button, rendered only when `isActive=true`; existing read-only list rendering preserved unchanged when `isActive` is absent/false
- `frontend/components/agent/ConversationPane.tsx` — holds `interviewSession: InterviewSessionState | null` in state, includes it in each `/api/agent/chat` request, updates it from each response
- `frontend/app/dashboard/agent/page.tsx` — wires an "Interview Setup" panel triggered by the interview Quick Action chip

## Files to Create
- `frontend/components/agent/InterviewSetup.tsx`
- `frontend/tests/interviewQuestionCard.test.ts`
- `frontend/tests/interviewSetup.test.ts`

## Architecture Impact
No new route, no new page. All work today extends the existing Sprint 8 Agent Workspace shell and its existing artifact-rendering mechanism.

## Data Flow
```
User clicks "Prep for Interview" Quick Action chip
  -> InterviewSetup.tsx renders inline (type/difficulty/count selection)
  -> User clicks "Start Interview"
  -> ConversationPane sends { message: "start interview", interview_type, difficulty, count } - no interview_session yet
  -> response includes an interview_question_card artifact (isActive=true) + an interview_session object
  -> ConversationPane stores interview_session in state
  -> InterviewQuestionCard renders the active question + answer textarea
  -> User types an answer, clicks Submit
  -> ConversationPane sends { message: "<answer text>", interview_session } (the session as last received)
  -> response includes interview_feedback_card + updated interview_session (+ next interview_question_card if not complete, or interview_report_card if complete)
  -> ConversationPane updates its held interview_session; loop continues
```

## Implementation Plan

### Step 1 — `InterviewSetup.tsx`
```tsx
export function InterviewSetup({ onStart }: { onStart: (config: InterviewConfig) => void }) {
  const [interviewType, setInterviewType] = useState<InterviewType>("mixed");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [count, setCount] = useState(10);
  return (
    <div className="...">
      {/* radio groups per 24_UI_Wireframes.md's Interview Setup mockup */}
      <button onClick={() => onStart({ interviewType, difficulty, count })}>Start Interview</button>
    </div>
  );
}
```
No "feedback timing" control, per the Day-9-Wireframes decision to always show feedback after each answer for MVP.

### Step 2 — `InterviewQuestionCard.tsx` Extension
```tsx
export function InterviewQuestionCard({ data }: { data: InterviewQuestionArtifactData }) {
  const activeQuestion = data.questions.find(q => q.isActive);
  if (activeQuestion) {
    return (
      <div>
        <ProgressBar current={activeQuestion.questionIndex} total={activeQuestion.totalQuestions} />
        <p>{activeQuestion.question}</p>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer..." />
        <button onClick={() => onSubmitAnswer(answer)}>Submit Answer</button>
      </div>
    );
  }
  // Sprint 8's existing read-only list rendering, completely unchanged, for the non-session prep-question use case
  return <ExistingReadOnlyQuestionList questions={data.questions} />;
}
```
The `isActive` branch and the pre-existing branch are mutually exclusive and share no state — confirmed via `interviewQuestionCard.test.ts` that the original Sprint 8 behavior (asking for "give me interview questions" with no session) is completely unaffected.

### Step 3 — `ConversationPane.tsx` Session State
```tsx
const [interviewSession, setInterviewSession] = useState<InterviewSessionState | null>(null);

async function sendMessage(text: string) {
  const payload = { message: text, resume, attachments, interview_session: interviewSession };
  const response = await fetch("/api/agent/chat", { method: "POST", body: JSON.stringify(payload) });
  for await (const event of streamAgentEvents(response)) {
    if (event.type === "artifact" && event.artifact.type === "interview_question_card") {
      // extract and store the returned interview_session from the response payload
    }
    // ... existing event handling unchanged ...
  }
}
```

### Step 4 — Progress Bar and Cancel Control
`ProgressBar` (new, small component) renders the `●●●○○○○○○○` style indicator from the wireframe using `questionIndex`/`totalQuestions`. A `[ Cancel Interview ]` button (visible only while `interviewSession?.status === "in_progress"`) simply calls `setInterviewSession(null)` — no network call, matching the Decision Log's "cancel is a pure client-side discard" design.

## Ready-to-Paste Antigravity Prompt
"Extend `InterviewQuestionCard.tsx` to render an answer textarea and Submit button when a question in its `data.questions` array has `isActive=true`, while leaving the existing read-only list rendering completely unchanged for the non-active case. Add `interviewSession` state to `ConversationPane.tsx`, following the exact pattern already used for conversation history, sending it on every request and updating it from every response. Create `InterviewSetup.tsx` per the wireframe in `24_UI_Wireframes.md`, with no feedback-timing control."

## Testing
- `interviewQuestionCard.test.ts`: renders textarea+Submit only when `isActive=true`; renders the original Sprint 8 list view identically to before when no question is active.
- `interviewSetup.test.ts`: `onStart` callback receives the exact selected config; defaults match the Decision Log (`mixed`/`intermediate`/10 questions... confirm actual default count chosen).

## Regression Testing
Confirm every other Sprint 8 artifact renderer, the Quick Actions chip bar, and the conversation history mechanism are unaffected — today only adds new state and one component's new rendering branch.

## Manual Verification
Complete a full mock interview through the real UI end-to-end: setup → active question → submit answer → feedback → next question (or follow-up) → ... → report. Confirm this matches `24_UI_Wireframes.md`'s states exactly.

## Expected Behaviour
A candidate can now conduct an entire mock interview through the Agent Workspace UI with no direct API calls needed — closing the third and final Day 1 gap.

## Failure Cases
Submitting an empty answer should be prevented client-side (disable Submit until non-empty text is entered) rather than sending an empty string to `evaluate_interview_answer`, which would produce meaningless feedback.

## Debugging Guidance
If the session seems to "reset" between turns, check whether `interviewSession` state is being correctly updated from the response before the *next* `sendMessage` call reads it — a stale-closure bug (reading old state in an async callback) is the most likely UI-side cause.

## Security Considerations
No new security surface — reuses the existing authenticated `/api/agent/chat` proxy exactly as every other Sprint 8 UI interaction does.

## Checklist
- [x] `InterviewSetup.tsx` implemented per wireframe
- [x] `InterviewQuestionCard.tsx` extended without regressing its Sprint 8 read-only behavior
- [x] `ConversationPane.tsx` / `page.tsx` correctly holds and resends `interviewSession`
- [x] Progress bar and Cancel control implemented
- [x] Full end-to-end mock interview walkthrough completed and verified

## Commit Message
`feat(sprint9-day7): Interview Coach UI - setup, active question answer input, session state in ConversationPane`

## Documentation Updates
`24_UI_Wireframes.md`'s Sprint 9 section is the spec implemented today; no further changes needed.

## End-of-Day Review
All three of Day 1's identified gaps are now closed: the tool is reachable, the session exists, and the UI supports the full interaction. Day 8 adds the two new artifact renderers (`InterviewFeedbackCard`, `InterviewReportCard`) that today's flow already produces data for but doesn't yet visually render.

## Tomorrow Preview
Day 8 implements `InterviewFeedbackCard.tsx` and `InterviewReportCard.tsx`, extends `ArtifactRenderer.tsx`'s switch to the full 10-artifact-type union, and confirms the streaming event sequence for a complete interview turn matches `02_Architecture.md`'s documented data flow exactly.
