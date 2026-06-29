# Sprint 2 — Day 3: Secure API Routes with Firebase Admin Token Verification

## Objective
All five `/api/*` routes (`parse-pdf`, `ai-improve`, `ai-insights`, `jd-refine`, `cover-letter`) currently have zero authentication — confirmed in `docs/26_Risks.md` and `BACKEND_AUDIT.md` §4 as a High-severity risk: any external client can call them directly, incurring OpenRouter billing costs or uploading arbitrary files. Today adds Firebase ID-token verification to every route, using the Firebase Admin SDK, per the decision already logged in `docs/20_Decision_Log.md` (Sprint 1, Day 5 entry: "API authentication mechanism: Firebase Admin SDK token verification").

## Concepts
- **Why Admin SDK token verification, not a new auth system:** The client already authenticates with Firebase Auth (`AuthContext.tsx`). A logged-in client already holds a valid Firebase ID token. Today's work is having the client send that token with each API request, and having the server verify it — not building new login infrastructure.
- **Why this needs `middleware.ts` or a shared helper, not five copy-pasted checks:** `BACKEND_AUDIT.md` §4 confirms no `middleware.ts` exists. Adding the same token-check logic independently into five route files risks drift (one route's check diverging from another's over time). Today introduces either a shared verification helper function imported by all five routes, or a Next.js middleware matcher covering `/api/*` — pick whichever fits this Next.js version's actual middleware capabilities (confirm: does Next.js 16 middleware support the request inspection needed here, or is a shared helper function cleaner for this specific case? Decide based on reading the routes, not by default.).
- **Token verification ≠ authorization:** Today confirms *who* is calling (a valid, logged-in Firebase user) — it does not add per-resource permission checks (e.g., "can this user access this specific resume"). That's a separate, larger concern not in today's scope; note it as a follow-up if discovered to be relevant.

## Prerequisites
- Days 1–2 complete; build succeeds; Firestore casing fixed.
- Firebase Admin SDK service account credentials available (a JSON key file or equivalent environment-variable-based credential) — if this doesn't already exist for this project, it needs to be generated via the Firebase Console (Project Settings → Service Accounts → Generate new private key) before today's code can run. This is a new credential, not previously required by the client-only Firebase usage confirmed in Sprint 1.

## Setup
```bash
cd frontend
npm install firebase-admin
```
Add the new required environment variable(s) for Admin SDK credentials (exact variable names depend on how the credential is provided — typically either a path to a service account JSON file, or individual project-id/client-email/private-key variables for serverless-friendly deployment). Document whichever approach is used in `frontend/.env.example` and `docs/06_API_Keys_and_Setup.md` today, since this is a new environment variable category not previously tracked.

## Resources
- Firebase Admin SDK setup: https://firebase.google.com/docs/admin/setup
- Verifying ID tokens server-side: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Next.js Route Handlers and Middleware (confirm which applies for this Next.js 16 App Router project): https://nextjs.org/docs/app/building-your-application/routing/middleware

## Files to Modify
- New: a shared server-side helper (e.g., `frontend/lib/verifyAuth.ts`) wrapping Firebase Admin SDK initialization and token verification.
- `frontend/app/api/parse-pdf/route.ts`
- `frontend/app/api/ai-improve/route.ts`
- `frontend/app/api/ai-insights/route.ts`
- `frontend/app/api/jd-refine/route.ts`
- `frontend/app/api/cover-letter/route.ts`
- Client-side: wherever these routes are currently called from (search for `fetch(` calls to `/api/...` across `frontend/app/dashboard/` and `frontend/components/`) — each call site needs to attach the current user's Firebase ID token as an `Authorization` header.
- `frontend/.env.example` and `docs/06_API_Keys_and_Setup.md` — new Admin SDK credential variable(s).

## Architecture Context
This is the first time a server-side Firebase Admin connection is introduced into this codebase — per `docs/02_Architecture.md`, the backend previously had zero authentication and zero Firebase Admin usage (it only proxied to OpenRouter). This is a structural addition, already pre-approved via the Sprint 1, Day 5 Decision Log entry, not a new architectural decision being made today.

## Implementation Plan
1. Generate (or locate, if one already exists for this Firebase project) a service account credential for the Admin SDK.
2. Add the credential to local `.env` (never committed) and document the variable name(s) in `.env.example`.
3. Create the shared `verifyAuth.ts` helper: initializes Firebase Admin once, exports a function that takes a request, extracts the `Authorization: Bearer <token>` header, verifies it via `getAuth().verifyIdToken(token)`, and returns the decoded user or throws/returns a 401.
4. Add the verification call to the start of each of the five route handlers, returning a `401 Unauthorized` JSON response immediately if verification fails.
5. Update every client-side call site to attach the current user's ID token (available via the Firebase client SDK's `getIdToken()` on the current user, from `AuthContext.tsx`) as an `Authorization: Bearer <token>` header on each request to these five routes.
6. Test each route both with a valid token (should succeed as before) and with no/invalid token (should now return 401, and should NOT reach OpenRouter or perform the file parse).
7. Confirm no regression: every existing feature that depends on these five routes (resume improvement, insights, JD refine, cover letter generation, PDF parsing) still works end-to-end for a logged-in user.

## Ready-to-Paste Antigravity Prompt

