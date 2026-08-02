# Sprint 6 — Day 7: UX Hardening — Errors, Token Control, Reset & Responsive Behaviour

## Day Title
**AI Career Coach — UX Hardening, Error States & Context Transparency**

## Objective
Harden every edge of the Career Coach user experience: per-message character limits, explicit conversation token budget warnings, comprehensive error state handling, responsive layout improvements, a context inspector panel (what did the Coach actually receive?), and smooth keyboard/accessibility behaviour. Day 7 is the quality sprint — nothing new architecturally, but the Coach becomes production-quality rather than prototype-quality.

## Why This Day Exists
Days 1–6 built a working Career Coach. Day 7 makes it trustworthy and resilient. Specific confirmed gaps from reading the Day 3–6 implementation:

1. **No per-message character limit on the input.** A user can paste 100,000 characters — the server rejects it at 4000 chars, but the UI shows no warning until after the send attempt fails.
2. **No conversation length warning.** After 8+ turns, `trimConversationHistory` silently drops early messages. The user doesn't know their context window has shifted.
3. **Error messages are raw API error strings.** Some OpenRouter errors are technical ("context_length_exceeded"). Users need human-readable messages.
4. **No context inspector.** Users cannot see what the Coach "knows about them." Transparency builds trust.
5. **Mobile layout:** The chat area and JD panel need verified responsiveness — the `max-w-4xl` container behaviour on narrow viewports has not been explicitly tested.
6. **Input auto-resize:** The textarea is fixed at `rows=2`. Long questions get scrollbars inside 2 rows, which is awkward.

## Repository Evidence / Current State
- **`app/dashboard/career-coach/page.tsx`** (Days 3–6) — the file being hardened today. Full implementation confirmed from previous days.
- **`app/api/career-coach/route.ts`** (Day 2) — returns specific error JSON for 400, 401, 429, 502. The client should translate these to user-friendly messages.
- **`lib/careerCoachService.ts`** (Day 1) — `trimConversationHistory`, `hasResumeContent`, `buildResumeContextBlock`. No changes needed today.

## Concepts
- **Auto-resize textarea:** A textarea that grows with its content uses a `useEffect` that sets `element.style.height = "auto"` then `element.style.height = element.scrollHeight + "px"`. This requires `min-h` and `max-h` constraints via Tailwind.
- **Input character counter:** Show `inputValue.length / 4000` when the user is approaching the limit. Show red when > 3500.
- **Conversation length indicator:** Count turns (pairs of user+assistant messages). When turns ≥ 6 (meaning 2 more turns before trimming), show a subtle banner: "Earlier messages may fall outside the conversation window."
- **Context Inspector:** A collapsible panel (initially collapsed) showing what the Coach received in its last request: whether resume context was included, the ATS score that was sent, and whether a JD was active. This uses the same state already computed — no new API call needed.
- **User-friendly error mapping:** Map known error patterns to clean messages: "Rate limit reached" → "HireLens is receiving a lot of requests right now. Please wait a moment.", "You must be signed in" → "Your session has expired. Please sign in again.", "Failed to connect" → "Couldn't reach the Career Coach service. Check your connection and try again."

## Prerequisites
- Days 1–6 complete; streaming, resume context, ATS context, JD panel all working; build clean.
- Read the current state of `app/dashboard/career-coach/page.tsx` fully before editing.

## Setup
No new packages.

## Files to Inspect
- `frontend/app/dashboard/career-coach/page.tsx` (full, current state)
- `frontend/app/api/career-coach/route.ts` (error response shapes)

## Files to Modify
- `frontend/app/dashboard/career-coach/page.tsx` — all hardening changes today

## Files to Create
None today.

## Architecture Impact
No structural changes. The page becomes more robust and transparent. No new API calls, no new context providers, no new service files.

## Data Flow Additions
```
inputValue changes
→ useEffect auto-resizes textarea height
→ character counter updates (red when > 3500)

messages changes
→ turn count computed: Math.floor(messages.length / 2)
→ context window warning shown when turns >= 6

On error in handleSend:
→ mapErrorToUserMessage(rawError) → human-readable string
→ setError(humanReadable)

Context inspector button (bottom of context status bar):
→ toggles inspector panel showing:
   - Resume: loaded / not loaded
   - ATS Score: X/100 / not available
   - JD: active (N chars) / not set
   - History: N turns (trim at 8)
```

## Implementation Plan

### Step 1 — Add error message mapping helper (at top of file, below imports)

```typescript
function mapErrorToUserMessage(err: Error): string {
    const msg = err.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("429")) {
        return "HireLens Career Coach is receiving a lot of requests right now. Please wait a moment and try again.";
    }
    if (msg.includes("sign in") || msg.includes("unauthorized") || msg.includes("401")) {
        return "Your session has expired. Please refresh the page and sign in again.";
    }
    if (msg.includes("connect") || msg.includes("network") || msg.includes("502")) {
        return "Couldn't reach the Career Coach service. Please check your connection and try again.";
    }
    if (msg.includes("4000") || msg.includes("too long") || msg.includes("character")) {
        return "Your message is too long. Please shorten it and try again.";
    }
    return "Something went wrong. Please try again.";
}
```

