# Sprint 11 — Asset and Image Generation Requirements (13-Page PDF)

> Audit of visual assets required across all 13 reference pages.

---

## Asset Register

| ID | Asset Description | Required On | Target Path / Delivery Format |
|---|---|---|---|
| **A-01** | HireLens brand logo mark (hex/lens glyph) | Days 01–14 (all pages) | `public/brand/hirelens-mark.svg` |
| **A-02** | HireLens wordmark lockup | Days 01–04, 07 | `public/brand/hirelens-wordmark.svg` |
| **A-03** | Favicon and app icon set | Day 01 | `public/favicon.ico`, `public/brand/favicon.svg` |
| **A-04** | Landing Hero Illustration (Young professional looking at skyline) | Day 02 (PDF Page 7) | `public/images/landing/hero-career-journey.webp` (AI generated) |
| **A-05** | Script-accent flourish SVGs (curved arrows, underlines) | Days 01–14 | `public/images/accents/*.svg` (Hand-authored SVGs) |
| **A-06** | Auth page marketing collages | Days 03, 04 (PDF Pages 12, 13) | Composed directly in DOM via React components & CSS |
| **A-07** | Company logo glyphs / monograms | Days 06, 09, 12 | Monogram fallback component with brand tints |
| **A-08** | Social auth brand glyphs (Google, GitHub, LinkedIn) | Days 03, 04 | `public/icons/*.svg` (Clean vector SVGs) |
| **A-09** | Social proof avatars & testimonial portraits | Days 02–04 | Illustrated/photographic avatar assets |
| **A-10** | Document & resume thumbnails | Days 05, 13, 14 | Rendered dynamic preview thumbnails |

---

## A-04 Hero Image Generation Specifications
- **Prompt Theme**: A young ambitious professional seen from behind/three-quarters rear, looking out toward a modern illuminated city skyline at sunrise along a glowing path. Soft purple, lilac, and sky blue hues with warm morning horizon accents. Premium modern SaaS editorial style.
- **Aspect Ratio**: 3:2 landscape.
- **Output**: High-resolution WebP and PNG formats placed at `frontend/public/images/landing/hero-career-journey.webp`.
