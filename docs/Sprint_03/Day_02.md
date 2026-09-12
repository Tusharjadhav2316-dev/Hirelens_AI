# Sprint 3 — Day 2: Enhance ATS Match Engine (`lib/atsEngine.ts`)

## Objective
`lib/atsEngine.ts` powers the Resume Analyzer page (`/dashboard/resume-analyzer`). Reading the code reveals four confirmed accuracy problems that make its scores misleading:

1. **Artificial 35-point floor in Match mode.** Lines 155–158: `if (finalScore < 35 && resumeText.trim().length > 0) { finalScore = 35; }`. This means a resume that matches only 10% of a job description's keywords is shown to the user as "35/100" — a misleading inflation. A score of 35 should mean something; currently it means "above the floor."
2. **Keyword extraction is single-word only.** `extractKeywords()` splits on spaces and filters individual words. A JD that says "machine learning engineer" extracts "machine", "learning", "engineer" — three separate words. The resume that says "Machine Learning Engineer" (exact phrase) also produces three separate matches. But a resume that says "ML Engineer" matches zero of the three, even though it means the same thing. The `TECHNICAL_TERMS` set in `jdMatcher.ts` handles compound terms well — `atsEngine.ts` has no equivalent.
3. **`detectQuantification` misses major patterns.** The current regex: `/\d+%|\d+\s*(?:users|clients|revenue|dollars|$|%|metrics)/i`. This catches "15%" and "500 users" but misses: `$500K`, `$1M`, `10x`, `2x growth`, `doubled`, `tripled`, `+30%`, `×3`. These are all extremely common in strong resumes.
4. **Year-experience extraction only matches "X years" patterns.** `extractYearsOfExperience()` uses regex `/(\\d+)(?:\\+|...)?\\s*(?:years?|yrs?)/gi`. It finds "5 years of experience" but not "Jan 2019 – Dec 2023" (4 years), which is the most common way date ranges appear in resumes.

Today's work is entirely within `lib/atsEngine.ts`. No other file is modified.

## Concepts
- **Why remove the floor, not lower it?** A meaningful ATS engine should give users accurate feedback even when the score is low. The floor was probably added as a UX band-aid ("we don't want to show 0/100"), but an honest 15/100 with specific missing-keyword feedback is more useful than an inflated 35/100. If the UX needs softening, that's a display-layer concern (e.g., a label that says "Needs significant improvement"), not a scoring concern.
- **Bigrams without complexity:** Rather than a full NLP tokenizer, a practical bigram extraction appends all adjacent word pairs to the keyword set. "machine learning" → add "machine", "learning", "machine learning" all. This way, a JD that says "machine learning" can match a resume that says either "machine learning" (exact bigram match) or separately demonstrates individual tokens. The bigram approach is additive, not replacing the existing unigram extraction.
- **Why not semantic matching today?** True semantic similarity (embeddings) would require a new API call or a new library with significant bundle impact, and belongs in a later sprint. Today's improvements are algorithmic and client-side — no new network calls, no new dependencies.

## Prerequisites
- Day 1 complete; build succeeds.
- Read `lib/atsEngine.ts` in full before implementing — specifically the `extractKeywords()`, `detectQuantification()`, `extractYearsOfExperience()`, and `analyzeResumeMatch()` functions. Confirm the artificial floor at line 155.

## Setup
No new packages required.

## Resources
- `lib/atsEngine.ts` — only file modified today.
- `lib/jdMatcher.ts` — reference for the `TECHNICAL_TERMS` set and the compound-term preservation pattern already in production.
- MDN `RegExp` docs for the year-range regex: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

## Files to Modify
- `frontend/lib/atsEngine.ts` — only file changed today.

## Architecture Impact
No structural change. The `ATSResult` interface shape is unchanged. The `analyzeResumeQuality()` and `analyzeResumeMatch()` functions return the same types. Improvements are internal to the computation logic only.

