# Sprint 3 — Day 3: Enhance Job Matcher Engine (`lib/jdMatcher.ts`)

## Objective
`lib/jdMatcher.ts` powers `JDMatcherPanel.tsx` (the Job Matcher tab in the Resume Builder). Reading the actual code reveals three specific, fixable problems:

1. **The JD keyword cap takes the first 80 keywords, not the most important 80.** Line: `if (jdKeywords.length > 80) { jdKeywords = jdKeywords.slice(0, 80); }`. In a job description, the most important keywords are typically those that appear most frequently — a skill mentioned 4 times is more central to the role than one mentioned once. Slicing from the front of a set (after deduplication) loses this signal entirely, since the order after `new Set()` deduplication reflects first-occurrence, not importance.

2. **No required vs. preferred skill distinction.** Real job descriptions use explicit language: "required", "must have", "minimum qualifications" vs. "preferred", "nice to have", "bonus". The current engine treats all JD keywords equally. A keyword from the required section that's missing from the resume should signal more strongly than a keyword from the preferred section.

3. **Section match percentages are mechanically computed by bucket-fill, not by section.** The code comment explicitly acknowledges this: `// Rough approximation for section bars since we lost strict structure in raw text. This ensures the visual bars still populate beautifully.` — the skills/experience/projects percentages are filled by incrementing counters in order (fill skills to 40%, then experience to 40%, then projects). This is cosmetic, not analytical. Replacing it with something more meaningful is feasible without a full structural parser.

Today's work is entirely within `lib/jdMatcher.ts`. No other file is modified.

## Concepts
- **Frequency-weighted keyword selection:** Rather than extracting unique keywords and slicing by position, count how many times each extracted keyword appears in the raw JD text (before deduplication). Sort by frequency descending. Take the top 80 most-frequently-mentioned keywords. This promotes multi-mention keywords (e.g., "TypeScript" mentioned 5 times in a JD) above single-mention ones.
- **Required vs. preferred parsing:** A JD can be split at a heuristic boundary: text before a "preferred" / "nice to have" / "bonus" heading likely contains required skills; text after likely contains preferred ones. This is a heuristic — it won't be perfect for every JD, but for most well-structured JDs it produces much better signal than treating all text equally. Weight: required keyword match contributes 1.0 to match score; preferred keyword match contributes 0.5.
- **Meaningful section scoring without a parser:** Rather than bucket-fill, use the skills listed in the `Resume` object (which is structured) to compute a skills section match, and use the existing experience/project descriptions to match against JD keywords separately. The `formatResumeToText()` function currently concatenates everything — we can split it by section for this analysis without changing its output (which is used by callers that need the full text).

## Prerequisites
- Days 1–2 complete; build succeeds.
- Read `lib/jdMatcher.ts` in full before implementing. Specifically note the `analyzeJobMatch()` function's keyword cap logic and the section match comment.
- Understand the `Resume` type structure from `types/resume.ts` — today's function receives a `Resume` object (`JDMatcherPanel.tsx` calls `analyzeJobMatch(resumeText, jobDescription)` where `resumeText` comes from `formatResumeToText(resume)`, but the panel also has access to the full `resume` prop).

## Setup
No new packages required.

## Resources
- `lib/jdMatcher.ts` — only file modified today.
- `types/resume.ts` — for the `Resume` type structure.
- `components/resume-builder/JDMatcherPanel.tsx` — to understand the call site and what `JobMatchResult` fields it currently renders.

## Files to Modify
- `frontend/lib/jdMatcher.ts` — only file changed today.

**Important note about the function signature:** `analyzeJobMatch(resumeText: string, jobDescription: string)` currently takes two strings. To enable meaningful section scoring (Change 3 below), we need access to the structured `resume` object. The function signature should be extended to `analyzeJobMatch(resumeText: string, jobDescription: string, resume?: Resume)` — the `resume` parameter is optional with `?` so every existing call site remains valid without modification.

## Architecture Impact
`analyzeJobMatch()` gets an optional third parameter `resume?: Resume`. All existing call sites pass only two arguments — they continue to work unchanged. When the structured resume is provided (as `JDMatcherPanel.tsx` can provide), section scoring improves; when it's absent, it gracefully falls back to the existing bucket-fill behavior (for the one case in `ResumeEditor` where only a text string is available).

The `JobMatchResult` interface shape is unchanged — `sectionMatch` still contains `{ skills: number; experience: number; projects: number }`. The numbers are just computed more meaningfully.

