# Sprint 4 — Day 4: Fix Keyword Density False Positives & Expand Benchmark Suite

## Objective
Two confirmed gaps addressed today — one in scoring accuracy, one in test coverage:

**Gap 1 — Keyword density uses substring matching for all skill names (`lib/atsAnalyzer.ts`):**
The current computation:
```typescript
resume.skills.forEach(skill => {
    const skillName = skill.name.toLowerCase().trim();
    if (skillName && fullText.includes(skillName)) {
        matchedSkillCount++;
    }
});
```
`.includes()` is a substring search with no word boundaries. This means:
- Skill `"Go"` matches inside "going", "google", "good", "argo" — false positives
- Skill `"R"` matches in every word containing the letter r — false positives
- Skill `"C"` would match everywhere
- Skill `"AWS"` (normalized to `"aws"`) matches inside "software" — false positive
- Skill `"SQL"` matches inside "NoSQL" — potentially ambiguous but not catastrophically wrong

Short skills (under 4 characters) are the primary problem. For longer skills (`"TypeScript"`, `"PostgreSQL"`, `"React Native"`), substring matching is effectively word-boundary matching because such strings rarely appear embedded in longer unrelated words. The fix: for skill names under 4 characters, require a word-boundary match using a regex instead of `.includes()`. For names of 4+ characters, retain `.includes()` (simpler, faster, and safe for longer strings).

**Gap 2 — `javaFullStack` JD defined in benchmark but never tested:**
`tests/atsBenchmark.test.ts` defines `BENCHMARK_JDS.javaFullStack` (line 139) but `runBenchmarkSuite()` only tests against `BENCHMARK_JDS.aiEngineer`. The Java Full Stack JD is the most relevant benchmark for resumes like `internship`, `oneToTwoYearsPro`, and `threePlusYearsProQuantified` — which are explicitly Java + Spring Boot profiles. Adding Java Full Stack JD tests validates that the Match engine correctly scores these profiles higher than the AI-focused profiles for a Java JD.

## Concepts
- **Word-boundary matching for short skill names:** The regex `new RegExp('\\b' + escapeRegex(skillName) + '\\b', 'i')` ensures `"Go"` only matches as a standalone word, not inside "going" or "argo". `escapeRegex` is needed for special-character skill names like `"C++"`, `"C#"`, `"Node.js"` — these contain regex metacharacters that must be escaped before being inserted into a `RegExp`.
- **Why 4 characters as the threshold:** Skills of 4+ characters are extremely unlikely to appear as substrings in unrelated common English words. `"java"` does not appear inside common words. `"sql"` doesn't either. `"go"`, `"r"`, `"c"` do. `"aws"` appears in "software" only if not word-boundary matched. Setting the threshold at ≤ 3 characters (or more conservatively ≤ 4) covers the problematic cases without adding regex overhead to the many long skill names.
- **Why the Java Full Stack benchmark matters:** The benchmark currently only verifies AI-focused skill matching. Java Full Stack is the most common target role in this project's resume fixture set. Without testing it, a regression in Java skill keyword extraction (e.g. "spring boot" as a bigram, "microservices architecture" as a phrase) would go undetected.

## Prerequisites
- Days 1–3 complete; build succeeds; benchmark still passing.
- Read `lib/atsAnalyzer.ts` keyword density computation block (the section added in Sprint 3) before editing.
- Read `tests/atsBenchmark.test.ts` `runBenchmarkSuite()` function to understand how the aiEngineer tests are structured — the new Java Full Stack tests follow the same pattern.

## Setup
No new packages.

```bash
cd frontend
npx tsx tests/atsBenchmark.test.ts   # capture current scores before changes
```

## Resources
- `lib/atsAnalyzer.ts` — file modified today (keyword density block only).
- `tests/atsBenchmark.test.ts` — file modified today (new Java Full Stack test block added).
- `docs/BENCHMARK_REGRESSION.md` — updated today with new Java Full Stack expected values.

## Files to Modify
- `frontend/lib/atsAnalyzer.ts` — keyword density block only.
- `frontend/tests/atsBenchmark.test.ts` — add Java Full Stack JD test scenarios.
- `docs/BENCHMARK_REGRESSION.md` — add Java Full Stack benchmark table.

