# Sprint 8 — Day 6

## Day Title
Streaming Transport — NDJSON Agent Events, Python to Browser

## Objective
Replace Day 1's hardcoded single-event response with real incremental NDJSON streaming: every `agent_started`, `tool_started`, `tool_completed`, `message_delta`, `artifact`, `action_required`, `agent_completed`, and `completed`/`error` event defined in `02_Architecture.md` is emitted by `agent-service` as the Crew actually executes, and re-streamed byte-for-byte by the Next.js proxy to the browser.

## Why This Day Exists
Days 2–5 proved the Crew reasons and sequences correctly, but only observable via server-side logs or a Python script's final return value. The brief's "Agent Activity" and "Streaming" sections require the user to *see* this happen live — Day 7's UI has nothing to render without this transport existing first.

## Repository Evidence / Current State
`frontend/app/api/career-coach/route.ts` already proves native `ReadableStream` streaming works end-to-end in this exact Next.js version, using raw SSE-style token chunks from OpenRouter — confirmed via direct inspection as the closest existing precedent, reused for the *transport mechanics* (stream construction, `TextDecoder`/`TextEncoder` handling) while the *framing* (NDJSON vs. raw SSE tokens) differs per the Day 1 architecture decision.

## Concepts
- FastAPI `StreamingResponse` with an async generator yielding `json.dumps(event) + "\n"` per line.
- Client-side NDJSON parsing: buffer incoming bytes, split on `\n`, `JSON.parse` each complete line, hold back any trailing incomplete line for the next chunk.
- CrewAI callback/event hooks used to surface `agent_started`/`tool_started`/etc. — CrewAI exposes step callbacks that this day's code taps to emit events without modifying CrewAI's internals.

## Prerequisites
Day 5 complete: multi-step workflows produce correctly-ordered artifacts (previously all-at-once; today made truly incremental).

## Setup
No new dependencies.

## Resources
- `frontend/app/api/career-coach/route.ts` — transport-mechanics reference only, not framing.
- `frontend/lib/careerCoachService.ts` (or equivalent client-side stream-consumption code, if present) — reference for the client-side buffering pattern being adapted from SSE-token-parsing to NDJSON-line-parsing.

## Files to Inspect
- `frontend/app/api/career-coach/route.ts`
- Client-side stream consumption code for the existing Career Coach page

## Files to Modify
- `agent-service/main.py` — `/chat` becomes a true `StreamingResponse` wired to Crew execution callbacks
- `frontend/app/api/agent/chat/route.ts` — confirm passthrough handles chunked transfer correctly (likely already correct from Day 1, verified not rewritten)

