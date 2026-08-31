import crypto from "crypto";
import { verifyAuth } from "@/lib/verifyAuth";

export interface DecodedInternalJwt {
    uid: string;
    sub?: string;
    iat?: number;
    exp?: number;
}

/**
 * Verifies an internal JWT passed in the X-Internal-Auth header.
 * Secret is process.env.INTERNAL_AGENT_JWT_SECRET.
 * Strict rules:
 * - Reject if header missing or empty token
 * - Reject if algorithm != HS256
 * - Reject if signature invalid
 * - Reject if expired
 * - Reject if missing uid or sub
 * - Reject if uid !== sub
 */
export function verifyInternalJwt(req: Request): { uid: string } {
    const authHeader = req.headers.get("X-Internal-Auth") || req.headers.get("x-internal-auth");
    if (!authHeader || !authHeader.trim()) {
        throw new Error("Missing required authentication header: X-Internal-Auth");
    }

    let token = authHeader.trim();
    if (token.toLowerCase().startsWith("bearer ")) {
        token = token.substring(7).trim();
    }

    if (!token) {
        throw new Error("Authentication token is empty");
    }

    const secret = process.env.INTERNAL_AGENT_JWT_SECRET;
    if (!secret || !secret.trim()) {
        throw new Error("Server configuration error: INTERNAL_AGENT_JWT_SECRET is missing");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
        throw new Error("Invalid JWT token format");
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode header & check alg
    let header: { alg?: string; typ?: string };
    try {
        header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf-8"));
    } catch {
        throw new Error("Invalid token header format");
    }

    if (header.alg !== "HS256") {
        throw new Error(`Invalid algorithm: expected HS256, got ${header.alg}`);
    }

    // Verify HMAC-SHA256 signature
    const dataToSign = `${headerB64}.${payloadB64}`;
    const expectedSignature = crypto
        .createHmac("sha256", secret.trim())
        .update(dataToSign)
        .digest("base64url");

    const sigBuffer = Buffer.from(signatureB64);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        throw new Error("Invalid internal authentication signature");
    }

    // Decode payload
    let payload: DecodedInternalJwt;
    try {
        payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    } catch {
        throw new Error("Invalid token payload format");
    }

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
        throw new Error("Internal authentication token has expired");
    }

    const uid = payload.uid?.trim();
    const sub = payload.sub?.trim();

    if (!uid || !sub) {
        throw new Error("Malformed token: missing uid or sub claim");
    }

    if (uid !== sub) {
        throw new Error("Malformed token: uid and sub claims do not match");
    }

    return { uid };
}

/**
 * Dual authentication helper:
 * IF X-Internal-Auth header EXISTS:
 *   Verify strictly via verifyInternalJwt.
 *   If invalid -> throw error (DO NOT fall back to Firebase).
 * IF X-Internal-Auth header DOES NOT EXIST:
 *   Fall back to standard verifyAuth(req) (Firebase token verification).
 */
export async function verifyAuthOrInternalJwt(req: Request): Promise<{ uid: string }> {
    const hasInternalHeader = req.headers.has("X-Internal-Auth") || req.headers.has("x-internal-auth");

    if (hasInternalHeader) {
        // Must verify strictly — do not fall back to Firebase on failure!
        return verifyInternalJwt(req);
    }

    // Fall back to standard Firebase ID token authentication
    const decodedFirebaseToken = await verifyAuth(req);
    return { uid: decodedFirebaseToken.uid };
}
