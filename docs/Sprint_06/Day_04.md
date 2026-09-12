# Sprint 6 — Day 4: Multi-Turn Conversation State & Real Streaming Connection

## Day Title
**AI Career Coach — Real Streaming API Connection & Multi-Turn Conversation**

## Objective
Replace the Day 3 `handleSend` stub with a real streaming fetch implementation that reads the Career Coach API route token-by-token and updates the assistant message in the UI as each chunk arrives. Today also hardens multi-turn conversation state management: every message exchange is preserved in client state and sent to the API on subsequent turns.

## Why This Day Exists
Day 3 produced a visually complete shell with a placeholder response. Day 4 makes it real. The streaming fetch pattern is the most technically precise work of Sprint 6 — reading a `ReadableStream`, accumulating partial chunks correctly, handling mid-stream errors, and keeping the UI responsive during a long generation are all non-trivial. Doing this on its own day ensures it gets full attention before resume context (Day 5) and ATS context (Day 6) are layered on top.

## Repository Evidence / Current State
- **`app/api/career-coach/route.ts`** (Day 2) — confirmed structure: POST, verifyAuth, assembles system context, calls OpenRouter with `stream: true`, returns `ReadableStream` as `text/plain; charset=utf-8`.
- **`app/dashboard/career-coach/page.tsx`** (Day 3) — confirmed: `handleSend` is a stub that adds a placeholder assistant message. `messages`, `inputValue`, `isStreaming`, `error` state already declared. The page structure is in place.
- **`lib/careerCoachService.ts`** (Day 1) — `ChatMessage`, `trimConversationHistory` available.
- **`lib/aiService.ts`** — reference: uses `AbortController` and `getIdToken()`. The same token pattern is used today.

## Concepts
- **Streaming fetch on the client:** The client calls `fetch("/api/career-coach", {...})` and reads `response.body.getReader()`. Each call to `reader.read()` returns `{ done, value }` where `value` is a `Uint8Array` chunk. Decoding with `TextDecoder` gives raw text tokens. These are accumulated into the current assistant message by updating state on each chunk.
- **Optimistic message append:** When the user sends a message, a `user` message is immediately added to state. Then an empty `assistant` message is added as a placeholder. As tokens stream in, that last `assistant` message's content is progressively replaced via `setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: accumulated }])`. This produces the "typing" effect.
- **AbortController for cancellation:** An `AbortController` is created per request. The `abort()` method is called if the user resets the conversation mid-stream or the component unmounts. This prevents stale state updates.
- **Multi-turn history:** Every previous message is included in the request body on each new send (after `trimConversationHistory` reduces to the last 8 turns). The server adds the system context and forwards the full array to OpenRouter. OpenRouter's Gemini model correctly interprets the alternating user/assistant history.

## Prerequisites
- Days 1–3 complete; page shell renders; API route streams; both existing test suites pass.
- Read `app/dashboard/career-coach/page.tsx` fully — replacing `handleSend` specifically.
- Read `lib/aiService.ts` for the `getIdToken()` pattern.

## Setup
No new packages.
```bash
cd frontend
npm run build   # confirm clean before today's changes
```

## Resources
- `app/dashboard/career-coach/page.tsx` — primary file modified today
- `lib/careerCoachService.ts` — `trimConversationHistory`, `ChatMessage`
- `contexts/AuthContext.tsx` — `user.getIdToken()`

## Files to Inspect
- `frontend/app/dashboard/career-coach/page.tsx`
- `frontend/app/api/career-coach/route.ts`
- `frontend/lib/aiService.ts`
- `frontend/lib/careerCoachService.ts`

## Files to Modify
- `frontend/app/dashboard/career-coach/page.tsx` — replace stub `handleSend` with real streaming implementation

## Files to Create
None today.

## Architecture Impact
No new files, no new routes. The page becomes a live client for the Day 2 streaming API. After Day 4, the Career Coach is fully functional for general conversation without resume or ATS context (those come Days 5–6).

## Data Flow
```
User types and sends message
→ userMessage added to messages state immediately
→ Empty assistant placeholder added to messages state
→ AbortController created
→ user.getIdToken() called for Firebase auth token
→ trimConversationHistory(allMessages, 8) produces trimmedHistory
→ POST /api/career-coach with { messages: trimmedHistory } + Authorization header
→ Response body reader opened
→ TextDecoder decodes each Uint8Array chunk → string token(s)
→ setMessages updates last message content (assistant placeholder → accumulating text)
→ On done: isStreaming = false, abortController = null
→ On error: error state set, streaming indicator removed
```