## Files to Create
- `agent-service/crew/event_bus.py` (in-process async event queue the Crew's step callbacks push to, and the `StreamingResponse` generator drains)
- `frontend/lib/agentStreamClient.ts` (NDJSON line-buffering client, parallel to the existing Career Coach's token-buffering client)
- `agent-service/tests/test_streaming_events.py`

## Architecture Impact
No change to the agent/tool architecture — this day is purely about surfacing what already happens internally, incrementally, over the wire.

## Data Flow
```
Crew.kickoff_async() with step_callback=event_bus.push
  Manager Agent starts   -> event_bus.push({"type":"agent_started","agent":"manager"})
  delegates to ATS Agent -> event_bus.push({"type":"agent_started","agent":"ats"})
  ATS Agent calls get_ats_analysis
    -> event_bus.push({"type":"tool_started","agent":"ats","tool":"get_ats_analysis"})
    -> (tool executes)
    -> event_bus.push({"type":"tool_completed", ...})
    -> event_bus.push({"type":"artifact","artifact":{"type":"ats_score_card", ...}})
  ATS Agent finishes -> event_bus.push({"type":"agent_completed","agent":"ats"})
  ... (repeats per delegated agent) ...
  Manager assembles final message -> event_bus.push({"type":"message_delta", ...}) (chunked if long)
  -> event_bus.push({"type":"completed"})

FastAPI StreamingResponse generator:
  async for event in event_bus.stream():
      yield json.dumps(event) + "\n"
```

## Implementation Plan

### Step 1 — `event_bus.py`
An `asyncio.Queue`-backed bus, one instance per request (not global/shared across users — a fresh queue is created at the top of each `/chat` request handler and threaded through to the Crew's callbacks via closure, preventing any cross-request event leakage).

### Step 2 — Wiring CrewAI Callbacks
CrewAI's `Agent`/`Task`/`Crew` step callbacks are used to observe execution without modifying CrewAI's internal control flow — today's code only *listens*, it never changes how or when an agent/tool actually runs (that would risk breaking Days 2–5's proven delegation behavior).

### Step 3 — `main.py` StreamingResponse
```python
@app.post("/chat")
async def chat(request: ChatRequest, uid: str = Depends(verify_internal_jwt)):
    bus = EventBus()
    asyncio.create_task(run_crew(request, uid, bus))
    async def event_stream():
        async for event in bus.stream():
            yield json.dumps(event.model_dump()) + "\n"
    return StreamingResponse(event_stream(), media_type="application/x-ndjson")
```

### Step 4 — `frontend/lib/agentStreamClient.ts`
```typescript
export async function* streamAgentEvents(response: Response): AsyncGenerator<AgentEvent> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line) as AgentEvent;
    }
  }
}
```

## Ready-to-Paste Antigravity Prompt
"Create `agent-service/crew/event_bus.py` as a per-request `asyncio.Queue`-backed event bus, wire CrewAI's step callbacks in `main.py`'s `/chat` handler to push `agent_started`/`tool_started`/`tool_completed`/`agent_completed`/`artifact`/`completed` events onto it without changing any existing agent/tool execution logic from Days 2-5, and expose `/chat` as a `StreamingResponse` yielding newline-delimited JSON. Then create `frontend/lib/agentStreamClient.ts` implementing an async generator that buffers response bytes by newline and yields parsed `AgentEvent` objects, following the buffering discipline in `Day_06.md`."

## Testing
- `test_streaming_events.py`: run a full request through the real `/chat` endpoint (test client, real Crew, mocked tool network calls), assert the received event sequence starts with `agent_started` (manager), ends with `completed`, and contains at least one `artifact` event for a request that should produce one.
- Client-side unit test for `agentStreamClient.ts`: feed it a `ReadableStream` with a line split across two chunk boundaries, assert it's still parsed correctly (the exact edge case flagged in `26_Risks.md`).

## Regression Testing
Re-run Day 2's 6 smoke tests and Day 5's application-workflow test — confirm identical delegation/sequencing behavior, now observed via the event stream instead of only via final return value.

## Manual Verification
Watch the Network tab during a real "improve my summary" request — confirm events arrive incrementally (visible latency between `agent_started` and `completed`, not one instantaneous blob) and the sequence is sensible.

## Expected Behaviour
Every event type defined in `02_Architecture.md`'s streaming schema is observed at least once across the day's test scenarios; no event carries any chain-of-thought text, only the high-level status labels the schema defines.

## Failure Cases
- Client disconnects mid-stream → server-side task should be cancelled/cleaned up (no orphaned Crew execution continuing after the client is gone) — tested by aborting a fetch mid-request and confirming server logs show cleanup, not a leaked task.
- A tool raises an exception mid-workflow → `error` event emitted with a user-safe message; server-side log captures the real exception (never sent to the client).

## Debugging Guidance
If events arrive out of order or bunched together instead of incrementally, check whether `asyncio.create_task(run_crew(...))` is actually running concurrently with the generator's drain loop, or whether something is accidentally `await`-ing the full Crew execution before starting to yield — the latter defeats the entire point of today's work.

## Security Considerations
Confirm the per-request `EventBus` instance is never shared or cached across requests/users — a shared bus would leak one user's agent activity into another's stream, a severe cross-user data exposure. Add an explicit test asserting two concurrent requests from different `uid`s never see each other's events.

## Checklist
- [ ] `EventBus` is strictly per-request, tested for no cross-request leakage
- [ ] All 9 event types wired and observed in tests
- [ ] `agentStreamClient.ts` correctly buffers split lines
- [ ] Client disconnect cleans up server-side task
- [ ] Day 2 and Day 5 behavior unchanged when observed via the new stream

## Commit Message
`feat(sprint8-day6): NDJSON streaming transport for agent events, Python to browser`

## Documentation Updates
`02_Architecture.md`'s Streaming Event Schema section is the spec this day implements against; no changes needed.

## End-of-Day Review
The full agent pipeline is now observable live, end-to-end, exactly as the brief's "Agent Activity" section describes — but still with no real UI consuming it (that's Day 7).

## Tomorrow Preview
Day 7 builds the actual Agent Workspace page and makes it the default post-login destination, consuming today's stream to render the live activity checklist from `24_UI_Wireframes.md`.