## Architecture Impact
No interface changes. `ATSAnalysisResult` shape is unchanged. The `keywordDensityScore` computation becomes more accurate for short skill names. The benchmark suite gains a new test section — all existing assertions remain, new ones are added.

## Implementation Plan

### Part 1 — Fix keyword density false positives in `lib/atsAnalyzer.ts`

1. Open `lib/atsAnalyzer.ts` and find the keyword density computation block (the block that starts with "Keyword Density Computation" from Sprint 3).

2. Add a helper function immediately above the `analyzeResume` export (not inside it):
```typescript
function escapeRegexChars(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function skillAppearsInText(skillName: string, fullText: string): boolean {
    if (skillName.length <= 3) {
        // Use word-boundary regex for short skill names to prevent false positives
        const pattern = new RegExp('\\b' + escapeRegexChars(skillName) + '\\b', 'i');
        return pattern.test(fullText);
    }
    // For longer skill names, substring match is safe and performant
    return fullText.includes(skillName);
}
```

3. In the keyword density loop, replace:
```typescript
if (skillName && fullText.includes(skillName)) {
    matchedSkillCount++;
}
```
With:
```typescript
if (skillName && skillAppearsInText(skillName, fullText)) {
    matchedSkillCount++;
}
```

4. Note: `fullText` is already `.toLowerCase()` at this point; the `'i'` flag in the regex is a safe redundancy — leave it in for clarity.

### Part 2 — Expand benchmark suite in `tests/atsBenchmark.test.ts`

1. In `runBenchmarkSuite()`, after the closing `console.log` of the AI Engineer section, add a new section:
```typescript
console.log("\n4. Java Full Stack JD ATS Match Verification:");
const m4_java = analyzeResumeMatch(BENCHMARK_RESUMES.internship, BENCHMARK_JDS.javaFullStack);
const m5_java = analyzeResumeMatch(BENCHMARK_RESUMES.oneToTwoYearsPro, BENCHMARK_JDS.javaFullStack);
const m6_java = analyzeResumeMatch(BENCHMARK_RESUMES.threePlusYearsProQuantified, BENCHMARK_JDS.javaFullStack);
const m2_java = analyzeResumeMatch(BENCHMARK_RESUMES.projectsOnly, BENCHMARK_JDS.javaFullStack);

console.log(`   Internship (Java/Spring)         : Match ${m4_java.finalScore} (Keyword: ${m4_java.breakdown[0].score}, Exp: ${m4_java.breakdown[2].score})`);
console.log(`   1-2 Yrs Pro (Java/Spring)        : Match ${m5_java.finalScore} (Keyword: ${m5_java.breakdown[0].score}, Exp: ${m5_java.breakdown[2].score})`);
console.log(`   3-5 Yrs Senior Full Stack         : Match ${m6_java.finalScore} (Keyword: ${m6_java.breakdown[0].score}, Exp: ${m6_java.breakdown[2].score})`);
console.log(`   Projects Only (AI/Python focus)   : Match ${m2_java.finalScore} (Keyword: ${m2_java.breakdown[0].score}, Exp: ${m2_java.breakdown[2].score})`);

// Assert correct ordering for Java Full Stack JD
console.assert(m4_java.finalScore < m5_java.finalScore, "Internship should score lower than 1-2 Yrs Pro on Java JD");
console.assert(m5_java.finalScore < m6_java.finalScore, "1-2 Yrs Pro should score lower than 3-5 Yrs Senior on Java JD");
console.assert(m2_java.breakdown[0].score < m4_java.breakdown[0].score, "AI-focused Projects should have lower keyword match than Java Internship on Java JD");
console.log("   ✓ Java Full Stack hierarchy assertions passed!");
```

2. Run `npx tsx tests/atsBenchmark.test.ts` and record the actual Java Full Stack scores produced.

3. Update `docs/BENCHMARK_REGRESSION.md` with a new section "Java Full Stack JD Comparison" table using the actual scores from the run above — never invent expected values.

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). I am modifying two files today: frontend/lib/atsAnalyzer.ts and frontend/tests/atsBenchmark.test.ts.

