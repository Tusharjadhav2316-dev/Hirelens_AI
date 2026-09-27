# Sprint 11 — Design System Extraction from the Finalized Reference

> Extracted by observation from the reference PDF. Values marked **(measured)** are read off the artboards; values marked **(inferred)** are conservative interpretations. Exact hex values are **not** stated where the PDF's rendering cannot be trusted to that precision — those are marked `SAMPLE FROM PDF DURING IMPLEMENTATION`, which Antigravity must do with a colour picker on Day 01.

## What Can Be Reused From the Current Repository
| Current asset | Verdict |
|---|---|
| Tailwind CSS v4 + `@theme inline` block in `globals.css` | **Reuse** — the token mechanism is correct; only the values are wrong |
| shadcn token *names* (`--primary`, `--card`, `--border`, `--sidebar-*`, `--chart-1..5`) | **Reuse the names**, replace the values. Keeps `ui/button.tsx` and `ui/card.tsx` working unchanged. |
| `--radius: 0.625rem` (10px) | **Close but slightly small.** Reference cards read ~12–16px. Raise to `0.875rem` (14px) and let the derived `--radius-*` scale follow. |
| `ui/button.tsx`, `ui/card.tsx`, `ui/input.tsx`, `ui/label.tsx`, `ui/dialog.tsx` (CVA-based) | **Reuse and extend with variants** — do not rewrite. Adding a `gradient` button variant is far safer than replacing the button. |
| `lucide-react` | **Reuse** for all UI icons (brand glyphs excepted — see `04_Asset_and_Image_Requirements.md`) |
| `framer-motion` | **Reuse** for the reference's subtle motion. No new animation dependency. |
| `radix-ui` | **Reuse** for missing primitives (tabs, select, checkbox, progress, avatar, dropdown, tooltip). No new dependency. |
| `.dark` token block | **Reuse and extend** — dark mode must keep working (`03_Reference_Conflicts.md` C-05) |
| `clsx` + `tailwind-merge` (`cn()`) | Reuse |

**Conclusion: this is a re-tokenization, not a new design system.** No CSS framework change, no component-library swap.

## Colors

### Brand
| Role | Observation | Token to add |
|---|---|---|
| Primary (buttons, active nav, links) | Strong indigo/violet; the primary CTA is a **left-to-right gradient** from indigo into violet (measured on "Sign In", "Create Account", "Start Interview", "Analyze Resume" bars) | `--brand-primary`, `--brand-primary-hover`, plus `--brand-gradient-from` / `--brand-gradient-to` |
| Accent / emphasis text | Brighter blue used for the emphasised word in H1s ("Opportunity.", "Intelligently", "HireLens") | `--brand-accent` |
| Brand tint surfaces | Very pale lilac/blue washes behind page-header panels and promo bands | `--brand-surface`, `--brand-surface-2` |

`SAMPLE FROM PDF DURING IMPLEMENTATION` — sample the gradient's two endpoints from the "Sign In" button on PDF page 9 and the accent blue from the word "Opportunity." on page 4.

### Semantic
| Role | Usage in reference | Token |
|---|---|---|
| Success / green | ATS donut, "Good Match" pill, matched keywords, ✓ rows, "Best Match" badge, 92%/90% bars | `--success`, `--success-surface`, `--success-border` |
| Warning / amber | "Suggested Keywords", Pro Tip rows, 78%/70% bars, lightbulb cards, score pill at 76 | `--warning`, `--warning-surface` |
| Error / red | "Missing Keywords", "Rejected" tracker row, areas-for-improvement dots, PDF file icon | `--danger`, `--danger-surface` |
| Info / blue | Resume Builder icon tile, informational cards | `--info`, `--info-surface` |

### Feature Accent Colors (per-tool tinting — used on landing cards, quick actions, sidebar icons)
Resume Builder → blue · ATS Analyzer → violet · Job Search → green · Cover Letters → red/rose · Interview Trainer → indigo · Career Roadmap → amber · Career Coach → teal/cyan *(inferred)* · Resume History → slate *(inferred)*
Token set: `--feature-{resume|ats|jobs|cover|interview|roadmap|coach|history}` each with a `-surface` companion for the tinted icon tile.

### Neutrals
Page background is a very light grey-blue (not pure white) behind white cards **(measured — matches the existing `bg-gray-50` usage)**. Card surfaces are white. Borders are a hairline light grey at low contrast. Text runs near-black for headings, mid-slate for body, lighter slate for captions/metadata. Maps cleanly onto the existing slate-ish neutrals — **retune `--background`, `--card`, `--border`, `--muted-foreground`; do not invent a new neutral ramp.**

## Typography
**Family: UNCONFIRMED** — a geometric sans (Poppins / Outfit / Plus Jakarta Sans family of shapes). Current code loads **no font at all** (stubbed). Day 01 selects, loads via `next/font`, and flags for owner confirmation. (`03_Reference_Conflicts.md` C-13)
**Script family: UNCONFIRMED** — handwritten accent face (Caveat / Kalam / Patrick Hand candidates). Required on every page. (C-12)