## Implementation Plan
1. Read `lib/atsEngine.ts` fully before writing a single line.
2. **Remove the 35-point floor.** Delete lines 155–158 (`if (finalScore < 35 && resumeText.trim().length > 0) { finalScore = 35; }`). Retain the ceiling logic (line 159: `else if (finalScore > 95 && ...) { finalScore = Math.min(finalScore, 95); }` — that one is honest and worth keeping).
3. **Add bigram extraction to `extractKeywords()`.** After building the single-word keyword set, iterate the `words` array again and for each adjacent pair `[words[i], words[i+1]]`, construct `bigram = words[i] + " " + words[i+1]`. Apply the same filtering: skip if either word is in STOP_WORDS or is numeric-only. Add passing bigrams to the keyword set. This means the returned array can contain both "machine" and "machine learning" — which is correct.
4. **Improve `detectQuantification()` regex.** Replace the current regex with: `/(\d+[xX×]|\d+%|\+\d+%|\$[\d,.]+[KkMmBb]?|\b(?:doubled|tripled|quadrupled|10x|5x|2x|3x)\b|\d+\s*(?:users|clients|revenue|dollars|projects|systems|teams|engineers))/i`. Test mentally: `$500K` → matches `\$[\d,.]+[KkMmBb]?`. `10x` → matches `\d+[xX×]`. `doubled` → matches `\b(?:doubled|...)\b`. `+30%` → matches `\+\d+%`.
5. **Improve `extractYearsOfExperience()` to also parse date ranges.** After the existing "X years" regex, add a second pass: find all year-number pairs in the format `YYYY` using `/\b(20\d\d|19\d\d)\b/g`. Collect all matched years into an array, then compute `maxYear - minYear` as the implied years of experience (capped at 40 to prevent absurd edge cases). Take the maximum of the two methods ("X years" extraction vs. date-range inference) as the final returned value.
6. Verify the `missingKeywords.slice(0, 15)` cap — this is acceptable for UX (showing more than 15 missing keywords on screen is noise), but note in a comment that it's a display cap only and doesn't affect `finalScore`. This does not need to change today — confirm it's documented correctly.
7. Run `npm run build` and confirm success.
8. Test in the running app: upload a resume that's clearly mismatched for a job description → confirm the score is now honest (below 35 if deserved) and the missing keywords list reflects the bigram-aware extraction.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). The file I am modifying today is frontend/lib/atsEngine.ts, which is the ATS scoring engine for the Resume Analyzer page (/dashboard/resume-analyzer).

I have confirmed the following issues by reading the actual code:
1. analyzeResumeMatch() has an artificial floor at lines ~155-158: `if (finalScore < 35 && resumeText.trim().length > 0) { finalScore = 35; }` — this inflates all non-empty resumes to at least 35, which is misleading.
2. extractKeywords() splits only on single words. Multi-word technical terms ("machine learning", "full stack") are not captured as phrases.
3. detectQuantification() regex misses: $500K, $1M, 10x, 2x, doubled, tripled, +30%.
4. extractYearsOfExperience() only matches explicit "X years" patterns — it misses date ranges like "Jan 2019 – Dec 2023" which are how most resumes express experience duration.

Task: Improve frontend/lib/atsEngine.ts with these specific changes only. Do not change the ATSResult interface, the ATSBreakdownItem interface, or the ATSFlags interface. Do not modify any other file.

Change 1 — Remove the artificial 35-point floor from analyzeResumeMatch():
Delete ONLY the block: `if (finalScore < 35 && resumeText.trim().length > 0) { finalScore = 35; }`
Retain the existing ceiling cap: `else if (finalScore > 95 && (missingKeywords.length > 0 || missingEducation || experienceGap)) { finalScore = Math.min(finalScore, 95); }` — adjust the if/else chain as needed now that the floor block is removed.

Change 2 — Add bigram extraction to extractKeywords():
After the existing single-word keyword set is built, add a bigram pass:
- Iterate the words array by index.
- For each adjacent pair [words[i], words[i+1]], form bigram = words[i] + " " + words[i+1].
- Skip if either word alone is in STOP_WORDS, is numeric-only (isNaN(Number(word)) is false), or is shorter than 2 characters.
- Add passing bigrams to the keywordSet.
- The returned array now naturally contains both unigrams and bigrams.
- All existing unigram behavior must be preserved exactly — the bigram logic is purely additive.

Change 3 — Improve detectQuantification():
Replace the current regex with:
/(\d+[xX×]|\d+%|\+\d+%|\$[\d,.]+[KkMmBb]?|\b(?:doubled|tripled|quadrupled)\b|\d+\s*(?:users|clients|revenue|dollars|projects|systems|teams|engineers))/i

Change 4 — Improve extractYearsOfExperience() to also infer from date ranges:
After the existing while loop that extracts "X years" style patterns (keep it exactly as-is), add:
- A second pass using: /\b(20\d{2}|19\d{2})\b/g to extract all 4-digit years from the text.
- If 2 or more years are found, compute inferredYears = maxYear - minYear.
- Cap inferredYears at 40 (guard against outliers).
- Return: Math.max(maxYears, inferredYears > 0 ? inferredYears : 0)
where maxYears is the value from the original "X years" extraction. The two methods are independent; the higher result wins.

