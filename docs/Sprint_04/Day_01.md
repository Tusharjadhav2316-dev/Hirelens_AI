# Sprint 4 — Day 1: Wire JDMatcherPanel to Structured Section Scoring & Unify Stop Word Sets

## Objective
Two confirmed, code-verified gaps that together mean Sprint 3's most significant `jdMatcher.ts` improvement has never been used in production:

**Gap 1 — `JDMatcherPanel.tsx:135` calls `analyzeJobMatch()` without the `resume` parameter:**
```typescript
const result = analyzeJobMatch(targetTextToAnalyze, jobDescription);
```
Sprint 3 extended `analyzeJobMatch()` to accept an optional third parameter `resume?: Resume` that enables structured section scoring (skills bar = actual skill name matches vs. JD, experience bar = experience description keyword matches vs. JD, projects bar = project description keyword matches vs. JD). Without the `resume` parameter, the function always falls back to the bucket-fill approximation. The `JDMatcherPanel` component has access to the `resume` prop — it is simply not being forwarded to the function call. **This is a one-line fix that activates a full sprint of prior work.**

**Gap 2 — `jdMatcher.ts` uses its own local `STOP_WORDS` set instead of `MASTER_STOP_WORDS` from `lib/atsConfig.ts`:**
`atsEngine.ts` (the Resume Analyzer engine) filters keywords using `MASTER_STOP_WORDS` — a composite set of 230+ words covering general English, recruiting boilerplate, location/meta words, and company/workplace words. `jdMatcher.ts` (the JD Matcher engine) has its own local `const STOP_WORDS` with approximately 80 words. This means the two keyword-based engines in HireLens treat the same text differently — words like "develop", "build", "manage", "lead", "design", "implement", "test", "deploy", "review", "analyze" are in `jdMatcher.ts`'s `STOP_WORDS` but NOT in `MASTER_STOP_WORDS`, and vice versa. This causes inconsistent "matched" and "missing" keyword classifications between the Resume Analyzer and the Job Matcher for identical input.

The fix: replace the local `STOP_WORDS` in `jdMatcher.ts` with an import of `MASTER_STOP_WORDS` from `atsConfig.ts`, then run the benchmark regression suite to confirm no score regressions.

## Concepts
- **Why the bucket-fill fallback was never visible to users:** When `analyzeJobMatch` returns bucketed section matches (40%/40%/remaining), the numbers look plausible — they're not obviously wrong. A user looking at Skills: 45%, Experience: 38%, Projects: 22% has no way to know those numbers were computed by filling match counts into arbitrary percentage buckets rather than actually checking skill names against JD keywords. The fix makes the displayed bars reflect reality.
- **Stop word unification and its scoring impact:** Adding words like "manage" and "build" to the effective stop word set means fewer generic verbs count as "matched" or "missing" JD keywords. This reduces false positives (generic resume verbs artificially inflating match scores) and reduces false negatives (generic JD verbs appearing as critical "missing keywords" the user should add to their resume). The overall keyword match score may shift slightly — which is correct.

## Prerequisites
- Sprint 3 complete; `npm run build` succeeds; `npx tsx tests/atsBenchmark.test.ts` passes all assertions.
- Read `components/resume-builder/JDMatcherPanel.tsx` line 135 to confirm the call site.
- Read `lib/jdMatcher.ts` line 1 and 15 to confirm the local `STOP_WORDS` declaration.
- Read `lib/atsConfig.ts` to confirm `MASTER_STOP_WORDS` is exported.

## Setup
No new packages. No new environment variables.

```bash
cd frontend
npm run build   # confirm clean before any changes
npx tsx tests/atsBenchmark.test.ts  # confirm benchmark baseline before any changes
```

## Resources
- `lib/atsConfig.ts` — the `MASTER_STOP_WORDS` export, already available.
- `lib/jdMatcher.ts` — the file being modified.
- `components/resume-builder/JDMatcherPanel.tsx` — the call site being fixed.
- `tests/atsBenchmark.test.ts` — the regression verification suite to run after changes.

## Files to Modify
- `frontend/components/resume-builder/JDMatcherPanel.tsx` — add `resume` as third argument to `analyzeJobMatch()`.
- `frontend/lib/jdMatcher.ts` — replace local `STOP_WORDS` with `MASTER_STOP_WORDS` from `atsConfig.ts`.

`tests/atsBenchmark.test.ts` is **run** (not modified) to verify no regressions. It should pass without changes since the benchmark suite tests `atsEngine.ts` functions directly, not `jdMatcher.ts`.

