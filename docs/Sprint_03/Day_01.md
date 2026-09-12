# Sprint 3 — Day 1: Enhance Resume Builder ATS Scoring Engine (`lib/atsAnalyzer.ts`)

## Objective
`lib/atsAnalyzer.ts` is the scoring engine used by `ATSScorePanel.tsx` inside the Resume Builder. Reading the actual code reveals four confirmed deficiencies that make the score less accurate and less useful than it should be:

1. **`keywordDensityScore` is always 100.** The variable is declared and initialized to 100 with the comment `// Placeholder for future use` — it is never recalculated anywhere in the function. It appears in the returned `ATSAnalysisResult` object, so the component receives a useless constant instead of a real measurement.
2. **`certifications` and `achievements` are never scored.** Both sections exist in `types/resume.ts`, appear in `lib/atsOrder.ts` as official ATS sections, have dedicated form components in `components/resume-builder/forms/`, and have their own nav tab in `ResumeEditor.tsx` — but `analyzeResume()` completely ignores them. A user who diligently fills in certifications gets zero scoring benefit.
3. **The weak verbs list has only 5 entries.** `lib/atsEngine.ts` (the analyzer page engine) uses 11 weak verbs; `lib/atsAnalyzer.ts` (the builder engine) uses 5 different ones — creating an inconsistency where the same resume gets flagged differently depending on which tool analyzes it.
4. **Skill `level` is ignored.** The `Skill` type has `level: "Beginner" | "Intermediate" | "Expert"`. The builder's scoring treats a "Beginner: HTML" the same as "Expert: React" — no distinction, even though level clearly affects recruiter value.

Today's work is entirely within `lib/atsAnalyzer.ts`. No other file is modified.

## Concepts
- **Scoring discipline:** Every deduction must be proportional and capped — never let a single section drive the overall score to 0 in a way that misleads users. Today's new scoring for certifications and achievements follows the same defensive pattern already used: `Math.max(0, score)`.
- **Consistency over perfection:** The weak verbs list should align with `lib/atsEngine.ts` so the same resume doesn't score differently for the same text pattern in two different tools in the same product.
- **Keyword density as a real metric:** "Keyword density" means (unique skill names + role-relevant terms) / total resume word count, expressed as a 0–100 score. A practical target: density above 8% is good, below 3% needs work. The score is a normalized rating, not a raw percentage.

## Prerequisites
- Sprint 2 complete; `npm run build` succeeds; environment running.
- Read `lib/atsAnalyzer.ts`, `lib/atsEngine.ts`, `types/resume.ts`, and `lib/atsOrder.ts` before implementing — this day's prompt assumes you have read them and confirmed the findings above yourself.

## Setup
No new packages required. All types already exist in `types/resume.ts`.

## Resources
- Current `lib/atsAnalyzer.ts` — the only file being modified today.
- `lib/atsEngine.ts` — reference for the canonical weak verbs list to align with (lines 1–6 of the `WEAK_VERBS` constant).
- `types/resume.ts` — confirms `Certification`, `Achievement`, and `Skill` type shapes.
- `lib/atsOrder.ts` — confirms `certifications` and `achievements` are official ATS sections.

## Files to Modify
- `frontend/lib/atsAnalyzer.ts` — the only file changed today.

## Architecture Impact
No architectural change. `ATSScorePanel.tsx` already consumes `keywordDensityScore`, `completenessScore`, and `impactScore` from the returned object — once `keywordDensityScore` becomes a real value, it will display more accurately without any UI change required. The `ATSAnalysisResult` interface shape does not change (no new fields added today — that would require a UI change which is out of Sprint 3 scope).

## Implementation Plan
1. Open `lib/atsAnalyzer.ts` and read the full function before editing anything.
2. **Expand the weak verbs list.** Replace the 5-entry list with the superset of entries from both files, removing duplicates: `["worked", "helped", "did", "assisted", "was responsible for", "handled", "worked on", "participated in", "supported", "contributed to", "tried"]`.
3. **Add certifications scoring.** After the education analysis block (section 5), add a new block:
   - If `resume.certifications` exists and has entries: no deduction (certifications are optional, not penalized for absence — only rewarded for presence).
   - If at least one certification exists, add `+5` to `completenessScore` (capped at 100) and add a suggestion if no `year` field is provided for any certification.
   - This treats certifications as a bonus-signal, consistent with how they're weighted in real ATS systems (they help; their absence does not automatically hurt).
