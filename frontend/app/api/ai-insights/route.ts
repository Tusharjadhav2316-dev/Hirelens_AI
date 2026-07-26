import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { AI_INSIGHTS_SYSTEM_PROMPT, AI_INSIGHTS_MODEL_PARAMS } from "@/lib/promptTemplates";

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
        const { resumeText, jobDescription, atsBreakdown, mode } = body;

        if (!resumeText || typeof resumeText !== "string" || resumeText.trim() === "") {
            return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
        }

        const isMatchMode = mode === "Match" && jobDescription;

        const prompt = `
        Analyze the following resume and ATS breakdown. Provide 3-5 concise, highly actionable improvement suggestions targeting the weakest areas shown in the ATS scoring breakdown.
        
        Resume:
        ${resumeText.substring(0, 3000)}...
        
        ${isMatchMode ? `Job Description:\n${jobDescription.substring(0, 3000)}` : ""}
        
        ATS Score Breakdown (Mode: ${mode}):
        ${JSON.stringify(atsBreakdown)}
        
        Provide 3-5 concise, highly actionable bullet points on how to improve this resume's ATS score, tone, and ${isMatchMode ? "keyword optimization for this specific job" : "overall formatting quality"}. Focus on the weakest areas identified in the breakdown. Do not use generic advice, be highly specific to the text provided. Only return the bullet points. No markdown formatting other than bullet points (* or -).
        `;

        const MODELS = [
            "google/gemini-2.0-flash-lite-001",
            "google/gemini-2.0-flash-001",
            "meta-llama/llama-3.3-70b-instruct"
        ];

        let insights = "";
        let lastError = "";

        for (const model of MODELS) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model,
                        ...AI_INSIGHTS_MODEL_PARAMS,
                        messages: [
                            { role: "system", content: AI_INSIGHTS_SYSTEM_PROMPT },
                            { role: "user", content: prompt }
                        ]
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    insights = data.choices?.[0]?.message?.content?.trim() || "";
                    if (insights) break;
                } else {
                    lastError = await response.text();
                    console.warn(`AI Insights model ${model} failed with status ${response.status}: ${lastError}`);
                }
            } catch (modelErr: any) {
                lastError = modelErr.message || String(modelErr);
                console.warn(`AI Insights model ${model} attempt threw error:`, lastError);
            }
        }

        if (!insights) {
            console.error("AI Insights All Models Failed. Last Error:", lastError);
            return NextResponse.json({ error: "Unable to generate AI Insights at this moment. Please try again shortly." }, { status: 502 });
        }

        return NextResponse.json({ insights });

    } catch (error) {
        console.error("AI Insights Fatal Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred processing your request." }, { status: 500 });
    }
}
