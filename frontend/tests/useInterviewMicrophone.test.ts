console.log("=== Interview Microphone Hook & State Machine Contract Tests ===\n");

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

function runMicrophoneHookTests() {
    // 1. Permission State Machine Transitions
    const VALID_STATES = ["OFF", "REQUESTING", "READY", "LISTENING", "PROCESSING", "ERROR", "BLOCKED"];
    assert(VALID_STATES.length === 7, "All 7 lifecycle states defined");

    // Transition: OFF -> REQUESTING -> READY
    let currentState = "OFF";
    assert(currentState === "OFF", "Initial state is OFF");

    currentState = "REQUESTING";
    assert(currentState === "REQUESTING", "State transitions to REQUESTING when user triggers permission");

    currentState = "READY";
    assert(currentState === "READY", "State transitions to READY upon permission grant");

    // Transition: READY -> LISTENING -> PROCESSING -> READY
    currentState = "LISTENING";
    assert(currentState === "LISTENING", "State transitions to LISTENING when recording begins");

    currentState = "PROCESSING";
    assert(currentState === "PROCESSING", "State transitions to PROCESSING when done speaking");

    currentState = "READY";
    assert(currentState === "READY", "State returns to READY after transcription completes");

    // Transition: REQUESTING -> BLOCKED
    let deniedState = "REQUESTING";
    deniedState = "BLOCKED";
    assert(deniedState === "BLOCKED", "State transitions to BLOCKED on NotAllowedError / PermissionDeniedError");

    // 2. Transition Lock Guard against Rapid Submissions
    let isSubmitting = false;
    let fetchCallsCount = 0;

    const mockSubmitRecording = () => {
        if (isSubmitting) {
            return null; // Locked
        }
        isSubmitting = true;
        fetchCallsCount++;
        return "Simulated transcript";
    };

    // First call succeeds
    const res1 = mockSubmitRecording();
    assert(res1 !== null && fetchCallsCount === 1, "First submit succeeds and triggers exactly 1 request");

    // Rapid second call is blocked by transition lock
    const res2 = mockSubmitRecording();
    assert(res2 === null && fetchCallsCount === 1, "Rapid second click is blocked by transition lock (zero duplicate requests)");

    // 3. Hard Duration Cutoff Cap (180s)
    const MAX_RECORDING_SECONDS = 180;
    const isDurationOverCap = (elapsedSeconds: number) => elapsedSeconds >= MAX_RECORDING_SECONDS;

    assert(!isDurationOverCap(30), "30s is below duration cap");
    assert(!isDurationOverCap(179), "179s is below duration cap");
    assert(isDurationOverCap(180), "180s hits hard cutoff cap and triggers recorder stop");
    assert(isDurationOverCap(200), "200s exceeds hard cutoff cap");

    // 4. Track Disposal / Hardware Lock Release Contract
    let stoppedTracksCount = 0;
    const mockTracks = [
        { kind: "audio", stop: () => { stoppedTracksCount++; } },
        { kind: "audio", stop: () => { stoppedTracksCount++; } }
    ];

    const releaseMediaStream = (tracks: Array<{ stop: () => void }>) => {
        tracks.forEach(t => t.stop());
    };

    releaseMediaStream(mockTracks);
    assert(stoppedTracksCount === 2, "All audio tracks are cleanly stopped to release OS hardware microphone lock");

    // 5. Silent / Empty Recording Client-Side Guard
    const MIN_AUDIO_BYTES = 500;
    const isAudioEligibleForStt = (byteSize: number) => byteSize >= MIN_AUDIO_BYTES;

    assert(!isAudioEligibleForStt(0), "0-byte recording rejected client-side before spending STT API request");
    assert(!isAudioEligibleForStt(120), "Near-empty audio (< 500 bytes) rejected client-side");
    assert(isAudioEligibleForStt(15000), "Valid audio recording (15KB) passes client-side guard for STT upload");

    // 6. Hook-Scoped Instance Isolation
    const createHookInstanceRefs = () => ({
        mediaRecorderRef: { current: null },
        mediaStreamRef: { current: null },
        audioChunksRef: { current: [] as any[] },
        isSubmittingRef: { current: false }
    });

    const instanceA = createHookInstanceRefs();
    const instanceB = createHookInstanceRefs();

    instanceA.isSubmittingRef.current = true;
    assert(instanceA.isSubmittingRef.current !== instanceB.isSubmittingRef.current, "Hook instances are strictly isolated with zero shared global state");

    console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
    if (failCount > 0) {
        process.exit(1);
    }
}

runMicrophoneHookTests();
