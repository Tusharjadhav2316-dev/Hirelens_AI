# Sprint 5 — Day 5: Optimizer Safety Tests, Regression & Sprint Close-Out

## Objective
Create `tests/optimizerSafety.test.ts` to verify the optimizer's truth-preservation guarantees, boundary behaviour, and prompt composition logic. Run the full regression suite. Close Sprint 5 with complete documentation.

## Why This Day Exists
The optimizer introduced in this sprint must never fabricate experience, metrics, skills, or companies. These are contractual guarantees to users — not best-effort. Without automated tests, every future prompt change or route refactor carries unverified risk of breaking truth preservation. Day 5 establishes a regression safety net for the optimizer layer specifically, complementing the existing ATS scoring benchmark (`tests/atsBenchmark.test.ts`).

**What can be tested deterministically (no AI call required):**
- `buildOptimizerPrompt()` composition — verifiable by inspecting the output string
- Input validation logic in the route — verifiable by unit-testing the validation conditions
- Mode validity checking — verifiable by testing the `validModes` array
- `SECTION_BASE_PROMPTS` presence and guardrail inclusion — string assertions
- The `HALLUCINATION_GUARDRAIL` constant presence in every composed prompt

**What requires AI calls (not automated in this sprint):**
- Whether the AI model actually preserves facts in its output — this is a model behaviour guarantee, not a code guarantee. The tests document the expected behaviour as manual test cases with sample inputs/outputs for human verification during sprint review.

## Repository Evidence / Current State

From reading `tests/atsBenchmark.test.ts`:
- Uses `npx tsx tests/atsBenchmark.test.ts` to run
- Uses `console.assert()` for assertions
- Imports directly from `lib/` — no test framework needed
- Pattern is plain TypeScript run with `tsx`

From reading `lib/promptTemplates.ts` (post Day 1):
- Exports: `OptimizerMode`, `SECTION_BASE_PROMPTS`, `OPTIMIZER_MODE_PROMPTS`, `buildOptimizerPrompt`, `HALLUCINATION_GUARDRAIL`
- `buildOptimizerPrompt()` is a pure function with no side effects — fully testable without mocking

From reading `app/api/ai-improve/route.ts` (post Day 1):
- `validSections` array is defined — testable
- `validModes` array — testable
- `mode === "jd-align" && !jobDescription` validation — testable

## Concepts
- **Testing `buildOptimizerPrompt` as a pure function:** Because it has no I/O, network calls, or side effects, every assertion about its output is fully deterministic. This is the most valuable category of optimizer test.
- **Guardrail presence testing:** Every composed prompt must contain the `HALLUCINATION_GUARDRAIL` text. A regression that removes the guardrail from the composer is caught immediately.
- **Manual truth-preservation test cases:** Documented as structured test data with input, expected NOT to see in output, and expected pattern. These become the QA checklist for any AI-involving change in future sprints.

## Prerequisites
- Days 1–4 complete; build succeeds; benchmark passes.
- Read `lib/promptTemplates.ts` post-Day-1 to confirm exact function signatures and constant names.
- Read `tests/atsBenchmark.test.ts` to understand the test file pattern.

## Setup
No new packages. Uses the same `npx tsx` pattern as the benchmark suite.

```bash
cd frontend
npm run build         # confirm clean before writing tests
npx tsx tests/atsBenchmark.test.ts  # confirm existing benchmark passes before adding new suite
```

## Resources
- `lib/promptTemplates.ts` — the module under test
- `tests/atsBenchmark.test.ts` — reference pattern for test structure

## Files to Create
- `frontend/tests/optimizerSafety.test.ts` — new file

## Files to Modify
- None in `lib/` or `app/` today — tests only

## Architecture Impact
`tests/optimizerSafety.test.ts` joins `tests/atsBenchmark.test.ts` as a regression safety suite. Both are run via `npx tsx tests/[name].test.ts` and produce console output with `console.assert` failures printed clearly.

## Safety / Hallucination Constraints
The test file documents the non-fabrication guarantee explicitly. Any future change that causes a prompt to no longer contain `HALLUCINATION_GUARDRAIL` will cause `optimizerSafety.test.ts` to fail — providing automated enforcement of the most important constraint in this sprint.