GAP 1 — CONFIRMED: In frontend/lib/atsAnalyzer.ts, the keyword density computation uses:
  if (skillName && fullText.includes(skillName)) { matchedSkillCount++; }
This substring search causes false positives for short skill names: "Go" matches "going"/"google"/"cargo"; "R" matches any word with r; "C" is even worse; "aws" matches "software". The fix uses word-boundary regex for skill names of 3 or fewer characters, and retains .includes() for longer names.

GAP 2 — CONFIRMED: In frontend/tests/atsBenchmark.test.ts, BENCHMARK_JDS.javaFullStack is defined (line 139: "Job Title: Java Full Stack Engineer...") but runBenchmarkSuite() never calls analyzeResumeMatch() with it. The AI Engineer JD is tested but the Java Full Stack JD — which matches the skill profiles of 3 of the 6 benchmark resumes (internship, oneToTwoYearsPro, threePlusYearsProQuantified) — is not.

Task — Fix Gap 1: In frontend/lib/atsAnalyzer.ts:
1. Before the analyzeResume export function (not inside it), add:
function escapeRegexChars(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function skillAppearsInText(skillName: string, fullText: string): boolean {
    if (skillName.length <= 3) {
        const pattern = new RegExp('\\b' + escapeRegexChars(skillName) + '\\b', 'i');
        return pattern.test(fullText);
    }
    return fullText.includes(skillName);
}

2. In the keyword density computation block (the forEach loop over resume.skills), replace:
  if (skillName && fullText.includes(skillName)) {
with:
  if (skillName && skillAppearsInText(skillName, fullText)) {

3. Do not change any other part of atsAnalyzer.ts.

Task — Fix Gap 2: In frontend/tests/atsBenchmark.test.ts, inside runBenchmarkSuite(), after the final console.log of section 3 (the AI Engineer section), add:

console.log("\n4. Java Full Stack JD ATS Match Verification:");
const m4_java = analyzeResumeMatch(BENCHMARK_RESUMES.internship, BENCHMARK_JDS.javaFullStack);
const m5_java = analyzeResumeMatch(BENCHMARK_RESUMES.oneToTwoYearsPro, BENCHMARK_JDS.javaFullStack);
const m6_java = analyzeResumeMatch(BENCHMARK_RESUMES.threePlusYearsProQuantified, BENCHMARK_JDS.javaFullStack);
const m2_java = analyzeResumeMatch(BENCHMARK_RESUMES.projectsOnly, BENCHMARK_JDS.javaFullStack);

console.log(`   Internship (Java/Spring)         : Match ${m4_java.finalScore} (Keyword: ${m4_java.breakdown[0].score}, Exp: ${m4_java.breakdown[2].score})`);
console.log(`   1-2 Yrs Pro (Java/Spring)        : Match ${m5_java.finalScore} (Keyword: ${m5_java.breakdown[0].score}, Exp: ${m5_java.breakdown[2].score})`);
console.log(`   3-5 Yrs Senior Full Stack        : Match ${m6_java.finalScore} (Keyword: ${m6_java.breakdown[0].score}, Exp: ${m6_java.breakdown[2].score})`);
console.log(`   AI Projects (Python focus)       : Match ${m2_java.finalScore} (Keyword: ${m2_java.breakdown[0].score}, Exp: ${m2_java.breakdown[2].score})`);

console.assert(m4_java.finalScore < m5_java.finalScore, "Internship should score lower than 1-2 Yrs Pro on Java JD");
console.assert(m5_java.finalScore < m6_java.finalScore, "1-2 Yrs Pro should score lower than 3+ Yrs Senior on Java JD");
console.assert(m2_java.breakdown[0].score < m4_java.breakdown[0].score, "AI-focused Projects should have lower keyword match than Java Internship for Java JD");
console.log("   ✓ Java Full Stack hierarchy assertions passed!");

Constraints:
- Only frontend/lib/atsAnalyzer.ts and frontend/tests/atsBenchmark.test.ts are modified.
- ATSAnalysisResult interface is unchanged.
- All existing benchmark assertions from sections 1, 2, and 3 must still pass.
- Report: (a) the exact diff for both files; (b) the full console output of npx tsx tests/atsBenchmark.test.ts after your changes so I can update BENCHMARK_REGRESSION.md with the real Java Full Stack scores.
```

## Testing
**How to test:**
1. `npm run build` — must succeed.
2. `npx tsx tests/atsBenchmark.test.ts` — record the full output. All existing assertions (sections 1–3) must pass. The new Java Full Stack assertions (section 4) must also pass.
3. **False positive verification:** In the browser, add skill `"Go"` to a resume. Write an experience description that says "going forward, I will manage the project." Open the ATS Score Panel and check `keywordDensityScore`. Before the fix, `"go"` would match `"going"` and count as found. After the fix, it should NOT match — the score should be lower (reflecting that "Go" the language is not actually mentioned in context).
4. **True positive verification:** Add skill `"Go"` and write "Developed backend services in Go and Python." → should correctly count as matched.

**Expected result:** Short skill names no longer produce false positives. Benchmark section 4 outputs Java Full Stack scores and all assertions pass.

**Edge cases:**
- Skill `"C++"` — `escapeRegexChars` escapes `+` to `\+`. The regex `\bC\+\+\b` should correctly match `"C++"` as a standalone token.
- Skill `"C#"` — `#` is not a regex metacharacter but escaping it is harmless. The regex `\bC\#\b` should work.
- Skill `"Node.js"` — length is 7, so `.includes("node.js")` is used (not regex). This is safe since "node.js" doesn't appear as a substring of other common words.

## Debugging
| Symptom | Likely Cause | Fix |
|---|---|---|
| Java Full Stack assertion "Internship < 1-2 Yrs Pro" fails | Both profiles score identically on the Java JD (possible if experience score tiers land them in the same range) | Examine `m4_java.breakdown[2].score` vs `m5_java.breakdown[2].score` — if they're equal, check whether `extractYearsOfExperience` correctly extracts years from both fixtures |
| `"Go"` skill still matches "going" after fix | `skillAppearsInText` not being called (old code path still running) | Confirm the `fullText.includes(skillName)` line was actually replaced, not just the helper added above it |
| Regex for `"C++"` throws | `escapeRegexChars` not escaping `+` | Confirm the replace pattern includes `\\+` in the character class: `/[.*+?^${}()|[\]\\]/g` — the `+` is inside the bracket which makes it literal |

## Checklist
- [ ] `lib/atsAnalyzer.ts` keyword density block read before editing
- [ ] `escapeRegexChars` and `skillAppearsInText` helpers added above `analyzeResume`
- [ ] `.includes()` replaced with `skillAppearsInText()` in the forEach loop
- [ ] `tests/atsBenchmark.test.ts` section 4 added for Java Full Stack JD
- [ ] `npm run build` succeeds
- [ ] `npx tsx tests/atsBenchmark.test.ts` — all sections 1–4 pass
- [ ] `docs/BENCHMARK_REGRESSION.md` updated with real Java Full Stack scores

## Commit Message
```
fix(ats-analyzer): use word-boundary matching for short skill names in keyword density; expand benchmark suite with Java Full Stack JD
```

## Documentation Update
- `docs/BENCHMARK_REGRESSION.md` — add Section 4: "Java Full Stack JD Comparison" with the actual scores produced by the updated benchmark run.
- `docs/25_Backlog.md` — mark Day 4 items Done.

## End-of-Day Review
Keyword density scoring no longer false-positives on short skill names like "Go", "R", "C", or "AWS". The benchmark suite now validates both major JD types in the codebase. `docs/BENCHMARK_REGRESSION.md` is a complete regression reference with confirmed expected values for all scoring scenarios.

## Tomorrow Preview
Day 5 — the final Sprint 4 day — cleans up the AI layer: the `ai-insights` user prompt duplicates context already in the system prompt; all three AI routes are missing `max_tokens` and `temperature` parameters. Adding consistent model parameters improves response determinism and prevents runaway token usage. A new `AI_IMPROVE_SYSTEM_PROMPT` export is added to `lib/promptTemplates.ts` to centralize the system prompt composition for the improve route.
