# Day 02 — Landing Page

## Objective
Build the public landing page at `/` — currently non-existent (the route is a pure auth-redirect stub) — matching PDF page 4: hero with headline/CTA/avatar-cluster/testimonial, 6-card feature grid, 3-step "How It Works" tracker, final CTA band, and footer.

## Reference
- PDF page: **4**
- Route: `/`

## Current Repository State
`app/page.tsx` (36 lines) is entirely a redirect: authenticated → `/dashboard/agent`, unauthenticated → `/login`, showing only a loading spinner in between. **No landing page markup exists at all.** No `PublicNav`/`PublicFooter` exists.

## Target UI
Public nav (logo, Product/Solutions/Resources/Pricing dropdown items, Sign in, Get Started Free) → hero (eyebrow, large two-line H1 with accent word, body, CTA + Watch Demo, avatar cluster + "500K+..." line; right side hero illustration with 4 floating pill-cards + script accent + testimonial card) → feature grid (eyebrow, H2, body, 6 `ActionCard`s) → How It Works (eyebrow, H2, body, `StepTracker` with 3 nodes) → final CTA `PromoBand` with script accent → `PublicFooter`.

## Current vs Target Difference
- Current: no landing page exists (redirect only). Target: full multi-section marketing page.
- Current: `/` unauthenticated → `/login`. Target: `/` unauthenticated → renders landing; authenticated behaviour unchanged (D-10).
- Current: no hero illustration asset. Target: generated illustration (A-04) or a placeholder block reserving its exact position until the asset is produced.
- Current: no testimonial/avatar-cluster component. Target: built, with content flagged for owner confirmation (A-09).

## Layout Specification
Full-width sections, each within a `max-w-7xl` (or wider, if sampled from the reference) centred container. Hero is a 2-column grid (roughly 45/55) on desktop, stacking to 1 column (copy above illustration) on mobile. Feature grid is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (6 cards → 2 rows of 3 at desktop). Step tracker is a horizontal flex row with dotted connectors, stacking vertically on mobile.

## Component Specification
`PublicNav` (from Day 01... no — **created today**, first page that needs it; add to `components/public/`), `PublicFooter`, `ActionCard` (icon tile, title, 2-line body, text-arrow link — reused verbatim on Dashboard Day 05), `StepTracker` (numbered circle, dotted connector, icon tile, title, body), `StatStrip` (three `number/label` pairs), `ScriptAccent` (from Day 01), `PromoBand` (from Day 01), testimonial card (new, small — avatar row + 5-star row + quote + name/title), avatar cluster (`MonogramAvatar` ×4 overlapping, from Day 01).

## Typography
H1 per `08_Design_System_Extraction.md` (~56–64px, weight 700–800, accent word in `--brand-accent`); eyebrow uppercase tracked labels; body ~14–16px relaxed line-height.

## Colors
`--brand-primary` gradient CTA; `--brand-accent` for the emphasised H1 word; per-feature tint on each of the 6 `ActionCard` icon tiles (blue/violet/green/red/indigo/amber, matching the feature-colour mapping in `08_Design_System_Extraction.md`).

## Spacing
Section vertical rhythm 64–96px per `08_Design_System_Extraction.md`; hero internal gap per its 2-column split.

## Cards / Surfaces
`ActionCard` uses the Day 01 `card` styling; testimonial card is a slightly elevated white card (one of the sprint's few intentionally-raised surfaces, matching the reference's floating treatment).

## Buttons / Controls
"Get Started Free →" = `gradient` button variant; "Watch Demo" = outlined button with a play icon; "Sign in" = plain/ghost button in the nav.

## Icons
Feature icons per `08_Design_System_Extraction.md`'s feature-colour table; play icon for Watch Demo; star icons (filled) for the testimonial rating.

## Images / Assets
**A-04 (hero illustration) — IMAGE GENERATION REQUIRED**, full brief in `04_Asset_and_Image_Requirements.md`. Until produced, reserve its exact bounding box with a subtly-tinted placeholder block (not an unrelated stock photo) so the surrounding layout (pill-cards, testimonial, script accent) can be built and verified against correct positioning. **A-09 (avatar cluster + testimonial photo)** — flagged as an **owner content decision** per D-13/R-17 before shipping; use `MonogramAvatar` placeholders in the interim.

## Image Generation Requirement
See A-04 in `04_Asset_and_Image_Requirements.md` — reproduced here for this day's convenience: young professional from behind, glowing career path toward a city skyline, warm horizon light, pale sky background blending to white, premium SaaS illustration style, ~3:2, WebP+PNG, `public/images/landing/hero-career-journey.webp`, referenced via `next/image` with `priority`.

