# Day 04 — Sign Up / Create Account

## Objective
Rework `/signup` to match PDF page 10, reusing Day 03's `AuthSplitLayout`/`SocialAuthButtons`/`TrustRow`, with sign-up-specific content (benefit list, collage, 3-step tracker, terms/privacy consent).

## Reference
PDF page: **10** · Route: `/signup`

## Current Repository State
`app/signup/page.tsx` (247 lines) — exists and functional (name/email/password creation via `AuthContext`; **verify exact current fields and whether a terms-consent checkbox already exists**). Layout not confirmed to match the reference split.

## Target UI
Left: `PublicNav`, "Already have an account? Sign in" (top-right of this column), eyebrow, H1 "Create Your Future With **HireLens**", body, 4-item benefit list, product-shot collage (profile card, skills chips, ATS donut, job card — per PDF page 10), `StepTracker` (Create Your Profile → Get AI Insights → Unlock Opportunities), `StatStrip`. Right: form card — logo, "Create your account" H2, subtitle, Full Name (icon), Email (icon), Password (icon + toggle), **consent checkbox** ("I agree to the Terms of Service and Privacy Policy", both as links), gradient "Create Account →", "or sign up with" divider, `SocialAuthButtons`, "Already have an account? Sign in", `TrustRow`.

## Current vs Target Difference
- Current: unknown whether a consent checkbox exists — **verify**; if absent, this is a genuine, small, justified addition (legal/consent UI, not decoration) — add it and wire it to block submission until checked, but do not invent Terms/Privacy page content (link to existing pages if present, otherwise to a coming-soon placeholder, flagged to the owner).
- Current: no collage, benefit list, step tracker, or stat strip. Target: all present, reusing Day 01–03 primitives.

## Layout Specification
Identical `AuthSplitLayout` structure to Day 03, mirrored content.

## Component Specification
Reuses Day 03's `AuthSplitLayout`, `SocialAuthButtons`, `TrustRow`. New: `AuthCollageSignUp` (profile card + skills chip cloud + ATS donut + job card, from Day 01/09 primitives — `JobCard`'s mini variant may not exist yet since Day 09 is later; if so, build a simple static card here and let Day 09 generalize it, not the other way around, since Day 04 precedes Day 09), `StepTracker` (already built Day 02, reused with 3 different nodes).

## Typography / Colors / Spacing / Cards / Buttons / Icons
Identical system to Day 03; see that day and `08_Design_System_Extraction.md`.

## Images / Assets
Reuses Day 03's brand glyphs (Google/GitHub/LinkedIn) — no new assets needed today.

## Image Generation Requirement
Not applicable.

## Responsive Behavior
Identical pattern to Day 03: full split on desktop, condensed on tablet, form-first with condensed marketing content beneath on mobile.

## Existing Functionality To Preserve
Name/email/password sign-up, validation (including password strength if currently implemented), error display, redirect-after-signup, link to `/login`, any working social sign-up.

## Files To Inspect
`app/signup/page.tsx` (full), `contexts/AuthContext.tsx` (signup method signature), Day 03's new components.

## Files To Modify
`app/signup/page.tsx` — visual rework, all existing handlers preserved; **add** a consent checkbox control wired to gate submission if one does not already exist (log this as the one small, justified new-field addition for the day).

## Files To Create
`components/public/AuthCollageSignUp.tsx`. (Everything else reused from Day 02/03.)

## Files That Must NOT Be Changed
`contexts/AuthContext.tsx` internals beyond what the existing signup call already does; `/login`'s own page file.

## Implementation Steps
1. Inspect `app/signup/page.tsx` fully; confirm current fields, and specifically whether consent is already captured anywhere (e.g. implicitly, or via a checkbox that's present but unstyled).
2. Reuse `AuthSplitLayout`/`SocialAuthButtons`/`TrustRow` unchanged.
3. Build `AuthCollageSignUp` and the sign-up-specific `StepTracker` instance.
4. Rebuild `app/signup/page.tsx` markup; add/restyle the consent checkbox; wire it to disable "Create Account →" until checked if not already enforced.
5. Point Terms/Privacy links at existing pages if any exist in the repo, otherwise a coming-soon affordance — do not fabricate legal content.

## Antigravity Execution Instructions
Standard 20-step protocol. STEP 3 review PDF page 10 in full detail. STEP 6 reuse Day 03's auth components verbatim — do not reimplement them. STEP 14 functional QA must include a real account-creation attempt end to end (use a disposable/test account) plus a check that submission is blocked when consent is unchecked (if that gate is added).

## Live Server Verification
Phase 1 at `/signup`.

## Visual Comparison Checklist
Full 20-point Phase 2 against PDF page 10.

## Functional QA
Successful sign-up creates an account and redirects correctly; validation errors display; consent checkbox gates submission (if newly added, confirm it actually blocks); Terms/Privacy links go somewhere sensible (existing page or coming-soon, not a dead link); Sign in link navigates correctly; any real social sign-up works.

## Accessibility QA
All fields labelled; consent checkbox has an accessible, clickable label including the two links (links themselves keyboard-reachable and distinguishable within the label text); password toggle as Day 03; focus order top-to-bottom.

## Regression Tests
Full Phase 6; specifically re-verify sign-up end-to-end and confirm `/login` and Day 01–03's shared components are unaffected by reuse here.

## Failure Cases
If adding the consent checkbox accidentally changes the signup payload shape in a way `AuthContext` doesn't expect, the checkbox must be UI-only (gating the button) rather than sent to the backend, unless the backend already expects a consent field — verify before wiring.

## Rollback Plan
Revert `app/signup/page.tsx`; delete `AuthCollageSignUp.tsx`; Day 03's shared components are unaffected since they are only consumed, not modified, here.

## Definition Of Done
`/signup` matches PDF page 10 per the 20-point checklist; account creation, validation, consent gating (if added), and navigation all verified working; full regression suite green.
