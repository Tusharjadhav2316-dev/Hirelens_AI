import {
    buildOptimizerPrompt,
    SECTION_BASE_PROMPTS,
    OPTIMIZER_MODE_PROMPTS,
    HALLUCINATION_GUARDRAIL,
    OptimizerMode,
} from "../lib/promptTemplates";

// ----------------------------------------------------------------------------
// AUTOMATED & QA SAFETY TEST SUITE FOR RESUME OPTIMIZER PROMPT BUILDER
// Validates guardrail enforcement, section/mode prompts, JD injection, and safety rules.
// ----------------------------------------------------------------------------

console.log("=== Optimizer Safety Test Suite ===\n");

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
    if (condition) {
        passCount++;
        console.log(`  ✓ ${message}`);
    } else {
        failCount++;
        console.error(`  ✗ FAIL: ${message}`);
    }
}

const SECTIONS: (keyof typeof SECTION_BASE_PROMPTS)[] = [
    "summary",
    "experience",
    "projects",
    "achievements",
    "certifications",
];

const MODES: OptimizerMode[] = [
    "ats",
    "impact",
    "concise",
    "action-verbs",
    "jd-align",
];

// ----------------------------------------------------------------------------
// 1. Guardrail presence in all section/mode combinations
// ----------------------------------------------------------------------------
console.log("1. Guardrail presence in all section/mode combinations:");
SECTIONS.forEach((section) => {
    MODES.forEach((mode) => {
        const prompt = buildOptimizerPrompt(section, "Sample resume content text.", mode);
        assert(
            prompt.includes(HALLUCINATION_GUARDRAIL),
            `Section="${section}" mode="${mode}" contains HALLUCINATION_GUARDRAIL`
        );
    });
});

SECTIONS.forEach((section) => {
    const prompt = buildOptimizerPrompt(section, "Sample resume content text.", undefined);
    assert(
        prompt.includes(HALLUCINATION_GUARDRAIL),
        `Section="${section}" mode=undefined contains HALLUCINATION_GUARDRAIL`
    );
});

// ----------------------------------------------------------------------------
// 2. Section base prompt completeness
// ----------------------------------------------------------------------------
console.log("\n2. Section base prompt completeness:");
SECTIONS.forEach((section) => {
    const basePrompt = SECTION_BASE_PROMPTS[section];
    assert(
        typeof basePrompt === "string" && basePrompt.trim().length > 10,
        `SECTION_BASE_PROMPTS["${section}"] is defined and non-trivial`
    );
});

assert(
    SECTION_BASE_PROMPTS["education"] === undefined,
    `SECTION_BASE_PROMPTS["education"] is NOT present (education section is not AI-optimizable)`
);

// ----------------------------------------------------------------------------
// 3. Optimizer mode prompt validation
// ----------------------------------------------------------------------------
console.log("\n3. Optimizer mode prompt validation:");
MODES.forEach((mode) => {
    const modePrompt = OPTIMIZER_MODE_PROMPTS[mode];
    assert(
        typeof modePrompt === "string" && modePrompt.trim().length > 10,
        `OPTIMIZER_MODE_PROMPTS["${mode}"] is defined and non-trivial`
    );
});

const uniqueModePrompts = new Set(Object.values(OPTIMIZER_MODE_PROMPTS));
assert(
    uniqueModePrompts.size === MODES.length,
    `All ${MODES.length} optimizer modes have distinct instructions`
);

// ----------------------------------------------------------------------------
// 4. JD context injection rules
// ----------------------------------------------------------------------------
console.log("\n4. JD context injection rules:");

const sampleJD = "We are seeking a Senior Full-Stack Engineer with React and AWS experience.";

const promptWithJD = buildOptimizerPrompt("experience", "Developed web apps.", "ats", sampleJD);
assert(
    promptWithJD.includes(sampleJD),
    "JD content is included in the prompt when provided"
);

const promptJdAlign = buildOptimizerPrompt("experience", "Developed web apps.", "jd-align", sampleJD);
assert(
    promptJdAlign.includes("Job Description (align terminology to this role — do not add missing skills):"),
    "jd-align mode includes specific alignment warning header"
);

const promptContextOnly = buildOptimizerPrompt("experience", "Developed web apps.", "ats", sampleJD);
assert(
    promptContextOnly.includes("Target Job Context (for context only — do not add missing skills):"),
    "non-jd-align mode uses context-only header"
);

const promptNoJD = buildOptimizerPrompt("experience", "Developed web apps.", "ats");
assert(
    !promptNoJD.includes("Job Description") && !promptNoJD.includes("Target Job Context"),
    "No-JD prompt contains no Job Description header"
);

// ----------------------------------------------------------------------------
// 5. Content preservation in built prompt
// ----------------------------------------------------------------------------
console.log("\n5. Content preservation in built prompt:");

const testContent = "Engineered microservices architecture handling 10k RPS.";
const promptContentPreserved = buildOptimizerPrompt("experience", testContent, "impact");
assert(
    promptContentPreserved.includes(testContent),
    "Original content appears verbatim in the built prompt"
);

// ----------------------------------------------------------------------------
// 6. Fallback for unknown section
// ----------------------------------------------------------------------------
console.log("\n6. Fallback for unknown section:");

const fallbackPrompt = buildOptimizerPrompt("references" as any, "John Doe, Manager", "concise");
assert(
    typeof fallbackPrompt === "string" && fallbackPrompt.length > 0,
    "Unknown section 'references' returns a non-empty string"
);

assert(
    fallbackPrompt.includes(HALLUCINATION_GUARDRAIL),
    "Fallback prompt for unknown section still contains guardrail"
);

// ----------------------------------------------------------------------------
// 7. Manual truth-preservation test cases (documented for QA)
// ----------------------------------------------------------------------------
console.log("\n7. Manual truth-preservation test cases (review with AI):");
console.log('   [T1] Fabrication prevention — no metric in source:');
console.log('        Input: "Built REST APIs using Spring Boot." (Impact mode)');
console.log('        Pass: AI output does NOT invent percentages (e.g., "40%") or unmentioned tools (e.g., "AWS").');
console.log('   [T2] Metric preservation — exact percentage:');
console.log('        Input: "Reduced API latency by 35% through optimization." (Impact mode)');
console.log('        Pass: AI output preserves exact "35%" figure.');
console.log('   [T3] Missing skill in JD:');
console.log('        Input: "Developed microservices in Java." (JD-align mode, JD mentions Kubernetes)');
console.log('        Pass: AI output does NOT add "Kubernetes" or "K8s" to resume.');
console.log('   [T4] Present skill alignment:');
console.log('        Input: "Built scalable Spring Boot services." (JD-align mode, JD requires Spring Boot)');
console.log('        Pass: AI output naturally aligns Spring Boot terminology.');

// ----------------------------------------------------------------------------
// Test Results & Process Exit
// ----------------------------------------------------------------------------
console.log("\n=== Optimizer Safety Results ===");
console.log(`Automated Assertions: ${passCount} passed, ${failCount} failed`);
console.log("Manual Test Cases: 4 documented for human verification");

if (failCount > 0) {
    console.error("  ✗ Automated assertions failed!");
    process.exit(1);
} else {
    console.log("✓ All automated assertions passed.");
    process.exit(0);
}
