# Sprint 8 — Day 7

## Day Title
AI-First Agent Workspace — Primary Post-Login Experience

## Objective
Build `app/dashboard/agent/page.tsx` as the new default post-login destination — the conversation pane, quick actions, and live agent-activity trace from `24_UI_Wireframes.md`'s desktop/mobile layouts — consuming Day 6's NDJSON stream, without yet rendering the Artifact Canvas's real artifact types (that's Day 8) or wiring Apply/Reject (Day 9). Today's canvas shows only the `agent_activity` trace and plain-text `message_delta` content.

## Why This Day Exists
This is the literal implementation of the brief's single biggest UX requirement: "after a user logs in, the FIRST major experience they should see is the AI Career Agent." Everything built in Days 1–6 is inert without a primary surface a real user actually lands on.

## Repository Evidence / Current State
- Confirmed via inspection: `frontend/app/dashboard/layout.tsx` wraps all dashboard routes with `Sidebar` + auth guard; `frontend/components/Sidebar.tsx` defines the current navigation order (Dashboard first, then feature pages).
- Confirmed: no existing redirect-after-login logic sends users anywhere but `/dashboard` today — this is the exact behavior Day 7 changes.
- Confirmed: `frontend/contexts/ResumeContext.tsx` is a pure client-side provider already wrapping the dashboard layout — the Agent Workspace consumes it via the existing `useResume()` hook, unmodified.

## Concepts
- "Primary experience" as a routing decision (default redirect target), not just a new menu item.
- Split-pane responsive layout collapsing to a tab-switcher on mobile, per the wireframe spec.
- Live activity trace rendering directly from `agent_activity`-shaped events without yet needing the full artifact-type union.

## Prerequisites
Day 6 complete: streaming events reliably reach the browser.