## Implementation Plan
1. Read `lib/jdMatcher.ts` fully before editing.
2. **Add frequency-weighted keyword selection.** Before calling `extractKeywords()`, build a frequency map: for each token extracted from the JD, count occurrences in the raw JD text (not the deduplicated set). After extraction and deduplication, sort keywords by their frequency in the raw text descending, then take `slice(0, 80)`. This gives the 80 keywords that appear most often in the JD, not the first 80 found.
3. **Add required vs. preferred detection.** Write a helper `splitJDByRequirement(jd: string): { required: string; preferred: string }` that finds the first occurrence of any of these case-insensitive patterns: `"preferred", "nice to have", "bonus", "what you'll bring", "it's a plus", "desirable"`. Everything before the first match → `required`. Everything from the match onward → `preferred`. If none found → all text is `required`, `preferred = ""`. Use this to tag extracted keywords: those extracted from `required` text get weight 1.0; those from `preferred` text only get weight 0.5.
4. **Apply weights to match score.** For each JD keyword, if the resume contains it: add its weight (1.0 for required, 0.5 for preferred) to `weightedMatchScore`. The denominator is: `sum of all weights` (i.e., `requiredKeywordCount * 1.0 + preferredKeywordCount * 0.5`). `matchScore = Math.round((weightedMatchScore / totalWeight) * 100)`. Cap at 100. This produces the same 0–100 range as before but now differentiates the importance of different skills.
5. **Add optional `resume?: Resume` parameter and improve section scoring.** When `resume` is provided: compute `sectionMatch.skills` as the percentage of resume skills (by name, lowercase, trimmed) that appear in the JD keyword set. Compute `sectionMatch.experience` as the percentage of unique keywords from all experience descriptions that appear in the JD keyword set. Compute `sectionMatch.projects` as the same for project descriptions. When `resume` is not provided, keep the existing bucket-fill fallback so no existing behavior breaks.
6. Add the `Resume` import at the top of the file (it's already in scope in the project — `import { Resume } from "@/types/resume";`).
7. Run `npm run build` and confirm success.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). The file I am modifying today is frontend/lib/jdMatcher.ts, which is the job matching engine used by the JDMatcherPanel component in the Resume Builder.

I have confirmed the following issues by reading the actual code:
1. jdKeywords.slice(0, 80) takes the first 80 extracted keywords, not the most frequently-mentioned 80, losing keyword importance signal.
2. All JD keywords are treated equally — no distinction between required and preferred skills.
3. sectionMatch.skills/experience/projects are computed by a bucket-fill approximation (the code comment says: "Rough approximation... This ensures the visual bars still populate beautifully") rather than actual section analysis.

The current analyzeJobMatch function signature is: analyzeJobMatch(resumeText: string, jobDescription: string): JobMatchResult

Task: Improve frontend/lib/jdMatcher.ts with these specific changes only. The JobMatchResult interface shape must remain identical.

Change 1 — Frequency-weighted keyword selection:
Before the existing `if (jdKeywords.length > 80)` cap:
- Build a frequency map: for each keyword in the extracted (but not yet capped) jdKeywords array, count how many times it appears in the raw jobDescription string (using normalizeText first, then .split and counting occurrences). Store as Map<string, number>.
- Sort jdKeywords by frequency descending (most-mentioned first).
- Then apply the slice(0, 80) cap.
- The rest of the function uses this now-prioritized jdKeywords array.

Change 2 — Required vs. preferred skill detection:
Add a helper function splitJDByRequirement(jd: string): { required: string; preferred: string }:
- Find the first occurrence (case-insensitive) of any of: "preferred qualifications", "preferred skills", "nice to have", "bonus", "desirable", "it's a plus", "what you'll bring" using indexOf on the lowercase jd.
- If found: required = jd.substring(0, matchIndex), preferred = jd.substring(matchIndex).
- If not found: required = jd, preferred = "".
- Return { required, preferred }.

Use this function to tag each JD keyword with a weight:
- Extract keywords from the required section and from the preferred section separately.
- Build a Map<string, number> called keywordWeights: required keywords get weight 1.0, preferred-only keywords (not already in required) get weight 0.5.
- Keywords that appear in both sections get weight 1.0 (required takes precedence).

Change 3 — Weighted match score:
Replace the current matchScore calculation:
- Instead of `(matchedKeywords.length / totalJD) * 100`, compute:
  - weightedMatch = sum of keywordWeights.get(kw) for each kw in matchedKeywords
  - totalWeight = sum of all values in keywordWeights
  - weightedScore = totalWeight > 0 ? Math.round((weightedMatch / totalWeight) * 100) : 0
  - matchScore = Math.min(100, weightedScore)
- matchedKeywords and missingKeywords arrays still contain the raw keyword strings (for display) — unchanged.

Change 4 — Extend function signature and add structured section scoring:
Update the function signature to: analyzeJobMatch(resumeText: string, jobDescription: string, resume?: Resume): JobMatchResult
Add Resume import at the top: import { Resume } from "@/types/resume";