Update the catch block in `handleSend` to use this mapping:
```typescript
} catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") return;
    const message = err instanceof Error ? mapErrorToUserMessage(err) : "Something went wrong. Please try again.";
    setError(message);
    setMessages(prev => prev.slice(0, -1));
}
```

### Step 2 — Input character limit enforcement and auto-resize

Add `MAX_INPUT_LENGTH = 3800` constant (slightly below the API's 4000 limit so validation never triggers).

Add character count display below the textarea (inside the input area div):
```tsx
<div className="flex justify-between items-center mt-1">
    <p className="text-[10px] text-slate-400 dark:text-slate-500">
        The Coach uses your HireLens resume and ATS analysis as context.
    </p>
    {inputValue.length > 2000 && (
        <span className={`text-[10px] ${inputValue.length > 3500 ? "text-red-500" : "text-slate-400"}`}>
            {inputValue.length}/{MAX_INPUT_LENGTH}
        </span>
    )}
</div>
```

Clamp input in `onChange`:
```typescript
onChange={(e) => setInputValue(e.target.value.substring(0, MAX_INPUT_LENGTH))}
```

Auto-resize the textarea with a `useEffect`:
```typescript
useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 128) + "px"; // max-h-32
}, [inputValue]);
```

Remove `rows={2}` from the textarea and replace with `style={{ minHeight: "44px" }}`.

### Step 3 — Conversation length warning

Compute turn count and add a warning banner between the JD panel and the message area:
```typescript
const turnCount = Math.floor(messages.length / 2);
```

```tsx
{turnCount >= 6 && (
    <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 shrink-0">
        💬 Earlier messages in this conversation may fall outside the coaching context window.{" "}
        <button onClick={handleReset} className="underline hover:no-underline">Start a new conversation</button>{" "}
        if the Coach seems to lose context.
    </div>
)}
```

### Step 4 — Context Inspector Panel

Add `inspectorOpen` state: `const [inspectorOpen, setInspectorOpen] = useState<boolean>(false)`.

Add an "ℹ Context" toggle button to the right side of the context status bar:
```tsx
<button
    onClick={() => setInspectorOpen(!inspectorOpen)}
    className="ml-auto text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
>
    ℹ️ Context
</button>
```

Add the inspector panel below the context status bar (when open):
```tsx
{inspectorOpen && (
    <div className="mb-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1 shrink-0">
        <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">What the Coach receives in each request:</p>
        <p>{hasResumeContent(resume) ? "✅ Resume: loaded" : "⚪ Resume: not loaded (add content in Resume Builder)"}</p>
        <p>{atsResult ? `✅ ATS Analysis: overall score ${Math.round(atsResult.overallScore)}/100 included` : "⚪ ATS Analysis: not available"}</p>
        <p>{jobDescription.trim().length >= 20 ? `✅ Job Description: active (${jobDescription.trim().length} chars)` : "⚪ Job Description: not set"}</p>
        <p>{`📊 Conversation history: ${turnCount} turn${turnCount !== 1 ? "s" : ""} (max 8 before oldest are trimmed)`}</p>
        <p className="text-[10px] text-slate-400 mt-2">ATS scores are computed by HireLens's deterministic engine — the Coach explains them, not recalculates them.</p>
    </div>
)}
```

### Step 5 — Mobile responsive adjustments

The `max-w-4xl mx-auto` container is already responsive. Add `px-3 sm:px-0` to the outer div to prevent content touching the screen edges on very narrow viewports. Verify the JD panel textarea is readable on mobile (`h-24` is fine). The message bubbles use `max-w-[75%]` — on narrow screens, `max-w-[85%]` is more readable:
```tsx
className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl ...`}
```

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 6, Day 7: UX Hardening.

The only file being modified today is:
  frontend/app/dashboard/career-coach/page.tsx

Current state: The page has a fully working streaming Career Coach with resume context, ATS context, and JD panel (from Days 3–6). Today hardens the UX.

Task — 5 changes, no structural rewrites:

Change 1: Add mapErrorToUserMessage() helper function above the component export. Maps known error patterns to user-friendly strings:
- "rate limit" / "429" → "HireLens Career Coach is receiving a lot of requests right now. Please wait a moment and try again."
- "sign in" / "unauthorized" / "401" → "Your session has expired. Please refresh the page and sign in again."
- "connect" / "network" / "502" → "Couldn't reach the Career Coach service. Please check your connection and try again."
- "4000" / "too long" / "character" → "Your message is too long. Please shorten it and try again."
- Default → "Something went wrong. Please try again."
Update handleSend catch block to use mapErrorToUserMessage(err) instead of err.message.

Change 2: Input character limit and auto-resize:
- Add MAX_INPUT_LENGTH = 3800 constant.
- Clamp onChange to substring(0, MAX_INPUT_LENGTH).
- Remove rows={2} from textarea, add style={{ minHeight: "44px" }}.
- Add useEffect that auto-resizes textarea to fit content (max 128px): set element.style.height = "auto" then element.style.height = Math.min(element.scrollHeight, 128) + "px" when inputValue changes.
- Show character counter below the disclaimer text when inputValue.length > 2000. Show red when > 3500.

Change 3: Conversation length warning:
- Compute: const turnCount = Math.floor(messages.length / 2);
- When turnCount >= 6, show a small amber banner above the message area: "Earlier messages may fall outside the coaching context window. [Start a new conversation] if the Coach seems to lose context." where the bracketed text calls handleReset.

Change 4: Context Inspector:
- Add inspectorOpen state (boolean, default false).
- Add "ℹ️ Context" toggle button on the right side of the context status bar.
- When open, show a panel below the status bar listing: resume status, ATS analysis status (with score), JD status (with char count), conversation turn count, and a note that ATS scores are from the deterministic engine.

Change 5: Responsive adjustments:
- Message bubble max-width: max-w-[85%] sm:max-w-[75%] instead of max-w-[75%].
- Outer container: add px-3 sm:px-0 to prevent edge-touching on narrow viewports.

Constraints:
- Only career-coach/page.tsx is modified. No new files, no new packages.
- The streaming logic, handleSend request body, and all other functionality from Days 1–6 are NOT changed.
- npm run build must succeed. Both existing test suites must pass.
- Report the exact diff.
```

