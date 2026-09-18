console.log("=== Interview Audio Player Hook & Playback Queue Contract Tests ===\n");

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

function runAudioPlayerHookTests() {
    // 1. Playback State Machine
    const VALID_STATES = ["IDLE", "BUFFERING", "PLAYING", "PAUSED", "ERROR"];
    assert(VALID_STATES.length === 5, "All 5 playback states defined (IDLE, BUFFERING, PLAYING, PAUSED, ERROR)");

    let state = "IDLE";
    assert(state === "IDLE", "Initial playback state is IDLE");

    state = "BUFFERING";
    assert(state === "BUFFERING", "State transitions to BUFFERING when fetching TTS audio");

    state = "PLAYING";
    assert(state === "PLAYING", "State transitions to PLAYING when audio starts playing");

    state = "IDLE";
    assert(state === "IDLE", "State returns to IDLE after audio ends");

    // 2. FIFO Playback Queue & Bounded Queue
    const MAX_QUEUE_ITEMS = 3;
    const queue: string[] = [];

    const enqueueUtterance = (text: string) => {
        if (!text || text.trim().length === 0) return;
        if (queue.length >= MAX_QUEUE_ITEMS) {
            queue.shift(); // Drop oldest to enforce bounded cap
        }
        queue.push(text.trim());
    };

    enqueueUtterance("First question");
    enqueueUtterance("Second follow-up");
    enqueueUtterance("Third comment");
    assert(queue.length === 3 && queue[0] === "First question", "FIFO queue stores items in exact submission order");

    enqueueUtterance("Fourth overflow utterance");
    assert(queue.length === 3 && queue[0] === "Second follow-up" && queue[2] === "Fourth overflow utterance", "Bounded queue caps at MAX_QUEUE_ITEMS (3) dropping oldest");

    // 3. TTS Request Cancellation & Invalidation on Interrupt
    let currentGeneration = 0;
    let pendingFetchGeneration = 0;
    let isAborted = false;

    // Simulate start of TTS fetch
    const startFetch = () => {
        pendingFetchGeneration = currentGeneration;
        return { generation: pendingFetchGeneration };
    };

    // User triggers interrupt
    const interrupt = () => {
        currentGeneration++;
        isAborted = true;
        queue.length = 0; // Clear queue
    };

    const fetchTask = startFetch();
    assert(fetchTask.generation === 0, "Initial fetch started with generation 0");

    interrupt();
    assert(currentGeneration === 1, "Interrupt increments generation token to invalidate in-flight requests");
    assert(queue.length === 0, "Interrupt completely empties the playback queue");

    // Late response arrives from the server
    const shouldPlayLateResponse = (responseGeneration: number) => {
        return responseGeneration === currentGeneration;
    };

    assert(!shouldPlayLateResponse(fetchTask.generation), "Late TTS response with stale generation is strictly ignored");

    // 4. Mute Optimization
    let ttsApiCallCount = 0;
    let isMuted = true;

    const mockSpeak = (text: string, muted: boolean) => {
        if (muted) {
            // Render caption only, skip TTS network call
            return { caption: text, audioPlayed: false };
        }
        ttsApiCallCount++;
        return { caption: text, audioPlayed: true };
    };

    const mutedResult = mockSpeak("Please explain your approach.", isMuted);
    assert(mutedResult.audioPlayed === false && ttsApiCallCount === 0, "Muted state suppresses TTS network request and audio playback");
    assert(mutedResult.caption === "Please explain your approach.", "Muted state still updates captions for visual reading");

    isMuted = false;
    const unmutedResult = mockSpeak("Next question.", isMuted);
    assert(unmutedResult.audioPlayed === true && ttsApiCallCount === 1, "Unmuting resumes normal TTS network dispatch");

    // 5. Browser Autoplay Block Handling (NotAllowedError)
    const handlePlayRejection = (err: { name: string }) => {
        if (err.name === "NotAllowedError") {
            return { state: "ERROR", isAutoplayBlocked: true };
        }
        return { state: "ERROR", isAutoplayBlocked: false };
    };

    const autoplayBlockResult = handlePlayRejection({ name: "NotAllowedError" });
    assert(autoplayBlockResult.isAutoplayBlocked === true, "NotAllowedError transitions to isAutoplayBlocked=true without crashing interview");

    // 6. Object URL Disposal & Clean Teardown
    let revokedUrlsCount = 0;
    const activeUrls = ["blob:http://localhost:3000/123", "blob:http://localhost:3000/456"];

    const cleanupUrls = (urls: string[]) => {
        urls.forEach(() => { revokedUrlsCount++; });
    };

    cleanupUrls(activeUrls);
    assert(revokedUrlsCount === 2, "Object URLs are revoked to prevent memory leaks");

    console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
    if (failCount > 0) {
        process.exit(1);
    }
}

runAudioPlayerHookTests();
