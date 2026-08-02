# Sprint 6 — Day 2: Career Coach Authenticated Streaming API Route

## Day Title
**AI Career Coach — Authenticated Streaming API Route**

## Objective
Create `app/api/career-coach/route.ts` — the server-side endpoint that accepts authenticated multi-turn conversation requests and streams the model's response token-by-token back to the client.

## Why This Day Exists
All five existing AI routes (`ai-improve`, `ai-insights`, `jd-refine`, `cover-letter`, `parse-pdf`) return complete JSON responses. A conversational Career Coach that makes users wait 5–10 seconds staring at a spinner before seeing any output would feel broken. Streaming is the difference between "the AI is thinking" (visually represented by tokens appearing as they arrive) and "the app is frozen." Day 2 introduces streaming for the first time in this codebase, using only built-in Web APIs — no new packages.

## Repository Evidence / Current State
- **`lib/verifyAuth.ts`** — confirmed: Firebase Admin SDK token verification. Used identically by all existing routes. Reused today.
- **`lib/promptTemplates.ts`** (post Day 1) — `CAREER_COACH_SYSTEM_PROMPT` and `CAREER_COACH_MODEL_PARAMS` now exported.
- **`lib/careerCoachService.ts`** (post Day 1) — `ChatMessage`, `CareerCoachRequest`, `trimConversationHistory` available.
- **`app/api/ai-improve/route.ts`** — reference: `verifyAuth()` pattern, `OPENROUTER_API_KEY`, response body parsing. Confirmed model used post-Sprint-5: `google/gemini-2.5-flash`.
- **`app/api/career-coach/`** — does not exist yet. **New today.**
- **No streaming exists anywhere in the codebase** — confirmed. Today introduces it.

## Concepts
- **OpenRouter streaming:** OpenRouter's `/v1/chat/completions` endpoint supports `"stream": true`. When enabled, it returns a chunked HTTP response in Server-Sent Events (SSE) format: each chunk is `data: {"choices": [{"delta": {"content": "..."}}]}\n\n`. The last chunk is `data: [DONE]\n\n`.
- **Next.js App Router streaming response:** A Next.js API route can stream by returning `new Response(readable, { headers: { "Content-Type": "text/event-stream" } })`. The `ReadableStream` is fed by a `TransformStream` that pipes from OpenRouter's SSE response.
- **No new dependencies:** This uses only the native `fetch` API (which supports streaming in Node.js 18+), native `ReadableStream`, `TextDecoder`, and `TransformStream`. Next.js 16 with Node.js 18+ supports all of these.
- **Context assembly order:** The system prompt is built from: `CAREER_COACH_SYSTEM_PROMPT` + resume context block + ATS context block + JD context block (if provided). This is sent as a single `system` role message — OpenRouter's Gemini models handle a combined system message correctly. The conversation history then follows as alternating `user`/`assistant` messages.

## Prerequisites
- Day 1 complete: `CAREER_COACH_SYSTEM_PROMPT`, `CAREER_COACH_MODEL_PARAMS`, and all `careerCoachService.ts` exports exist and build cleanly.
- Read `app/api/ai-improve/route.ts` fully — today's route follows the same `verifyAuth` + `OPENROUTER_API_KEY` + OpenRouter call pattern.
- Read `lib/verifyAuth.ts` — no changes needed, just understanding the call signature.
- Node.js 18+ is required for native `ReadableStream` in the server environment. Next.js 16 runs on Node 18+ by default — no change needed.

## Setup
No new packages.
```bash
cd frontend
npm run build   # confirm Day 1 is still clean
```

## Resources
- `lib/verifyAuth.ts` — reused exactly
- `lib/promptTemplates.ts` — `CAREER_COACH_SYSTEM_PROMPT`, `CAREER_COACH_MODEL_PARAMS`
- `lib/careerCoachService.ts` — `ChatMessage`, `trimConversationHistory`
- OpenRouter streaming docs: https://openrouter.ai/docs/streaming

## Files to Inspect
- `frontend/lib/verifyAuth.ts`
- `frontend/app/api/ai-improve/route.ts`
- `frontend/lib/promptTemplates.ts`
- `frontend/lib/careerCoachService.ts`

## Files to Create
- `frontend/app/api/career-coach/route.ts` **[NEW]**

## Files to Modify
None today — only the new file is created.

## Architecture Impact
The Career Coach API route is stateless — it does not write to Firestore and does not maintain session state. All conversation history is passed in from the client on each request. The streaming response changes the client-side consumption model from `await response.json()` to `response.body.getReader()` + chunked text accumulation (implemented in Day 4).