## Implementation Plan

### Step 1 — Add `AbortController` ref and imports to the page

Add to imports:
```typescript
import { trimConversationHistory, ChatMessage } from "@/lib/careerCoachService";
```
(These are likely already imported on Day 3. Confirm and add only what is missing.)

Add ref inside the component (alongside `messagesEndRef`):
```typescript
const abortControllerRef = useRef<AbortController | null>(null);
```

### Step 2 — Update `handleReset` to cancel in-flight requests
```typescript
const handleReset = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages([]);
    setInputValue("");
    setError(null);
    setIsStreaming(false);
};
```

### Step 3 — Replace `handleSend` stub with the real implementation

```typescript
const handleSend = async (text?: string) => {
    const content = (text ?? inputValue).trim();
    if (!content || isStreaming) return;

    setInputValue("");
    setError(null);

    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
        // Get Firebase auth token
        const token = await user?.getIdToken();
        if (!token) throw new Error("You must be signed in to use Career Coach.");

        // Trim history for the API request (server also enforces this)
        const trimmedHistory = trimConversationHistory(updatedMessages, 8);

        const response = await fetch("/api/career-coach", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                messages: trimmedHistory,
                // resumeContext and atsContext added in Day 5 & 6
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData?.error ?? `Request failed (${response.status})`;
            if (response.status === 429) {
                throw new Error("Rate limit reached. Please wait a moment and try again.");
            }
            throw new Error(errMsg);
        }

        if (!response.body) throw new Error("No response stream received.");

        // Stream the response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;

            // Update the last message (assistant placeholder) with accumulated content
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: accumulated },
            ]);
        }

        // Flush any remaining bytes in the decoder
        const finalChunk = decoder.decode();
        if (finalChunk) {
            accumulated += finalChunk;
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: accumulated },
            ]);
        }

    } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
            // User reset the conversation mid-stream — silently discard
            return;
        }
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
        // Remove the empty assistant placeholder on error
        setMessages(prev => prev.filter((_, i) => i < prev.length - 1));
    } finally {
        if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
    }
};
```

### Step 4 — Add cleanup on unmount
```typescript
useEffect(() => {
    return () => {
        abortControllerRef.current?.abort();
    };
}, []);
```

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 6, Day 4: Real Streaming API Connection.

The only file being modified today is:
  frontend/app/dashboard/career-coach/page.tsx

Current state of this file (from Day 3): handleSend is a stub that adds a placeholder assistant message. The page imports ChatMessage from careerCoachService. messages, inputValue, isStreaming, error state are all declared. messagesEndRef is declared for auto-scroll. The full UI (empty state, message list, input) is fully rendered.

Task: Replace the handleSend stub with the real streaming implementation and harden the reset flow.

Change 1 — Add AbortController ref:
Inside the component, add alongside messagesEndRef:
  const abortControllerRef = useRef<AbortController | null>(null);
Add to the existing react import if useRef is not already imported (it should be from Day 3).

Change 2 — Add trimConversationHistory to imports:
Ensure the import from "@/lib/careerCoachService" includes: ChatMessage, trimConversationHistory.

Change 3 — Update handleReset to cancel in-flight requests:
const handleReset = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages([]);
    setInputValue("");
    setError(null);
    setIsStreaming(false);
};

Change 4 — Replace handleSend with the real implementation:
const handleSend = async (text?: string) => {
    const content = (text ?? inputValue).trim();
    if (!content || isStreaming) return;
    setInputValue("");
    setError(null);
    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, { role: "assistant", content: "" }]);
    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
        const token = await user?.getIdToken();
        if (!token) throw new Error("You must be signed in to use Career Coach.");
        const trimmedHistory = trimConversationHistory(updatedMessages, 8);
        const response = await fetch("/api/career-coach", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ messages: trimmedHistory }),
            signal: controller.signal,
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            if (response.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
            throw new Error(errData?.error ?? `Request failed (${response.status})`);
        }
        if (!response.body) throw new Error("No response stream received.");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: accumulated }]);
        }
        const finalChunk = decoder.decode();
        if (finalChunk) {
            accumulated += finalChunk;
            setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: accumulated }]);
        }
    } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
        setMessages(prev => prev.slice(0, -1));
    } finally {
        if (abortControllerRef.current === controller) abortControllerRef.current = null;
        setIsStreaming(false);
    }
};

Change 5 — Add cleanup useEffect for unmount:
useEffect(() => {
    return () => { abortControllerRef.current?.abort(); };
}, []);