4. **Add achievements scoring.** Similarly:
   - If `resume.achievements` exists and has entries with both `title` and `description` populated, add `+5` to `impactScore` (capped at 100).
   - If achievements exist but descriptions are empty or very short (< 20 words), add a suggestion to expand them.
5. **Add skill level weighting.** In the skills analysis block (section 3), after counting unique skills, compute: what proportion of skills are Intermediate or Expert? If fewer than half the skills are above Beginner, add a suggestion (don't penalize, just guide).
6. **Compute `keywordDensityScore` as a real value.** After all section analyses, compute: collect all skill names from `resume.skills`, count how many appear (case-insensitive) in the full resume text (summary + experience descriptions + project descriptions). Express as: `Math.min(100, Math.round((matchedSkillCount / totalSkillCount) * 100))` if skills exist, or 50 as a neutral default if no skills are listed. Assign this computed value to `keywordDensityScore` — remove the `// Placeholder for future use` comment.
7. Run `npm run build` and confirm it succeeds. Run `npm run dev`, open the Resume Builder, add certifications to a resume, and confirm the ATS score panel updates (the overall score itself may not visibly change since certifications affect `completenessScore` which has a penalty impact, but the suggestions array should update correctly).

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). The file I am modifying today is frontend/lib/atsAnalyzer.ts, which is the ATS scoring engine used by the Resume Builder's ATSScorePanel component.

I have confirmed the following issues by reading the actual code:
1. keywordDensityScore is initialized to 100 and never recalculated (comment says "Placeholder for future use").
2. resume.certifications and resume.achievements are never analyzed or scored, despite being valid Resume type fields and official ATS sections (per lib/atsOrder.ts).
3. The weak verbs list has only 5 entries; lib/atsEngine.ts has 11 — inconsistency between the two engines.
4. The Skill type has a level field ("Beginner" | "Intermediate" | "Expert") that is completely ignored in scoring.

Task: Improve frontend/lib/atsAnalyzer.ts with the following specific changes only. Do not change the ATSAnalysisResult interface shape (no new fields). Do not modify any other file.

Change 1 — Expand the weak verbs list to the superset of entries from both atsAnalyzer.ts and atsEngine.ts:
["worked", "helped", "did", "assisted", "was responsible for", "handled", "worked on", "participated in", "supported", "contributed to", "tried"]

Change 2 — Add certifications analysis after the education block (section 5, before section 6):
- If resume.certifications exists and has 1+ entries: add +5 to completenessScore (Math.min(100, completenessScore + 5)).
- If any certification entry is missing its year field: push to suggestions: "Add the year to your certification entries to improve credibility."
- If resume.certifications is empty or undefined: no deduction (certifications are optional), but push to suggestions: "Consider adding relevant certifications to strengthen your ATS profile."

Change 3 — Add achievements analysis in the same new block:
- If resume.achievements exists and has 1+ entries: add +5 to impactScore (Math.min(100, impactScore + 5)).
- If any achievement has a description shorter than 20 words (or empty): push to suggestions: "Expand your achievement descriptions with measurable impact and context."

Change 4 — Add skill level guidance in the skills analysis block (section 3), after the duplicate skills check:
- Compute: how many skills have level "Intermediate" or "Expert" vs total skills.
- If total skills > 0 and fewer than 50% are Intermediate/Expert: push to suggestions: "Most of your skills are listed as Beginner. Consider highlighting more Intermediate or Expert-level skills relevant to your target roles."
- Do not add any score deduction for this — it is guidance only.

Change 5 — Replace the keywordDensityScore placeholder with a real computation, placed after all section analyses and before the "Constraints check" block:
- Collect the full text from: resume.personalInfo.summary + all experience descriptions + all project descriptions (join with space).
- Normalize to lowercase.
- For each skill in resume.skills, check if skill.name.toLowerCase().trim() appears in the normalized full text.
- matchedSkillCount = number of skills that appear in the text.
- totalSkillCount = resume.skills.length.
- If totalSkillCount > 0: keywordDensityScore = Math.min(100, Math.round((matchedSkillCount / totalSkillCount) * 100)).
- If totalSkillCount === 0: keywordDensityScore = 50 (neutral default, since no skills means no basis to evaluate).
- Remove the "// Placeholder for future use" comment.
- If keywordDensityScore < 50: push to suggestions: "Many of your listed skills don't appear in your experience or project descriptions. Integrate them naturally to improve ATS keyword density."

