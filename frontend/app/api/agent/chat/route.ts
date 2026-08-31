import crypto from "crypto";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { checkAndIncrementUsage, DAILY_AGENT_REQUEST_LIMIT } from "@/lib/agentUsageService";

/**
 * Generates a signed HS256 JWT for internal service-to-service authentication.
 * Payload contains only { uid, sub, iat, exp } and expires in 60 seconds.
 */
function signInternalJwt(uid: string, secret: string): string {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        uid,
        sub: uid,
        iat: now,
        exp: now + 60,
    };

    const base64UrlEncode = (obj: object) =>
        Buffer.from(JSON.stringify(obj)).toString("base64url");

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
        .createHmac("sha256", secret)
        .update(dataToSign)
        .digest("base64url");

    return `${dataToSign}.${signature}`;
}

export async function POST(req: Request) {
    // 1. Verify caller's Firebase ID token
    let decodedUser: { uid: string };
    try {
        decodedUser = await verifyAuth(req);
    } catch (authError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!decodedUser || !decodedUser.uid) {
        return NextResponse.json({ error: "Unauthorized: Invalid identity claim" }, { status: 401 });
    }

    // 2. Atomic server-side rate-limit check (50 requests/day ceiling)
    const { allowed, count } = await checkAndIncrementUsage(decodedUser.uid);
    if (!allowed) {
        return NextResponse.json(
            { error: `Daily AI agent request limit reached (${DAILY_AGENT_REQUEST_LIMIT} requests/day). Please try again tomorrow.` },
            { status: 429 }
        );
    }

    // 3. Validate internal service secret configuration
    const secret = process.env.INTERNAL_AGENT_JWT_SECRET;
    if (!secret || !secret.trim()) {
        console.error("Internal Auth Error: INTERNAL_AGENT_JWT_SECRET is not configured server-side.");
        return NextResponse.json(
            { error: "Server configuration error: missing internal authentication secret." },
            { status: 500 }
        );
    }

    // 4. Resolve target Python agent service URL
    const agentServiceUrl = process.env.AGENT_SERVICE_URL || "http://127.0.0.1:8000";

    // 5. Mint 60-second HS256 JWT carrying the verified Firebase UID
    const internalJwt = signInternalJwt(decodedUser.uid, secret.trim());

    // 5. Read incoming request body safely to forward
    let requestBodyText = "";
    try {
        requestBodyText = await req.text();
    } catch (readErr) {
        console.error("Failed to read request body:", readErr);
        return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    // 6. Upstream proxy request with timeout safety (15 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let upstreamResponse: Response;
    try {
        const targetUrl = `${agentServiceUrl.replace(/\/$/, "")}/chat`;
        upstreamResponse = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Internal-Auth": internalJwt,
            },
            body: requestBodyText || "{}",
            signal: controller.signal,
        });
    } catch (networkError: any) {
        clearTimeout(timeoutId);
        const isAbort = networkError.name === "AbortError";
        console.error(
            "Agent Service Proxy Connection Error:",
            isAbort ? "Request timed out after 15s" : networkError.message
        );
        return NextResponse.json(
            { error: "Agent service is currently unavailable." },
            { status: 502 }
        );
    } finally {
        clearTimeout(timeoutId);
    }

    // 7. Check for upstream HTTP error responses
    if (!upstreamResponse.ok) {
        console.error(
            `Agent service returned upstream HTTP error: status ${upstreamResponse.status}`
        );
        return NextResponse.json(
            { error: "Agent service returned an error response." },
            { status: upstreamResponse.status >= 400 && upstreamResponse.status < 600 ? upstreamResponse.status : 502 }
        );
    }

    if (!upstreamResponse.body) {
        console.error("Agent service returned an empty response body.");
        return NextResponse.json(
            { error: "Agent service returned an empty stream." },
            { status: 502 }
        );
    }

    // 8. Stream NDJSON response back to client unmodified
    return new Response(upstreamResponse.body, {
        headers: {
            "Content-Type": "application/x-ndjson",
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