Constraints:
- Only frontend/app/dashboard/career-coach/page.tsx is modified.
- The page's UI structure (empty state, message list, streaming indicator, input, disclaimer) is NOT changed — only handleSend, handleReset, and the new AbortController ref are changed.
- No new npm packages.
- resumeContext and atsContext are NOT yet passed in the fetch body (Days 5 and 6 add those).
- Run npm run build and confirm zero TypeScript errors.
- Run npx tsx tests/atsBenchmark.test.ts and npx tsx tests/optimizerSafety.test.ts — both must pass.
- Report the exact diff.
```

## Testing
```bash
cd frontend
npm run build
npm run dev
```

## Manual Verification
1. Navigate to `/dashboard/career-coach`.
2. Type "Hello, can you help me with my resume?" and press Enter.
3. Confirm: user message appears immediately (right-aligned, blue), typing indicator shows, then the assistant message streams in token-by-token (left-aligned, slate).
4. Type a follow-up question referencing the previous answer — confirm the model has conversation history (mentions something from the first response).
5. Click "New conversation" while a response is streaming — confirm the stream is cancelled (no stale text appears after reset), and the page returns to empty state cleanly.
6. Disconnect network mid-stream — confirm an error message appears and the empty placeholder assistant message is removed.
7. With a valid session: check browser network tab — confirm the request includes `Authorization: Bearer <token>` header and the body includes the conversation history array.

## Regression Testing
```bash
npx tsx tests/atsBenchmark.test.ts
npx tsx tests/optimizerSafety.test.ts
```

## Expected Behaviour
The Career Coach is fully functional for general career conversation. Responses stream in real-time. Multi-turn history is preserved client-side and sent to the server. Reset cleanly cancels in-flight requests.

## Failure Cases
- **Empty stream:** `response.body` is null — error message shown, placeholder removed.
- **Auth failure:** `user.getIdToken()` returns null (expired session) — error "You must be signed in" shown.
- **Network timeout:** `fetch` throws — error message shown.
- **AbortError on reset:** Silently discarded — no error message for deliberate user action.

## Debugging Guidance
| Symptom | Likely Cause | Fix |
|---|---|---|
| Streaming shows full response at once (no animation) | TextDecoder chunks are too large or buffered | Verify OpenRouter returns SSE chunks; confirm route does not buffer the whole response |
| "You must be signed in" error even when logged in | `user` is null at the time of the call | Confirm `const { user } = useAuth()` is at the top of the component and `user` is not null when clicking send |
| Empty assistant message stays after error | `setMessages(prev => prev.slice(0, -1))` not removing it | Check the error catch branch — it must remove the last message (the empty placeholder) |
| Second message does not include first exchange | `updatedMessages` builds from stale `messages` state | Confirm `const updatedMessages = [...messages, userMessage]` captures the snapshot before the state update |

## Security Considerations
- Firebase ID token is obtained fresh on every send via `user.getIdToken()` (Firebase SDK auto-refreshes tokens).
- Token is sent as `Authorization: Bearer` header — never in the URL or query string.
- The stream is consumed server-side — no raw OpenRouter response is forwarded to the client other than the extracted text tokens.

## Checklist
- [ ] `AbortController` ref added to component
- [ ] `trimConversationHistory` imported from `careerCoachService`
- [ ] `handleReset` updated to abort in-flight requests
- [ ] `handleSend` stub replaced with real streaming implementation
- [ ] Unmount cleanup `useEffect` added
- [ ] UI structure unchanged (no message list or input changes)
- [ ] `npm run build` succeeds
- [ ] Live streaming verified in browser
- [ ] Multi-turn exchange verified (second message references first)
- [ ] Reset during streaming verified
- [ ] Both regression test suites pass

## Commit Message
```
feat(career-coach): wire real streaming API connection and multi-turn conversation state
```

## Documentation Updates
- `docs/05_Prompt_Library.md` — add Sprint 6 Day 4 entry
- `docs/20_Decision_Log.md` — log streaming implementation decision: native ReadableStream + AbortController, no new packages

## End-of-Day Review
The Career Coach is now a working conversational AI interface. Users can hold multi-turn conversations, see tokens stream in real-time, and reset cleanly. The system is currently general-purpose — it has no knowledge of the user's actual resume or ATS scores yet.

## Tomorrow Preview
Day 5 adds resume-awareness: `buildResumeContextBlock()` is called client-side using the resume from `ResumeContext`, and the resulting context string is added to the `handleSend` fetch body. The Coach will be able to answer questions like "What skills should I highlight?" based on the candidate's actual profile.
