import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
    if (!OPENROUTER_API_KEY) {
        return NextResponse.json({ error: "OpenRouter API key is not configured." }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { section, content } = body;

        // 1. Validate Input
        if (!content || typeof content !== "string" || content.trim() === "") {
            return NextResponse.json({ error: "Content cannot be empty." }, { status: 400 });
        }

        if (content.length > 2000) {
            return NextResponse.json({ error: "Content exceeds the 2000 character limit." }, { status: 400 });
        }

        const validSections = ["summary", "experience", "projects"];
        if (!section || !validSections.includes(section)) {
            return NextResponse.json({ error: "Invalid section specified." }, { status: 400 });
        }

        // 2. Construct Prompt dynamically
        let userPrompt = "";
        if (section === "summary") {
            userPrompt = `Rewrite the professional summary to be concise (max 80 words), ATS-optimized, achievement-driven, and impactful. Preserve meaning:\n\n${content}`;
        } else if (section === "experience") {
            userPrompt = `Rewrite the experience content to:\n- Use strong action verbs\n- Add quantifiable impact where possible\n- Be concise\n- Preserve original intent\n- Avoid fabricating data\n\n${content}`;
        } else if (section === "projects") {
            userPrompt = `Rewrite the project description to:\n- Emphasize results and technical clarity\n- Improve keyword richness\n- Maintain professionalism\n- Do not fabricate metrics\n\n${content}`;
        }

        // 3. Call OpenRouter AI
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
                        content: "You are a professional resume optimization assistant. Respond only with the improved content. No markdown. No explanations. Do NOT invent numbers, metrics, companies, achievements, or technologies that are not present in the original content. Only improve clarity, wording, and structure."
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
