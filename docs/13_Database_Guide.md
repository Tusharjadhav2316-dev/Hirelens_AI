# HireLens 2.0 — Database Guide

## Current State
**To be verified during Sprint 1, Day 1 (database technology identification) and Day 3 (actual schema, migration history, access patterns).** Do not assume PostgreSQL, MongoDB, SQLite, or any specific engine, ORM, or migration tool until confirmed via connection strings, driver imports, or migration directories found directly in the codebase.

## Target State
The redesign report's target schema (User, UserSettings, Resume, AtsReport, JobApplication, InterviewSession, ChatSession, Message) describes the *data model* the product needs, not a specific database engine. This data model is largely engine-agnostic — it can be implemented relationally or as documents, depending on what Sprint 1 confirms is already in use. Vector search for career memory (Sprint 10) and semantic job matching (Sprint 6/Sprint 11) does require *some* vector-capable store or extension — which one depends entirely on the confirmed base database (e.g., a vector extension if relational, a vector-native document store feature if document-based, or a dedicated vector database as a separate service if neither base option supports it well).

## Migration Strategy
1. Confirm actual database technology, schema, and migration tooling (Sprint 1, Day 1 and Day 3).
2. Diff the confirmed current schema against the target data model — which entities exist, which are missing, which are partially implemented. This diff happens with real findings, not assumed ones.
3. Sprint 2/3 implements only the confirmed gap, using the confirmed database's actual migration tooling (whatever that turns out to be) — not a generic migration approach.
4. Sprint 10 (Career Memory) revisits vector-search requirements once the base database is confirmed, choosing the lowest-friction option consistent with what's already running rather than introducing a new database service by default.

## Open Questions (resolve before Sprint 2)
- What database engine and ORM/driver are actually in use?
- What migration tool, if any, is actually configured, and what does its history show?
- Does the confirmed database have a viable path to vector search (extension, native feature), or will Sprint 10 need to evaluate a separate vector store?

## Sprint 8 Addendum — Confirmed Firestore, Agent Service Has No Direct Database Access

**Confirmed (Sprint 1 + Sprint 8 audit):** Database engine is Google Cloud Firestore, accessed exclusively client-side via the Firebase Web SDK (`historyService.ts`, `profileService.ts`), with Firebase Admin used only for server-side ID token verification (`verifyAuth.ts`) — never for Firestore reads/writes. No server-side Firestore client exists anywhere in `frontend/`.

**Sprint 8 change:** Exactly one new collection is introduced: `users/{uid}/agentUsage/{date}`, an atomic daily request-count document used only for agent cost-control rate limiting (see `20_Decision_Log.md`). It is written and read **only** by the Next.js proxy route (`/api/agent/chat/route.ts`), using the existing pattern already established by `historyService.ts` (client-callable service functions using the Firebase Web SDK, or — since this specific write must be trusted server-side, unlike history — a small Firebase Admin Firestore write from within the already-authenticated proxy route). The Python `agent-service` has **zero** direct database access of any kind, by design (see `12_FastAPI_Guide.md`). This preserves the existing architectural boundary — "only Next.js touches Firestore" — instead of introducing a second database client library in a second language.

No other collections are added. Agent conversation state, resume data, and ATS results are all request-scoped payloads, not persisted (see `20_Decision_Log.md`, "No persistent agent memory").

**Schema:**
```
users/{uid}/agentUsage/{date}      // date = "YYYY-MM-DD"
  count: number                     // requests made today
  updatedAt: Timestamp
```

## Sprint 10 Addendum — Interview Trainer Sessions (Second New Collection)

**Change:** Sprint 10 introduces `users/{uid}/interviewTrainerSessions/{sessionId}` — the project's second new collection after Sprint 8's `agentUsage`. This **reverses Sprint 9's deliberate no-persistence decision**, with a stated cause logged in `20_Decision_Log.md`: a 10–20 minute voice interview involving microphone permission and spoken answers is materially more costly to lose to a refresh than Sprint 9's short text exchange, and reviewing past sessions is intrinsic to a *trainer* rather than a one-shot coach.

**Schema:**
```
users/{uid}/interviewTrainerSessions/{sessionId}
  targetRole: string
  interviewType: "hr" | "behavioral" | "technical" | "mixed" | "role_specific"
  difficulty: "beginner" | "intermediate" | "advanced"
  trainingMode: "coaching" | "realistic_mock"
  roleIntelligence: map          // RoleIntelligence output
  questionIndex: number
  questionsAsked: array<map>     // {id, question, category, difficulty}
  answersGiven: array<map>       // {questionId, transcript, feedback, speechSignals, visualSignals?, retryCount}
  voiceEnabled: boolean
  cameraEnabled: boolean
  status: "setup" | "in_progress" | "paused" | "completed" | "abandoned"
  startedAt / completedAt: Timestamp
  finalReport: map | null
  // DELIBERATELY ABSENT: audioUrl, videoUrl, frame data, face descriptors
```

**Ownership & access:** the `users/{uid}/` path plus security rules restrict all access to the owning user — a guessed `sessionId` alone grants nothing. Writes are performed server-side via Firebase Admin from the authenticated `/api/interview/session` route (following `agentUsageService.ts`'s precedent), so session contents cannot be forged client-side.

**Access patterns:** read one session by ID (Room rehydrate/resume); list most-recent-N for the owning user (landing page, bounded page size); append a turn record (PATCH); write the final report once. No cross-user or collection-group queries, so no composite index is required beyond the default.

**Retention & deletion:** transcripts are candidate-authored free text and may contain personal detail. Sessions are user-deletable from the Trainer UI (implemented Day 9), which removes the document and its transcripts. Raw audio and video are never stored at any point, so deletion of the document is complete deletion of the session's content.