## Data Flow
```
Client POST /api/career-coach
  Body: { messages: ChatMessage[], resumeContext?, atsContext?, jobDescription? }
  Header: Authorization: Bearer <Firebase ID token>
      ↓
verifyAuth(req) → decodedToken or 401
      ↓
Validate: messages array exists and is non-empty, no message exceeds 4000 chars
      ↓
Assemble system prompt:
  CAREER_COACH_SYSTEM_PROMPT
  + resumeContext (if provided)
  + atsContext (if provided)
  + JD block (if jobDescription provided)
      ↓
Trim conversation history to last 8 turns (client already does this, server enforces)
      ↓
POST https://openrouter.ai/api/v1/chat/completions
  { model: "google/gemini-2.5-flash", stream: true, messages: [...], ...CAREER_COACH_MODEL_PARAMS }
      ↓
Pipe OpenRouter SSE chunks → TransformStream → ReadableStream
      ↓
Return: new Response(readable, { Content-Type: "text/event-stream" })
      ↓
Client accumulates streamed text tokens in state
```

## Implementation Plan

### Step 1 — Create directory and file
Create `frontend/app/api/career-coach/route.ts`.

### Step 2 — Full route implementation

```typescript
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import {
    CAREER_COACH_SYSTEM_PROMPT,
    CAREER_COACH_MODEL_PARAMS,
    HALLUCINATION_GUARDRAIL,
} from "@/lib/promptTemplates";
import {
    ChatMessage,
    trimConversationHistory,
} from "@/lib/careerCoachService";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MAX_USER_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_TURNS = 8;
const MODEL = "google/gemini-2.5-flash";

export async function POST(req: Request) {
    // ── 1. Authentication ────────────────────────────────────────────────────
    try {
        await verifyAuth(req);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!OPENROUTER_API_KEY) {
        return NextResponse.json({ error: "OpenRouter API key is not configured." }, { status: 500 });
    }

    // ── 2. Parse and validate request body ───────────────────────────────────
    let body: {
        messages?: ChatMessage[];
        resumeContext?: string;
        atsContext?: string;
        jobDescription?: string;
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { messages, resumeContext, atsContext, jobDescription } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: "messages array is required and must be non-empty." }, { status: 400 });
    }

    // Validate each message
    for (const msg of messages) {
        if (!msg.role || !["user", "assistant"].includes(msg.role)) {
            return NextResponse.json({ error: "Each message must have a role of 'user' or 'assistant'." }, { status: 400 });
        }
        if (!msg.content || typeof msg.content !== "string") {
            return NextResponse.json({ error: "Each message must have a string content field." }, { status: 400 });
        }
        if (msg.content.length > MAX_USER_MESSAGE_LENGTH) {
            return NextResponse.json(
                { error: `Message content exceeds the ${MAX_USER_MESSAGE_LENGTH}-character limit.` },
                { status: 400 }
            );
        }
    }

    // Optional context field validation
    if (resumeContext !== undefined && typeof resumeContext !== "string") {
        return NextResponse.json({ error: "resumeContext must be a string." }, { status: 400 });
    }
    if (atsContext !== undefined && typeof atsContext !== "string") {
        return NextResponse.json({ error: "atsContext must be a string." }, { status: 400 });
    }
    if (jobDescription !== undefined && (typeof jobDescription !== "string" || jobDescription.length > 5000)) {
        return NextResponse.json({ error: "jobDescription must be a string under 5000 characters." }, { status: 400 });
    }

    // ── 3. Build system context ──────────────────────────────────────────────
    const systemParts: string[] = [CAREER_COACH_SYSTEM_PROMPT];

    if (resumeContext && resumeContext.trim().length > 0) {
        systemParts.push("\n\n" + resumeContext);
    }
    if (atsContext && atsContext.trim().length > 0) {
        systemParts.push("\n\n" + atsContext);
    }
    if (jobDescription && jobDescription.trim().length >= 20) {
        systemParts.push(
            "\n\n=== TARGET JOB DESCRIPTION (provided by candidate) ===\n" +
            "(Use this to answer questions about role fit — do not claim the candidate has skills not in their resume.)\n\n" +
            jobDescription.substring(0, 2000) +
            "\n=== END JOB DESCRIPTION ==="
        );
    }

    const systemContent = systemParts.join("");

    // ── 4. Trim conversation history (server-enforced safety) ────────────────
    const trimmedMessages = trimConversationHistory(messages, MAX_HISTORY_TURNS);

    // ── 5. Build OpenRouter messages array ───────────────────────────────────
    const openRouterMessages = [
        { role: "system", content: systemContent },
        ...trimmedMessages,
    ];

    // ── 6. Call OpenRouter with streaming ────────────────────────────────────
    let openRouterResponse: Response;
    try {
        openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                stream: true,
                ...CAREER_COACH_MODEL_PARAMS,
                messages: openRouterMessages,
            }),
        });
    } catch (networkError) {
        console.error("Career Coach: OpenRouter network error:", networkError);
        return NextResponse.json({ error: "Failed to connect to AI provider." }, { status: 502 });
    }

    if (!openRouterResponse.ok) {
        const errText = await openRouterResponse.text();
        console.error("Career Coach: OpenRouter error:", openRouterResponse.status, errText);
        if (openRouterResponse.status === 429) {
            return NextResponse.json({ error: "Rate limit exceeded. Please try again in a moment." }, { status: 429 });
        }
        return NextResponse.json({ error: "AI provider returned an error." }, { status: 502 });
    }

    if (!openRouterResponse.body) {
        return NextResponse.json({ error: "AI provider returned an empty stream." }, { status: 502 });
    }

    // ── 7. Pipe the SSE stream from OpenRouter to the client ─────────────────
    const reader = openRouterResponse.body.getReader();
    const decoder = new TextDecoder();

    const readable = new ReadableStream({
        async start(controller) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const data = line.slice(6).trim();
                        if (data === "[DONE]") break;

                        try {
                            const parsed = JSON.parse(data);
                            const token = parsed?.choices?.[0]?.delta?.content;
                            if (token) {
                                // Forward the raw token as plain text
                                controller.enqueue(new TextEncoder().encode(token));
                            }
                        } catch {
                            // Skip malformed SSE chunks
                        }
                    }
                }
            } catch (streamError) {
                console.error("Career Coach: Stream error:", streamError);
                controller.error(streamError);
            } finally {
                controller.close();
                reader.releaseLock();
            }
        },
        cancel() {
            reader.cancel();
        },
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
```

