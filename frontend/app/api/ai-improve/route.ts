import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { RESUME_OPTIMIZER_PERSONA, HALLUCINATION_GUARDRAIL, OUTPUT_FORMAT_PLAIN } from "@/lib/promptTemplates";

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
        const { section, content, jobDescription } = body;

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

        // 2. Construct Prompt dynamically
        let userPrompt = "";
        if (section === "summary") {
            userPrompt = `Rewrite the professional summary to be concise (max 80 words), ATS-optimized, achievement-driven, and impactful. Preserve meaning:\n\n${content}`;
        } else if (section === "experience") {
            userPrompt = `Rewrite the experience content to:\n- Use strong action verbs\n- Add quantifiable impact where possible\n- Be concise\n- Preserve original intent\n- Avoid fabricating data\n\n${content}`;
        } else if (section === "projects") {
            userPrompt = `Rewrite the project description to:\n- Emphasize results and technical clarity\n- Improve keyword richness\n- Maintain professionalism\n- Do not fabricate metrics\n\n${content}`;
        } else if (section === "achievements") {
            userPrompt = `Rewrite this achievement entry to:\n- Lead with a strong, specific action verb\n- Emphasize measurable impact and tangible results\n- Be concise and recruiter-focused (aim for 1-3 sentences)\n- Preserve all factual content; do not invent or fabricate metrics or outcomes\n\n${content}`;
        } else if (section === "certifications") {
            userPrompt = `Review this certification entry and provide a single professional sentence explaining what this certification demonstrates to a recruiter — its relevance, the skill it validates, and the level of expertise implied. Do not modify the certification name, issuer, or year. Only add professional context.\n\n${content}`;
        }

        if (jobDescription && typeof jobDescription === "string" && jobDescription.trim().length > 0) {
            userPrompt += "\n\nTarget Job Context (tailor this rewrite for the following role):\n" + jobDescription.substring(0, 1000);
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