## Implementation Plan

Create `frontend/tests/optimizerSafety.test.ts`:

```typescript
/**
 * Optimizer Safety Tests
 * Sprint 5, Day 5
 *
 * Tests the prompt composition logic in lib/promptTemplates.ts.
 * All tests are deterministic (pure function — no AI calls, no network).
 *
 * Run: npx tsx tests/optimizerSafety.test.ts
 */

import {
    buildOptimizerPrompt,
    SECTION_BASE_PROMPTS,
    OPTIMIZER_MODE_PROMPTS,
    HALLUCINATION_GUARDRAIL,
    OptimizerMode,
} from "../lib/promptTemplates";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, label: string): void {
    if (condition) {
        console.log(`  ✓ ${label}`);
        passCount++;
    } else {
        console.error(`  ✗ FAIL: ${label}`);
        failCount++;
    }
}

console.log("\n=== Optimizer Safety Test Suite ===\n");

// ───────────────────────────────────────────────────────────────────────────────
// 1. HALLUCINATION GUARDRAIL PRESENCE
// Every prompt must contain the guardrail regardless of mode or section.
// ───────────────────────────────────────────────────────────────────────────────
console.log("1. Guardrail presence in all section/mode combinations:");

const sections = ["summary", "experience", "projects", "achievements", "certifications"];
const modes: (OptimizerMode | undefined)[] = ["ats", "impact", "concise", "action-verbs", "jd-align", undefined];

for (const section of sections) {
    for (const mode of modes) {
        const prompt = buildOptimizerPrompt(section, "Sample content.", mode, mode === "jd-align" ? "Sample JD." : undefined);
        assert(
            prompt.includes(HALLUCINATION_GUARDRAIL),
            `Section="${section}" mode="${mode ?? "none"}" contains HALLUCINATION_GUARDRAIL`
        );
    }
}

// ───────────────────────────────────────────────────────────────────────────────
// 2. SECTION BASE PROMPTS COMPLETENESS
// All five supported sections must have base prompts defined.
// ───────────────────────────────────────────────────────────────────────────────
console.log("\n2. Section base prompt completeness:");

for (const section of sections) {
    assert(
        typeof SECTION_BASE_PROMPTS[section] === "string" && SECTION_BASE_PROMPTS[section].length > 20,
        `SECTION_BASE_PROMPTS["${section}"] is defined and non-trivial`
    );
}

assert(
    !("education" in SECTION_BASE_PROMPTS),
    "Education is NOT in SECTION_BASE_PROMPTS (not an AI-optimizable section)"
);

// ───────────────────────────────────────────────────────────────────────────────
// 3. OPTIMIZER MODE PROMPT VALIDATION
// Each mode must have a distinct, non-empty instruction.
// ───────────────────────────────────────────────────────────────────────────────
console.log("\n3. Optimizer mode prompt validation:");

const allModes: OptimizerMode[] = ["ats", "impact", "concise", "action-verbs", "jd-align"];
for (const mode of allModes) {
    assert(
        typeof OPTIMIZER_MODE_PROMPTS[mode] === "string" && OPTIMIZER_MODE_PROMPTS[mode].length > 30,
        `OPTIMIZER_MODE_PROMPTS["${mode}"] is defined and non-trivial`
    );
}

// Verify modes are distinct (no duplicates)
const modePromptValues = allModes.map(m => OPTIMIZER_MODE_PROMPTS[m]);
const uniqueValues = new Set(modePromptValues);
assert(uniqueValues.size === allModes.length, "All mode prompts are distinct (no duplicates)");

// ───────────────────────────────────────────────────────────────────────────────
// 4. JD CONTEXT INJECTION RULES
// JD must appear in prompt only when provided.
// JD-align must include the "do not add missing skills" warning.
// ───────────────────────────────────────────────────────────────────────────────
console.log("\n4. JD context injection rules:");

const jdPrompt = buildOptimizerPrompt("experience", "Sample.", "jd-align", "We need a Java expert.");
assert(jdPrompt.includes("Java"), "JD content is included in the prompt when provided");
assert(
    jdPrompt.toLowerCase().includes("do not add") || jdPrompt.toLowerCase().includes("do not insert"),
    "JD-align prompt includes 'do not add' missing skills warning"
);

const noJdPrompt = buildOptimizerPrompt("experience", "Sample.", "ats", undefined);
assert(!noJdPrompt.includes("Job Description"), "No JD header when no jobDescription provided");

const contextPrompt = buildOptimizerPrompt("experience", "Sample.", "impact", "Looking for React developer.");
assert(contextPrompt.includes("context only"), "Non-jd-align mode uses 'context only' header for JD");
assert(!contextPrompt.includes("align terminology"), "Non-jd-align mode does not use the alignment instruction");

// ───────────────────────────────────────────────────────────────────────────────
// 5. CONTENT PRESERVATION IN PROMPT
// The original content must always appear verbatim in the output prompt.
// ───────────────────────────────────────────────────────────────────────────────
console.log("\n5. Content preservation in built prompt:");

const uniqueContent = "Built microservice using unique-token-xf7q9z";
const builtPrompt = buildOptimizerPrompt("experience", uniqueContent, "impact");
assert(builtPrompt.includes(uniqueContent), "Original content appears verbatim in the built prompt");

// ───────────────────────────────────────────────────────────────────────────────
// 6. FALLBACK BEHAVIOUR FOR UNKNOWN SECTION
// An unrecognized section should not crash — should return a safe generic prompt.
// ───────────────────────────────────────────────────────────────────────────────
console.log("\n6. Fallback for unknown section:");

const fallbackPrompt = buildOptimizerPrompt("references", "John Smith, CTO.", undefined);
assert(
    typeof fallbackPrompt === "string" && fallbackPrompt.length > 0,
    "Unknown section 'references' returns a non-empty string (no crash)"
);
assert(
    fallbackPrompt.includes(HALLUCINATION_GUARDRAIL),
    "Fallback prompt for unknown section still contains guardrail"
);

// ───────────────────────────────────────────────────────────────────────────────
// 7. IMPACT MODE TRUTH-PRESERVATION DOCUMENTATION (manual verification)
// These are NOT automated asserts — they document expected AI behavior
// for manual QA during sprint review.
// ───────────────────────────────────────────────────────────────────────────────
console.log("\n7. Manual truth-preservation test cases (review with AI):");
console.log("   These cases must be manually verified after running the optimizer in the browser.\n");

const manualTestCases = [
    {
        id: "T1",
        label: "Fabrication prevention — no metric in source",
        input: "Built REST APIs using Spring Boot.",
        mode: "impact" as OptimizerMode,
        mustNotContain: ["40%", "50%", "performance improvement", "latency reduction", "AWS", "Kubernetes"],
        acceptable: "Developed robust REST APIs using Spring Boot, delivering reliable backend services.",
    },
    {
        id: "T2",
        label: "Quantification preservation — metric must survive",
        input: "Reduced API latency by 35% through query optimization and caching.",
        mode: "impact" as OptimizerMode,
        mustContain: ["35%"],
        mustNotContain: ["30%", "40%", "50%", "25%"],
    },
    {
        id: "T3",
        label: "JD missing skill — must not be fabricated",
        input: "Developed microservices in Java and Spring Boot.",
        mode: "jd-align" as OptimizerMode,
        jobDescription: "We require Kubernetes experience for container orchestration.",
        mustNotContain: ["Kubernetes", "container orchestration experience", "K8s"],
    },
    {
        id: "T4",
        label: "JD present skill — alignment allowed",
        input: "Built scalable services in Java and Spring Boot.",
        mode: "jd-align" as OptimizerMode,
        jobDescription: "Strong Spring Boot and Java backend experience required.",
        acceptable: "Developed high-performance backend services using Java and Spring Boot...",
    },
];

for (const tc of manualTestCases) {
    const prompt = buildOptimizerPrompt(tc.id === "T3" || tc.id === "T4" ? "experience" : "experience", tc.input, tc.mode, tc.jobDescription);
    console.log(`   [${tc.id}] ${tc.label}`);
    console.log(`   Input: "${tc.input}"`);
    if (tc.mustNotContain) console.log(`   AI output must NOT contain: ${tc.mustNotContain.join(", ")}`);
    if (tc.mustContain) console.log(`   AI output must contain: ${tc.mustContain.join(", ")}`);
    if (tc.acceptable) console.log(`   Acceptable example: "${tc.acceptable}"`);
    console.log("");
}

// ───────────────────────────────────────────────────────────────────────────────
// RESULTS
// ───────────────────────────────────────────────────────────────────────────────
console.log("=== Optimizer Safety Results ===");
console.log(`Automated Assertions: ${passCount} passed, ${failCount} failed`);
console.log(`Manual Test Cases: ${manualTestCases.length} documented for human verification`);
if (failCount > 0) {
    console.error(`\n✗ ${failCount} automated assertion(s) FAILED — review and fix before committing.`);
    process.exit(1);
} else {
    console.log("\n✓ All automated assertions passed.");
    console.log("  Complete manual test cases T1–T4 in the browser before marking Sprint 5 Done.");
}
```