**Note on streaming content type:** We use `text/plain` rather than `text/event-stream` because the client will consume this with a `ReadableStream` reader accumulating raw text, not an `EventSource`. This is simpler and avoids the SSE client protocol overhead since we're already extracting the token content server-side.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 6, Day 2: Career Coach API Route.

I am creating exactly one new file today:
  frontend/app/api/career-coach/route.ts [NEW]

No existing file is modified today.

Current architecture confirmed from reading source:
- verifyAuth() in frontend/lib/verifyAuth.ts — Firebase Admin SDK ID token verification. Used by all existing API routes. Reused exactly today.
- OPENROUTER_API_KEY is the only OpenRouter secret, accessed via process.env.OPENROUTER_API_KEY (server-side only).
- Model used in ai-improve route (post Sprint 5): "google/gemini-2.5-flash".
- CAREER_COACH_SYSTEM_PROMPT and CAREER_COACH_MODEL_PARAMS are now exported from lib/promptTemplates.ts (added Day 1).
- ChatMessage and trimConversationHistory are exported from lib/careerCoachService.ts (added Day 1).
- No streaming exists anywhere in the codebase yet. This is the first streaming route.
- OpenRouter supports stream: true in the request body; it returns SSE chunks in format: "data: {...}\n\n".

Task: Create frontend/app/api/career-coach/route.ts implementing a POST handler with exactly this behaviour:

1. Authentication: call verifyAuth(req) — return 401 JSON if it throws.
2. Check OPENROUTER_API_KEY exists — return 500 if missing.
3. Parse request body: { messages: ChatMessage[], resumeContext?: string, atsContext?: string, jobDescription?: string }
   - Return 400 if messages is missing, not an array, or empty.
   - Return 400 if any message has a role not in ["user", "assistant"] or missing/non-string content.
   - Return 400 if any message content exceeds 4000 characters.
   - Return 400 if resumeContext or atsContext is provided but not a string.
   - Return 400 if jobDescription is provided but not a string or exceeds 5000 characters.
4. Build system context string: start with CAREER_COACH_SYSTEM_PROMPT. If resumeContext is non-empty, append "\n\n" + resumeContext. If atsContext is non-empty, append "\n\n" + atsContext. If jobDescription is at least 20 chars, append a JD block with appropriate header.
5. Trim conversation history: call trimConversationHistory(messages, 8) to enforce the 8-turn maximum server-side.
6. Build OpenRouter messages: [{ role: "system", content: systemContent }, ...trimmedMessages]
7. Call OpenRouter fetch with: model "google/gemini-2.5-flash", stream: true, ...CAREER_COACH_MODEL_PARAMS, messages: openRouterMessages.
   - Return 502 on network error.
   - Return 429 (with appropriate message) if OpenRouter returns 429.
   - Return 502 for other non-OK OpenRouter responses.
8. Pipe the streaming response: read chunks from openRouterResponse.body.getReader(), decode with TextDecoder, split on "\n", skip lines not starting with "data: ", skip "[DONE]", parse JSON, extract choices[0].delta.content token, and enqueue it to a ReadableStream controller as encoded bytes.
9. Return: new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked", "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff" } })