```
Context: This is the HireLens project (Next.js 16 App Router, React 19, TypeScript, Firebase Auth client-side). A confirmed High-severity security gap exists, documented in docs/26_Risks.md and docs/02_Architecture.md: none of the five API routes under frontend/app/api/ (parse-pdf, ai-improve, ai-insights, jd-refine, cover-letter) verify any authentication, allowing unauthenticated billing abuse and file uploads. The decision to fix this using Firebase Admin SDK ID-token verification (not a new auth system) is already logged in docs/20_Decision_Log.md.

Task:
1. Create frontend/lib/verifyAuth.ts: initialize the Firebase Admin SDK (using environment-variable-based credentials — do not hardcode any credential), and export an async function that accepts a Next.js Request, extracts the "Authorization: Bearer <token>" header, verifies it using getAuth().verifyIdToken(token), and returns the decoded token's user info on success, or throws a clearly typed error on failure that the calling route can turn into a 401 response.
2. Modify each of the five route handlers (frontend/app/api/parse-pdf/route.ts, ai-improve/route.ts, ai-insights/route.ts, jd-refine/route.ts, cover-letter/route.ts) to call this helper at the very start of the handler, before any other logic (including before reading the request body for the AI/parsing work), and return a 401 JSON response (e.g., {"error": "Unauthorized"}) immediately if verification fails.
3. Search the codebase for every client-side fetch call targeting these five routes (likely in frontend/app/dashboard/ and/or frontend/components/), and update each to attach the current user's Firebase ID token as an Authorization: Bearer <token> header, using the existing AuthContext.tsx to access the current user and Firebase client SDK's getIdToken() method.
4. Update frontend/.env.example to document whichever Firebase Admin credential environment variable(s) your implementation requires, with placeholder values and a one-line comment for each — never include a real credential.
5. Confirm npm run build still succeeds after these changes.
6. Report back exactly which client-side call sites were found and updated, and flag if any call site calling one of these five routes was found that you're unsure should also receive this treatment (e.g., a call from an unexpected location), rather than silently deciding either way.

Constraints:
- Do not add per-resource authorization (e.g., checking whether a user owns a specific resume) — today is authentication only (confirming a valid logged-in user), not authorization. Note in your response if you see an authorization gap worth flagging for later, but do not implement it today.
- Do not modify the actual AI prompt logic, the PDF parsing logic, or any unrelated code in these route files — only add the auth check at the top of each handler.
- Do not change any UI/UX outside of the header attachment on existing fetch calls.
- Report the exact diff for every file touched.
```

## Testing
**How to test:**
1. While logged in (valid session), exercise each of the five features (resume improve, insights, JD refine, cover letter, PDF parse-upload) and confirm they all still work exactly as before.
2. Using a tool like `curl` or Postman, call each of the five routes directly with no `Authorization` header — confirm each now returns `401` and does **not** call OpenRouter (check, e.g., via logs or by confirming no OpenRouter usage/cost is incurred for that call).
3. Call each route with a deliberately invalid/expired token string — confirm the same 401 behavior, not a different error or a crash.
**Expected result:** Authenticated requests behave identically to before; unauthenticated or invalid-token requests are rejected before any AI call or file processing occurs.
**Edge cases:** A token that's valid but for a since-deleted user; a token that's technically well-formed but expired — both should be rejected cleanly with a 401, not a 500 error.
**Failure cases:** If Admin SDK initialization fails (e.g., misconfigured credentials), the failure should be loud in server logs (not silently letting requests through unauthenticated) — explicitly verify this fail-closed behavior, not just the happy path.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| Every request now returns 401, even logged-in ones | Client isn't actually attaching the token, or attaching it with the wrong header format | Confirm the exact header format expected (`Authorization: Bearer <token>`) matches what the client sends; log the received header server-side temporarily during debugging |
| Admin SDK throws on startup | Missing or malformed credential environment variable | Re-check `.env` against `.env.example`; confirm the credential format (JSON vs. individual fields) matches what `verifyAuth.ts` expects |
| Token verification succeeds locally but fails in a deployed environment | Environment variables not set in the deployment platform's config | Confirm the same Admin SDK credential variables are set in the actual deployment target, not just locally |

## Checklist
- [ ] Firebase Admin SDK service account credential obtained and stored only in environment variables
- [ ] `verifyAuth.ts` helper created and used identically across all five routes
- [ ] All five routes reject unauthenticated/invalid requests with 401, before any OpenRouter call or file processing
- [ ] All client-side call sites updated to attach a valid ID token
- [ ] All five features manually re-tested end-to-end while logged in, confirmed unchanged in behavior
- [ ] `npm run build` still succeeds
- [ ] `.env.example` and `docs/06_API_Keys_and_Setup.md` updated with the new credential variable(s)

## Commit Message
```
feat(security): require Firebase ID token verification on all /api/* routes
```
(Note: tagged `feat` per Conventional Commits since this adds new server-side behavior, even though it's a stabilization task, not a product feature — `15_Git_Workflow.md`'s commit type list permits this.)

## Documentation Update
- `docs/02_Architecture.md` — update the architecture diagram/description: the API routes are no longer purely stateless/unauthenticated; note the new Admin SDK dependency. Move Known Issue #3 to Resolved.
- `docs/26_Risks.md` — mark "Unauthenticated API Routes" Resolved.
- `docs/21_Tech_Stack.md` — add `firebase-admin` to the Backend technology table.
- `docs/06_API_Keys_and_Setup.md` — add a full entry for the new Admin SDK credential, following that file's required template.
- `docs/20_Decision_Log.md` — confirm the Sprint 1, Day 5 entry on this decision is marked Accepted and now Implemented (add a one-line implementation note with today's date).

## End-of-Day Review
The highest-severity confirmed security gap is closed. All five AI/processing routes now require a valid, verified Firebase session — removing the unauthenticated billing-abuse and arbitrary-upload exposure that existed since before Sprint 1's audit.

## Tomorrow Preview
Day 4 fixes two small, isolated, confirmed UI defects: the Job Matcher's missing AI insights render and the dead settings navbar link — both quick, low-risk corrections bundled into one day because of their size, not their relationship to each other.
