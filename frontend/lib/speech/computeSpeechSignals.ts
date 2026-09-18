export interface SpeechSignals {
    word_count: number;
    duration_seconds?: number;
    words_per_minute?: number;
    filler_word_counts: Record<string, number>;
    total_fillers: number;
    repeated_phrases: string[];
    long_pause_count: number;
    answer_length_band: "too_brief" | "concise" | "optimal" | "lengthy" | "overlong";
}

const COMMON_FILLERS = [
    "um",
    "uh",
    "like",
    "you know",
    "basically",
    "actually",
    "right",
    "i mean",
    "sort of",
    "kind of",
];

/**
 * Deterministically computes observable speech delivery signals from transcript,
 * duration, and optional energy samples.
 * Returns null if duration is missing or zero (e.g. typed answers).
 */
export function computeSpeechSignals(
    transcript: string,
    durationSeconds?: number,
    energySamples?: number[]
): SpeechSignals | null {
    if (!transcript || typeof transcript !== "string") {
        return null;
    }

    const trimmed = transcript.trim();
    if (trimmed.length === 0) {
        return null;
    }

    // Tokenize words (alphanumeric sequences)
    const words = trimmed.match(/\b[\w'-]+\b/g) || [];
    const wordCount = words.length;

    if (wordCount === 0) {
        return null;
    }

    // 1. Calculate WPM (if duration is provided and valid)
    let wordsPerMinute: number | undefined = undefined;
    if (typeof durationSeconds === "number" && durationSeconds > 0) {
        const minutes = durationSeconds / 60;
        wordsPerMinute = Math.round(wordCount / minutes);
    }

    // 2. Filler Word Detection with strict word boundary regex
    const lowerTranscript = trimmed.toLowerCase();
    const fillerWordCounts: Record<string, number> = {};
    let totalFillers = 0;

    for (const filler of COMMON_FILLERS) {
        // Use word boundaries for single words or phrase boundary
        const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "gi");
        const matches = lowerTranscript.match(regex);
        if (matches && matches.length > 0) {
            fillerWordCounts[filler] = matches.length;
            totalFillers += matches.length;
        }
    }

    // 3. Repeated Phrases Detection (2-to-3 word consecutive repetitions)
    const repeatedPhrases: string[] = [];
    if (words.length >= 4) {
        for (let i = 0; i < words.length - 3; i++) {
            const twoWord = `${words[i]} ${words[i + 1]}`.toLowerCase();
            const nextTwoWord = `${words[i + 2]} ${words[i + 3]}`.toLowerCase();
            if (twoWord === nextTwoWord && !repeatedPhrases.includes(twoWord)) {
                repeatedPhrases.push(twoWord);
            }
        }
    }

    // 4. Answer Length Banding
    let answerLengthBand: SpeechSignals["answer_length_band"] = "optimal";
    if (wordCount < 30 || (durationSeconds && durationSeconds < 20)) {
        answerLengthBand = "too_brief";
    } else if (wordCount <= 80 || (durationSeconds && durationSeconds < 45)) {
        answerLengthBand = "concise";
    } else if (wordCount <= 220 && (!durationSeconds || durationSeconds <= 120)) {
        answerLengthBand = "optimal";
    } else if (wordCount <= 350 && (!durationSeconds || durationSeconds <= 180)) {
        answerLengthBand = "lengthy";
    } else {
        answerLengthBand = "overlong";
    }

    // 5. Coarse Long Pause Count (from energy samples if present, e.g. >= 2.5s sustained silence)
    let longPauseCount = 0;
    if (energySamples && energySamples.length > 0 && durationSeconds && durationSeconds > 0) {
        const sampleIntervalSec = durationSeconds / energySamples.length;
        const silenceThreshold = 0.02; // Very low RMS energy
        const minSilenceSamples = Math.max(1, Math.round(2.5 / sampleIntervalSec));

        let currentSilenceSamples = 0;
        for (const sample of energySamples) {
            if (sample < silenceThreshold) {
                currentSilenceSamples++;
                if (currentSilenceSamples === minSilenceSamples) {
                    longPauseCount++;
                }
            } else {
                currentSilenceSamples = 0;
            }
        }
    }

    return {
        word_count: wordCount,
        duration_seconds: durationSeconds && durationSeconds > 0 ? durationSeconds : undefined,
        words_per_minute: wordsPerMinute,
        filler_word_counts: fillerWordCounts,
        total_fillers: totalFillers,
        repeated_phrases: repeatedPhrases,
        long_pause_count: longPauseCount,
        answer_length_band: answerLengthBand,
    };
}
