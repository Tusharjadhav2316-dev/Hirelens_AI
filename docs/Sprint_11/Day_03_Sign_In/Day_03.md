# Day 03 — Sign In / Login

## Objective
Rework `/login` to match PDF page 9: two-column split with a marketing/benefits column (including the product-shot collage) on the left and the sign-in form card on the right, preserving all existing authentication functionality.

## Reference
PDF page: **9** · Route: `/login`

## Current Repository State
`app/login/page.tsx` (178 lines) — exists and is functional (email/password sign-in via `AuthContext`, presumably existing validation and error display; **verify exact current fields/social-provider support during inspection**). Layout is not confirmed to match the reference split — treat as needing full visual rework.

## Target UI
Left: `PublicNav` (top), eyebrow, H1 "Your Career, **Intelligently** Guided." (accent word), body, 4-item benefit list (`InsightRow`-style with `IconTile`), product-shot collage (composed from real components per D-05), 3 script accents, `StatStrip`. Right: white form card — back-to-home link, centred logo, "Welcome back" H2, subtitle, Email field (icon), Password field (icon + show/hide), Remember me + Forgot password row, gradient "Sign In →", "or continue with" divider, `SocialAuthButtons` (Google/GitHub/LinkedIn), "Don't have an account? Sign up" link, `TrustRow` beneath the card.

## Current vs Target Difference
- Current: layout structure unconfirmed against a two-column marketing/form split — **verify first**, likely single-column or simpler card. Target: full split layout.
- Current: unknown whether social sign-in buttons exist or function. Target: render only providers `AuthContext` genuinely supports (C-07 boundary — verify during inspection, do not add new OAuth providers).
- Current: no product-shot collage, no benefit list, no trust row. Target: all present, collage built from real components (D-05).

## Layout Specification
Two-column grid, ~50/50, left column on a soft brand-tinted gradient background, right column white. Stacks to form-only (marketing column hidden or moved below) on mobile — see Responsive.

## Component Specification
`AuthSplitLayout` (new, shared with Day 04): takes `marketing` and `form` slots. `SocialAuthButtons` (new, shared with Day 04): renders a row of outlined buttons, one per **actually supported** provider. `TrustRow` (new, shared): 3 items, icon + 2-line text. Collage built from `ScoreRing`, `MetricBar`, small mock cards — all Day 01 primitives, populated with the reference's exact illustrative numbers as **static marketing composition**, not live data.

## Typography
Per `08_Design_System_Extraction.md`: H1 ~44–52px; H2 "Welcome back" ~28–32px centred; body ~14px; field labels ~13px.

## Colors
Left column background: `--brand-surface`/`--brand-surface-2` gradient. Form card: `--card`. Primary button: gradient. Trust-row icons: `--success`/`--info`/`--brand-accent` per item.

## Spacing
Form field vertical rhythm per `08_Design_System_Extraction.md`; card internal padding 24–32px given its prominence.

## Cards / Surfaces
Form card is one of the sprint's few deliberately-elevated surfaces (`shadow-raised`, per `08_Design_System_Extraction.md`'s Depth section).

## Buttons / Controls
Gradient "Sign In →" full width; outlined social buttons with brand glyph + label (A-08 assets); ghost "← Back to Home"; text-link "Sign up"/"Forgot password?".

## Icons
Mail icon (email field), lock icon (password field) + eye/eye-off toggle, shield/people/sparkle for `TrustRow`.

## Images / Assets
Social brand glyphs (A-08) — first page in the sprint to need them; hand-author the 3 required (Google, GitHub, LinkedIn) today. No illustration/photo asset required (collage is component-built per D-05).

## Image Generation Requirement
Not applicable — see D-05.

## Responsive Behavior
- **Desktop:** full two-column split as designed.
- **Tablet:** marketing column narrows; collage may simplify (fewer floating elements) to avoid crowding — reference has no tablet artboard, so this is a conservative inference.
- **Mobile:** marketing column **collapses below or is hidden**, form card becomes the full-width primary content (this is the existing, safer pattern for auth pages); benefit list and trust row may render in a condensed form beneath the form card rather than being dropped entirely, since they contain trust-building copy, not just decoration.

