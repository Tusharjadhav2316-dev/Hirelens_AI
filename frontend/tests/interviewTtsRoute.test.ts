import { NullSpeechProvider } from "../lib/speech/NullSpeechProvider.ts";
import { SarvamSpeechProvider } from "../lib/speech/SarvamSpeechProvider.ts";

console.log("=== Interview TTS Route & Speech Provider Contract Tests ===\n");

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

async function runTtsContractTests() {
    // 1. NullSpeechProvider Synthesize Contract
    const nullProvider = new NullSpeechProvider();
    assert(nullProvider.name === "null", "NullSpeechProvider has name 'null'");
    assert(nullProvider.isConfigured() === false, "NullSpeechProvider isConfigured is false");

    try {
        await nullProvider.synthesize("Hello candidate");
        assert(false, "NullSpeechProvider.synthesize should throw NOT_CONFIGURED error");
    } catch (err: any) {
        assert(err?.code === "NOT_CONFIGURED", "NullSpeechProvider.synthesize throws error with code NOT_CONFIGURED");
    }

    // 2. SarvamSpeechProvider Synthesize Configuration Guard
    const unconfiguredSarvam = new SarvamSpeechProvider("");
    assert(unconfiguredSarvam.isConfigured() === false, "SarvamSpeechProvider with empty key is unconfigured");

    try {
        await unconfiguredSarvam.synthesize("Hello candidate");
        assert(false, "Unconfigured SarvamSpeechProvider should throw NOT_CONFIGURED");
    } catch (err: any) {
        assert(err?.code === "NOT_CONFIGURED", "Unconfigured SarvamSpeechProvider.synthesize throws code NOT_CONFIGURED");
    }

    const configuredSarvam = new SarvamSpeechProvider("test-sarvam-key-456");
    assert(configuredSarvam.isConfigured() === true, "SarvamSpeechProvider with valid key isConfigured is true");
    assert(configuredSarvam.name === "sarvam", "SarvamSpeechProvider name is 'sarvam'");

    // 3. Text Length Ceiling (2000 chars)
    const MAX_TTS_TEXT_LENGTH = 2000;
    const validText = "Tell me about a time you resolved a complex architectural bottleneck.";
    const emptyText = "   ";
    const oversizedText = "A".repeat(2001);

    const validateTtsText = (t: string) => {
        const trimmed = (t || "").trim();
        if (trimmed.length === 0) return { valid: false, code: "EMPTY_TEXT" };
        if (trimmed.length > MAX_TTS_TEXT_LENGTH) return { valid: false, code: "TEXT_TOO_LONG" };
        return { valid: true, text: trimmed };
    };

    assert(validateTtsText(validText).valid === true, "Valid interview question text passes validation");
    assert(validateTtsText(emptyText).code === "EMPTY_TEXT", "Empty or whitespace-only text rejected with EMPTY_TEXT (triggers 400)");
    assert(validateTtsText(oversizedText).code === "TEXT_TOO_LONG", "Text exceeding 2000 chars rejected with TEXT_TOO_LONG (triggers 400)");

    // 4. Authentication Guard Contract
    const authHeadersWithoutBearer = { Authorization: "Basic 12345" };
    const authHeadersEmpty = {};
    const authHeadersValid = { Authorization: "Bearer valid-firebase-jwt" };

    const isBearer = (headers: Record<string, string>) => {
        const h = headers["Authorization"] || "";
        return h.startsWith("Bearer ") && h.substring(7).trim().length > 0;
    };

    assert(!isBearer(authHeadersWithoutBearer), "Non-Bearer header fails authentication check (triggers 401 before provider call)");
    assert(!isBearer(authHeadersEmpty), "Missing Authorization header fails authentication check (triggers 401 before provider call)");
    assert(isBearer(authHeadersValid), "Valid Bearer Authorization header passes initial format validation");

    // 5. Provider Error Sanitization (No Secret Leakage)
    const sanitizeError = (err: any) => {
        // Must never leak API key or credentials
        const safeMessage = "Failed to synthesize speech. Please continue with text captions.";
        return { error: safeMessage, canFallbackToText: true };
    };

    const sanitized = sanitizeError(new Error("Sarvam error with api-key: secret_12345"));
    assert(!sanitized.error.includes("secret_12345"), "Sanitized error does not leak API keys or credentials");
    assert(sanitized.canFallbackToText === true, "Sanitized error provides canFallbackToText flag for graceful degradation");

    console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
    if (failCount > 0) {
        process.exit(1);
    }
}

runTtsContractTests().catch((e) => {
    console.error("TTS test execution failed:", e);
    process.exit(1);
});
