import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import {
    RESUME_OPTIMIZER_PERSONA,
    HALLUCINATION_GUARDRAIL,
    OUTPUT_FORMAT_PLAIN,
    AI_IMPROVE_MODEL_PARAMS,
    OptimizerMode,
    buildOptimizerPrompt
} from "@/lib/promptTemplates";

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
        const { section, content, jobDescription, mode } = body;

        // 1. Validate Input
        if (!content || typeof content !== "string" || content.trim() === "") {
            return NextResponse.json({ error: "Content cannot be empty." }, { status: 400 });
        }

        if (content.length > 2000) {
            return NextResponse.json({ error: "Content exceeds the 2000 character limit." }, { status: 400 });
        }

        if (jobDescription !== undefined && (typeof jobDescription !== "string" || jobDescription.length > 5000)) {
            return NextResponse.json({ error: "Job description must be a string under 5000 characters." }, { status: 400 });
        }

        const validSections = ["summary", "experience", "projects", "achievements", "certifications"];
        if (!section || !validSections.includes(section)) {
            return NextResponse.json({ error: "Invalid section specified." }, { status: 400 });
        }

        const validModes: OptimizerMode[] = ["ats", "impact", "concise", "action-verbs", "jd-align"];
        if (mode !== undefined && !validModes.includes(mode as OptimizerMode)) {
            return NextResponse.json({ error: "Invalid optimization mode specified." }, { status: 400 });
        }

        if (mode === "jd-align" && (!jobDescription || jobDescription.trim().length < 20)) {
            return NextResponse.json(
                { error: "A job description is required for JD Align optimization mode." },
                { status: 400 }
            );
        }

        // 2. Construct Prompt dynamically
        const userPrompt = buildOptimizerPrompt(section, content, mode as OptimizerMode | undefined, jobDescription);


        // 3. Call OpenRouter AI
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                ...AI_IMPROVE_MODEL_PARAMS,
                messages: [
                    {
                        role: "system",
                        content: `${RESUME_OPTIMIZER_PERSONA} ${OUTPUT_FORMAT_PLAIN} ${HALLUCINATION_GUARDRAIL}`
                    },
                    {
                        role: "user",
                        content: userPrompt
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
        const improvedContent = data.choices?.[0]?.message?.content?.trim();

        if (!improvedContent) {
            return NextResponse.json({ error: "AI returned an empty response." }, { status: 500 });
        }

        return NextResponse.json({ improvedContent });

    } catch (error) {
        console.error("AI Improvement Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred processing your request." }, { status: 500 });
    }
}
