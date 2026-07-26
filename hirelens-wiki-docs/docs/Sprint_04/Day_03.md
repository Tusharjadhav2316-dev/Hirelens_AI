# Sprint 4 — Day 3: Graduate Binary Scores & Extract Shared Formatting Helper (`lib/atsEngine.ts`)

## Objective
Three confirmed code problems in `lib/atsEngine.ts`, all reducing the accuracy and recruiter-authenticity of the Quality Mode analysis:

**Problem 1 — `impactScore` is binary (lines 442–444):**
```typescript
let impactScore = 100;
const noQuantification = !detectQuantification(resumeText);
if (noQuantification) impactScore = 20;
```
A resume with one buried metric ("Improved system performance") scores exactly the same as a resume with eight quantified, dollar-impacted achievements. Both score 100. A resume with zero metrics scores 20. No gradation exists. This is the most visible accuracy gap in the Quality Mode scoring.

**Problem 2 — `skillsScore` is binary (lines 447–448):**
```typescript
let skillsScore = 100;
if (!detectSkillsSection(resumeText)) skillsScore = 20;
```
A resume that mentions "Technical Skills" in one line with zero actual skills listed scores 100. A resume that lists 20 well-chosen skills under a section header also scores 100. No distinction.

**Problem 3 — Formatting score is copy-pasted (lines 417–435 and 530–549):**
The same 8-line block computing `formatScore` appears in both `analyzeResumeQuality()` and `analyzeResumeMatch()`. The only difference is one extra line in Match mode (`if (noQuantification) formatScore -= cfgFormat.noQuantificationDeduction`). This duplication means any future change to formatting scoring logic must be applied in two places. Extracting it to `calculateFormattingScore(resumeText: string, includeQuantificationCheck?: boolean): number` eliminates the duplication.

Today fixes all three. This is the only file changed today.

