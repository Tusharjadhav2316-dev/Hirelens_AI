# Sprint 8 — Day 9

## Day Title
Apply/Reject Wiring, Rate Limiting, and Security/Cost Hardening

## Objective
Wire the Day 8 Apply/Reject buttons to actually mutate `ResumeContext` client-side (Apply) or discard the proposal (Reject); implement the `users/{uid}/agentUsage/{date}` Firestore daily counter and enforce it server-side; apply the full cost-control and security checklist from `02_Architecture.md`'s Security Architecture Summary before Day 10's dedicated test day.

## Why This Day Exists
This is the day the non-negotiable "never silently modify the user's resume" rule becomes real, clickable behavior rather than a documented intention, and the day cost/abuse controls move from "designed" to "enforced." Both are prerequisites for Day 10's safety test suite to have something real to test against.

## Repository Evidence / Current State
- Confirmed: `frontend/contexts/ResumeContext.tsx` already exposes an update function (`updateResume` or equivalent — confirm exact name during implementation) callable from any component wrapped by the provider, including the new Agent Workspace — no changes to `ResumeContext.tsx` itself are needed, only a new caller.
- Confirmed: no rate-limiting or usage-counting mechanism of any kind exists prior to Sprint 8 — `aiService.ts`'s `COOLDOWN_MS` is a client-side-only cooldown, not a server-enforced limit, and is left completely unmodified today (it continues to govern the *existing* non-agent AI routes exactly as before).

## Concepts
- Client-side-only mutation as the enforcement mechanism for "human in the loop" (recap from `02_Architecture.md`'s Resume Safety section — today is where it's actually implemented, not just documented).
- Atomic Firestore increments (`FieldValue.increment`) for race-safe usage counting without a read-then-write pattern.

## Prerequisites
Day 8 complete: all artifact cards render, including inert Apply/Reject buttons.

## Setup
No new dependencies.

## Resources
- `frontend/contexts/ResumeContext.tsx`
- `frontend/lib/aiService.ts` (`COOLDOWN_MS` — reference only, not modified)

## Files to Inspect
- `frontend/contexts/ResumeContext.tsx`

## Files to Modify
- `frontend/components/agent/artifacts/ResumeDiffCard.tsx` — wire real `onClick` handlers
- `frontend/app/api/agent/chat/route.ts` — add pre-request rate-limit check (atomic increment + ceiling check) before forwarding to `agent-service`

## Files to Create
- `frontend/lib/agentUsageService.ts` (Firestore atomic increment/read helper for `agentUsage`)
- `frontend/tests/agentSafety.test.ts` (safety assertions — see Testing section)

## Architecture Impact
No new agents/tools. This is the day the client-side mutation boundary and the server-side cost boundary both go from designed to enforced.

## Data Flow
```
User clicks [Apply Change] on a ResumeDiffCard
  -> onClick: useResume().updateResume({ section, itemId, newContent: artifact.data.after })
  -> purely client-side React state update, no network call to agent-service or Firestore
  -> ArtifactCanvas marks that specific diff card as "Applied" (visual state only)

User clicks [Reject]
  -> ArtifactCanvas marks the card "Rejected", no state mutation of any kind

Every /api/agent/chat request:
  -> BEFORE forwarding to agent-service: agentUsageService.checkAndIncrement(uid)
       reads today's counter, atomically increments, compares against ceiling (e.g. 50/day)
       if over ceiling -> respond 429 with a clear message, do NOT forward to agent-service
```

## Implementation Plan

