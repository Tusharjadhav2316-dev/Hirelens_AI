import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { getSpeechProvider } from "@/lib/speech/SpeechProviderAdapter";

export const runtime = "nodejs";

const MAX_TTS_TEXT_LENGTH = 2000; // Character ceiling to prevent runaway TTS cost and buffer bloat

export async function POST(req: Request) {
    // 1. Mandatory Authentication Check
    try {
        await verifyAuth(req);
    } catch (authErr: any) {
        return NextResponse.json(
            { error: "Authentication required", message: authErr?.message || "Invalid or missing token" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const text = typeof body?.text === "string" ? body.text.trim() : "";
        const languageCode = body?.languageCode || "en-IN";
        const voiceId = body?.voiceId || "meera";
        const pace = typeof body?.pace === "number" ? body.pace : 1.0;

        // 2. Validate Text Input
        if (!text || text.length === 0) {
            return NextResponse.json(
                { error: "Text is required for speech synthesis", code: "EMPTY_TEXT" },
                { status: 400 }
            );
        }

        if (text.length > MAX_TTS_TEXT_LENGTH) {
            return NextResponse.json(
                {
                    error: `Text length (${text.length}) exceeds maximum limit of ${MAX_TTS_TEXT_LENGTH} characters`,
                    code: "TEXT_TOO_LONG",
                },
                { status: 400 }
            );
        }

        // 3. Delegate to SpeechProvider
        const provider = getSpeechProvider();
        const result = await provider.synthesize(text, {
            languageCode,
            voiceId,
            pace,
        });

        return NextResponse.json({
            audioBase64: result.audioBase64,
            format: result.format || "audio/wav",
            provider: result.provider,
            textLength: text.length,
        });

    } catch (error: any) {
        if (error?.code === "NOT_CONFIGURED") {
            return NextResponse.json(
                {
                    error: "Speech synthesis provider is not configured.",
                    code: "NOT_CONFIGURED",
                    canFallbackToText: true,
                },
                { status: 503 }
            );
        }

        // Sanitize error to prevent secret leakage
        console.error("[TTS Route Error]", error?.message || error);
        return NextResponse.json(
            {
                error: "Failed to synthesize speech. Please continue with text captions.",
                code: "SYNTHESIS_FAILED",
                canFallbackToText: true,
            },
            { status: 500 }
        );
    }
}