Constraints:
- Only the new file frontend/app/api/career-coach/route.ts is created. No existing file is modified.
- No new npm packages are installed. Uses only built-in Web APIs and existing imports.
- OPENROUTER_API_KEY must NEVER be exposed to any client-side code.
- The route must never return non-streaming responses for success cases — only error cases return JSON.
- verifyAuth() is called BEFORE any body parsing — auth is always checked first.
- Run npm run build and confirm zero TypeScript errors.
- Report the complete file content.
```

## Testing

```bash
cd frontend
npm run build   # must succeed — TypeScript validates the new route

# Manual API test via curl (requires a real Firebase ID token):
curl -X POST http://localhost:3000/api/career-coach \
  -H "Authorization: Bearer <REAL_FIREBASE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What should I focus on to improve my resume?"}]}' \
  --no-buffer
# Expected: streaming plain text tokens appear one by one, not a JSON blob
```

## Regression Testing
```bash
npx tsx tests/atsBenchmark.test.ts     # must pass — unchanged files
npx tsx tests/optimizerSafety.test.ts  # must pass — unchanged files
```

## Manual Verification
1. Build passes with zero errors.
2. The `app/api/career-coach/` directory exists with `route.ts`.
3. Call the route with no Authorization header — confirm 401 JSON response.
4. Call the route with a valid token but empty messages array — confirm 400 JSON response.
5. Call the route with a valid token and a user message — confirm the response streams plain text (not a JSON blob).
6. Call with `mode: "jd-align"` absent from body — confirm no error (mode param is not in this route, only in ai-improve).

## Expected Behaviour
- Unauthenticated requests return `{"error": "Unauthorized"}` with status 401.
- Invalid body returns `{"error": "..."}` with status 400.
- Valid requests return a streaming plain-text response where each decoded chunk is a token of the AI's reply.
- The response completes when the `ReadableStream` controller closes.

## Failure Cases
- OpenRouter returns 429 → route returns `{"error": "Rate limit exceeded..."}` with status 429.
- Network error reaching OpenRouter → route returns `{"error": "Failed to connect to AI provider."}` with status 502.
- OpenRouter returns a chunk that is not valid JSON → the SSE parser skips it silently.
- `openRouterResponse.body` is null (shouldn't happen with Node 18+ fetch, but guarded) → returns 502.

## Debugging Guidance
| Symptom | Likely Cause | Fix |
|---|---|---|
| Build error: "ReadableStream is not defined" | Node version < 18 | Confirm Node 18+ is the runtime. Add `export const runtime = "nodejs"` to the route if needed |
| Streaming response arrives as one large chunk instead of tokens | OpenRouter not returning SSE format | Confirm `stream: true` is in the body; verify the model supports streaming |
| Route returns 401 for valid tokens | `verifyAuth()` failing due to missing Admin SDK env vars | Check `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` are set |

## Security Considerations
- `verifyAuth()` is the first thing called — no processing happens without a valid Firebase token.
- `OPENROUTER_API_KEY` is server-side only — never in the response or client-accessible.
- Input length limits on all fields prevent memory exhaustion attacks.
- `trimConversationHistory` enforces a maximum of 16 messages regardless of what the client sends.

## Checklist
- [ ] `lib/verifyAuth.ts` and `app/api/ai-improve/route.ts` read before writing
- [ ] `app/api/career-coach/route.ts` created
- [ ] `verifyAuth()` called first before body parsing
- [ ] All request body fields validated with appropriate 400 responses
- [ ] System context assembled from CAREER_COACH_SYSTEM_PROMPT + optional context blocks
- [ ] `trimConversationHistory(messages, 8)` applied server-side
- [ ] OpenRouter called with `stream: true` and `google/gemini-2.5-flash`
- [ ] SSE chunks parsed correctly, token content extracted and piped to `ReadableStream`
- [ ] Response returned as `text/plain` streaming
- [ ] Error cases (401, 400, 429, 502) all handled
- [ ] `npm run build` succeeds
- [ ] Both existing test suites pass
- [ ] No existing file was modified

## Commit Message
```
feat(career-coach): add authenticated streaming career coach API route
```

## Documentation Updates
- `docs/02_Architecture.md` — add `app/api/career-coach/route.ts` to the API route inventory
- `docs/05_Prompt_Library.md` — add Sprint 6 Day 2 entry

## End-of-Day Review
The Career Coach API route exists and streams. Auth, validation, context assembly, OpenRouter streaming, and error handling are all in place. The route is production-ready in terms of security and error handling before the UI that calls it even exists.

## Tomorrow Preview
Day 3 creates the Career Coach page (`app/dashboard/career-coach/page.tsx`) and adds the "AI Career Coach" navigation entry to `Sidebar.tsx`. This is the page shell — empty state, starter prompts, and the chat input — but without live API calls yet (those connect in Day 4).
