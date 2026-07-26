# HireLens 2.0 — Antigravity Prompt Library

Index of every Antigravity prompt generated for this project. Each prompt lives in full inside its `Sprint_NN/Day_NN.md` file under the **"Ready-to-Paste Antigravity Prompt"** heading — this file is a lookup table so a past prompt can be found without searching every day file.

| Sprint | Day | Prompt Topic | File |
|---|---|---|---|
| 1 | 1 | Read-only project discovery — zero assumptions, citation-backed inventory | `Sprint_01/Day_01.md` |
| 1 | 2 | Environment verification using confirmed (not assumed) stack | `Sprint_01/Day_02.md` |
| 1 | 3 | Verified backend audit — route/service/data-access tracing | `Sprint_01/Day_03.md` |
| 1 | 4 | Verified frontend audit — data flow, state, coupling | `Sprint_01/Day_04.md` |
| 1 | 5 | Architecture consolidation, real diagrams, Sprint 2 planning | `Sprint_01/Day_05.md` |
| 2 | 1 | Fix production build failure — Uint8Array/BlobPart type error | `Sprint_02/Day_01.md` |
| 2 | 2 | Fix Firestore collection casing mismatch ("Users" vs. "users") | `Sprint_02/Day_02.md` |
| 2 | 3 | Add Firebase Admin SDK token verification to all `/api/*` routes | `Sprint_02/Day_03.md` |
| 2 | 4 | Render Job Matcher AI insights; fix settings navbar link | `Sprint_02/Day_04.md` |
| 2 | 5 | Move Firebase config to env vars; full Sprint 2 regression pass | `Sprint_02/Day_05.md` |

> Update this table every time a new `Day_NN.md` is created. Keep "Prompt Topic" to one line — detail lives in the day file.
| 3 | 1 | Enhance `lib/atsAnalyzer.ts` — certifications/achievements scoring, keyword density, skill levels | `Sprint_03/Day_01.md` |
| 3 | 2 | Enhance `lib/atsEngine.ts` — remove floor, bigram extraction, quantification, date ranges | `Sprint_03/Day_02.md` |
| 3 | 3 | Enhance `lib/jdMatcher.ts` — frequency-weighted keywords, required vs preferred, section scoring | `Sprint_03/Day_03.md` |
| 3 | 4 | Enhance `api/ai-improve/route.ts` — achievements/certifications support, JD context | `Sprint_03/Day_04.md` |
| 3 | 5 | Create `lib/promptTemplates.ts`, add ai-insights system prompt, centralize shared prompts | `Sprint_03/Day_05.md` |
| 4 | 1 | Wire `resume` param in `JDMatcherPanel.tsx`; unify stop words with `MASTER_STOP_WORDS` | `Sprint_04/Day_01.md` |
| 4 | 2 | Display `keywordDensityScore`, `impactScore`, `completenessScore` in `ATSScorePanel.tsx` | `Sprint_04/Day_02.md` |
| 4 | 3 | Graduate binary impact/skills scores; extract `calculateFormattingScore()` from `atsEngine.ts` | `Sprint_04/Day_03.md` |
| 4 | 4 | Fix keyword density false positives (word-boundary); expand Java Full Stack benchmark | `Sprint_04/Day_04.md` |
| 4 | 5 | Add `max_tokens`/`temperature` to all AI routes; clean `ai-insights` user prompt | `Sprint_04/Day_05.md` |