## Concepts
- **Why count quantification instances, not just detect presence:** `detectQuantification(text)` returns a boolean. The improvement: use `(text.match(detectQuantificationRegex) || []).length` to count occurrences. Score the impact tier:
  - 0 instances → 20 (baseline, penalized)
  - 1–2 instances → 55 (marginal — recruiter notices metrics but there aren't enough)
  - 3–5 instances → 80 (good — demonstrates impact-focused writing)
  - 6+ instances → 100 (strong — consistent measurable impact throughout)
- **Why skills count matters:** Recruiter behavior: a "Skills" section with 2 skills suggests a candidate who didn't think carefully about the role. The gradation:
  - No skills section detected → 20 (current baseline, unchanged)
  - Section detected, 0 skills explicitly listed (detectSkillsSection true but word count very low) → 40
  - 1–4 skills → 60
  - 5–9 skills → 80
  - 10+ skills → 100
- **Benchmark regression must still pass:** After today's changes, run `npx tsx tests/atsBenchmark.test.ts`. The quality hierarchy (Education < Projects < Internship < 1-2yr Pro < 3+yr Pro) must remain monotonically ordered. The benchmark resumes have strong enough differences in impact and skills that score ordering should be preserved; if an assertion fails, a calibration note in `BENCHMARK_REGRESSION.md` is added explaining the update.

## Prerequisites
- Days 1–2 complete; `npm run build` succeeds.
- Read `lib/atsEngine.ts` lines 417–470 (Quality mode) and lines 530–600 (Match mode) in full to understand both blocks before touching either.
- Run `npx tsx tests/atsBenchmark.test.ts` now (before any changes) and note the current scores as your baseline.

## Setup
No new packages.

```bash
cd frontend
npx tsx tests/atsBenchmark.test.ts   # record current benchmark scores before editing
```

## Resources
- `lib/atsEngine.ts` — only file modified today.
- `lib/atsConfig.ts` — `ATS_SCORING_CONFIG.formatting` values used in formatting score calculation.
- `tests/atsBenchmark.test.ts` — regression suite to run after changes.

## Files to Modify
- `frontend/lib/atsEngine.ts` — only file changed today.

## Architecture Impact
`calculateFormattingScore()` becomes a new exported helper function in `atsEngine.ts`, alongside the existing `calculateExperienceClarity()` and `calculateATSExperienceScore()`. The `analyzeResumeQuality()` and `analyzeResumeMatch()` functions call it instead of computing inline. No interface changes to `ATSResult`, `ATSBreakdownItem`, or `ATSFlags`.

## Implementation Plan
1. Read `lib/atsEngine.ts` lines 417–470 (Quality mode) and 530–549 (Match mode formatting blocks) fully before editing.
2. **Extract `calculateFormattingScore()`:**
   - Create a new exported function `calculateFormattingScore(resumeText: string, includeQuantificationCheck: boolean = false): number` immediately below the `countWeakVerbs` function.
   - Move the shared formatting logic into it: `formatScore = cfg.baseScore`, lowWordCount deduction, highWordCount deduction, specialChar deduction, uppercase deduction, noBulletPoints deduction, `if (!detectExperienceSection) formatScore -= cfg.noExperienceSectionDeduction` (Quality mode only), then `if (includeQuantificationCheck && noQuantification) formatScore -= cfg.noQuantificationDeduction` (Match mode only — passed via parameter).
   - Return `Math.min(100, Math.max(0, formatScore))`.
   - In `analyzeResumeQuality()`, replace the inline formatting block with: `const formatScore = calculateFormattingScore(resumeText, false);`
   - In `analyzeResumeMatch()`, replace the inline formatting block with: `const formatScore = calculateFormattingScore(resumeText, true);`
   - The `lowWordCount` and `noBulletPoints` variables still need to be accessible for `flags` — extract them before calling the helper, or return them alongside the score. Cleanest: have `calculateFormattingScore` return `{ score: number; lowWordCount: boolean }` since `lowWordCount` is used in the flags object.
3. **Graduate `impactScore` in Quality mode:**
   After the `noQuantification` declaration (after `const noQuantification = !detectQuantification(resumeText)`), replace the binary assignment with:
   ```typescript
   let impactScore: number;
   const quantMatches = (resumeText.match(/(\d+[xX×]|\d+%|\+\d+%|\$[\d,.]+[KkMmBb]?|\b(?:doubled|tripled|quadrupled)\b|\d+\s*(?:users|clients|customers|revenue|dollars|projects|systems|teams|engineers|features|releases|services|applications|updates|requests|transactions|events|records|downloads|stars|workshops|members|students))/gi) || []).length;
   if (quantMatches === 0) impactScore = 20;
   else if (quantMatches <= 2) impactScore = 55;
   else if (quantMatches <= 5) impactScore = 80;
   else impactScore = 100;
   ```
   The regex is the same pattern used in `detectQuantification()` — copy it, but use `.match()` instead of `.test()` to count occurrences.
4. **Graduate `skillsScore` in Quality mode:**
   Replace the binary assignment:
   ```typescript
   let skillsScore: number;
   if (!detectSkillsSection(resumeText)) {
     skillsScore = 20;
   } else {
     // Count individual skill tokens after the skills section header
     const skillsSectionMatch = resumeText.match(/(?:skills?|technologies|tools|competencies)[:\s]+([^\n]+(?:\n(?![\n\S*])[^\n]+)*)/i);
     const skillsText = skillsSectionMatch ? skillsSectionMatch[1] : resumeText;
     const skillTokens = skillsText.split(/[\s,|/•·\-\n]+/).filter(t => t.trim().length >= 2).length;
     if (skillTokens < 5) skillsScore = 60;
     else if (skillTokens < 10) skillsScore = 80;
     else skillsScore = 100;
   }
   ```
5. Run `npm run build` — confirm zero TypeScript errors.
6. Run `npx tsx tests/atsBenchmark.test.ts` — confirm the quality hierarchy assertions still hold. If any assertion fails because a graduated score changed a profile's ordering, note it in `BENCHMARK_REGRESSION.md` and update the benchmark targets table.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). The only file I am modifying today is frontend/lib/atsEngine.ts.

I have confirmed by reading the actual code:
1. Lines 442-444: impactScore in analyzeResumeQuality() is binary — 100 if any quantification detected, 20 if none.
2. Lines 447-448: skillsScore in analyzeResumeQuality() is binary — 100 if detectSkillsSection() returns true, 20 if false.
3. Lines 417-435 and 530-549: the formatting score calculation (formatScore = baseScore; then 6-8 deduction checks) is identically copy-pasted in both analyzeResumeQuality() and analyzeResumeMatch(), with only one difference (Match mode adds: if (noQuantification) formatScore -= noQuantificationDeduction).

Task — Change 1: Extract calculateFormattingScore() helper:
Create an exported function immediately below countWeakVerbs():
export function calculateFormattingScore(resumeText: string, includeQuantificationCheck: boolean = false): { score: number; lowWordCount: boolean } {
  const cfg = ATS_SCORING_CONFIG.formatting;
  let formatScore = cfg.baseScore;
  const lowWordCount = resumeText.length < cfg.lowWordCountThreshold;
  if (lowWordCount) formatScore -= cfg.lowWordCountDeduction;
  if (resumeText.length > cfg.highWordCountThreshold) formatScore -= cfg.highWordCountDeduction;
  const specialCharCount = (resumeText.match(/[^\w\s.,-]/g) || []).length;
  if (specialCharCount > resumeText.length * cfg.specialCharThresholdPercent) formatScore -= cfg.specialCharDeduction;
  const upperCaseWords = (resumeText.match(/\b[A-Z]{4,}\b/g) || []).length;
  const totalWords = resumeText.split(/\s+/).length;
  if (totalWords > 0 && upperCaseWords / totalWords > cfg.uppercaseRatioThreshold) formatScore -= cfg.uppercaseDeduction;
  const noBulletPoints = !(/•|-|\*/.test(resumeText));
  if (noBulletPoints) formatScore -= cfg.noBulletsDeduction;
  if (!detectExperienceSection(resumeText)) formatScore -= cfg.noExperienceSectionDeduction;
  if (includeQuantificationCheck && !detectQuantification(resumeText)) formatScore -= cfg.noQuantificationDeduction;
  return { score: Math.min(100, Math.max(0, formatScore)), lowWordCount };
}

In analyzeResumeQuality(): replace the inline formatting block with:
  const { score: formatScore, lowWordCount } = calculateFormattingScore(resumeText, false);

In analyzeResumeMatch(): replace the inline formatting block with:
  const { score: formatScore, lowWordCount } = calculateFormattingScore(resumeText, true);
(Note: in Match mode, the noQuantification variable is still needed for flags — compute it separately after the helper call: const noQuantification = !detectQuantification(resumeText);)

Task — Change 2: Graduate impactScore in analyzeResumeQuality() (Quality mode only — Match mode impactScore is not applicable):
Replace:
  let impactScore = 100;
  const noQuantification = !detectQuantification(resumeText);
  if (noQuantification) impactScore = 20;
With:
  const noQuantification = !detectQuantification(resumeText);
  const quantMatches = (resumeText.match(/(\d+[xX×]|\d+%|\+\d+%|\$[\d,.]+[KkMmBb]?|\b(?:doubled|tripled|quadrupled)\b|\d+\s*(?:users|clients|customers|revenue|dollars|projects|systems|teams|engineers|features|releases|services|applications|updates|requests|transactions|events|records|downloads|stars|workshops|members|students))/gi) || []).length;
  let impactScore: number;
  if (quantMatches === 0) impactScore = 20;
  else if (quantMatches <= 2) impactScore = 55;
  else if (quantMatches <= 5) impactScore = 80;
  else impactScore = 100;

Task — Change 3: Graduate skillsScore in analyzeResumeQuality() (Quality mode only):
Replace:
  let skillsScore = 100;
  if (!detectSkillsSection(resumeText)) skillsScore = 20;
With:
  let skillsScore: number;
  if (!detectSkillsSection(resumeText)) {
    skillsScore = 20;
  } else {
    const skillsSectionMatch = resumeText.match(/(?:skills?|technologies|tools|competencies)[:\s]+([^\n]+(?:\n(?![\n\S])[^\n]+)*)/i);
    const skillsText = skillsSectionMatch ? skillsSectionMatch[1] : "";
    const skillTokens = skillsText ? skillsText.split(/[\s,|/•·\-\n]+/).filter(t => t.trim().length >= 2).length : 0;
    if (skillTokens < 5) skillsScore = 60;
    else if (skillTokens < 10) skillsScore = 80;
    else skillsScore = 100;
  }

Constraints:
- Only frontend/lib/atsEngine.ts is modified.
- The ATSResult, ATSBreakdownItem, ATSFlags interfaces are unchanged.
- analyzeResumeMatch() impact and skills scoring logic is NOT changed — only analyzeResumeQuality() gets the graduated scores.
- The existing benchmark resumes (educationOnly, projectsOnly, projectsLeadership, internship, oneToTwoYearsPro, threePlusYearsProQuantified) should still satisfy the monotonic quality hierarchy after these changes.
- Run npx tsx tests/atsBenchmark.test.ts after changes and report the new scores. If any quality hierarchy assertion fails, explain which one and propose a calibration fix.
- Report the exact diff.
```

## Testing
**How to test:**
1. `npm run build` — must succeed.
2. `npx tsx tests/atsBenchmark.test.ts` — run and compare output to the baseline captured before editing:
   - The "Impact & Metrics" breakdown score for `projectsOnly` (which has bullet-quantified metrics) should now be significantly higher than `educationOnly` (which has none). Before the fix, both would score 20 (no quantification) or 100 (any quantification), depending on content. After the fix, they should vary based on quantity of metrics.
   - Skills breakdown scores should now vary by skill count, not just section presence.
3. `npm run dev`, open Resume Analyzer, test Quality mode:
   - Upload a resume with no numbers → Impact & Metrics score should be 20.
   - Edit to add 2 metrics → should rise to 55.
   - Add 4 total metrics → should rise to 80.
   - Verify by examining the breakdown panel's "Impact & Metrics" row.

**Expected result:** Quality Mode breakdown now has a graduated Impact & Metrics score (20/55/80/100) and a graduated Skills Coverage score (20/60/80/100). Benchmark hierarchy still holds.

**Edge cases:**
- Resume text with only one number that's not a quantification (e.g. a phone number "555-0199") — `detectQuantification` regex should not match phone numbers; verify.
- Skills section header with no actual content after it → `skillsText` would be empty, `skillTokens` = 0 → skillsScore = 60 (has header but no skills listed — reasonable).

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| Quality hierarchy benchmark assertion fails | Graduated impact/skills score changed a profile's relative ranking | Examine which profiles flipped — for example, if `projectsOnly` now scores lower than `educationOnly` on Skills, check the skill token count regex against those resume fixtures |
| TypeScript error on `noQuantification` used after the refactor | The `noQuantification` variable was inside the old block scope | After extracting `calculateFormattingScore`, ensure `noQuantification` is declared before the `formatScore` call or after, depending on where it's used |
| Match mode benchmark score changes unexpectedly | `calculateFormattingScore` with `includeQuantificationCheck=true` produces different result than the original inline code | Compare the helper's output vs the original computation line-by-line for the `javaFullStack` JD benchmark |

## Checklist
- [ ] Baseline benchmark scores recorded before any edit
- [ ] `lib/atsEngine.ts` read in full before editing
- [ ] `calculateFormattingScore()` helper extracted and exported
- [ ] `analyzeResumeQuality()` and `analyzeResumeMatch()` call the helper
- [ ] `impactScore` in Quality mode graduated into 4 tiers
- [ ] `skillsScore` in Quality mode graduated into 4 tiers
- [ ] Match mode functions (`analyzeResumeMatch`) unchanged for these two scores
- [ ] `npm run build` succeeds
- [ ] `npx tsx tests/atsBenchmark.test.ts` passes all assertions (or failing assertions documented with explanation)

## Commit Message
```
feat(ats-engine): graduate impact and skills quality scores; extract shared calculateFormattingScore helper
```

## Documentation Update
- `docs/BENCHMARK_REGRESSION.md` — update the "Quality Scores" table if benchmark scores changed; note the graduation change and new expected values.
- `docs/25_Backlog.md` — mark Day 3 items Done.

## End-of-Day Review
The Quality Mode ATS engine now produces graduated, recruiter-aligned scores for impact (quantification count) and skills (skill count). The formatting score computation is no longer duplicated. The engine more accurately differentiates between "has 1 metric" and "has 8 metrics" — a distinction that matters significantly to recruiters.

## Tomorrow Preview
Day 4 improves keyword density accuracy in `lib/atsAnalyzer.ts` (fixing substring false-positives for short skill names like "Go" and "R"), then expands `tests/atsBenchmark.test.ts` to actually run the Java Full Stack JD benchmark that's been defined but unused since Sprint 3.
