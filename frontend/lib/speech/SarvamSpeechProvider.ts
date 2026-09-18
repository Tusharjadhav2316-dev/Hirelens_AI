import type { SpeechProvider, TranscribeOptions, TranscribeResult, SynthesizeOptions, SynthesizeResult } from "./SpeechProviderAdapter";

export class SarvamSpeechProvider implements SpeechProvider {
    readonly name = "sarvam";
    private readonly apiKey: string | undefined;
    private readonly sttEndpoint = "https://api.sarvam.ai/speech-to-text";
    private readonly ttsEndpoint = "https://api.sarvam.ai/text-to-speech";

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.SPEECH_PROVIDER_API_KEY || process.env.SARVAM_API_KEY;
    }

    isConfigured(): boolean {
        return Boolean(this.apiKey && this.apiKey.trim().length > 0);
    }

    async transcribe(audioBlob: Blob | Buffer, options?: TranscribeOptions): Promise<TranscribeResult> {
        if (!this.isConfigured()) {
            const error = new Error("Sarvam speech API key is not configured.");
            (error as any).code = "NOT_CONFIGURED";
            throw error;
        }

        const formData = new FormData();
        const languageCode = options?.languageCode || "en-IN";
        const model = options?.model || "saaras:v3";

        // Convert Buffer to Blob if running in Node environment
        let blobToSend: Blob;
        if (typeof Buffer !== "undefined" && Buffer.isBuffer(audioBlob)) {
            blobToSend = new Blob([new Uint8Array(audioBlob)], { type: "audio/webm" });
        } else {
            blobToSend = audioBlob as Blob;
        }

        formData.append("file", blobToSend, "audio.webm");
        formData.append("model", model);
        formData.append("language_code", languageCode);

        const response = await fetch(this.sttEndpoint, {
            method: "POST",
            headers: {
                "api-subscription-key": this.apiKey!,
            },
            body: formData,
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Sarvam STT failed with status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const transcript = data.transcript || "";

        return {
            transcript: transcript.trim(),
            languageCode: data.language_code || languageCode,
            provider: "sarvam",
        };
    }

    async synthesize(text: string, options?: SynthesizeOptions): Promise<SynthesizeResult> {
        if (!this.isConfigured()) {
            const error = new Error("Sarvam speech API key is not configured.");
            (error as any).code = "NOT_CONFIGURED";
            throw error;
        }

        const targetLanguageCode = options?.languageCode || "en-IN";
        const speaker = options?.voiceId || "meera";
        const pace = options?.pace || 1.0;
        const model = options?.model || "bulbul:v1";

        const payload = {
            inputs: [text.trim()],
            target_language_code: targetLanguageCode,
            speaker: speaker,
            pitch: 0,
            pace: pace,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: model,
        };

        const response = await fetch(this.ttsEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-subscription-key": this.apiKey!,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Sarvam TTS failed with status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const audios = data.audios || [];
        const base64Audio = audios[0] || "";

        if (!base64Audio) {
            throw new Error("Sarvam TTS returned empty audio data.");
        }

        return {
            audioBase64: base64Audio,
            format: "audio/wav",
            provider: "sarvam",
        };
    }
}
