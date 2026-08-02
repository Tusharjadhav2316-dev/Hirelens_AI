import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { CAREER_COACH_SYSTEM_PROMPT, CAREER_COACH_MODEL_PARAMS } from "@/lib/promptTemplates";
import { ChatMessage, trimConversationHistory, buildJDContextBlock } from "@/lib/careerCoachService";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Explicitly restrict client message roles to user and assistant (no client system messages)
const CLIENT_MESSAGE_ROLES = ["user", "assistant"];

/**
 * Safely parses a single OpenRouter Server-Sent Events (SSE) data line.
 * Returns the extracted token string or null if line is not a valid token payload.
 */
function parseOpenRouterSSEToken(line: string): string | null {
    const trimmedLine = line.trim();
    if (!trimmedLine.startsWith("data: ")) return null;

    const dataStr = trimmedLine.substring(6).trim();
    if (dataStr === "[DONE]") return null;

    try {
        const parsed = JSON.parse(dataStr);
        const token = parsed.choices?.[0]?.delta?.content;
        return typeof token === "string" ? token : null;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    // 1. Authentication check via Firebase Admin SDK
    try {
        await verifyAuth(req);
    } catch (authError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check OpenRouter API key configuration
    if (!OPENROUTER_API_KEY) {
        return NextResponse.json({ error: "OpenRouter API key is not configured." }, { status: 500 });
    }

    // 3. Parse and validate request body
    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
    }

    const { messages, resumeContext, atsContext, jobDescription } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: "Messages array is required and cannot be empty." }, { status: 400 });
    }

    for (const msg of messages) {
        if (!msg || typeof msg !== "object" || !CLIENT_MESSAGE_ROLES.includes(msg.role) || typeof msg.content !== "string") {
            return NextResponse.json(
                { error: "Each message must have a valid role ('user' or 'assistant') and string content." },
                { status: 400 }
            );
        }
        if (msg.content.length > 4000) {
            return NextResponse.json({ error: "Message content exceeds the 4000 character limit." }, { status: 400 });
        }
    }

    if (resumeContext !== undefined && typeof resumeContext !== "string") {
        return NextResponse.json({ error: "Resume context must be a string." }, { status: 400 });
    }

    if (atsContext !== undefined && typeof atsContext !== "string") {
        return NextResponse.json({ error: "ATS context must be a string." }, { status: 400 });
    }

    if (jobDescription !== undefined && (typeof jobDescription !== "string" || jobDescription.length > 5000)) {
        return NextResponse.json({ error: "Job description must be a string under 5000 characters." }, { status: 400 });
    }

    // 4. Build system context string
    let systemContent = CAREER_COACH_SYSTEM_PROMPT;
    if (resumeContext && resumeContext.trim().length > 0) {
        systemContent += "\n\n" + resumeContext.trim();
    }
    if (atsContext && atsContext.trim().length > 0) {
        systemContent += "\n\n" + atsContext.trim();
    }
    if (jobDescription && typeof jobDescription === "string" && jobDescription.trim().length >= 20) {
        const jdBlock = buildJDContextBlock(jobDescription);
        if (jdBlock) {
            systemContent += "\n\n" + jdBlock;
        }
    }

    // 5. Trim conversation history (server-side enforcement: 8 turns max)
    const trimmedMessages = trimConversationHistory(messages as ChatMessage[], 8);

    // 6. Build OpenRouter messages array
    const openRouterMessages = [
        { role: "system", content: systemContent },
        ...trimmedMessages.map(msg => ({ role: msg.role, content: msg.content }))
    ];


    // 7. Call OpenRouter AI (streaming mode)
    let openRouterResponse: Response;
    try {
        openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                stream: true,
                ...CAREER_COACH_MODEL_PARAMS,
                messages: openRouterMessages,
            })
        });
    } catch (networkError) {
        console.error("OpenRouter connection error:", networkError);
        return NextResponse.json({ error: "Failed to connect to AI provider." }, { status: 502 });
    }

    if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        console.error("OpenRouter API Failed:", openRouterResponse.status, errorText);

        if (openRouterResponse.status === 429) {
            return NextResponse.json({ error: "Rate limit exceeded. Please try again in a few moments." }, { status: 429 });
        }
        return NextResponse.json({ error: "Failed to communicate with AI provider." }, { status: 502 });
    }

    if (!openRouterResponse.body) {
        return NextResponse.json({ error: "Failed to communicate with AI provider." }, { status: 502 });
    }

    // 8. Pipe streaming response using native ReadableStream
    const reader = openRouterResponse.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readable = new ReadableStream({
        async start(controller) {
            let buffer = "";

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const token = parseOpenRouterSSEToken(line);
                        if (token) {
                            controller.enqueue(encoder.encode(token));
                        }
                    }
                }

                // Flush remaining buffer
                const remainingToken = parseOpenRouterSSEToken(buffer);
                if (remainingToken) {
                    controller.enqueue(encoder.encode(remainingToken));
                }
            } catch (err) {
                console.error("Stream reader error:", err);
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });

    // 9. Return streaming text response
    return new Response(readable, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff"
        }
    });
}
