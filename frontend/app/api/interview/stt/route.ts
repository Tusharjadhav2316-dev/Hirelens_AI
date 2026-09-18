import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { getSpeechProvider } from "@/lib/speech/SpeechProviderAdapter";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15 MB hard payload size ceiling

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
        const contentType = req.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
            return NextResponse.json(
                { error: "Content-Type must be multipart/form-data" },
                { status: 400 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file");
        const languageCode = formData.get("languageCode")?.toString() || "en-IN";
        const clientDuration = formData.get("durationSeconds") ? Number(formData.get("durationSeconds")) : undefined;

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { error: "No audio file provided in form data ('file' field required)" },
                { status: 400 }
            );
        }

        // 2. Enforce Server-Side Payload Size Limit (15 MB)
        if (file.size > MAX_AUDIO_BYTES) {
            return NextResponse.json(
                { error: "Audio file exceeds maximum size limit of 15 MB", code: "PAYLOAD_TOO_LARGE" },
                { status: 413 }
            );
        }

        if (file.size === 0) {
            return NextResponse.json(
                { error: "Audio file is empty", code: "EMPTY_AUDIO" },
                { status: 400 }
            );
        }

        // 3. Delegate to SpeechProviderAdapter
        const provider = getSpeechProvider();
        const result = await provider.transcribe(file, { languageCode });

        return NextResponse.json({
            transcript: result.transcript,
            languageCode: result.languageCode || languageCode,
            provider: result.provider,
            durationSeconds: clientDuration, // Informational metadata only
        });

    } catch (error: any) {
        if (error?.code === "NOT_CONFIGURED") {
            return NextResponse.json(
                {
                    error: "Speech provider is not configured. Please type your response.",
                    code: "NOT_CONFIGURED",
                    transcript: "",
                },
                { status: 503 }
            );
        }

        console.error("[STT Route Error]", error);
        return NextResponse.json(
            { error: error?.message || "Failed to transcribe audio" },
            { status: 500 }
        );
    }
}