## Architecture Impact
No interface changes. `analyzeJobMatch()`'s signature does not change — the `resume` parameter is already typed as optional. The only change is forwarding an already-available value at the call site. Stop word unification affects which JD keywords appear in `matchedKeywords` and `missingKeywords` arrays returned by `analyzeJobMatch()` — the display in `JDMatcherPanel.tsx` will now reflect more accurate, less-noisy keyword lists.

## Implementation Plan
1. Open `components/resume-builder/JDMatcherPanel.tsx` and find line 135 (confirm it reads `analyzeJobMatch(targetTextToAnalyze, jobDescription)`).
2. Change it to `analyzeJobMatch(targetTextToAnalyze, jobDescription, resume)`. The `resume` prop is already available in `JDMatcherPanel` — confirm via the `JDMatcherPanelProps` interface at line 1 and the destructured `resume` in the component's render.
3. Open `lib/jdMatcher.ts`. Add the import: `import { MASTER_STOP_WORDS } from "@/lib/atsConfig";`.
4. Delete the local `const STOP_WORDS = new Set([...])` declaration (lines ~15–80).
5. In the `extractKeywords` function, replace all references to `STOP_WORDS` with `MASTER_STOP_WORDS`. There are two references: the guard `!STOP_WORDS.has(cleanWord)` and the TECHNICAL_TERMS check (`if (TECHNICAL_TERMS.has(cleanWord)) return true;` — this logic is preserved as-is; only the stop word set changes).
6. Run `npm run build` — confirm zero TypeScript errors.
7. Run `npx tsx tests/atsBenchmark.test.ts` — confirm all assertions still pass. Note any score changes in the output (expected: minor fluctuations in `jdMatcher` keyword match scores; the benchmark suite tests `atsEngine` functions, so it should pass without any issue).
8. Test in the running app: open the Resume Builder, paste a job description in the JD Matcher tab, click Analyze. Confirm the Skills, Experience, and Projects section bars now reflect your actual resume content, not generic bucket percentages.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). I am fixing two confirmed gaps in Sprint 4, Day 1. Both gaps are verified by reading the actual source files.

GAP 1 — CONFIRMED: frontend/components/resume-builder/JDMatcherPanel.tsx, line 135 calls:
  analyzeJobMatch(targetTextToAnalyze, jobDescription)
The function signature from lib/jdMatcher.ts is:
  analyzeJobMatch(resumeText: string, jobDescription: string, resume?: Resume): JobMatchResult
The JDMatcherPanel component already receives a `resume: Resume` prop in its props interface. The `resume` parameter is simply not being forwarded to the call. Sprint 3 added structured section scoring (skills = actual skill matches, experience = experience text matches, projects = project text matches) that only activates when `resume` is provided. Without it, the bucket-fill fallback always runs.

GAP 2 — CONFIRMED: frontend/lib/jdMatcher.ts declares its own local:
  const STOP_WORDS = new Set([...]) // ~80 words
instead of using MASTER_STOP_WORDS from lib/atsConfig.ts (~230+ words covering GENERAL_ENGLISH_STOPWORDS + RECRUITING_BOILERPLATE_WORDS + LOCATION_AND_META_WORDS + COMPANY_WORKPLACE_WORDS). This creates inconsistent keyword extraction between lib/atsEngine.ts (which uses MASTER_STOP_WORDS) and lib/jdMatcher.ts (which uses its own set).

Task — Fix Gap 1:
In frontend/components/resume-builder/JDMatcherPanel.tsx, find the line:
  const result = analyzeJobMatch(targetTextToAnalyze, jobDescription);
Change it to:
  const result = analyzeJobMatch(targetTextToAnalyze, jobDescription, resume);
Do not change any other line in this file. Confirm that the `resume` prop is already in scope at this location by checking the component's props interface and destructuring.

Task — Fix Gap 2:
In frontend/lib/jdMatcher.ts:
1. Add this import at the top: import { MASTER_STOP_WORDS } from "@/lib/atsConfig";
2. Delete the entire local STOP_WORDS Set declaration (the const STOP_WORDS = new Set([...]) block and its contents).
3. In the extractKeywords function body, find every reference to STOP_WORDS and replace with MASTER_STOP_WORDS. Do not change any other logic. The TECHNICAL_TERMS set, splitJDByRequirement function, formatResumeToText function, and analyzeJobMatch function are all untouched — only the stop word set reference changes.

