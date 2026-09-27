# Day 01 — Design System Foundation + AppShell

## Objective
Establish the core design tokens, typography, brand assets, and shared primitives across the application:
1. Retune `app/globals.css` with the reference's indigo/violet brand tokens, semantic colors, and elevated radius (`0.875rem` / `14px`).
2. Load geometric sans (`Plus Jakarta Sans` or `Outfit`) and script font (`Caveat` or `Kalam`) via `next/font/google` in `app/layout.tsx`.
3. Build shared shell primitives: `TopHeader`, `GlobalSearchInput`, `UpgradeCard`, and `SidebarUserBlock`.
4. Update `components/Sidebar.tsx` with all 10 items in exact reference order, active pill styling, Upgrade card, and user profile block.
5. Create base visual atoms: `IconTile`, `ScriptAccent`, `ScoreRing`, `MetricBar`, `KeywordTag`, `PromoBand`, `PageHeader`, `EmptyState`, and `LoadingState`.

## Reference
- **PDF Pages**: All 13 pages (cross-cutting design framework and navigation shell).
- **Scope**: Applied across all authenticated routes (`/dashboard/*`).

## Deliverables
- `frontend/app/globals.css` updated with new design tokens & dark-mode complements.
- `frontend/app/layout.tsx` font loader configuration.
- `frontend/components/shell/TopHeader.tsx`
- `frontend/components/shell/GlobalSearchInput.tsx`
- `frontend/components/shell/UpgradeCard.tsx`
- `frontend/components/Sidebar.tsx` updated with 10 nav routes.
- `frontend/components/common/` core atomic primitives.