## Ready-to-Paste Antigravity Prompt

```
Context: I am working on the HireLens project (Next.js 16, React 19, TypeScript). This is Sprint 5, Day 5: Optimizer Safety Tests and Sprint Close-Out.

I am creating exactly one new file today: frontend/tests/optimizerSafety.test.ts
No existing source file is modified.

Current state (confirmed):
- frontend/lib/promptTemplates.ts exports: buildOptimizerPrompt, SECTION_BASE_PROMPTS, OPTIMIZER_MODE_PROMPTS, HALLUCINATION_GUARDRAIL, OptimizerMode (all added Day 1).
- frontend/tests/atsBenchmark.test.ts exists and uses the pattern: import from "../lib/", console.assert(), npx tsx runner.
- No test framework (Jest/Vitest) is configured.

Task: Create frontend/tests/optimizerSafety.test.ts exactly as defined in the Sprint 5 Day 5 implementation plan. The file must:

1. Import from "../lib/promptTemplates": buildOptimizerPrompt, SECTION_BASE_PROMPTS, OPTIMIZER_MODE_PROMPTS, HALLUCINATION_GUARDRAIL, OptimizerMode.
2. Use the same console.assert + passCount/failCount pattern as atsBenchmark.test.ts.
3. Include these automated test sections:
   - Section 1: Guardrail presence — assert buildOptimizerPrompt includes HALLUCINATION_GUARDRAIL for every section × mode combination.
   - Section 2: Section base prompt completeness — assert all 5 sections exist in SECTION_BASE_PROMPTS with non-trivial content; assert "education" is NOT present.
   - Section 3: Mode prompt validation — assert all 5 modes have distinct, non-trivial instructions.
   - Section 4: JD context injection — assert JD content appears in prompt when provided; jd-align includes "do not add" warning; no-JD prompt has no "Job Description" header; non-jd-align mode uses "context only" header.
   - Section 5: Content preservation — assert original content string appears verbatim in the built prompt.
   - Section 6: Fallback for unknown section — assert buildOptimizerPrompt("references", ...) returns a non-empty string and contains HALLUCINATION_GUARDRAIL.
4. Include a Section 7 that prints 4 documented manual test cases (T1–T4) to the console as QA guidance — these are NOT automated asserts, just structured documentation printed during the run:
   - T1: No metric in source → "impact" mode must not fabricate percentages or technologies.
   - T2: "Reduced API latency by 35%" → must preserve the exact "35%" figure.
   - T3: JD requires Kubernetes, resume lacks it → "jd-align" mode must not add Kubernetes.
   - T4: JD requires Spring Boot, resume has it → "jd-align" mode may align Spring Boot language.
5. Exit with process.exit(1) if any automated assertion fails; exit 0 if all pass.

Constraints:
- The file is tests/optimizerSafety.test.ts — no other file is created or modified.
- No test framework is installed — plain TypeScript with tsx runner only.
- All assertions are against the pure buildOptimizerPrompt() function — no API calls, no network, no Firebase.
- Report the complete file content.
- After writing the file, run: npx tsx tests/optimizerSafety.test.ts and report the full output.
```