When resume is provided, replace the bucket-fill sectionMatch logic with:
- skills: percentage of resume.skills names (lowercase, trimmed) that appear in the jdKeywords set. Formula: Math.round((matchedSkillCount / Math.max(1, resume.skills.length)) * 100).
- experience: percentage of unique keywords extracted from all experience descriptions (join all exp.description values, run through extractKeywords) that appear in the jdKeywords set.
- projects: same for all project descriptions.
When resume is NOT provided (resume === undefined), keep the existing bucket-fill fallback exactly as-is.

Constraints:
- Only frontend/lib/jdMatcher.ts is modified.
- The JobMatchResult interface shape is unchanged: { matchScore, matchedKeywords, missingKeywords, sectionMatch: { skills, experience, projects }, keywordDensity }.
- The resume parameter is optional (resume?: Resume) — all existing callers that pass only two arguments continue to compile and run without change.
- The STOP_WORDS set, TECHNICAL_TERMS set, extractKeywords(), formatResumeToText(), and normalizeText() functions are not changed structurally — only analyzeJobMatch() and the new splitJDByRequirement() helper are added/changed.
- Report the exact diff of every change.
```

## Testing
**How to test:**

1. `npm run build` — must succeed.
2. `npm run dev`, open the Resume Builder, navigate to the Job Matcher tab.
3. **Frequency-weighting test:** Use a JD that mentions "TypeScript" 5 times and "Agile" once. Confirm "TypeScript" appears higher in the missing keywords list than "Agile" (the display sorts matched/missing alphabetically, but the match score should now prioritize TypeScript's weight more heavily — you can verify by temporarily adding TypeScript to the resume skills and checking the score change is larger than adding Agile would be).
4. **Required vs. preferred test:** Use a JD that says "Required: Python, SQL. Preferred: Tableau". Create a resume with only Tableau. Confirm the match score is lower (Tableau has 0.5 weight) than if the resume had Python (1.0 weight). Create another resume with Python only and confirm its score is higher than the Tableau-only resume.
5. **Section scoring test (when resume is provided — confirm via JDMatcherPanel):** Add React to the skills section. Confirm the skills bar updates to reflect React being matched in the JD. Add React to an experience description instead — confirm the experience bar updates.
6. Confirm that the `JDMatcherPanel.tsx` call site still compiles — it currently calls `analyzeJobMatch(targetTextToAnalyze, jobDescription)` with two arguments. With the optional third parameter, this continues to work.

**Expected result:** Match scores now reflect keyword importance (required skills weighted 2x more than preferred), section bars reflect actual resume content structure, and the most-important JD keywords appear first in the missing list.

**Edge cases:**
- JD that has no "preferred" section keywords: `preferred = ""` → all keywords get weight 1.0 → match score behaves identically to before for these JDs.
- Resume with empty skills array: `skills` section score = 0 (no matches possible), experience and projects sections still compute normally.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error on `resume.skills` when resume is undefined | Optional parameter not properly guarded | Ensure the section scoring block is inside an `if (resume)` guard |
| Match score is always 0 after the change | `totalWeight` is 0 (no keywords extracted or all weights are 0) | Confirm `splitJDByRequirement` is returning non-empty required text; add a fallback: `if (totalWeight === 0) return matchedKeywords.length / jdKeywords.length * 100` |
| Existing call site breaks with "Expected 2 arguments" | TypeScript strict mode doesn't allow calling a 3-arg function with 2 | Confirm the third parameter has `?` making it optional: `resume?: Resume` |

## Checklist
- [ ] `lib/jdMatcher.ts` read in full before editing
- [ ] Frequency map built; keywords sorted before the 80-keyword cap
- [ ] `splitJDByRequirement()` helper added and tested with required/preferred JD text
- [ ] Weighted match score computed and replacing the simple fraction
- [ ] `resume?:Resume` parameter added; structured section scoring implemented behind an `if (resume)` guard
- [ ] Existing two-argument call sites confirmed still valid (TypeScript compiles)
- [ ] `JobMatchResult` interface shape unchanged
- [ ] No other file modified
- [ ] `npm run build` succeeds
- [ ] All test scenarios verified

## Commit Message
```
feat(jd-matcher): frequency-weighted keywords, required vs preferred scoring, structured section matching
```

## Documentation Update
- `docs/25_Backlog.md` — mark JD Matcher intelligence improvements Done (Sprint 3, Day 3).
- `docs/02_Architecture.md` — note that `analyzeJobMatch()` now accepts an optional `resume` parameter for structured section analysis.

## End-of-Day Review
The Job Matcher now produces scores that reflect keyword importance (required skills count double the weight of preferred), and section bars reflect real structural analysis when the full resume object is available. Both the match score and the missing-keyword list are now more actionable.

## Tomorrow Preview
Day 4 moves to the server-side AI improvement route (`api/ai-improve/route.ts`). The confirmed issues: `achievements` and `certifications` sections exist in the Resume Editor but are unsupported by the API (only `summary`, `experience`, `projects` are valid today), and the improvement prompt has no job-description context so all improvements are generic. Both are quick, isolated server-side changes.
