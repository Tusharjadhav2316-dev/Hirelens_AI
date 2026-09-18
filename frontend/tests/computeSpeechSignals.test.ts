import { computeSpeechSignals } from "../lib/speech/computeSpeechSignals.ts";

console.log("=== Speech Delivery Signals & Grounded Metrics Contract Tests ===\n");

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

function runSpeechSignalsTests() {
    // 1. Exact WPM Arithmetic Calculation
    // 120 words spoken in 60 seconds = 120 WPM
    const testTranscript1 = "word ".repeat(120).trim();
    const signals1 = computeSpeechSignals(testTranscript1, 60.0);
    assert(signals1 !== null, "Signals computed for valid transcript and duration");
    assert(signals1?.word_count === 120, "Word count is exactly 120");
    assert(signals1?.words_per_minute === 120, "WPM is exactly 120 for 120 words in 60s");

    // 90 words in 30 seconds = 180 WPM
    const testTranscript2 = "word ".repeat(90).trim();
    const signals2 = computeSpeechSignals(testTranscript2, 30.0);
    assert(signals2?.words_per_minute === 180, "WPM is exactly 180 for 90 words in 30s");

    // 2. Strict Filler Word Boundary Matching (No Substring False Positives)
    const fillerTranscript = "Um, I basically think that I like software engineering, but it is likely not unlike anything else. Actually you know, uh, we did it right.";
    const fillerSignals = computeSpeechSignals(fillerTranscript, 45.0);

    assert(fillerSignals?.filler_word_counts["um"] === 1, "'um' counted once (capitalization ignored)");
    assert(fillerSignals?.filler_word_counts["basically"] === 1, "'basically' counted once");
    assert(fillerSignals?.filler_word_counts["like"] === 1, "'like' matched once without matching inside 'likely' or 'unlike'");
    assert(fillerSignals?.filler_word_counts["actually"] === 1, "'actually' counted once");
    assert(fillerSignals?.filler_word_counts["you know"] === 1, "'you know' counted once as a multi-word filler phrase");
    assert(fillerSignals?.filler_word_counts["uh"] === 1, "'uh' counted once");
    assert(fillerSignals?.filler_word_counts["right"] === 1, "'right' counted once");
    assert(fillerSignals?.total_fillers === 7, "Total fillers accurately sum to 7");

    // 3. Repeated Phrase Detection
    const repeatedTranscript = "We deployed the system to production to production yesterday.";
    const repeatedSignals = computeSpeechSignals(repeatedTranscript, 30.0);
    assert(repeatedSignals?.repeated_phrases.includes("to production"), "Repeated consecutive phrase 'to production' detected");

    // 4. Answer Length Banding Thresholds
    // < 30 words -> too_brief
    const briefSignals = computeSpeechSignals("Yes, I have used React.", 10.0);
    assert(briefSignals?.answer_length_band === "too_brief", "Brief response (<30 words) categorized as 'too_brief'");

    // 30 - 80 words -> concise
    const conciseText = "word ".repeat(50).trim();
    const conciseSignals = computeSpeechSignals(conciseText, 35.0);
    assert(conciseSignals?.answer_length_band === "concise", "50-word response categorized as 'concise'");

    // 80 - 220 words -> optimal
    const optimalText = "word ".repeat(150).trim();
    const optimalSignals = computeSpeechSignals(optimalText, 70.0);
    assert(optimalSignals?.answer_length_band === "optimal", "150-word response categorized as 'optimal'");

    // 220 - 350 words -> lengthy
    const lengthyText = "word ".repeat(280).trim();
    const lengthySignals = computeSpeechSignals(lengthyText, 140.0);
    assert(lengthySignals?.answer_length_band === "lengthy", "280-word response categorized as 'lengthy'");

    // > 350 words -> overlong
    const overlongText = "word ".repeat(380).trim();
    const overlongSignals = computeSpeechSignals(overlongText, 200.0);
    assert(overlongSignals?.answer_length_band === "overlong", "380-word response categorized as 'overlong'");

    // 5. Zero / Missing Duration Handling (Typed Response Fallback)
    const typedSignals = computeSpeechSignals("This is a typed answer without voice timing.", undefined);
    assert(typedSignals?.words_per_minute === undefined, "WPM is undefined when duration is missing (no divide by zero)");
    assert(typedSignals?.duration_seconds === undefined, "Duration is undefined when omitted");
    assert(typedSignals?.word_count === 8, "Word count remains accurate for typed response");

    const zeroDurationSignals = computeSpeechSignals("Quick text", 0);
    assert(zeroDurationSignals?.words_per_minute === undefined, "Zero duration safely omits WPM (no NaN / Infinity)");

    // Empty / whitespace transcript returns null
    assert(computeSpeechSignals("", 30.0) === null, "Empty transcript returns null");
    assert(computeSpeechSignals("   ", 30.0) === null, "Whitespace transcript returns null");

    // 6. Coarse Long Pause Detection
    // 10 samples over 20s (2s/sample). 2 consecutive silence samples = 4s silence (>= 2.5s)
    const energySamples = [0.2, 0.3, 0.005, 0.005, 0.25, 0.4, 0.3, 0.001, 0.001, 0.2];
    const pauseSignals = computeSpeechSignals(testTranscript2, 20.0, energySamples);
    assert((pauseSignals?.long_pause_count ?? 0) >= 1, "Sustained silence samples accurately detected as long pause");

    console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
    if (failCount > 0) {
        process.exit(1);
    }
}

runSpeechSignalsTests();
