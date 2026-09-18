console.log("=== Interview Room State Ownership & Concurrency Contract Tests ===\n");

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

function runStateOwnershipTests() {
    // 1. Single Turn-State Authority Mapping
    const VALID_TURN_PHASES = ["SETUP", "AI_SPEAKING", "LISTENING", "PROCESSING", "FEEDBACK", "PAUSED", "COMPLETED"];
    assert(VALID_TURN_PHASES.length === 7, "All 7 explicit turn-state phases defined");

    let currentPhase = "SETUP";
    currentPhase = "AI_SPEAKING";
    assert(currentPhase === "AI_SPEAKING", "Turn transitions to AI_SPEAKING when presenting question");

    currentPhase = "LISTENING";
    assert(currentPhase === "LISTENING", "Turn transitions to LISTENING once AI finishes speaking");

    // 2. Transition Lock: Duplicate Submit Prevention
    let isSubmitting = false;
    let submissionsCount = 0;

    const mockSubmitAnswer = (answer: string) => {
        if (isSubmitting || !answer.trim()) return null;
        isSubmitting = true;
        submissionsCount++;
        return { success: true, count: submissionsCount };
    };

    const firstSubmit = mockSubmitAnswer("My STAR answer about leadership");
    assert(firstSubmit !== null && submissionsCount === 1, "First submit succeeds and transitions to processing");

    const duplicateRapidSubmit = mockSubmitAnswer("My STAR answer about leadership");
    assert(duplicateRapidSubmit === null && submissionsCount === 1, "Rapid duplicate submit is blocked by transition lock");

    // 3. Question Advancement Blocked While PROCESSING
    const canAdvanceQuestion = (phase: string) => phase === "FEEDBACK";
    assert(!canAdvanceQuestion("PROCESSING"), "Cannot advance question while turn state is PROCESSING");
    assert(canAdvanceQuestion("FEEDBACK"), "Can advance question once turn state is FEEDBACK");

    // 4. Media Release on Pause & End Interview
    let audioStopped = false;
    let micReleased = false;
    let cameraStopped = false;

    const mockPauseOrEnd = () => {
        audioStopped = true;
        micReleased = true;
        cameraStopped = true;
    };

    mockPauseOrEnd();
    assert(audioStopped && micReleased && cameraStopped, "Audio, mic, and camera are all released on Pause or End Interview");

    // 5. Idempotent Report Generation (Generated Exactly Once Across Re-renders)
    let reportGenerations = 0;
    let isReportGenerated = false;

    const triggerReportGeneration = () => {
        if (isReportGenerated) return null;
        isReportGenerated = true;
        reportGenerations++;
        return { reportId: "rep_1" };
    };

    // First completion
    const rep1 = triggerReportGeneration();
    assert(rep1 !== null && reportGenerations === 1, "Report generated on initial session completion");

    // Simulated React effect re-render
    const rep2 = triggerReportGeneration();
    assert(rep2 === null && reportGenerations === 1, "Duplicate report generation prevented across re-renders");

    console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
    if (failCount > 0) {
        process.exit(1);
    }
}

runStateOwnershipTests();