Constraints:
- Only frontend/lib/atsEngine.ts is modified.
- The ATSResult, ATSBreakdownItem, and ATSFlags interface shapes are unchanged.
- The analyzeResumeQuality() function's weights and structure are unchanged.
- The analyzeResumeMatch() function's weights (Keyword 40%, Formatting 25%, Experience 20%, Education 15%) are unchanged.
- The missingKeywords.slice(0, 15) display cap is unchanged — add a comment clarifying it's a display cap only.
- Report the exact diff of every change.
```

## Testing
**How to test:**

1. `npm run build` — must succeed.
2. `npm run dev`, open `/dashboard/resume-analyzer`.
3. **Floor removal test:** Upload a resume with random text unrelated to a job description (e.g., Lorem ipsum). Paste a very technical JD (e.g., a senior machine learning engineer role). Confirm the Match score is now below 35 (previously would have been locked to 35).
4. **Bigram test:** Use a resume that says "Machine Learning" in the experience section. Use a JD that says "machine learning experience required". Confirm "machine learning" appears in matched keywords (not just "machine" and "learning" separately).
5. **Quantification test:** Add "$500K revenue impact" to a resume's experience. Confirm `noQuantification` flag is false (the resume has quantification).
6. **Date range test:** Use a resume with experience dated "January 2019 – December 2023". Confirm the experience score treats this as ~4 years of experience, instead of 0 (which would happen if no explicit "4 years" phrase is present).
7. Reconfirm Day 1's changes are still intact — `npm run build` clean.

**Expected result:** Scores are now honest (no floor inflation), bigrams match correctly, quantification detection catches dollar-format and multiplier-format numbers, and date ranges are understood.

**Edge cases:**
- Resume with "2019" appearing in a product version or a project name (e.g., "Python 2019 competition") — the year-range inference could over-count. Accept this edge case for now; the cap of 40 prevents absurd values, and the `Math.max(existingYears, inferredYears)` means the explicit "X years" extraction takes precedence if both are present.
- Bigrams that cross section boundaries (last word of skills, first word of experience header) — not a concern since the function works on a flat text string, not parsed sections.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error on bigram logic | Typed `words` array indexed out of bounds | Ensure the bigram loop runs from `i = 0` to `i < words.length - 1` (not `words.length`) |
| Date-range inference gives absurd values | Year regex matches non-date numbers (phone numbers with 4-digit sequences) | The `/\b(20\d{2}\|19\d{2})\b/g` pattern already restricts to 1900–2099 range — this is a reasonable constraint for dates |
| Match score now shows 0 for clearly relevant resumes | Bigram extraction changed match logic | Confirm the bigram pass is *additive* and the original unigram set is not replaced |

## Checklist
- [ ] `lib/atsEngine.ts` read in full before editing
- [ ] Artificial 35-point floor removed from `analyzeResumeMatch()`
- [ ] Bigram extraction added to `extractKeywords()` — additively, not replacing unigrams
- [ ] `detectQuantification()` regex updated and mentally verified against $500K, 10x, doubled
- [ ] `extractYearsOfExperience()` updated to infer from year-range patterns, capped at 40
- [ ] `missingKeywords.slice(0, 15)` commented as display cap only
- [ ] No interface changes
- [ ] No other file modified
- [ ] `npm run build` succeeds
- [ ] All test scenarios manually verified

## Commit Message
```
feat(ats-engine): remove artificial score floor, add bigram keyword extraction, improve quantification and year detection
```

## Documentation Update
- `docs/26_Risks.md` — mark "ATS scoring accuracy" concerns as partially addressed (Days 1–2).
- `docs/25_Backlog.md` — mark corresponding backlog items as Done.

## End-of-Day Review
The Resume Analyzer's Match scoring engine now gives honest scores (removing the floor that inflated all non-empty resumes), catches multi-word technical terms, and recognizes date-range-based experience. Combined with Day 1's builder engine improvements, both ATS scoring paths in HireLens are materially more accurate.

## Tomorrow Preview
Day 3 improves `lib/jdMatcher.ts` — the JD Matcher panel's matching engine. The main issues there are: taking the first 80 JD keywords regardless of importance (should weight by frequency), no required vs. preferred skill detection, and section match percentages that are computed mechanically rather than from actual section analysis.