## Automated Testing

Run both suites:
```bash
cd frontend
npx tsx tests/optimizerSafety.test.ts   # new suite — must pass all automated assertions
npx tsx tests/atsBenchmark.test.ts      # existing suite — must still pass all 4 sections
npm run build                           # must succeed
```

**Expected output from `optimizerSafety.test.ts`:**
```
=== Optimizer Safety Test Suite ===

1. Guardrail presence in all section/mode combinations:
  ✓ Section="summary" mode="ats" contains HALLUCINATION_GUARDRAIL
  ✓ Section="summary" mode="impact" contains HALLUCINATION_GUARDRAIL
  ... (30 assertions, all ✓)

2. Section base prompt completeness:
  ✓ SECTION_BASE_PROMPTS["summary"] is defined and non-trivial
  ... (6 assertions, all ✓)

3. Optimizer mode prompt validation:
  ✓ OPTIMIZER_MODE_PROMPTS["ats"] is defined and non-trivial
  ... (6 assertions, all ✓)

4. JD context injection rules:
  ✓ JD content is included in the prompt when provided
  ... (4 assertions, all ✓)

5. Content preservation in built prompt:
  ✓ Original content appears verbatim in the built prompt

6. Fallback for unknown section:
  ✓ Unknown section 'references' returns a non-empty string
  ✓ Fallback prompt for unknown section still contains guardrail

7. Manual truth-preservation test cases (review with AI):
   [T1] Fabrication prevention — no metric in source
   ...
   [T4] JD present skill — alignment allowed

=== Optimizer Safety Results ===
Automated Assertions: 48 passed, 0 failed
Manual Test Cases: 4 documented for human verification
✓ All automated assertions passed.
```