## Testing
```bash
npm run build
npx tsx tests/atsBenchmark.test.ts
npx tsx tests/optimizerSafety.test.ts
npm run dev
```

## Manual Verification
1. **Error mapping:** Disconnect from OpenRouter (remove API key temporarily in dev) → send a message → confirm "Couldn't reach the Career Coach service" message, not a raw error.
2. **Character limit:** Paste 3900+ characters → input truncates at 3800, counter shows red.
3. **Auto-resize:** Type 4 lines of text → textarea grows naturally up to ~128px, then scrolls.
4. **Turn count warning:** Have 6+ conversation turns → amber banner appears. Click "Start a new conversation" → resets.
5. **Context inspector:** Click "ℹ️ Context" → panel opens showing current state of all 4 context sources.
6. **Mobile:** Shrink browser window to 375px wide → message bubbles fit at 85%, no horizontal scroll.

## Regression Testing
```bash
npx tsx tests/atsBenchmark.test.ts   # must pass
npx tsx tests/optimizerSafety.test.ts # must pass
```
Both existing suites are unchanged by today's UX-only modifications.

## Expected Behaviour
Every edge case is handled gracefully. Users understand what the Coach knows, get clear error messages when things fail, and have warnings before their context window shrinks. The UI looks and feels professional on all screen sizes.

## Failure Cases
- Auto-resize causing layout jump: The `height = "auto"` then `height = scrollHeight` pattern briefly collapses and re-expands. The `shrink-0` on the input area prevents this from affecting the message area height.
- Context inspector showing stale values: The inspector reads from existing state variables (`atsResult`, `jobDescription`, `turnCount`) — these are always current, not cached separately.

## Debugging Guidance
| Symptom | Likely Cause | Fix |
|---|---|---|
| Auto-resize not working | `inputRef.current` is null | Confirm `inputRef` is on the `<textarea>` element, not a wrapper div |
| Character counter not appearing | Condition `inputValue.length > 2000` not met | Type 2001+ characters, then check |
| Context inspector toggle not working | `inspectorOpen` state not declared | Confirm `const [inspectorOpen, setInspectorOpen] = useState(false)` is in the component body |

## Checklist
- [ ] `mapErrorToUserMessage()` helper added and used in catch block
- [ ] Input clamped to `MAX_INPUT_LENGTH` characters
- [ ] Textarea auto-resizes with content (no fixed `rows` prop)
- [ ] Character counter shows when > 2000 chars, red when > 3500
- [ ] Turn count warning banner at ≥ 6 turns
- [ ] Context inspector panel added and toggles correctly
- [ ] Message bubble width responsive (`max-w-[85%] sm:max-w-[75%]`)
- [ ] `npm run build` succeeds
- [ ] All 6 manual verification items checked

## Commit Message
```
feat(career-coach): UX hardening — error messages, input limits, context inspector, responsive layout
```

## Documentation Updates
- `docs/05_Prompt_Library.md` — add Sprint 6 Day 7 entry
- `docs/26_Risks.md` — mark "JD UX Confusion" risk mitigated by Day 7's context inspector

## End-of-Day Review
The Career Coach is production-quality. Every error case has a human-readable message. Users can inspect what context the Coach has. The conversation window warning prevents silent context loss confusion. The UI is responsive. Tomorrow is the safety test suite and Sprint 6 close-out.

## Tomorrow Preview
Day 8 — Sprint 6 close-out: create `tests/careerCoachSafety.test.ts` with deterministic assertions covering prompt composition, context inclusion, truth-preservation instructions, and conversation trimming. Run the full regression suite. Complete all documentation updates and mark Sprint 6 ready for review.
