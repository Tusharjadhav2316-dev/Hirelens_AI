# Sprint 2 — Day 5: Move Firebase Config to Environment Variables & Sprint 2 Close-Out

## Objective
`lib/firebase.ts` hardcodes Firebase client configuration values directly in source, even though `.env.example` already lists the equivalent `NEXT_PUBLIC_FIREBASE_*` variables — they're simply unused (confirmed, `ENVIRONMENT_VERIFICATION.md` §3, §5). Today wires up the existing environment variables for real, removes the hardcoded values, and closes out Sprint 2 with a full regression pass across everything fixed this week, plus the final documentation consolidation.

## Concepts
- **Why this is "Medium," not "Critical," despite being a security finding:** Firebase *client-side* config values (API key, project ID, etc.) are not secret in the way a server-side credential is — they're necessarily exposed to the browser for the SDK to function, and Firebase's actual security boundary is its server-side security rules, not concealment of these values. The real problem here is inconsistency and maintainability (config requires a code change + redeploy instead of an environment variable change), not a secret leak. Today's fix should be framed and explained accurately as a configuration-hygiene fix, not oversold as closing a secret-exposure vulnerability — see `docs/26_Risks.md`'s "Hardcoded Firebase Credentials" entry for the same framing.
- **Why this is last in Sprint 2:** It's genuinely lower priority than build failures, data bugs, and unauthenticated billing exposure — appropriately sequenced last among this sprint's confirmed issues.

## Prerequisites
- Days 1–4 complete: build succeeds, Firestore casing fixed, all five API routes authenticated, Job Matcher insights visible, settings link fixed.

## Setup
No new package installs. Confirm `frontend/.env.example` already lists the Firebase client variables (per `ENVIRONMENT_VERIFICATION.md` §3) — today wires them up rather than inventing new variable names.

## Resources
- Next.js environment variables (note: `NEXT_PUBLIC_` prefix is required for any variable that must be available client-side, which Firebase client config needs): https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- Firebase Web SDK initialization docs: https://firebase.google.com/docs/web/setup