## Manual Testing — Full Sprint 5 Regression

Run the manual test cases T1–T4 in the browser with a logged-in account:

| Test | Setup | Pass Criterion |
|---|---|---|
| T1 | Experience: "Built REST APIs using Spring Boot." Impact mode, no JD | AI output does NOT contain: "40%", "AWS", "Kubernetes" |
| T2 | Experience: "Reduced API latency by 35% through optimization." Impact mode | AI output contains "35%" — exact figure preserved |
| T3 | Experience: "Developed microservices in Java." JD-align mode, JD says "requires Kubernetes" | AI output does NOT contain "Kubernetes" or "K8s" |
| T4 | Experience: "Built scalable Spring Boot services." JD-align mode, JD says "Spring Boot required" | AI output aligns Spring Boot language naturally |

Additionally, verify all five sprint days' deliverables:

| Day | Verification |
|---|---|
| Day 1 | `/api/ai-improve?mode=action-verbs` returns 200; `mode=invalid` returns 400; `mode=jd-align` without JD returns 400 |
| Day 2 | AchievementsForm and CertificationsForm show ✨ buttons and modal works |
| Day 3 | JD panel appears in Resume Builder; network request includes `jobDescription` when panel populated |
| Day 4 | Modal shows Regenerate, editable textarea, mode badge, JD Context badge; Accept sends edited text |
| Day 5 | `npx tsx tests/optimizerSafety.test.ts` passes all 48 automated assertions |

## Verification
- `npx tsx tests/optimizerSafety.test.ts` exits with code 0
- `npx tsx tests/atsBenchmark.test.ts` still passes (no regressions)
- `npm run build` succeeds
- Manual T1–T4 test cases verified in the browser
- Sprint 5 documentation finalized

## Edge Cases
- `buildOptimizerPrompt` called with very long content (> 2000 chars) — the route enforces a length limit; the function itself should handle it without crashing. Test: `buildOptimizerPrompt("experience", "x".repeat(3000), "concise")` → should return a string (the route validation rejects overlength input, not the prompt composer).
- `HALLUCINATION_GUARDRAIL` constant changed in future — all 30 guardrail assertions will fail immediately, catching the regression.

