# Sprint 2 — Day 1: Fix Production Build Failure

## Objective
The application cannot currently be deployed — `npm run build` fails with a TypeScript compilation error in `cover-letter/page.tsx:171`. This is the single highest-priority item in `docs/26_Risks.md` ("Critical"). Today's entire scope is making `npm run build` succeed, with no other changes. Nothing else in Sprint 2 matters if the app can't build.

## Concepts
- **Why this is TypeScript, not a runtime bug:** `pdfDoc.save()` (from whatever PDF library is in use in the cover-letter export path) returns a `Uint8Array`. The `Blob` constructor's TypeScript types expect a `BlobPart`, and depending on the exact TS/lib.dom.d.ts version in this project, a raw `Uint8Array` may not satisfy that type even though it works at runtime in most browsers. The fix is a type-level correction (wrapping/casting correctly), not a logic change — the actual PDF bytes produced should be identical before and after.
- **Why "minimal fix" matters here specifically:** Per `04_Project_Rules.md` Rule 1 ("never rewrite unnecessarily") and this sprint's explicit mandate (no refactors, no new features), today's fix should be the smallest correct change that satisfies the type checker — not a rewrite of the export flow.

## Prerequisites
- Sprint 1 complete; `docs/02_Architecture.md`, `docs/21_Tech_Stack.md`, `docs/26_Risks.md` available and current.
- Local environment runnable per `ENVIRONMENT_VERIFICATION.md` (`npm install`, `npm run dev` confirmed working in Sprint 1, Day 2).
- Node/npm installed as already verified in Sprint 1 — no new installs expected today.

## Setup
```bash
cd frontend
npm install   # only if dependencies have changed since Sprint 1, Day 2 — otherwise skip
npm run build # reproduce the failure first, exactly as documented in ENVIRONMENT_VERIFICATION.md §4
```
Confirm the build fails with the same error already recorded:
```
app/dashboard/cover-letter/page.tsx:171:55 - error TS2345: Argument of type 'Uint8Array' is not assignable to parameter of type 'BlobPart'.
```
If the error differs from what's recorded, stop and re-verify against `ENVIRONMENT_VERIFICATION.md` before proceeding — today's fix is scoped to the exact, already-confirmed error.

## Resources
- TypeScript `BlobPart` type definition (part of `lib.dom.d.ts`) — check via your editor's "go to definition" on `BlobPart` for the exact signature in this project's TypeScript version.
- MDN `Blob()` constructor docs: https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob
- Whatever PDF library's docs correspond to the `pdfDoc.save()` call at line 171 (identify the import at the top of `cover-letter/page.tsx` before assuming which library it is — don't guess from the audit summary alone, confirm in the actual file).

## Files to Modify
- `frontend/app/dashboard/cover-letter/page.tsx` — the single file containing the type error, per `ENVIRONMENT_VERIFICATION.md` §4 and `02_Architecture.md`'s Known Issues table (#1).

No other file should be touched today.

## Architecture Context
Per `docs/02_Architecture.md`, this fix touches only the client-side cover-letter export flow — it has no interaction with the API routes, Firestore, or auth, all of which are untouched today.