Constraints:
- Only frontend/lib/atsAnalyzer.ts is modified.
- The ATSAnalysisResult interface shape must remain identical (no new fields, no removed fields).
- All new score adjustments must still go through the existing Math.max(0, ...) and Math.min(100, ...) guards already present in the file.
- The overall score calculation formula and weights (Experience 35%, Skills 20%, Summary 15%, Projects 15%, Education 15%) are NOT changed today.
- Do not add any new imports — all types needed (Certification, Achievement) are already imported via the Resume type.
- Report the exact diff of every change made.
```

## Testing
**How to test:**

1. `npm run build` — must succeed with zero errors.
2. `npm run dev`, open the Resume Builder (`/dashboard/builder`).
3. Add a certification with no `year` field → confirm "Add the year to your certification entries" appears in the suggestions panel.
4. Add a certification with a `year` field → confirm the previous suggestion disappears; `completenessScore` should be 5 points higher than before the certification was added (verify via the section breakdown bars).
5. Add 5 skills all set to "Beginner" → confirm the skill level guidance suggestion appears.
6. Change 3 of those skills to "Expert" → confirm the suggestion disappears (now ≥ 50% are above Beginner).
7. Add a skill that also appears in an experience description → verify `keywordDensityScore` increases. Add a skill that appears nowhere in text → verify score is lower. (You can `console.log` the result object temporarily during dev to verify the value changes; remove the log before committing.)
8. Confirm `npm run build` still succeeds after all tests.

**Expected result:** All four confirmed issues are resolved; the ATS panel's suggestions are more accurate and complete; the build remains clean.

**Edge cases:**
- Empty `certifications` array (not undefined) — should trigger the "Consider adding" suggestion, not crash.
- `resume.skills` is empty — `keywordDensityScore` should be 50, not NaN or 0.
- `resume.achievements` is undefined (possible for older resume objects missing the field) — guard with `resume.achievements?.length` optional chaining.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| TypeScript error on `resume.certifications` | Import is missing from the destructure or type guard | Confirm `Certification` type is accessible via the existing `Resume` import; use `resume.certifications?.length` optional chaining |
| `keywordDensityScore` is NaN | Division by zero when skills list is empty | Ensure the `totalSkillCount === 0` branch assigns 50 before any division is attempted |
| Build error on new skill-level logic | The `Skill` type's `level` field is checked with wrong string literals | The valid values are exactly `"Beginner"`, `"Intermediate"`, `"Expert"` — confirm against `types/resume.ts` |

## Checklist
- [ ] `lib/atsAnalyzer.ts` read in full before any edit
- [ ] Weak verbs list expanded and aligned with `lib/atsEngine.ts`
- [ ] Certifications and achievements scoring added with correct Math guards
- [ ] Skill level guidance added (suggestion only, no score deduction)
- [ ] `keywordDensityScore` computes a real value; placeholder comment removed
- [ ] No other file modified
- [ ] `npm run build` succeeds
- [ ] All test scenarios manually verified in the running app

## Commit Message
```
feat(ats-analyzer): score certifications/achievements, compute keyword density, expand weak verbs, add skill-level guidance
```

## Documentation Update
- `docs/02_Architecture.md` — note that `keywordDensityScore` is now a real computed value, not a placeholder.
- `docs/26_Risks.md` — mark any relevant "scoring accuracy" speculative risks as addressed by this day's work.
- `docs/25_Backlog.md` — mark the certifications/achievements scoring item as Done (Sprint 3, Day 1).

## End-of-Day Review
`lib/atsAnalyzer.ts` now produces meaningful values for every field in `ATSAnalysisResult`, and its logic is consistent with the canonical weak verbs list used by `lib/atsEngine.ts`. Users who fill in certifications and achievements now see scoring impact from that work.

## Tomorrow Preview
Day 2 moves to `lib/atsEngine.ts` — the standalone Resume Analyzer page's engine. The highest-priority issues there are the artificial 35-point floor that inflates scores for terrible resumes, single-word-only keyword extraction that misses multi-word technical terms ("machine learning", "full stack developer"), and an outdated quantification detection regex that misses common patterns.
