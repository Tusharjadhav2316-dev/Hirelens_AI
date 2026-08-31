import { NextResponse } from "next/server";
import { verifyInternalJwt } from "@/lib/verifyInternalJwt";
import { analyzeResumeQuality, analyzeResumeMatch } from "@/lib/atsEngine";
import { formatResumeToText } from "@/lib/jdMatcher";

export async function POST(req: Request) {
    // 1. Enforce Internal-JWT ONLY authentication
    let authUser: { uid: string };
    try {
        authUser = verifyInternalJwt(req);
    } catch (authError: any) {
        return NextResponse.json(
            { error: authError.message || "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { resume, jobDescription } = body;

        if (!resume) {
            return NextResponse.json(
                { error: "Resume payload is required." },
                { status: 400 }
            );
        }

        // Convert resume object to string if necessary
        let resumeText = "";
        if (typeof resume === "string") {
            resumeText = resume;
        } else if (typeof resume === "object") {
            try {
                resumeText = formatResumeToText(resume);
            } catch {
                resumeText = JSON.stringify(resume);
            }
        }

        if (!resumeText.trim()) {
            return NextResponse.json(
                { error: "Resume content cannot be empty." },
                { status: 400 }
            );
        }

        // 2. Call existing deterministic ATS engine (no LLM, no score manipulation)
        const result = jobDescription && typeof jobDescription === "string" && jobDescription.trim().length > 0
            ? analyzeResumeMatch(resumeText, jobDescription.trim())
            : analyzeResumeQuality(resumeText);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Internal ATS Score Endpoint Error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred calculating ATS score." },
            { status: 500 }
        );
    }
}