## Implementation Plan
1. Reproduce the build failure locally (Setup section above) and confirm the exact error and line number match Sprint 1's findings.
2. Open `cover-letter/page.tsx` and read the code around line 171 — identify exactly what `pdfDoc.save()` returns and how the result is passed into `new Blob(...)`.
3. Apply the minimal correct fix: wrap the `Uint8Array` in a way TypeScript accepts as a valid `BlobPart` (e.g., constructing the `Blob` from an array containing the typed array, or using a buffer view consistent with the library's actual return type) — the exact correct fix depends on what's actually at that line, so inspect before patching rather than applying a generic snippet blindly.
4. Re-run `npm run build` and confirm it completes with no TypeScript errors.
5. Manually test the cover letter export feature in the running dev server (`npm run dev`) to confirm the exported file is still valid and unchanged in content/behavior — today's fix must not alter what gets exported, only satisfy the type checker.
6. Confirm no other part of the build output changed unexpectedly (e.g., no new warnings introduced).

## Ready-to-Paste Antigravity Prompt

```
Context: This is the HireLens project (Next.js 16 App Router, React 19, TypeScript). A confirmed, cited production build failure exists, documented in docs/26_Risks.md and docs/02_Architecture.md, Known Issue #1: a TypeScript compilation error at frontend/app/dashboard/cover-letter/page.tsx:171, where a value returned by a PDF library's `.save()` method (a Uint8Array) is passed directly into a `new Blob(...)` call, which TypeScript rejects because Uint8Array is not assignable to BlobPart in this project's TypeScript configuration.

Task:
1. Open frontend/app/dashboard/cover-letter/page.tsx and read the code at and around line 171 to confirm exactly what is being passed to the Blob constructor and which PDF library is in use (check the import statement — do not assume).
2. Apply the minimal, correct fix so that `npm run build` succeeds with zero TypeScript errors. The fix must not change the actual bytes/content of the exported PDF file — this is a type-level correction only, not a logic change. Do not refactor any other part of this file or any other file.
3. Run `npm run build` and confirm it completes successfully. Paste the full build output.
4. Run `npm run dev` and manually exercise the cover letter export feature in the browser to confirm the exported file still opens correctly and is unchanged in content.
5. Do not modify any other file. Do not touch any API route, any Firestore call, or any unrelated component, even if you notice something else worth improving — note it in your response as an observation for a future sprint, but do not change it today.

Constraints:
- Single file change: frontend/app/dashboard/cover-letter/page.tsx only.
- No new dependencies installed unless absolutely required to fix the type error (if one is required, state explicitly why no type-only fix was possible).
- No behavior change to the exported PDF content.
- Report the exact diff applied.
```

## Testing
**How to test:**
1. `npm run build` — must complete with exit code 0 and no TypeScript errors.
2. `npm run dev` — load `/dashboard/cover-letter`, generate or open a cover letter, trigger the export action, and open the resulting file to confirm it's a valid, correctly-formatted PDF.
3. Compare the exported file's content against a pre-fix export (if you captured one in dev mode before the fix, since dev mode doesn't run the type checker) to confirm no content regression.

**Expected result:** Clean production build; exported PDF is byte-for-byte equivalent in content to what dev mode produced before the fix.

**Edge cases:** If the cover letter contains unusual characters (non-ASCII, long text causing pagination) test export with at least one such case to confirm the fix doesn't break PDF generation under realistic content.

**Failure cases:** If the build still fails after the fix, the type signature assumption was wrong — re-inspect the actual return type of `.save()` from the specific library version installed (check `package.json`/`package-lock.json` for the exact version) rather than guessing again.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| Fix resolves the type error but export now produces a corrupt/empty PDF | The wrapping approach changed the actual byte content, not just satisfied the type checker | Revert; use a wrapping approach that preserves the underlying buffer exactly (e.g., wrap without copying/transforming bytes) |
| A different TypeScript error appears after this one is fixed | A second, previously-masked type issue in the same file | Document it as a new, separately-tracked issue — do not silently fix it today if it's unrelated to the Blob/Uint8Array issue; today's scope is this one error |
| Build succeeds locally but a different error appears in CI/Vercel (if applicable) | Local and deployment TypeScript versions differ | Confirm the exact TypeScript version pinned in `package.json` is what's being used in both environments |

## Checklist
- [ ] Build failure reproduced and confirmed to match Sprint 1's documented error exactly
- [ ] Root cause confirmed by reading the actual code, not assumed from the audit summary alone
- [ ] Minimal fix applied to `cover-letter/page.tsx` only
- [ ] `npm run build` completes successfully
- [ ] Cover letter export manually tested in dev mode and confirmed unchanged in output
- [ ] No other file modified
- [ ] No new unrelated warnings introduced by the build

## Commit Message
```
fix(cover-letter): resolve Uint8Array/BlobPart type error blocking production build
```

## Documentation Update
- `docs/02_Architecture.md` — move Known Issue #1 from "Confirmed Risks" to a "Resolved" note (don't delete the history — strike it through or move to a "Resolved Issues" subsection with the date/sprint-day it was fixed).
- `docs/26_Risks.md` — same: mark the Production Build Failure entry as Resolved, with a one-line note on the actual fix applied.
- `docs/20_Decision_Log.md` — if the fix required any judgment call beyond a one-line type cast (e.g., choosing between two valid wrapping approaches), log it briefly.

## End-of-Day Review
The application now builds successfully for production for the first time since Sprint 1's audit. This unblocks every subsequent Sprint 2 day and any future deployment — nothing else in this sprint depended on this being fixed first only by convention; it's a genuine prerequisite, since a broken build makes it impossible to verify any other fix in a production-equivalent build.

## Tomorrow Preview
Day 2 fixes the second Critical issue: the Firestore collection casing mismatch (`"Users"` vs. `"users"`) that breaks user profile loading — an isolated, single-purpose fix following the same minimal-change discipline as today.
