import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { ATS_EXPERT_PERSONA, HALLUCINATION_GUARDRAIL, OUTPUT_FORMAT_PLAIN } from "@/lib/promptTemplates";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
    try {
        const decodedUser = await verifyAuth(req);
    } catch (authError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!OPENROUTER_API_KEY) {
        return NextResponse.json({ error: "OpenRouter API key is not configured." }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { resumeText, jobDescription } = body;

        // 1. Validate Input
        if (!resumeText || typeof resumeText !== "string" || resumeText.trim() === "") {
            return NextResponse.json({ error: "Resume content is missing or invalid." }, { status: 400 });
        }

        if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim() === "") {
            return NextResponse.json({ error: "Job description is missing or invalid." }, { status: 400 });
        }

        if (resumeText.length > 10000 || jobDescription.length > 10000) {
            return NextResponse.json({ error: "Input exceeds the character limit." }, { status: 400 });
        }

        // 2. Call OpenRouter AI
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [
                    {
                        role: "system",
                        content: `${ATS_EXPERT_PERSONA} ${HALLUCINATION_GUARDRAIL} ${OUTPUT_FORMAT_PLAIN} Provide actionable but factual suggestions. Respond in structured paragraphs.`
                    },
                    {
                        role: "user",
                        content: `--- RESUME TEXT ---\n${resumeText}\n\n--- JOB DESCRIPTION ---\n${jobDescription}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API Failed:", response.status, errorText);

            if (response.status === 429) {
                return NextResponse.json({ error: "Rate limit exceeded. Please try again in a few moments." }, { status: 429 });
            }
            return NextResponse.json({ error: "Failed to communicate with AI provider." }, { status: 502 });
        }

        const data = await response.json();
        const refinedInsights = data.choices?.[0]?.message?.content?.trim();

        if (!refinedInsights) {
            return NextResponse.json({ error: "AI returned an empty response." }, { status: 500 });
        }

        return NextResponse.json({ refinedInsights });

    } catch (error) {
        console.error("JD Refine Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred processing your request." }, { status: 500 });
    }
}
