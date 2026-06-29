# Sprint 2 — Day 2: Fix Firestore Collection Casing Mismatch

## Objective
`signup/page.tsx#L54` writes new user profiles to a Firestore collection named `"Users"`, while every read path (settings, profile display) queries the lowercase `"users"` collection. This is a confirmed, cited Critical issue (`docs/26_Risks.md`, `PROJECT_DISCOVERY.md` §19/§21) that silently breaks profile data for every new signup. Today's scope is a single, isolated correction — standardize on the collection name the read paths already use, and fix the one write path that disagrees with it.

## Concepts
- **Why fix the write path, not the read paths:** Multiple read locations already correctly query `"users"` (lowercase). Changing the write path to match is a one-line, single-location fix. Changing every read path to match the write path instead would touch more files for no benefit — always converge on whichever side has fewer call sites to change, unless there's a strong reason otherwise (there isn't one here).
- **Why this needs a data-migration consideration, not just a code fix:** If any real user data already exists in the `"Users"` (capital U) collection from before this fix, simply changing the code doesn't move that existing data. Today's plan must explicitly address whether any existing `"Users"` documents need to be migrated to `"users"`, not just prevent the bug going forward.

## Prerequisites
- Day 1 complete; production build succeeds.
- Read access to the Firebase project's Firestore console (or equivalent CLI access) to check whether any real documents currently exist in the `"Users"` collection.

## Setup
No new package installs. Before writing any code today, manually check the Firestore console (or run a read-only query via the Firebase CLI/Admin SDK in a throwaway script) to answer: **does the `"Users"` (capital) collection currently contain any real documents?** This determines whether today also needs a one-time data migration step, or just the code fix.

## Resources
- Firestore collection naming conventions (no official enforced casing — this is purely a project consistency issue): https://firebase.google.com/docs/firestore/manage-data/structure-data
- Firebase Admin SDK docs (if a migration script is needed): https://firebase.google.com/docs/admin/setup

## Files to Modify
- `frontend/app/signup/page.tsx` (around line 54, per `PROJECT_DISCOVERY.md` §19) — the write path being corrected.
- Possibly a new one-off, run-once migration script (e.g., `scripts/migrate-users-casing.ts`, not part of the app itself) — only if the Setup-step check above finds existing data in `"Users"`. This script is deleted/archived after running once; it does not become a permanent part of the codebase.

