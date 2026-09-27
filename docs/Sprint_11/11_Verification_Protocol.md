# Sprint 11 — Mandatory Verification Protocol

> This protocol is referenced by every implementation day. **"It looks approximately correct" is not acceptable.**

## Phase 1 — Live Server Verification
1. `cd frontend && npm run dev`
2. If the page depends on the agent service, start it too (`agent-service`: `uvicorn main:app --reload --port 8000`) — otherwise expect and tolerate agent-endpoint failures, but **note them** so they are not confused with new breakage.
3. Open the exact route for the day (listed in the day's Reference section).
4. Authenticate if the route is behind `ProtectedRoute`.
5. Set the browser viewport to **1440 × 900** for primary comparison (the reference artboards are desktop-proportioned). Also check 1280 and 1920.
6. Open the corresponding reference PDF page side by side at comparable scale.

## Phase 2 — Visual Comparison Checklist (all 20 points, every day)
Work top-to-bottom through the page and check each against the reference:
1. **Layout** — correct number of columns; correct column order; correct row order
2. **Width** — content container width; per-column widths and their relative proportions
3. **Height** — card heights; whether cards in a row are equal-height as in the reference
4. **Positioning** — is each element in the same region of the page as the reference
5. **Alignment** — baseline alignment of title/subtitle/actions; left edges of stacked cards; centring where the reference centres
6. **Spacing** — page padding, gap between rows, grid gaps, card internal padding, label→input gaps (values in `08_Design_System_Extraction.md`)
7. **Typography** — family, and the correct size/role per element
8. **Font weight** — headings vs card titles vs body vs captions
9. **Color** — text colours, surface colours, border colours, the brand gradient's direction and endpoints, semantic colours on bars/pills/tags
10. **Border** — presence, weight (hairline), colour; dashed where the reference is dashed (dropzones)
11. **Radius** — per element class (see the shape table)
12. **Shadow** — softness and restraint; no heavy shadows
13. **Icon size** — 14/16/18-20/20-24 per context
14. **Icon placement** — inside tiles, leading card titles, leading list rows, inside buttons (left vs right)
15. **Image scale** — hero/illustration/thumbnail sizing and crop
16. **Image position** — anchoring and bleed
17. **Button size** — height, horizontal padding, label size; solid vs outlined vs gradient variant correct
18. **Input size** — height, padding, leading-icon inset, placeholder colour
19. **Card size** — proportions relative to siblings, especially rail cards vs main cards
20. **Responsive behaviour** — see Phase 4

**If any point mismatches: fix it, reload, and re-run the checklist.** Do not record the mismatch and move on.

## Phase 3 — Functional QA
Exercise the page's **real, existing** interactions (each day lists them specifically). Generic requirements:
- Every button and link either performs its real action or is visibly disabled/coming-soon. **Nothing silently does nothing.**
- Forms validate as they did before.
- Data-driven regions show real data, or a documented empty/loading/error state.
- **Fresh-account check:** log in as (or simulate) a user with no data and confirm no fabricated numbers appear.

## Phase 4 — Responsive QA
Check at **1440**, **1024**, **768**, **390** px widths:
- No horizontal page scroll at any width
- Documented collapse order is followed (each day specifies it)
- Sidebar becomes the mobile drawer (existing `isOpen`/`setIsOpen` behaviour) and still opens/closes
- Touch targets ≥ 44px on mobile
- Wide content (tables, tag clouds, resume previews) scrolls **inside its own container**, not the page

## Phase 5 — Accessibility QA
- Keyboard-only: tab through the entire page; every interactive element reachable and operable; visible focus ring on each
- Icon-only controls have `aria-label`
- Every input has an associated `<label>` (or `aria-label`)
- Headings form a sensible order (one `h1`, then `h2`/`h3`)
- New text/background pairs meet **4.5:1** (3:1 for large text); check the reference's muted captions and tinted chips specifically
- Segmented toggles/tabs use Radix (correct roles/keyboard) rather than styled divs
- Images have meaningful `alt`, decorative accents `alt=""` / `aria-hidden`

## Phase 6 — Regression QA
- `npm run build` — clean
- `npm test` — full existing suite green
- **Every route still loads:** `/`, `/login`, `/signup`, `/dashboard`, `/dashboard/agent`, `/dashboard/builder`, `/dashboard/resume-analyzer`, `/dashboard/job-matcher`, `/dashboard/interview-trainer`, `/dashboard/interview-trainer/setup`, `/dashboard/interview-trainer/room`, `/dashboard/cover-letter`, `/dashboard/career-coach`, `/dashboard/history`, `/dashboard/settings`
- DevTools **Console**: no new errors or warnings
- DevTools **Network**: no new failed requests, no 404s on assets
- Auth still works: sign in, sign out, protected-route redirect
- **Shared-component impact:** if the day touched anything in `components/ui/`, `components/shell/`, `components/common/`, `globals.css`, `app/layout.tsx`, or `app/dashboard/layout.tsx`, **every** route above must be visually spot-checked, not just the day's page
- Dark mode toggled and checked
- `git diff package.json` empty unless the day logs a dependency decision

## Phase 7 — Sign-Off
The day is complete only when every item in its own **Definition Of Done** is checked, and the day's documentation is updated with anything discovered during implementation that differs from the plan.