## Existing Functionality To Preserve
Email/password sign-in, form validation, error messaging, "Forgot password?" (link to whatever it currently does — verify; do not build new reset flow), any currently-working social sign-in, redirect-after-login behaviour, link to `/signup`.

## Files To Inspect
`app/login/page.tsx` (full), `contexts/AuthContext.tsx` (confirm which sign-in methods exist: email/password, and any OAuth providers actually wired), `components/ui/input.tsx`.

## Files To Modify
`app/login/page.tsx` — visual rework only; all existing handler logic (`onSubmit`, error state, loading state, provider calls) preserved and re-wired into the new markup.

## Files To Create
`components/public/AuthSplitLayout.tsx`, `components/public/SocialAuthButtons.tsx`, `components/public/TrustRow.tsx`, `components/public/AuthCollageSignIn.tsx`, `public/icons/{google,github,linkedin}.svg`.

## Files That Must NOT Be Changed
`contexts/AuthContext.tsx` internals (consumed, not modified, unless a genuinely missing provider must be *rendered conditionally absent* rather than added — do not add new OAuth wiring), `/signup`'s own page file (Day 04 owns it, though `AuthSplitLayout` is shared).

## Implementation Steps
1. Inspect `app/login/page.tsx` fully; enumerate every existing prop/handler/state before touching markup.
2. Confirm exactly which sign-in methods `AuthContext` supports; render `SocialAuthButtons` only for those (do not render a non-functional button).
3. Build `AuthSplitLayout`, `TrustRow`, `SocialAuthButtons`, hand-author the 3 brand SVGs.
4. Build `AuthCollageSignIn` from Day 01 primitives with the reference's exact illustrative figures as static content.
5. Rebuild `app/login/page.tsx`'s markup inside `AuthSplitLayout`, preserving every existing handler exactly.
6. Verify "Forgot password" points at whatever it currently does; do not build a new flow.

## Antigravity Execution Instructions
Standard 20-step protocol (see Day 01/`11_Verification_Protocol.md`) with these specifics: STEP 3 review PDF page 9 in detail including the collage's exact card contents; STEP 6 reuse Day 01/02 primitives (`ScriptAccent`, `StatStrip`, `IconTile`, `ScoreRing`, `MetricBar`) plus `PublicNav`/`PublicFooter` from Day 02; STEP 14 functional QA must include a real sign-in attempt (valid and invalid credentials) to prove the rework didn't break auth; STEP 19 confirm `/signup` link still navigates correctly.

## Live Server Verification
Phase 1 at `/login`, both empty and filled form states.

## Visual Comparison Checklist
Full 20-point Phase 2 against PDF page 9, left and right columns separately.

## Functional QA
Successful sign-in redirects correctly; invalid credentials show the existing error UI (restyled, not rebuilt); password show/hide toggle works; Remember me persists whatever it currently persists; Forgot password and Sign up links navigate correctly; any real social button actually initiates its provider flow.

## Accessibility QA
Email/password inputs have labels; password toggle has `aria-label` and `aria-pressed`; error messages are associated with their field (`aria-describedby`) or announced; social buttons have accessible names including the provider; focus order follows the visual left-to-right, top-to-bottom reading order... actually right-to-left is not applicable — standard order top-to-bottom within the form.

## Regression Tests
Full Phase 6; specifically re-verify sign-in end-to-end (this page's core function) after the visual rework, and confirm `/signup` and `/` (landing) are unaffected.

## Failure Cases
If a social provider is rendered but not actually wired in `AuthContext`, the button must not be shown at all — showing a non-functional button is worse than omitting it. If layout changes accidentally alter input `name`/`id` attributes relied on by tests or autofill, restore them.

## Rollback Plan
Revert `app/login/page.tsx` to its pre-Day-03 version; `AuthSplitLayout`/`SocialAuthButtons`/`TrustRow` remain unused pending Day 04, or are deleted if Day 04 has not started.

## Definition Of Done
`/login` matches PDF page 9 per the 20-point checklist; sign-in, validation, error handling, forgot-password link, and sign-up link all verified working; only genuinely-supported social providers rendered; full regression suite green.
