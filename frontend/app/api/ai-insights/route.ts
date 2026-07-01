import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";

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
        You are an expert ATS optimizer and career coach.
        You have been given a candidate's resume text, ${isMatchMode ? "a target job description," : ""} and their current ATS scoring breakdown based on a ${mode} mode analysis.
        
        Resume:
        ${resumeText.substring(0, 3000)}...
        
        ${isMatchMode ? `Job Description:\n${jobDescription.substring(0, 3000)}` : ""}
        
        ATS Score Breakdown (Mode: ${mode}):
        ${JSON.stringify(atsBreakdown)}
        
        Provide 3-5 concise, highly actionable bullet points on how to improve this resume's ATS score, tone, and ${isMatchMode ? "keyword optimization for this specific job" : "overall formatting quality"}. Focus on the weakest areas identified in the breakdown. Do not use generic advice, be highly specific to the text provided. Only return the bullet points. No markdown formatting other than bullet points (* or -).
        `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API Failed:", response.status, errorText);
            return NextResponse.json({ error: "Failed to communicate with AI provider." }, { status: 502 });
        }

        const data = await response.json();
        const insights = data.choices?.[0]?.message?.content?.trim();

        if (!insights) {
            return NextResponse.json({ error: "AI returned an empty response." }, { status: 500 });
        }

        return NextResponse.json({ insights });

    } catch (error) {
        console.error("AI Insights Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred processing your request." }, { status: 500 });
    }
}