### Step 1 — `ResumeDiffCard.tsx` Apply/Reject Wiring
```typescript
const { updateResume } = useResume();

function handleApply() {
  updateResume({ section: data.section, itemId: data.itemId, content: data.after });
  setStatus("applied");
}

function handleReject() {
  setStatus("rejected");
}
```
No call to `agent-service`, no Firestore write, no `fetch` of any kind in either handler — this is the entire enforcement mechanism, and its simplicity is deliberate (see `20_Decision_Log.md`'s Resume Safety workflow).

### Step 2 — `agentUsageService.ts`
```typescript
export async function checkAndIncrement(uid: string): Promise<{ allowed: boolean; count: number }> {
  const ref = adminDb.doc(`users/${uid}/agentUsage/${todayKey()}`);
  const result = await ref.set(
    { count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  const snap = await ref.get();
  const count = snap.data()?.count ?? 1;
  return { allowed: count <= DAILY_AGENT_REQUEST_LIMIT, count };
}
```
Uses Firebase Admin (server-side only, inside the already-authenticated proxy route) — this is the one place Sprint 8 writes to Firestore from a server context rather than the client SDK, justified narrowly per `13_Database_Guide.md`'s Sprint 8 addendum.

### Step 3 — Proxy Route Rate-Limit Enforcement
```typescript
const { allowed } = await checkAndIncrement(uid);
if (!allowed) {
  return new Response(JSON.stringify({ error: "Daily agent request limit reached. Try again tomorrow." }), { status: 429 });
}
// ... existing JWT-mint-and-forward logic from Day 1
```

### Step 4 — Security/Cost Hardening Pass
Walk `02_Architecture.md`'s "Security Architecture Summary" line by line and confirm each item against the actual codebase as it stands after Day 8:
- Cross-user data access → re-confirm Day 1's JWT test still passes with today's new rate-limit code inserted before it.
- Prompt injection → confirm resume/JD content is never concatenated into a system-level instruction string anywhere in the 9 tools.
- Tool authorization → re-run Day 2's authorization test.
- Runaway costs/loops → confirm `max_iter`, timeouts, and today's new daily ceiling are all simultaneously active.
- Malformed structured responses → confirm Day 1/Day 6's schema validation still rejects malformed events after today's changes.

## Ready-to-Paste Antigravity Prompt
"Wire `ResumeDiffCard.tsx`'s Apply button to call `useResume().updateResume(...)` directly with no network request, and the Reject button to only update local component state. Create `lib/agentUsageService.ts` using Firebase Admin's `FieldValue.increment` to atomically track and cap daily agent requests per user at a `DAILY_AGENT_REQUEST_LIMIT` constant, and call it in `app/api/agent/chat/route.ts` before forwarding any request to `agent-service`, returning 429 if the user is over their daily limit."

## Testing
- `agentSafety.test.ts`: simulate clicking Apply on a `ResumeDiffCard` and assert `ResumeContext`'s state changes to exactly the proposed `after` content, nothing more; simulate Reject and assert `ResumeContext` is provably unchanged.
- `agentUsageService` unit test: two concurrent increments against the same day-document resolve to a correct final count (no lost update) — proves the atomic-increment choice actually prevents the race condition flagged in `26_Risks.md`.
- Integration test: a request made after the daily ceiling is reached receives 429 and is never forwarded to `agent-service` (assert the upstream mock was never called).

## Regression Testing
Confirm `aiService.ts`'s existing client-side `COOLDOWN_MS` behavior for the *non-agent* routes (`/api/ai-improve`, `/api/ai-insights`, etc.) is completely unaffected — today's rate limiting is scoped only to `/api/agent/chat`.

## Manual Verification
1. Apply a proposed resume change in the real UI, navigate to the Resume Builder page, confirm the change is actually reflected there (proving `ResumeContext` is genuinely shared, not a Workspace-local copy).
2. Reject a different proposed change, confirm the resume is unaffected.
3. (If feasible) temporarily lower `DAILY_AGENT_REQUEST_LIMIT` for testing, exceed it, confirm the 429 response and UI messaging.

## Expected Behaviour
Apply/Reject behave exactly as documented; the daily ceiling is enforced server-side and cannot be bypassed by refreshing the page or opening a new tab (since the counter lives in Firestore, not client memory).

## Failure Cases
- Firestore write for the usage counter fails (e.g. transient outage) → decide and document a fail-open vs. fail-closed policy; recommended: fail-open (allow the request) for a cost-control soft limit, since fail-closed would let a Firestore hiccup take down the entire agent feature for cost-control reasons alone — log the failure either way.
- User applies the same diff twice → idempotent, second Apply is a no-op producing the same final state (not an error, not a duplicate append).

## Debugging Guidance
If a resume change doesn't appear to "stick" after Apply, first check whether `ResumeContext`'s update function was called with the right shape (component-level bug) before suspecting anything about the agent pipeline — by construction, nothing upstream of the click handler is involved in this failure mode.

## Security Considerations
This is the day covered most directly by `26_Risks.md`'s "Cross-Service Authentication Bypass" and "Rate-Limit Counter Race Condition" entries — both should be re-verified against the actual Day 9 implementation, not just the Day 1/Day 3 design.

## Checklist
- [ ] Apply mutates `ResumeContext` exactly as proposed, nothing more
- [ ] Reject never mutates anything
- [ ] Daily usage counter implemented with atomic increment
- [ ] Rate limit enforced before any request reaches `agent-service`
- [ ] Full Security Architecture Summary re-verified against current code
- [ ] Existing `aiService.ts` cooldown behavior unaffected

## Commit Message
`feat(sprint8-day9): Apply/Reject resume mutation, daily agent rate limiting, security hardening pass`

## Documentation Updates
`20_Decision_Log.md`'s "No persistent agent memory; one new minimal Firestore collection" ADR is the design this day implements; no further changes needed.

## End-of-Day Review
Every non-negotiable rule from the brief is now enforced in running code, not just documented: resume mutation requires an explicit click, ATS numbers are never invented, job listings are never fabricated, interview content is grounded, and costs are bounded both per-request and per-day.

## Tomorrow Preview
Day 10 is the dedicated safety/integration/regression test day and Sprint 8 close-out — running the full automated suite (Python + TypeScript), the manual QA cases C1–C8 from `08_Testing_Guide.md`, and a full regression pass of every pre-Sprint-8 feature.
