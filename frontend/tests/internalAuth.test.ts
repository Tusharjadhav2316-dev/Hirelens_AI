import crypto from "crypto";
import { verifyInternalJwt, verifyAuthOrInternalJwt } from "../lib/verifyInternalJwt.ts";

console.log("=== Internal JWT & Dual Auth Test Suite ===\n");

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
    if (condition) {
        passCount++;
        console.log(`  ✓ ${message}`);
    } else {
        failCount++;
        console.error(`  ✗ FAIL: ${message}`);
    }
}

const TEST_SECRET = "test_internal_jwt_secret_32_bytes_long_12345";
process.env.INTERNAL_AGENT_JWT_SECRET = TEST_SECRET;

function mintJwt(payloadObj: object, secret: string = TEST_SECRET, alg: string = "HS256"): string {
    const header = { alg, typ: "JWT" };
    const base64UrlEncode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payloadObj);
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac("sha256", secret).update(dataToSign).digest("base64url");
    return `${dataToSign}.${signature}`;
}

async function runTests() {
    const now = Math.floor(Date.now() / 1000);

    // 1. Valid Token
    try {
        const token = mintJwt({ uid: "user_abc", sub: "user_abc", iat: now, exp: now + 60 });
        const req = new Request("http://localhost:3000/api/internal/ats-score", {
            headers: { "X-Internal-Auth": token }
        });
        const res = verifyInternalJwt(req);
        assert(res.uid === "user_abc", "Valid token correctly extracts uid='user_abc'");
    } catch (e: any) {
        assert(false, `Valid token threw error: ${e.message}`);
    }

    // 2. Missing Header
    try {
        const req = new Request("http://localhost:3000/api/internal/ats-score");
        verifyInternalJwt(req);
        assert(false, "Missing header should throw 401 error");
    } catch (e: any) {
        assert(e.message.includes("Missing required authentication header"), "Missing header throws clear error");
    }

    // 3. Expired Token
    try {
        const token = mintJwt({ uid: "user_abc", sub: "user_abc", iat: now - 120, exp: now - 60 });
        const req = new Request("http://localhost:3000/api/internal/ats-score", {
            headers: { "X-Internal-Auth": token }
        });
        verifyInternalJwt(req);
        assert(false, "Expired token should throw error");
    } catch (e: any) {
        assert(e.message.includes("expired"), "Expired token throws expired error");
    }

    // 4. Mismatched uid and sub
    try {
        const token = mintJwt({ uid: "user_abc", sub: "user_xyz", iat: now, exp: now + 60 });
        const req = new Request("http://localhost:3000/api/internal/ats-score", {
            headers: { "X-Internal-Auth": token }
        });
        verifyInternalJwt(req);
        assert(false, "Mismatched uid/sub should throw error");
    } catch (e: any) {
        assert(e.message.includes("do not match"), "Mismatched uid/sub throws error");
    }

    // 5. Wrong Secret
    try {
        const token = mintJwt({ uid: "user_abc", sub: "user_abc", iat: now, exp: now + 60 }, "wrong_secret_12345678901234567890");
        const req = new Request("http://localhost:3000/api/internal/ats-score", {
            headers: { "X-Internal-Auth": token }
        });
        verifyInternalJwt(req);
        assert(false, "Wrong secret should throw signature error");
    } catch (e: any) {
        assert(e.message.includes("signature"), "Wrong secret throws signature error");
    }

    // 6. Dual Auth - Invalid Internal Header does NOT fall back
    try {
        const invalidToken = mintJwt({ uid: "user_abc", sub: "user_abc", iat: now - 120, exp: now - 60 });
        const req = new Request("http://localhost:3000/api/ai-improve", {
            headers: { "X-Internal-Auth": invalidToken, "Authorization": "Bearer fake_firebase_token" }
        });
        await verifyAuthOrInternalJwt(req);
        assert(false, "Invalid X-Internal-Auth header must NOT fall back to Firebase auth");
    } catch (e: any) {
        assert(e.message.includes("expired"), "Invalid internal header fails immediately without fallback");
    }

    console.log(`\n=== Results: ${passCount} passed, ${failCount} failed ===`);
    if (failCount > 0) process.exit(1);
    else process.exit(0);
}

runTests();
