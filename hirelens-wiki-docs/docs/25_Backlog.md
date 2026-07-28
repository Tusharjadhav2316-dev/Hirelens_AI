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

## Sprint 3 Items
| Feature | Priority | Status | Sprint | Dependencies | Notes |
|---|---|---|---|---|---|
| Score certifications and achievements in atsAnalyzer.ts | High | Done (Sprint 3, Day 1) | Sprint 3, Day 1 | Sprint 2 | `keywordDensityScore` also computed |
| Remove artificial 35-floor, add bigrams/better quantification in atsEngine.ts | High | Done (Sprint 3, Day 2) | Sprint 3, Day 2 | Sprint 3 Day 1 | |
| Frequency-weighted JD keywords + required/preferred scoring in jdMatcher.ts | High | Done (Sprint 3, Day 3) | Sprint 3, Day 3 | Sprint 3 Day 2 | |
| AI Improve: add achievements/certifications + optional JD context | High | Done (Sprint 3, Day 4) | Sprint 3, Day 4 | Sprint 3 Day 1 | Also updates `lib/aiService.ts` |
| Centralize prompts in lib/promptTemplates.ts; fix ai-insights system prompt | Medium | Done (Sprint 3, Day 5) | Sprint 3, Day 5 | Sprint 3 Day 4 | New file: `lib/promptTemplates.ts` |

## Deferred from Sprint 3 (candidates for Sprint 4)
| Feature | Reason Deferred |
|---|---|
| Semantic embedding-based ATS matching | Requires new API call or library; significant scope beyond Sprint 3 |
| Full cover-letter prompt centralization | 5 distinct prompt variants; deserves a dedicated day |
| Word (.docx) export implementation | Feature work, already in backlog from Sprint 2 |
| Firestore security rules audit | Security concern, not intelligence feature |
| `ResumeContext` re-render performance | Performance concern, not intelligence feature |

## Sprint 4 Items
| Feature | Priority | Status | Sprint | Dependencies | Notes |
|---|---|---|---|---|---|
| Wire `resume` param to `analyzeJobMatch()` in JDMatcherPanel | Critical (bug) | Not Started | Sprint 4, Day 1 | Sprint 3 | Sprint 3's structured section scoring was never activated |
| Unify stop word sets (jdMatcher → MASTER_STOP_WORDS) | High | Not Started | Sprint 4, Day 1 | Sprint 3 | Inconsistency between engines |
| Display Resume Intelligence signals in ATSScorePanel | High | Not Started | Sprint 4, Day 2 | Sprint 3 | keywordDensityScore/impactScore/completenessScore computed but invisible |
| Graduate impact score in Quality mode (4 tiers) | High | Not Started | Sprint 4, Day 3 | Sprint 3 | Binary 100/20 → 20/55/80/100 |
| Graduate skills score in Quality mode (4 tiers) | High | Not Started | Sprint 4, Day 3 | Sprint 3 | Binary 100/20 → 20/60/80/100 |
| Extract calculateFormattingScore() shared helper | Medium | Not Started | Sprint 4, Day 3 | Sprint 3 | Identical code duplicated in Quality + Match modes |
| Word-boundary matching for short skill names in atsAnalyzer | Medium | Not Started | Sprint 4, Day 4 | Sprint 3 | "Go" false-matching "going"/"good" |
| Java Full Stack JD benchmark expansion | Medium | Not Started | Sprint 4, Day 4 | Sprint 3 | Defined but never tested in runBenchmarkSuite() |
| max_tokens + temperature on all AI routes | Medium | Not Started | Sprint 4, Day 5 | Sprint 3 | No response length control; no temperature set |
| Clean duplicate persona from ai-insights user prompt | Low | Not Started | Sprint 4, Day 5 | Sprint 3 | "You are an expert..." duplicated in user message |

## Deferred from Sprint 4 (candidates for Sprint 5)
| Feature | Reason Deferred |
|---|---|
| Cover letter prompt full centralization | Complex (5 distinct prompt variants); deferred from Sprint 3, still deferred |
| Semantic/embedding-based ATS matching | Requires new API or library; not client-side computable without new infrastructure |
| Firestore security rules audit | Security concern not in ATS/intelligence scope |
| ResumeContext memoization | Performance concern, not ATS/intelligence concern |

---

## Sprint 5 Items — AI Resume Optimizer & Rewrite Engine

| Feature | Priority | Status | Sprint/Day | Notes |
|---|---|---|---|---|
| Optimization modes architecture (`buildOptimizerPrompt`, `SECTION_BASE_PROMPTS`, `OPTIMIZER_MODE_PROMPTS`) | High | Done (Sprint 5, Day 1) | Sprint 5, Day 1 | `promptTemplates.ts`, `api/ai-improve`, `aiService.ts` |
| AI optimize button on `AchievementsForm` (Impact mode) | High | Done (Sprint 5, Day 2) | Sprint 5, Day 2 | API supported since Sprint 3; UI was missing |
| AI optimize button on `CertificationsForm` (no mode, context sentence) | High | Done (Sprint 5, Day 2) | Sprint 5, Day 2 | Same — API existed, UI missing |
| JD context panel in Resume Builder | High | Done (Sprint 5, Day 3) | Sprint 5, Day 3 | `ResumeEditor.tsx` local state; wired to all 5 forms |
| Wire `jobDescription` to all 5 AI-enabled form `improveSection()` calls | High | Done (Sprint 5, Day 3) | Sprint 5, Day 3 | Was always accepted by API, never passed by any form |
| `AIImprovementModal` — Regenerate button | Medium | Done (Sprint 5, Day 4) | Sprint 5, Day 4 | Re-run without closing modal |
| `AIImprovementModal` — editable improved-text textarea | Medium | Done (Sprint 5, Day 4) | Sprint 5, Day 4 | User can refine AI output before accepting |
| `AIImprovementModal` — mode indicator badge | Medium | Done (Sprint 5, Day 4) | Sprint 5, Day 4 | Shows which optimization strategy was applied |
| `AIImprovementModal` — JD Context badge | Low | Done (Sprint 5, Day 4) | Sprint 5, Day 4 | Shows when `jobDescription` was active |
| `tests/optimizerSafety.test.ts` — 49 automated assertions | High | Done (Sprint 5, Day 5) | Sprint 5, Day 5 | Guardrail presence, mode validation, JD injection, content preservation |
| Manual truth-preservation cases T1–T4 | High | Done (Sprint 5, Day 5) | Sprint 5, Day 5 | In-browser QA; fabrication, quantification, JD missing skill |

## Deferred From Sprint 5 (Candidates for Future Sprints)

| Feature | Reason Deferred | Target Sprint |
|---|---|---|
| `Certification.description` / `notes` field in type | Cascades into scoring, export, Firestore — out of scope for optimizer sprint | Future type-extension sprint |
| Whole-resume optimization in a single API call | Token usage, hallucination risk, accept/reject granularity concerns | Sprint 6+ (after Career Coach architecture is decided) |
| Mode selector in modal UI (user picks mode before optimizing) | Day 4 modal shows which mode was used; Day 1 sets default modes per section; user-selectable mode is a UX enhancement | Sprint 11 (Premium UI/UX) |
| Persist JD target per resume in Firestore | Session-only JD is sufficient for Sprint 5; persisted "saved JD targets" is a Job Tracker feature | Sprint 7 (Job Search & Application Tracker) |
| Cover letter prompt full centralization (5 variants) | Deferred from Sprint 3 and Sprint 4 | Sprint 6 or dedicated cleanup sprint |
| Firestore security rules audit | Deferred since Sprint 2 | Sprint 13 (Testing, Performance, Security) |
