# Sprint 11 — Shared Component Strategy (13-Page Reference PDF)

> Principle: Create reusable, modular components for visual patterns repeated across all 13 reference pages.

---

## Shared Component Inventory

| Component | Target Location | Used On (PDF Pages) | Description & Props |
|---|---|---|---|
| `TopHeader` | `components/shell/TopHeader.tsx` | All 8 Authenticated Pages | Global search input (`Ctrl K`), Upgrade button, Bell icon, User profile chip |
| `Sidebar` (Updated) | `components/Sidebar.tsx` | All 8 Authenticated Pages | 10 navigation items, Upgrade to Pro card, User footer profile block |
| `GlobalSearchInput` | `components/shell/GlobalSearchInput.tsx` | All 8 Authenticated Pages | Search input with magnifier icon and `⌘ K` / `Ctrl K` keycap badge |
| `UpgradeCard` | `components/shell/UpgradeCard.tsx` | All 8 Authenticated Pages | Gradient promo card for Pro tier |
| `PageHeader` | `components/common/PageHeader.tsx` | All Authenticated Pages | IconTile, H1 title, subtitle, right action button, ScriptAccent flourish |
| `IconTile` | `components/common/IconTile.tsx` | All 13 Pages | Tinted rounded square with feature-colored icon |
| `ScriptAccent` | `components/common/ScriptAccent.tsx` | All 13 Pages | Handwritten script typography with rotation and optional SVG flourish |
| `ScoreRing` | `components/common/ScoreRing.tsx` | Pages 1, 2, 3, 4, 8, 9, 10, 11 | Circular SVG progress donut with score value, status pill, and delta |
| `MetricBar` | `components/common/MetricBar.tsx` | Pages 6, 8, 10, 11, 12, 13 | Labelled horizontal progress bar with percentage indicator |
| `KeywordTag` | `components/common/KeywordTag.tsx` | Pages 1, 3, 4, 9, 10, 11 | Pill badge with semantic variants (`matched`, `missing`, `suggested`, `neutral`) |
| `SegmentedToggle` | `components/common/SegmentedToggle.tsx` | Pages 9, 11 | Radix-based toggle (e.g. Desktop / Mobile, Original / ATS) |
| `StepTracker` | `components/common/StepTracker.tsx` | Pages 2, 7, 8, 13 | Multi-node horizontal progress stepper with connectors |
| `ActionCard` | `components/common/ActionCard.tsx` | Pages 7, 8 | Clickable feature card with icon tile, title, description, and directional arrow |
| `EmptyState` | `components/common/EmptyState.tsx` | All dynamic pages | Clean empty state with icon, message, and fallback action |
| `LoadingState` | `components/common/LoadingState.tsx` | All dynamic pages | Skeleton shimmer loading state |
| `PromoBand` | `components/common/PromoBand.tsx` | Pages 7, 8, 11 | Full-width gradient banner with headline, body, and CTA button |
| `PublicNav` | `components/public/PublicNav.tsx` | Pages 7, 12, 13 | Public top navigation with dropdowns and CTA |
| `PublicFooter` | `components/public/PublicFooter.tsx` | Page 7 | Complete SaaS footer with link columns and social glyphs |
| `AuthSplitLayout` | `components/public/AuthSplitLayout.tsx` | Pages 12, 13 | Two-column responsive split layout for Sign In and Sign Up |
| `SocialAuthButtons` | `components/public/SocialAuthButtons.tsx` | Pages 12, 13 | Google, GitHub, LinkedIn OAuth button row |
| `TrustRow` | `components/public/TrustRow.tsx` | Pages 12, 13 | 3-item security and trust strip |

---

## Directory Organization Plan
```
frontend/components/
├── shell/          # TopHeader, GlobalSearchInput, UpgradeCard, SidebarUserBlock
├── common/         # PageHeader, IconTile, ScriptAccent, ScoreRing, MetricBar,
│                   # KeywordTag, StepTracker, ActionCard, EmptyState, PromoBand
├── public/         # PublicNav, PublicFooter, AuthSplitLayout, SocialAuthButtons, TrustRow
├── ui/             # Shadcn primitives (button, card, input, dialog, textarea, tabs)
├── agent/          # AI Career Agent components & Artifact Canvas
├── interview-trainer/ # Interview Trainer room & config components
└── resume-builder/ # Resume Editor, forms, and preview templates
```