## Setup
No new dependencies (React state + existing Tailwind setup is sufficient; no new UI library introduced, consistent with `24_UI_Wireframes.md`'s "no new visual language" note).

## Resources
- `24_UI_Wireframes.md`, "Sprint 8 — Agent Workspace" section — the authoritative layout spec for today.
- `frontend/components/Sidebar.tsx`, `frontend/app/dashboard/layout.tsx`

## Files to Inspect
- `frontend/components/Sidebar.tsx`
- `frontend/app/dashboard/layout.tsx`
- `frontend/contexts/ResumeContext.tsx`

## Files to Modify
- `frontend/components/Sidebar.tsx` — add "AI Career Agent" as the new top entry, above "Dashboard"
- `frontend/app/dashboard/page.tsx` or the post-login redirect logic — new default destination is `/dashboard/agent`; the existing dashboard home remains reachable via the Sidebar's "Dashboard" entry, unchanged otherwise

## Files to Create
- `frontend/app/dashboard/agent/page.tsx`
- `frontend/components/agent/ConversationPane.tsx`
- `frontend/components/agent/QuickActions.tsx`
- `frontend/components/agent/AgentActivityTrace.tsx`
- `frontend/components/agent/ArtifactCanvas.tsx` (empty-state + activity-trace only today)

## Architecture Impact
First new primary route in the app since Sprint 1. Does not remove or hide any existing route — "Dashboard," "Resume Builder," "ATS Analyzer," etc. all remain in the Sidebar exactly where they are, per the brief's "existing feature navigation should become secondary," not "removed."

## Data Flow
```
User logs in -> redirected to /dashboard/agent (new default)
ConversationPane: user types "improve my summary", clicks Send
  -> fetch("/api/agent/chat", { body: { messages, resume: useResume().resume } })
  -> for await (const event of streamAgentEvents(response)) { ... }
       agent_started/agent_completed -> update AgentActivityTrace
       message_delta -> append to the visible assistant message bubble
       artifact (type=agent_activity) -> update trace state
       completed -> mark turn finished
       error -> show inline error + retry affordance
```

## Implementation Plan

### Step 1 — Sidebar Update
Add "AI Career Agent" as the first entry, using a distinct icon/highlight treatment (not identical styling to the other entries) so it visually reads as the primary entry point, matching `24_UI_Wireframes.md`'s design note. "AI Career Coach" (Sprint 6) stays exactly where it already is.

### Step 2 — Default Post-Login Route
Change the redirect target from `/dashboard` to `/dashboard/agent` wherever login/auth-guard logic currently sends an authenticated user. `frontend/app/dashboard/page.tsx` (the existing dashboard home) is not deleted — it remains reachable by clicking "Dashboard" in the Sidebar.

### Step 3 — `ConversationPane.tsx`
Message list + input box + Send button, quick-action chips (`[Build Resume] [Check ATS] [Find Jobs] [Cover Letter] [Prep Interview]`) that pre-fill the input with a representative prompt rather than silently auto-sending, so the user always sees and can edit what's about to be sent.

### Step 4 — `AgentActivityTrace.tsx`
Renders a live checklist (pending/active/done/error per agent) driven directly by `agent_started`/`agent_completed`/`tool_started`/`tool_completed` events — this is the concrete implementation of the brief's "Manager Agent ✓ Understanding request / Resume Agent ✓ Reading resume / ..." example, using only the high-level labels the event schema provides (no chain-of-thought is ever available to render, by construction from Day 6).

### Step 5 — `ArtifactCanvas.tsx` (partial, today)
Empty state per the wireframe spec when no artifact has arrived yet; renders the `AgentActivityTrace` while a turn is in progress. Real artifact-type rendering (`resume_diff`, `ats_score_card`, etc.) is explicitly Day 8's work — today's canvas intentionally does not yet handle those event payloads beyond passing them through unrendered.

## Ready-to-Paste Antigravity Prompt
"Create `app/dashboard/agent/page.tsx` implementing the desktop split-pane layout from `24_UI_Wireframes.md`'s 'Sprint 8 — Agent Workspace' section: a `ConversationPane` on the left with quick-action chips that pre-fill (not auto-send) the input, and an `ArtifactCanvas` on the right showing an empty state until a turn starts, then a live `AgentActivityTrace` checklist driven by `agent_started`/`agent_completed`/`tool_started`/`tool_completed` events consumed via `streamAgentEvents` from `lib/agentStreamClient.ts`. Update `components/Sidebar.tsx` to add 'AI Career Agent' as the first entry, and change the post-login redirect target to `/dashboard/agent`, without removing or modifying any existing Sidebar entry or route."

## Testing
- Component test: `AgentActivityTrace` renders correct pending/active/done states given a sequence of mock events.
- Component test: quick-action chips populate the input field without triggering a network call until Send is explicitly clicked.

## Regression Testing
Confirm every existing Sidebar entry still navigates correctly; confirm `/dashboard` (the original dashboard home) still renders exactly as before for a user who clicks "Dashboard" explicitly.

## Manual Verification
1. Log in fresh → confirm landing page is `/dashboard/agent`, not `/dashboard`.
2. Click each existing Sidebar entry → confirm no regressions.
3. Send a real message → confirm the activity trace updates live, matching the actual sequence of Day 6's events.

## Expected Behaviour
A newly-logged-in user's first screen is the Agent Workspace; every other existing feature remains one click away in the Sidebar, unchanged.

## Failure Cases
- Stream connection fails immediately → ConversationPane shows an inline error, not a blank/frozen screen.
- User navigates away mid-turn → in-flight fetch is aborted cleanly (no state update on an unmounted component — matches the existing Career Coach's `useEffect` cleanup pattern).

## Debugging Guidance
If the activity trace never updates, first confirm events are actually arriving (Network tab, Day 6's manual verification) before suspecting a rendering bug — the two layers are independently testable by design.

## Security Considerations
No new security surface — this is presentation-layer work over the already-authenticated Day 1–6 pipeline.

## Checklist
- [ ] `/dashboard/agent` is the new post-login default
- [ ] Sidebar updated, no existing entries removed/broken
- [ ] Conversation pane + quick actions working
- [ ] Live activity trace renders from real streamed events
- [ ] All existing routes/pages regression-tested

## Commit Message
`feat(sprint8-day7): Agent Workspace primary post-login experience`

## Documentation Updates
`24_UI_Wireframes.md`'s Sprint 8 section is the spec this day implements; no further doc changes needed today.

## End-of-Day Review
The AI Career Agent is now literally the first thing a user sees after logging in, exactly as the brief requires, with a working (if visually minimal) live activity trace.

## Tomorrow Preview
Day 8 fills in the Artifact Canvas's real Generative UI components — ATS score cards, resume diffs, job result cards, skill-gap cards, cover-letter previews, interview question cards — so results actually render, not just activity status.
