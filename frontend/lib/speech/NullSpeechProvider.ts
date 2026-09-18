import type { SpeechProvider, TranscribeOptions, TranscribeResult, SynthesizeOptions, SynthesizeResult } from "./SpeechProviderAdapter";

export class NullSpeechProvider implements SpeechProvider {
    readonly name = "null";

    isConfigured(): boolean {
        return false;
    }

    async transcribe(_audioBlob: Blob | Buffer, _options?: TranscribeOptions): Promise<TranscribeResult> {
        const error = new Error("Speech provider is not configured. Please use typing mode or configure SPEECH_PROVIDER_API_KEY.");
        (error as any).code = "NOT_CONFIGURED";
        throw error;
    }

    async synthesize(_text: string, _options?: SynthesizeOptions): Promise<SynthesizeResult> {
        const error = new Error("Speech synthesis provider is not configured. Fallback to text captions.");
        (error as any).code = "NOT_CONFIGURED";
        throw error;
    }
}