## Architecture Context
Per `docs/02_Architecture.md`, all Firestore access is direct client-side access via the Firebase Web SDK — there is no backend layer mediating this write today (that's addressed structurally in Day 3, for routes, not for direct client Firestore calls, which remain client-side per the confirmed current architecture). Today's fix does not change that architecture; it only corrects which collection name is targeted.

## Implementation Plan
1. Check the Firestore console for existing documents in `"Users"` (capital). Record the count.
2. Open `frontend/app/signup/page.tsx` at line 54 and confirm exactly how the collection reference is constructed (e.g., `collection(db, "Users")` or similar — confirm the actual syntax before editing).
3. Change the collection name reference to `"users"` (lowercase), matching every confirmed read path.
4. If Step 1 found existing documents in `"Users"`, write a small, one-time script using the Firebase Admin SDK to copy each document from `"Users"` to `"users"` (preserving document IDs), then verify the copy succeeded before deleting the originals. Do not delete `"Users"` documents until the copy is verified.
5. Test: sign up a new test account, confirm the resulting document lands in `"users"` (lowercase), and confirm the settings/profile page correctly displays that new account's data.
6. If a migration script was needed, confirm it ran successfully against any existing real data, and confirm the previously-broken existing accounts (if any) now load correctly.

## Ready-to-Paste Antigravity Prompt

```
Context: This is the HireLens project (Next.js 16 App Router, React 19, TypeScript, Firebase Auth + Firestore via client Web SDK). A confirmed, cited Critical bug exists: frontend/app/signup/page.tsx (around line 54) writes new user profile documents to a Firestore collection named "Users" (capital U), while every existing read path (settings page, profile display) queries the lowercase "users" collection. This is documented in docs/26_Risks.md and docs/02_Architecture.md, Known Issue #2.

Task:
1. Open frontend/app/signup/page.tsx and confirm the exact line and syntax constructing the "Users" collection reference. Also confirm, by searching the codebase, every location that reads from a "users" or "Users" collection, to confirm the lowercase version is indeed the one used by all read paths (do not assume — verify with a codebase search before changing anything).
2. Change the write path in signup/page.tsx to use the lowercase "users" collection name, matching the confirmed read paths. Do not change any read path — only the one write path that disagrees with the rest of the codebase.
3. Tell me explicitly: based on your search, are there any OTHER write paths in the codebase that also write to a capitalized "Users" collection, which I should be aware of before considering this fully fixed? List them if found.
4. Do not write or run a Firestore data-migration script yourself — I will check the Firestore console manually for existing data in the "Users" collection and handle migration separately if needed. Your task today is the code fix and the verification search only.
5. After the fix, describe exactly how I should manually test this: creating a new test signup and confirming the resulting document appears in the correct ("users") collection and is visible on the settings/profile page.

Constraints:
- Single logical change: the collection name in the signup write path, corrected to match existing read paths.
- No other file changes.
- No automatic data migration — that's a manual, verified step I'll perform separately given it affects real (or potentially real) user data.
```

## Testing
**How to test:**
1. Create a brand-new test signup through the actual signup flow.
2. Open the Firestore console and confirm the new document appears under `"users"` (lowercase), not `"Users"`.
3. Log in as that test user and visit the settings/profile page — confirm the profile data (display name, etc.) loads correctly, where previously it would have failed to find the document.
4. If a migration was performed for pre-existing accounts, log in as one of those previously-broken accounts and confirm their profile now loads correctly too.

**Expected result:** New signups write to the correct collection; profile loading works for both new and (if migrated) pre-existing accounts.

**Edge cases:** A user who signed up before the fix and was never migrated will still have a "missing profile" experience until/unless migrated — make sure this is explicitly tracked, not silently left broken for existing users while only fixing it for new ones going forward.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| New signup still creates a document in "Users" (capital) | A cached build, or a second write path not caught by the search | Hard-refresh / rebuild; re-run the codebase search for any other `"Users"` references, including in any seed/test data scripts |
| Existing account still shows broken profile after the fix | Fix only addresses new signups going forward; pre-existing broken accounts need the migration step from Step 4 of the Implementation Plan | Run the migration for existing documents, don't assume the code fix alone repairs already-broken accounts |

## Checklist
- [ ] Firestore console checked for existing documents in `"Users"` (capital) before any code change
- [ ] Codebase searched for every read AND write reference to a `users`/`Users` collection — confirmed lowercase is the correct, dominant convention
- [ ] `signup/page.tsx` write path corrected to lowercase `"users"`
- [ ] No other file changed
- [ ] New test signup verified to write to the correct collection and load correctly on the profile/settings page
- [ ] If pre-existing data existed in `"Users"`, migration performed and verified before any deletion of the old collection
- [ ] Production build still succeeds after this change (`npm run build`)

## Commit Message
```
fix(auth): correct signup collection casing from "Users" to "users"
```

## Documentation Update
- `docs/02_Architecture.md` and `docs/26_Risks.md` — mark Known Issue #2 / the Firestore Casing Mismatch entry as Resolved, noting whether a data migration was also required and performed.
- If a migration script was created, note in `docs/20_Decision_Log.md` that it was a one-time, run-once script and is not part of the permanent codebase (and confirm it was removed/archived, not left lying around per the "no stale files" principle from `PROJECT_DISCOVERY.md`'s low-severity findings).

## End-of-Day Review
The second Critical, production-blocking data bug is resolved. Both Critical issues from Sprint 1 are now fixed — the application builds and new user profiles load correctly. Sprint 2's remaining days move to High-severity security and broken-feature fixes.

## Tomorrow Preview
Day 3 begins the highest-impact security fix: adding Firebase Admin SDK token verification to every unauthenticated `/api/*` route, closing the confirmed billing-abuse and unrestricted-upload exposure.
