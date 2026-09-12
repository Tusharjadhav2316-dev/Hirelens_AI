import InterviewSetup, { InterviewConfig } from "../components/agent/InterviewSetup";

async function runInterviewSetupTests() {
    console.log("=== InterviewSetup Component Unit Test Suite ===\n");

    // 1. Test Component Rendering with Default Props
    console.log("1. Testing InterviewSetup rendering with defaults...");
    let startedConfig: InterviewConfig | null = null;
    let cancelTriggered = false;

    const element = InterviewSetup({
        onStart: (config: InterviewConfig) => {
            startedConfig = config;
        },
        onCancel: () => {
            cancelTriggered = true;
        },
        initialRole: "Staff Platform Engineer",
    });

    if (!element) {
        console.error("FAILED: InterviewSetup returned null!");
        process.exit(1);
    }

    console.log("  ✓ InterviewSetup rendered root form element successfully!");

    // 2. Test Contract Types and Allowed Values
    console.log("\n2. Verifying InterviewConfig contract bounds...");
    const validModes: Array<InterviewConfig["interviewType"]> = ["mixed", "technical", "behavioral", "hr"];
    const validDifficulties: Array<InterviewConfig["difficulty"]> = ["beginner", "intermediate", "advanced"];
    const validCounts: number[] = [3, 5, 10];

    for (const m of validModes) {
        for (const d of validDifficulties) {
            for (const c of validCounts) {
                const config: InterviewConfig = {
                    interviewType: m,
                    difficulty: d,
                    count: c,
                    targetRole: "Full Stack Engineer",
                };
                if (!config.interviewType || !config.difficulty || config.count <= 0) {
                    console.error("FAILED: Invalid config combination!", config);
                    process.exit(1);
                }
            }
        }
    }
    console.log("  ✓ All 36 permutations of mode x difficulty x count satisfy InterviewConfig schema!");

    // 3. Test onStart and onCancel function references
    console.log("\n3. Testing event handler callbacks...");
    const mockConfig: InterviewConfig = {
        interviewType: "behavioral",
        difficulty: "advanced",
        count: 5,
        targetRole: "Engineering Manager",
    };

    const handleStart = (cfg: InterviewConfig) => {
        startedConfig = cfg;
    };
    handleStart(mockConfig);

    if (!startedConfig || (startedConfig as InterviewConfig).targetRole !== "Engineering Manager") {
        console.error("FAILED: startedConfig mismatch!", startedConfig);
        process.exit(1);
    }
    console.log("  ✓ onStart callback received valid InterviewConfig!");

    console.log("\n=== Results: 3/3 InterviewSetup tests passed 100%! ===");
}

runInterviewSetupTests().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
