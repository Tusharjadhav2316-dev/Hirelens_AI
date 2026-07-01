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
        const { action } = body;

        let prompt = "";

        if (action === "generate") {
            const { resumeText, customInput, jobTitle, companyName, jobDescription, tone } = body;

            if (!jobTitle || !companyName) {
                return NextResponse.json({ error: "Job title and company name are required." }, { status: 400 });
            }
            if (!resumeText && !customInput) {
                return NextResponse.json({ error: "Resume text or custom input is required." }, { status: 400 });
            }

            prompt = `
You are an expert executive career coach and cover letter writer.
Write a highly professional, engaging, and customized cover letter for a candidate applying to the position of "${jobTitle}" at "${companyName}".

Tone: ${tone || "Professional and Confident"}

Source Material:
${resumeText ? `Resume Context:\n${resumeText.substring(0, 3000)}...` : `Candidate Details:\n${customInput.substring(0, 3000)}`}

${jobDescription ? `Job Description:\n${jobDescription.substring(0, 3000)}` : ""}

Instructions:
1. Always follow this structured format:
   - Greeting (e.g., Dear Hiring Manager,)
   - Opening paragraph (hook the reader, express enthusiasm for the role and company)
   - Skills alignment paragraph (connect the candidate's core strengths to the role's requirements)
   - Impact paragraph (highlight 1-2 major achievements that prove value, use quantification if available)
   - Company alignment paragraph (explain why they want to work specifically at this company)
   - Closing paragraph (call to action, express eagerness to discuss further)
   - Signature (Sincerely, [Candidate Name])
2. Maintain a strict 300–450 word limit.
3. ${jobDescription ? "Extract key technical terms from the Job Description and ensure at least 3 are referenced naturally." : ""}
4. The tone must affect sentence strength, formality, and confidence level.
5. Avoid repetition. Avoid generic fluff phrases. Do NOT use fake placeholders like [Insert Insert] - write around it smoothly or infer from context if possible. If the candidate name is unknown from the text, use a generic signature like "Sincerely,\n[Your Name]".
6. Output ONLY the cover letter text. No markdown, no preambles, no conversational filler.
            `.trim();
        } else if (action === "improve" || action === "shorten" || action === "impactful") {
            const { currentText } = body;

            if (!currentText) {
                return NextResponse.json({ error: "Current text is required to improve." }, { status: 400 });
            }

            let modificationInstruction = "";
            if (action === "improve") {
                modificationInstruction = "Enhance the text with stronger verbs, better quantification, improved clarity, and sentence tightening. Do NOT rewrite completely; enhance and polish the existing structure.";
            } else if (action === "shorten") {
                modificationInstruction = "Shorten the text. Remove redundant words, fluff, and overly wordy sentences while maintaining the core message and professional tone.";
            } else if (action === "impactful") {
                modificationInstruction = "Make the text highly impactful. Use strong action verbs, emphasize results and metrics, and ensure the tone is confident and authoritative. Do not add fake facts, just elevate the presentation of existing ones.";
            }

            prompt = `
You are an expert editor and career coach.
Review and edit the following cover letter content based on the instruction below.

Instruction: ${modificationInstruction}

Current Text:
${currentText.substring(0, 4000)}

Output ONLY the edited cover letter text. Keep the same exact paragraph structure if possible. No markdown, no preambles, no conversational filler.
            `.trim();
        } else {
            return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
        }

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
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
            return NextResponse.json({ error: "AI returned an empty response." }, { status: 500 });
        }

        return NextResponse.json({ content });

    } catch (error) {
        console.error("Cover Letter AI Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred processing your request." }, { status: 500 });
    }
}