## Debugging Guide
| Symptom | Likely Cause | Fix |
|---|---|---|
| `npx tsx tests/optimizerSafety.test.ts` fails with "Module not found" | Import path incorrect | Confirm: `from "../lib/promptTemplates"` — relative to `tests/` directory |
| Guardrail assertion fails for one mode | `buildOptimizerPrompt` not appending guardrail in a specific code path | Check the `if (modeInstruction)` branch — guardrail must be appended after the mode block, unconditionally |
| JD header assertion fails | JD header text changed in `buildOptimizerPrompt` after Day 1 | Re-read current `buildOptimizerPrompt` and update assertion to match current wording |

## Checklist
- [ ] `tests/optimizerSafety.test.ts` created
- [ ] All 6 automated test sections implemented
- [ ] Manual test cases T1–T4 documented in Section 7
- [ ] `npx tsx tests/optimizerSafety.test.ts` passes with 0 failures
- [ ] `npx tsx tests/atsBenchmark.test.ts` still passes all 4 sections
- [ ] `npm run build` succeeds
- [ ] Manual T1–T4 tests run in browser and pass
- [ ] All Sprint 5 day deliverables verified in the browser

## Commit Message
```
test(optimizer): add optimizer safety test suite — guardrail presence, mode validation, JD injection, truth-preservation cases
```

## Documentation Updates
- `docs/01_Master_Roadmap.md` — mark Sprint 5 ✅ Complete with actual outcome note
- `docs/25_Backlog.md` — mark all Sprint 5 items Done; add newly-discovered items if any
- `docs/05_Prompt_Library.md` — add Sprint 5 Day 5 entry
- `docs/26_Risks.md` — add Sprint 5 specific risks (fabrication risk, regenerate behavior)
- `docs/02_Architecture.md` — document `tests/optimizerSafety.test.ts` in the testing section

---

# Sprint 5 Summary

## Sprint Goal
Evolve the existing basic AI section rewrite into a reliable, context-aware resume optimization workflow — with optimization modes, JD-awareness, an upgraded review modal, and automated safety tests.

## Deliverables

| Day | Files Changed | What Was Built |
|---|---|---|
| Day 1 | `promptTemplates.ts`, `api/ai-improve/route.ts`, `lib/aiService.ts` | 5 optimization modes; centralized prompt architecture; `buildOptimizerPrompt()` with guardrail |
| Day 2 | `AchievementsForm.tsx`, `CertificationsForm.tsx` | AI optimize buttons on all 5 resume sections |
| Day 3 | `ResumeEditor.tsx`, 5 form files | JD context panel in Resume Builder; JD wired to all AI calls |
| Day 4 | `AIImprovementModal.tsx`, 5 form files | Regenerate, editable output, mode badge, JD Context badge |
| Day 5 | `tests/optimizerSafety.test.ts` (new) | 48 automated safety assertions; 4 manual truth-preservation cases |

## Non-Fabrication Guarantee
The optimizer is designed to never invent metrics, employers, skills, or technologies. This is enforced at three levels:
1. **Prompt level:** `HALLUCINATION_GUARDRAIL` appended to every built prompt
2. **Mode level:** Mode-specific instructions reinforce the constraint (especially `"impact"` and `"jd-align"`)
3. **Test level:** `optimizerSafety.test.ts` asserts guardrail presence in all 30 section/mode combinations; manual cases T1–T4 verify AI model compliance

## Definition of Done
- `npm run build` passes
- `npx tsx tests/optimizerSafety.test.ts` passes all automated assertions
- `npx tsx tests/atsBenchmark.test.ts` passes (no regression)
- All 5 resume sections have AI optimize buttons
- JD panel populates `jobDescription` in AI requests
- AIImprovementModal supports Regenerate, editable output, mode badge, JD badge
- Manual T1–T4 truth-preservation cases pass in the browser
- `docs/01_Master_Roadmap.md` marks Sprint 5 ✅ Complete

## Exit Criteria
Sprint 5 is complete and Sprint 6 (AI Career Coach) may be planned once:
1. Every Definition of Done item is independently, manually verified
2. Manual truth-preservation cases T1–T4 have been run and passed
3. `docs/01_Master_Roadmap.md` shows Sprint 5 as ✅ Complete with a real "Actual Outcome" note