Scale **(measured, in px at the artboard's desktop width)**:
| Role | Size | Weight | Notes |
|---|---|---|---|
| Landing H1 | ~56–64 | 700–800 | tight leading (~1.05), emphasised word in `--brand-accent` |
| Auth H1 (left column) | ~44–52 | 700–800 | same treatment |
| Auth card H2 ("Welcome back") | ~28–32 | 700 | centred |
| Page title (authenticated H1) | ~26–30 | 700 | beside icon tile |
| Section H2 (landing) | ~32–36 | 700 | |
| Card title | ~15–16 | 600 | often with a leading icon |
| Body | ~14 | 400–500 | line-height ~1.55 |
| Subtitle under page title | ~13–14 | 400 | muted |
| Caption / metadata | ~11–12 | 400–500 | muted |
| Eyebrow ("EVERYTHING YOU NEED") | ~11–12 | 600 | uppercase, letter-spacing ~0.12em |
| Button label | ~13–14 | 600 | |
| Stat number (dashboard) | ~32–36 | 700 | |
| Donut centre number | ~30–34 | 700 | with a smaller `/100` suffix |
| Script accent | ~18–22 | 400 | script family, rotated ~-4° to -8° |

## Spacing **(measured, 4px base)**
| Context | Value |
|---|---|
| Dashboard content padding | 24–32px (current `p-4 sm:p-6 lg:p-8` is compatible) |
| Gap between major rows | 20–24px |
| Grid gap between cards | 16–20px |
| Card internal padding | 20–24px (large cards), 14–16px (compact rail cards) |
| Card title → content | 12–16px |
| Form field vertical rhythm | 16–18px (label → input 6–8px) |
| Icon tile → title (page header) | 12–16px |
| Chip/tag gap | 6–8px |
| Landing section vertical rhythm | 64–96px |

## Shape
| Element | Radius **(measured)** |
|---|---|
| Large cards / panels | 14–16px |
| Compact rail cards | 12px |
| Buttons | 8–10px |
| Inputs / textareas | 8–10px |
| Chips / tags / pills | fully rounded (`9999px`) |
| Icon tiles | 10–12px |
| Avatars | circular |
| Segmented toggles | 8px outer, 6px inner |
| Dropzone | 12px, **dashed** border |
Recommendation: raise `--radius` to `0.875rem` and use the derived scale.

## Depth
The reference is **low-elevation**: cards sit on a hairline border plus a very soft, wide, low-opacity shadow — closer to `shadow-sm`/`shadow-xs` than `shadow-lg`. Elevation increases only for: floating hero pill-cards, the auth form card, and modals. **Avoid heavy shadows** — the dominant separation device is the border + background contrast, not shadow.
Tokens: `--shadow-card` (soft), `--shadow-raised`, `--shadow-overlay`.

## Icons
- **Style:** outline/stroke, ~1.5–1.75px stroke, rounded caps — consistent with `lucide-react` defaults. ✅ reusable.
- **Sizes (measured):** 14px inline/metadata · 16px in buttons and list rows · 18–20px card titles · 20–24px inside icon tiles.
- **Icon container:** rounded square (10–12px radius), roughly 36–44px, filled with the feature's `-surface` tint, icon in the feature's solid colour. This is the single most repeated visual device in the reference and should become one component.
- **Colored status dots:** small filled circles (green/amber/red) preceding list rows — used heavily on ATS strengths/improvements and insight lists.

## Motion
Observable/implied only — the reference is static, so this is deliberately conservative:
- Hover on cards: slight border-colour darkening and a marginal shadow increase. **No lift/translate on large cards.**
- Hover on buttons: gradient/fill darkens; no scale.
- Focus: a visible 2px brand-coloured ring with offset (required for accessibility regardless of the reference).
- Transitions: 150–200ms, ease-out, on `color`/`background`/`border`/`box-shadow` only — **not** on `transform` or `width` for layout elements.
- Loading: skeleton shimmer on cards; spinner only inside buttons.
- Agent activity checklist (PDF 7): the in-progress row has a rotating/pulsing indicator — the only genuinely animated element visible in the reference.
- Modal/dropdown: 150ms fade + 4px rise.
**Explicitly avoid:** parallax, glow pulses, bouncing, entrance animations on every card, `framer-motion` page transitions. `framer-motion` is already installed and sufficient for everything above.

## Token Delivery Plan (Day 01)
1. Add brand/semantic/feature tokens to `:root` in `globals.css` **additively** — retune existing shadcn token values, do not rename them.
2. Add matching `.dark` values (inferred, verified for contrast).
3. Expose new tokens through the existing `@theme inline` block so Tailwind utilities pick them up.
4. Load real fonts in `app/layout.tsx`; add `--font-script`.
5. Raise `--radius`.
6. **Do not** mass-rewrite existing hardcoded utilities (`bg-blue-600`, `text-slate-900`, …). Pages migrate to tokens on their own day. This keeps the Day 01 regression surface to the shell plus token values, rather than every page at once.