## Files to Modify
- `frontend/lib/firebase.ts` — replace hardcoded values with `process.env.NEXT_PUBLIC_FIREBASE_*` references.
- `frontend/.env.example` — confirm/finalize the listed variable names match exactly what `firebase.ts` now expects.
- Local `.env` (not committed) — populate with the real values currently hardcoded in `firebase.ts`, so local dev continues working identically.
- `README.md` — if it documents environment setup, confirm it now mentions these variables are required (per `ENVIRONMENT_VERIFICATION.md`'s Day 2 setup work, if that already added a "Local Development" section, extend it rather than duplicating).

## Architecture Context
No architectural change — `docs/02_Architecture.md`'s confirmed current-state diagram already shows the client initializing Firebase directly; today only changes *where the configuration values come from*, not the architecture itself.

## Implementation Plan
1. Open `lib/firebase.ts` and note every hardcoded value currently present (API key, auth domain, project ID, storage bucket, messaging sender ID, app ID — whichever subset is actually present).
2. Confirm `.env.example` already has a matching `NEXT_PUBLIC_FIREBASE_*` entry for each — add any that are missing.
3. Replace each hardcoded value in `firebase.ts` with the corresponding `process.env.NEXT_PUBLIC_FIREBASE_*` reference.
4. Create/update local `.env` with the real values (copied from what was previously hardcoded, so the actual Firebase project being targeted doesn't change).
5. Restart the dev server (env var changes require a restart) and confirm the app still connects to Firebase correctly — login, Firestore reads/writes all still function.
6. Run `npm run build` to confirm the production build still succeeds with this change.
7. **Full Sprint 2 regression pass:** with all five days' fixes in place, manually walk through every confirmed-fixed item once more, end to end, in a single continuous session: build succeeds → sign up a new account → confirm profile loads correctly → use each of the five AI features while authenticated → confirm Job Matcher insights render → confirm settings link works → confirm Firebase still connects correctly with env-var config.
8. Finalize Sprint 2 documentation per the Documentation Update section below.

## Ready-to-Paste Antigravity Prompt

```
Context: This is the HireLens project (Next.js 16 App Router, React 19, TypeScript, Firebase). A confirmed Medium-severity configuration issue exists, documented in docs/26_Risks.md: frontend/lib/firebase.ts hardcodes Firebase client config values, while frontend/.env.example already lists equivalent NEXT_PUBLIC_FIREBASE_* variables that are currently unused.

Task:
1. Open frontend/lib/firebase.ts and list every hardcoded configuration value currently present.
2. Open frontend/.env.example and confirm whether a matching NEXT_PUBLIC_FIREBASE_* variable already exists for each value found in step 1. Add any missing variable names (with placeholder values and a one-line comment) to .env.example — do not invent variable names inconsistent with Next.js's required NEXT_PUBLIC_ prefix convention for client-exposed env vars.
3. Replace every hardcoded value in firebase.ts with the corresponding process.env.NEXT_PUBLIC_FIREBASE_* reference. Do not change the actual Firebase project being targeted — the real values (which I will place in my local .env, not committed) must correspond to the same Firebase project already in use.
4. Confirm npm run build succeeds after this change.
5. Tell me explicitly which real values I need to copy into my local .env file to keep targeting the same Firebase project as before (referencing the original hardcoded values you found in step 1, without you writing them anywhere in the codebase or in your response in a way that gets committed — just confirm the variable names I need to fill in).

Constraints:
- Only frontend/lib/firebase.ts and frontend/.env.example are modified.
- Never write a real credential value into any file that gets committed — .env.example must only ever contain placeholders.
- Do not refactor firebase.ts beyond this specific change (e.g., do not restructure its exports or initialization pattern).
- Report the exact diff for both files.
```

## Testing
**How to test:**
1. After setting up local `.env` with the real values, restart `npm run dev` and confirm login still works (proves Firebase Auth config is correctly read from env vars).
2. Confirm Firestore reads/writes still work (e.g., load the dashboard, check history loads) — proves Firestore config is correctly read.
3. Run `npm run build` — confirm it still succeeds (env vars must also be available at build time for `NEXT_PUBLIC_` variables to be inlined correctly).
4. **Full Sprint 2 regression pass** (see Implementation Plan step 7) — every fix from Days 1–5 verified together in one session, since this is the last day of the sprint and the last chance to catch any interaction between this week's changes before calling Sprint 2 done.

**Expected result:** Identical behavior to before, but configuration now lives in environment variables; full regression pass confirms no fix from this week broke any other fix.

**Edge cases:** Confirm a fresh clone of the repo (or a clean `.env` based only on `.env.example`) fails clearly and obviously (not silently) if the Firebase env vars aren't set — a clear error is preferable to a confusing runtime failure, so check what actually happens and consider whether a startup check is warranted (if so, keep it minimal — don't build a full config-validation framework today, that's beyond Sprint 2's scope).

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| Firebase fails to initialize after the change | `.env` not actually populated, or dev server wasn't restarted after adding env vars | Confirm `.env` has real values and restart `npm run dev` |
| Build succeeds but production deployment fails to connect to Firebase | Deployment platform's environment variables not yet updated to match the new required variable names | Add the same variables to whatever deployment platform is in use, mirroring local `.env` |
| `NEXT_PUBLIC_` variables show as `undefined` in the browser | Variable name doesn't actually start with `NEXT_PUBLIC_`, or a typo in the variable name between `.env` and `firebase.ts` | Confirm exact spelling matches in both places — Next.js requires the literal `NEXT_PUBLIC_` prefix at build time |

## Checklist
- [ ] Every hardcoded Firebase value identified in `firebase.ts`
- [ ] `.env.example` confirmed/updated with matching placeholder variables
- [ ] `firebase.ts` updated to read from `process.env.NEXT_PUBLIC_FIREBASE_*`
- [ ] Local `.env` populated with real values, app confirmed still connecting to the same Firebase project
- [ ] `npm run build` succeeds
- [ ] Full Sprint 2 regression pass completed across all five days' fixes in one session
- [ ] Sprint 2 documentation finalized (see below)

## Commit Message
```
chore(config): move Firebase client configuration to environment variables
```

## Documentation Update
- `docs/26_Risks.md` and `docs/02_Architecture.md` — mark "Hardcoded Firebase Credentials" Resolved.
- `docs/21_Tech_Stack.md` — no technology change, but note that Firebase config is now environment-variable-driven.
- `docs/01_Master_Roadmap.md` — mark Sprint 2 ✅ Complete, with an "Actual Outcome" note summarizing the five fixes.
- `docs/25_Backlog.md` — confirm the explicitly-deferred items from Sprint 1/2 (prompt injection hardening, Context re-render performance, Word export, duplicate PDF libraries, Firestore security rules audit) are present and correctly prioritized for Sprint 3 planning.

## End-of-Day Review
Sprint 2 is complete. Every Critical and High-severity issue confirmed during Sprint 1 is resolved: the application builds for production, new user profiles load correctly, all AI/processing API routes require authentication, the Job Matcher displays the insights it already generates, the settings link works, and Firebase configuration is environment-variable-driven and consistent with the rest of the project's configuration approach. Nothing new was built — every change this week corrected something Sprint 1 directly found and cited.

## Tomorrow Preview (Sprint 3 — to be planned separately)
Sprint 3 is not yet scoped in detail. Based on `docs/26_Risks.md`'s deferred items, likely candidates are: prompt-injection input sanitization, a Firestore security rules audit, `ResumeContext` re-render performance, and the re-scoping of the original Sprint 3–14 roadmap against the now-confirmed real tech stack (per the "Roadmap Corrections Needed" note in `docs/01_Master_Roadmap.md`). Sprint 3's actual day-by-day plan should be generated as its own request, the same way Sprint 2 was — grounded in what's true at that time, not assumed now.

---

# Sprint 2 Summary

## Sprint Goal
Resolve every Critical and High-severity issue confirmed during Sprint 1's audit, making the existing HireLens application stable, secure, and genuinely deployable — with zero new product features, zero UI redesign, and zero architectural changes beyond what each confirmed defect specifically required.

## Expected Deliverables
1. A passing production build (`npm run build` exits 0).
2. Firestore collection casing corrected; new (and, if needed, migrated existing) user profiles load correctly.
3. All five `/api/*` routes require valid Firebase ID-token verification; unauthenticated requests are rejected before incurring any OpenRouter cost or performing any file processing.
4. Job Matcher AI insights visibly rendered to users.
5. Settings navigation link corrected.
6. Firebase client configuration sourced from environment variables, consistent with the rest of the project's configuration approach.
7. `docs/02_Architecture.md`, `docs/26_Risks.md`, `docs/21_Tech_Stack.md`, and `docs/01_Master_Roadmap.md` all updated to reflect Resolved status for every item addressed.

## Risks
- **Migration risk (Day 2):** if real user accounts already existed under the miscased `"Users"` collection before this sprint, those accounts require a verified one-time data migration, not just a forward-looking code fix — this must not be silently skipped.
- **Regression risk (Day 3):** adding mandatory authentication to all five API routes changes their contract; any client code calling these routes that wasn't found and updated during Day 3's search will break. Day 5's full regression pass is the safety net for this.
- **Scope discipline risk:** several confirmed issues (prompt injection, Context re-render performance, Word export, duplicate PDF libraries) are real and cited but deliberately deferred — there's a risk of scope creep pulling these into Sprint 2 mid-week; the daily "Files to Modify" constraints in each day's prompt are the guardrail against this.

## Definition of Done
- `npm run build` succeeds with zero errors.
- A new signup creates a profile that loads correctly on first attempt, with no manual database intervention.
- Calling any of the five `/api/*` routes without a valid Firebase ID token returns 401 and incurs no OpenRouter cost.
- The Job Matcher visibly displays AI-generated insights after a successful request.
- The "Your Profile" navbar link correctly navigates to `/dashboard/settings`.
- No Firebase configuration value is hardcoded in `lib/firebase.ts`; the app functions identically using only environment-variable-sourced configuration.
- All five `Day_NN.md` Documentation Update steps have been applied — `02_Architecture.md`, `26_Risks.md`, `21_Tech_Stack.md`, and `01_Master_Roadmap.md` accurately reflect the post-Sprint-2 state of the codebase.

## Exit Criteria
Sprint 2 is complete and Sprint 3 may be planned once:
1. Every item in the Definition of Done above is independently, manually verified (not just "the AI said it passed") — per this wiki's standing rule, verification by direct observation, not by trusting a generated report.
2. The Day 5 full regression pass has been performed in a single continuous session covering all five days' changes together.
3. `docs/01_Master_Roadmap.md` shows Sprint 2 as ✅ Complete with a real "Actual Outcome" note, the same discipline applied when Sprint 1 was closed out.
