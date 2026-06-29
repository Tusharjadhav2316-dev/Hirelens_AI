# HireLens 2.0 — Feature Backlog

> Tracks every individual feature, with sprint/dependency detail. Features get added here once they're confirmed in `22_Product_Requirements.md` as Must/Should/Could Have — this file is the operational tracker, that one is the prioritization rationale.

| Feature | Priority | Status | Sprint | Dependencies | Notes |
|---|---|---|---|---|---|
| Fix production build failure | Critical | Done (Sprint 2, Day 1) | Sprint 2 | — | `cover-letter/page.tsx:171` |
| Fix Firestore casing bug | Critical | Done (Sprint 2, Day 2) | Sprint 2 | — | `signup/page.tsx#L54` |
| API route authentication | High | Done (Sprint 2, Day 3) | Sprint 2 | — | Firebase Admin SDK token verification |
| Job Matcher insights render fix | High | Done (Sprint 2, Day 4) | Sprint 2 | — | `JDMatcherPanel.tsx#L470` |
| Settings navbar link fix | Low | Done (Sprint 2, Day 4) | Sprint 2 | — | `Navbar.tsx#L120` |
| Firebase config to env vars | Medium | Done (Sprint 2, Day 5) | Sprint 2 | — | `lib/firebase.ts` |
| Prompt injection input sanitization | High | Not Started | Sprint 3 (proposed) | — | Deferred from Sprint 2; see `26_Risks.md` |
| Firestore security rules audit | High (speculative until audited) | Not Started | Sprint 3 (proposed) | — | Never directly audited; see `26_Risks.md` Speculative section |
| `ResumeContext` re-render performance fix | Medium | Not Started | Sprint 3 (proposed) | — | Deferred from Sprint 2; see `26_Risks.md` |
| Word (.docx) export implementation | Medium | Not Started | Future feature sprint | — | Explicitly out of Sprint 2 scope — new feature, not a stabilization fix |
| Duplicate PDF library cleanup (`pdf-parse` + `pdfjs-dist`) | Low | Not Started | Future cleanup sprint | — | Bundle size only, not user-facing |
| Re-scope Sprint 3–14 roadmap against confirmed real stack | High | Not Started | Before Sprint 3 planning | Sprint 2 | See `01_Master_Roadmap.md` "Roadmap Corrections Needed" |

## How to Use This Document
Update **Status** as work progresses (Not Started → In Progress → Done → Blocked). If a feature's sprint changes, update `01_Master_Roadmap.md` in the same commit so the two files never disagree.