## Responsive Behavior
- **Desktop:** as designed, 2-column hero, 3-column feature grid, horizontal step tracker.
- **Tablet:** hero stacks copy-above-illustration; feature grid becomes 2 columns; step tracker stays horizontal but tightens.
- **Mobile:** hero fully stacked, illustration scaled and cropped to a shorter aspect; feature grid 1 column; step tracker stacks vertically with a left connector line instead of a horizontal dotted one; nav collapses to a hamburger menu (new — this page has no existing mobile nav pattern to inherit, so build the simplest option: a slide-down panel, consistent with the dashboard drawer's interaction style).

## Existing Functionality To Preserve
The authenticated-user redirect (`user → /dashboard/agent`) must be preserved exactly. Nothing else exists on this route today to preserve.

## Files To Inspect
`app/page.tsx`, `contexts/AuthContext.tsx`, Day 01's `components/common/*` and `components/shell/*`.

## Files To Modify
`app/page.tsx` — becomes: unauthenticated → render landing content; authenticated → redirect to `/dashboard/agent` (unchanged); loading → existing spinner (unchanged).

## Files To Create
`components/public/PublicNav.tsx`, `components/public/PublicFooter.tsx`, `components/public/HeroSection.tsx`, `components/public/FeatureGrid.tsx`, `components/public/HowItWorks.tsx`, `components/public/TestimonialCard.tsx`, `components/common/ActionCard.tsx`, `components/common/StepTracker.tsx`, `components/common/StatStrip.tsx`, `public/images/landing/hero-career-journey.webp` (placeholder until generated).

## Files That Must NOT Be Changed
`contexts/AuthContext.tsx` (read-only consumption of `user`/`loading`), any dashboard route, `app/dashboard/layout.tsx`.

## Implementation Steps
1. Inspect `app/page.tsx`'s current redirect logic in full; confirm the exact `loading`/`user` states.
2. Build `PublicNav`/`PublicFooter` first (used again on Days 03–04).
3. Build `HeroSection`, `FeatureGrid` (6 `ActionCard`s with the mapping from `08_Design_System_Extraction.md`), `HowItWorks` (`StepTracker`, 3 nodes), final `PromoBand`.
4. Wire the hero illustration placeholder at the exact bounding box from A-04.
5. Build `TestimonialCard`; flag its content for owner confirmation in the day's completion notes (do not silently ship a fabricated named endorsement without raising it).
6. Update `app/page.tsx`: unauthenticated renders the new landing content instead of redirecting; authenticated/loading branches unchanged.

## Antigravity Execution Instructions
STEP 1–4 as in Day 01's pattern, reading this doc, inspecting `app/page.tsx` and `AuthContext`, and reviewing PDF page 4 closely (not just the cross-cutting summary).
STEP 5 Implement per Implementation Steps.
STEP 6 Reuse Day 01's `ActionCard`... (create today, but reuse its shape on Day 05's Quick Actions), `ScriptAccent`, `PromoBand`, `MonogramAvatar`, button/card primitives.
STEP 7 Do not touch `/login`, `/signup`, or any dashboard route.
STEP 8 Do not implement Watch Demo's video, Product/Solutions/Resources dropdown destinations, or Pricing — render as static/coming-soon per `07_Future_Sprint_Boundaries.md`.
STEP 9 `npm run dev`.
STEP 10 Open `/` **logged out**.
STEP 11 Compare against PDF page 4 using the full 20-point checklist.
STEP 12 Fix discrepancies.
STEP 13 Repeat.
STEP 14 Test: nav links/dropdowns open (even if destination is coming-soon), Get Started Free → `/signup`, Sign in → `/login`, Watch Demo → coming-soon affordance, mobile nav opens/closes.
STEP 15 Test responsive at 1440/1024/768/390.
STEP 16 Run `npm test` / `npm run build`.
STEP 17–18 Console/network clean, including confirming the placeholder hero image doesn't 404.
STEP 19 Confirm `/` still redirects correctly when **logged in** (this is the regression-critical check for this day).
STEP 20 Mark complete.

## Live Server Verification
Per Phase 1; explicitly test both logged-out (see landing) and logged-in (redirect fires) states.

## Visual Comparison Checklist
Full 20-point Phase 2 checklist against PDF page 4, section by section (nav → hero → features → how-it-works → CTA → footer).

## Functional QA
Get Started Free / Sign in navigate correctly; nav dropdowns and mobile menu open/close; avatar cluster and testimonial render without layout shift; footer links present (destinations may be coming-soon per boundary doc).

## Accessibility QA
Nav is a real `<nav>` with accessible dropdown buttons (`aria-expanded`); hero H1 is a true `h1`; illustration has descriptive alt text; testimonial stars have an accessible rating description, not icon-only; footer social icons have `aria-label`; colour contrast checked on the accent-blue H1 word and on script-accent text (script accents are decorative and may need `aria-hidden` if purely ornamental).

## Regression Tests
Full Phase 6, with special attention to: logged-in redirect still fires (this is the one behavioural change in the sprint — see D-10/R-12), and no other route is affected since this page previously had no content.

## Failure Cases
If the authenticated-redirect check is accidentally removed or reordered, a logged-in user could see the marketing page instead of being sent to their workspace — this is the primary failure mode to test for explicitly, not just incidentally.

## Rollback Plan
Revert `app/page.tsx` to the pure-redirect stub; delete the new `public/` components and `ActionCard`/`StepTracker`/`StatStrip` if not yet consumed elsewhere. Because `ActionCard` is intended for reuse on Day 05, check whether Day 05 has landed before deleting it on rollback.

## Definition Of Done
Landing page live at `/` for unauthenticated visitors, authenticated redirect unchanged and verified, all sections match PDF page 4 per the 20-point checklist, hero illustration either integrated or clearly placeholder-marked with A-04's spec satisfied, testimonial/avatar content flagged for owner sign-off, full regression suite green.