Constraints:
- Only frontend/components/resume-builder/JDMatcherPanel.tsx and frontend/lib/jdMatcher.ts are modified.
- The analyzeJobMatch function signature in jdMatcher.ts is not changed.
- The JDMatcherPanel component's props interface is not changed.
- Report the exact diff of both files.
- After applying both fixes, run npm run build and confirm it succeeds with zero TypeScript errors.
- Report whether MASTER_STOP_WORDS contains any words that were NOT in the original STOP_WORDS, as those would be newly filtered from keyword extraction (expected: yes, several — that is the intended outcome).
```

## Testing
**How to test:**
1. `npm run build` — must succeed with zero errors.
2. `npx tsx tests/atsBenchmark.test.ts` — all quality hierarchy assertions must still pass.
3. `npm run dev`, open Resume Builder, navigate to the JD Matcher tab.
4. Use a resume with specific technical skills (e.g., Python, Docker, PostgreSQL).
5. Paste a job description that mentions some of those skills.
6. Click Analyze. **Before the fix:** Skills section bar would show a bucket-filled approximation. **After the fix:** Skills section bar should show the percentage of resume skill names that appear in the JD keyword set. For a resume with 10 skills of which 7 match the JD, expect Skills ≈ 70%.
7. Confirm Experience and Projects bars are similarly reflective of their actual section content.
8. Confirm the "missing keywords" list no longer includes words like "develop", "build", "manage" (now filtered by MASTER_STOP_WORDS).

**Expected result:** Section bars are now meaningful. Missing keyword list is cleaner with fewer generic verbs.

**Edge cases:**
- Resume with empty skills array: skills bar should show 0% (correct — no skills to match).
- JD that's entirely generic boilerplate: many keywords filtered → small keyword set → possibly low match scores, which is honest.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error: "resume is not defined" in JDMatcherPanel | The `resume` destructure in the component function is missing | Confirm `JDMatcherPanel` destructures `resume` from its props at the top of the component function |
| Section bars all show 0% after fix | `resume` object is empty (no skills/experience/projects) | Test with a populated resume — an empty resume correctly shows 0% matches |
| TypeScript error: "Cannot find name MASTER_STOP_WORDS" | Import missing or path wrong | Confirm: `import { MASTER_STOP_WORDS } from "@/lib/atsConfig"` — not from `./atsConfig` |
| Benchmark assertions fail | MASTER_STOP_WORDS filtered a benchmark keyword unexpectedly | Note which assertion fails; `atsBenchmark.test.ts` tests `atsEngine.ts` not `jdMatcher.ts` — if a benchmark fails, something else changed |

## Checklist
- [ ] `JDMatcherPanel.tsx:135` confirmed to call `analyzeJobMatch` with only 2 arguments before the fix
- [ ] `resume` prop confirmed in scope at that call site
- [ ] Line changed to pass `resume` as third argument
- [ ] `jdMatcher.ts` import added for `MASTER_STOP_WORDS`
- [ ] Local `STOP_WORDS` declaration removed
- [ ] All `STOP_WORDS` references replaced with `MASTER_STOP_WORDS` in `extractKeywords`
- [ ] No other changes to `jdMatcher.ts`
- [ ] `npm run build` succeeds
- [ ] `npx tsx tests/atsBenchmark.test.ts` all assertions pass
- [ ] JD Matcher section bars verified in browser with a real resume

## Commit Message
```
fix(jd-matcher): wire resume parameter to activate structured section scoring; unify stop word sets with MASTER_STOP_WORDS
```

## Documentation Update
- `docs/02_Architecture.md` — note that `analyzeJobMatch()` now receives the `resume` object at the `JDMatcherPanel` call site, activating structured section scoring.
- `docs/25_Backlog.md` — mark Day 1 items Done.

## End-of-Day Review
Sprint 3's structured section scoring in `jdMatcher.ts` is now actually in use — activated by a one-line fix at the call site. The JD Matcher's section bars now reflect real content analysis. The stop word sets are unified, reducing false positives and false negatives in the missing keyword list across both engines.

## Tomorrow Preview
Day 2 surfaces the three computed intelligence signals (`keywordDensityScore`, `impactScore`, `completenessScore`) that `analyzeResume()` in `atsAnalyzer.ts` already computes and returns — but that `ATSScorePanel.tsx` currently ignores entirely. These values are available in the `result` prop; only the display layer needs updating.
