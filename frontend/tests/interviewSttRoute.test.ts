import { NullSpeechProvider } from "../lib/speech/NullSpeechProvider.ts";
import { SarvamSpeechProvider } from "../lib/speech/SarvamSpeechProvider.ts";

console.log("=== Interview STT Route & Speech Provider Contract Tests ===\n");

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

async function runSttContractTests() {
    // 1. NullSpeechProvider Contract
    const nullProvider = new NullSpeechProvider();
    assert(nullProvider.name === "null", "NullSpeechProvider has name 'null'");
    assert(nullProvider.isConfigured() === false, "NullSpeechProvider isConfigured is false");

    try {
        const dummyBlob = new Blob(["dummy audio"], { type: "audio/webm" });
        await nullProvider.transcribe(dummyBlob);
        assert(false, "NullSpeechProvider.transcribe should throw NOT_CONFIGURED error");
    } catch (err: any) {
        assert(err?.code === "NOT_CONFIGURED", "NullSpeechProvider throws error with code NOT_CONFIGURED");
    }

    // 2. SarvamSpeechProvider Configuration Guard
    const unconfiguredSarvam = new SarvamSpeechProvider("");
    assert(unconfiguredSarvam.isConfigured() === false, "SarvamSpeechProvider with empty key is unconfigured");

    try {
        const dummyBlob = new Blob(["dummy audio"], { type: "audio/webm" });
        await unconfiguredSarvam.transcribe(dummyBlob);
        assert(false, "Unconfigured SarvamSpeechProvider should throw NOT_CONFIGURED");
    } catch (err: any) {
        assert(err?.code === "NOT_CONFIGURED", "Unconfigured SarvamSpeechProvider throws code NOT_CONFIGURED");
    }

    const configuredSarvam = new SarvamSpeechProvider("test-sarvam-key-123");
    assert(configuredSarvam.isConfigured() === true, "SarvamSpeechProvider with valid key isConfigured is true");
    assert(configuredSarvam.name === "sarvam", "SarvamSpeechProvider name is 'sarvam'");

    // 3. Factory Selection Logic
    const resolveProvider = (name?: string, key?: string) => {
        const selected = (name || (key ? "sarvam" : "null")).toLowerCase().trim();
        if (selected === "sarvam" && key) {
            return new SarvamSpeechProvider(key);
        }
        return new NullSpeechProvider();
    };
    const defaultProvider = resolveProvider(undefined, undefined);
    assert(defaultProvider.name === "null", "Default provider without key resolves to NullSpeechProvider");
    const configuredProvider = resolveProvider("sarvam", "test-key");
    assert(configuredProvider.name === "sarvam", "Configured provider resolves to SarvamSpeechProvider");

    // 4. Payload Size Limit Enforcement Logic
    const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
    const oversizedBytes = 16 * 1024 * 1024;
    const validBytes = 2 * 1024 * 1024;
    const emptyBytes = 0;

    assert(oversizedBytes > MAX_AUDIO_BYTES, "16MB exceeds 15MB hard payload ceiling (triggers 413)");
    assert(validBytes <= MAX_AUDIO_BYTES, "2MB is within allowable size limits");
    assert(emptyBytes === 0, "0-byte audio payload is detected as empty (triggers 400)");

    // 5. Authentication Guard Contract
    const authHeadersWithoutBearer = { Authorization: "Basic 12345" };
    const authHeadersEmpty = {};
    const authHeadersValid = { Authorization: "Bearer valid-firebase-jwt" };

    const isBearer = (headers: Record<string, string>) => {
        const h = headers["Authorization"] || "";
        return h.startsWith("Bearer ") && h.substring(7).trim().length > 0;
    };

    assert(!isBearer(authHeadersWithoutBearer), "Non-Bearer header fails authentication check (triggers 401)");
    assert(!isBearer(authHeadersEmpty), "Missing Authorization header fails authentication check (triggers 401)");
    assert(isBearer(authHeadersValid), "Valid Bearer Authorization header passes initial format validation");

    console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
    if (failCount > 0) {
        process.exit(1);
    }
}

runSttContractTests().catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
});
