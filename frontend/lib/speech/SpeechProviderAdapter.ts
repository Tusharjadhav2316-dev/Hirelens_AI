export interface TranscribeOptions {
    languageCode?: string;
    model?: string;
}

export interface TranscribeResult {
    transcript: string;
    languageCode?: string;
    provider: string;
    durationSeconds?: number;
}

export interface SynthesizeOptions {
    languageCode?: string;
    voiceId?: string;
    pace?: number;
    model?: string;
}

export interface SynthesizeResult {
    audioBase64?: string;
    audioBuffer?: ArrayBuffer;
    format: string; // e.g. "audio/wav"
    provider: string;
}

export interface SpeechProvider {
    readonly name: string;
    isConfigured(): boolean;
    transcribe(audioBlob: Blob | Buffer, options?: TranscribeOptions): Promise<TranscribeResult>;
    synthesize(text: string, options?: SynthesizeOptions): Promise<SynthesizeResult>;
}

import { NullSpeechProvider } from "./NullSpeechProvider";
import { SarvamSpeechProvider } from "./SarvamSpeechProvider";

export function getSpeechProvider(providerName?: string): SpeechProvider {
    const selected = (providerName || process.env.SPEECH_PROVIDER || (process.env.SPEECH_PROVIDER_API_KEY ? "sarvam" : "null")).toLowerCase().trim();

    if (selected === "sarvam") {
        const sarvam = new SarvamSpeechProvider();
        if (sarvam.isConfigured()) {
            return sarvam;
        }
    }

    return new NullSpeechProvider();
}
