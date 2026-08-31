import { NextResponse } from "next/server";
import { verifyInternalJwt } from "@/lib/verifyInternalJwt";
import { analyzeJobMatch } from "@/lib/jdMatcher";

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
        const { resumeText, jobDescription, resume } = body;

        if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
            return NextResponse.json(
                { error: "resumeText string is required." },
                { status: 400 }
            );
        }

        if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
            return NextResponse.json(
                { error: "jobDescription string is required." },
                { status: 400 }
            );
        }

        // 2. Call existing deterministic JD Matcher
        const result = analyzeJobMatch(resumeText.trim(), jobDescription.trim(), resume);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Internal JD Match Endpoint Error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred running JD Match analysis." },
            { status: 500 }
        );
    }
}
