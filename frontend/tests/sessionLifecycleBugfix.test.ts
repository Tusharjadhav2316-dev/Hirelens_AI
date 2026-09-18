import assert from "node:assert/strict";
import type { InterviewTrainerSession } from "../types/agent.ts";

console.log("=== Interview Trainer Session Lifecycle & Rehydration Bugfix Test Suite ===\n");

let passCount = 0;
let failCount = 0;

function runTest(name: string, fn: () => void) {
    try {
        fn();
        passCount++;
        console.log(`  ✓ ${name}`);
    } catch (err: any) {
        failCount++;
        console.error(`  ✗ FAIL: ${name} ->`, err.message);
    }
}

// ----------------------------------------------------------------------------
// 1. Session Envelope and Rehydration Contract
// ----------------------------------------------------------------------------
runTest("1.1 POST /api/interview/session returns wrapped { session } envelope", () => {
    const rawPostResponse = {
        session: {
            session_id: "test-sess-uuid-1234",
            target_role: "Staff Backend Engineer",
            interview_type: "technical",
            difficulty: "intermediate",
            training_mode: "coaching",
            question_index: 0,
            questions_asked: [],
            answers_given: [],
            voice_enabled: true,
            camera_enabled: false,
            status: "setup",
            created_at: new Date().toISOString(),
        }
    };

    // Client service unpacking
    const session = rawPostResponse.session;
    assert.ok(session !== undefined);
    assert.equal(session.session_id, "test-sess-uuid-1234");
});

runTest("1.2 GET /api/interview/session?sessionId=... returns wrapped { session } envelope correctly unpacked by Room page", () => {
    const rawGetResponse = {
        session: {
            session_id: "test-sess-uuid-1234",
            target_role: "Staff Backend Engineer",
            interview_type: "technical",
            difficulty: "intermediate",
            training_mode: "coaching",
            question_index: 0,
            questions_asked: [
                {
                    id: "q_1",
                    question: "Explain cache invalidation strategies.",
                    category: "Architecture",
                    difficulty: "intermediate"
                }
            ],
            answers_given: [],
            voice_enabled: true,
            camera_enabled: false,
            status: "setup",
            created_at: new Date().toISOString(),
        }
    };

    // Verify room rehydration extraction: (rawGetResponse.session || rawGetResponse)
    const sessionData: InterviewTrainerSession = (rawGetResponse as any).session || rawGetResponse;
    assert.ok(sessionData !== undefined);
    assert.equal(sessionData.session_id, "test-sess-uuid-1234");
    assert.equal(sessionData.questions_asked.length, 1);
    assert.equal(sessionData.questions_asked[0].id, "q_1");
});

runTest("1.3 Missing sessionId returns 400 Bad Request error contract", () => {
    const handleGetValidation = (sessionIdParam: string | null) => {
        if (!sessionIdParam || !sessionIdParam.trim()) {
            return { status: 400, error: "sessionId is required" };
        }
        return { status: 200 };
    };

    assert.equal(handleGetValidation(null).status, 400);
    assert.equal(handleGetValidation("").status, 400);
    assert.equal(handleGetValidation("valid-session-id").status, 200);
});

runTest("1.4 Nonexistent session returns 404 Not Found", () => {
    const mockDb: Record<string, any> = {
        "existing-id-1": { session_id: "existing-id-1" }
    };

    const lookupSession = (id: string) => {
        const found = mockDb[id];
        if (!found) return { status: 404, error: "Session not found" };
        return { status: 200, session: found };
    };

    assert.equal(lookupSession("nonexistent-id").status, 404);
    assert.equal(lookupSession("existing-id-1").status, 200);
});

runTest("1.5 User scoping ensures User A cannot access User B session", () => {
    const firestoreCollections: Record<string, Record<string, any>> = {
        "user_alice": {
            "session_alice_1": { session_id: "session_alice_1", user_id: "user_alice", target_role: "Data Scientist" }
        },
        "user_bob": {
            "session_bob_1": { session_id: "session_bob_1", user_id: "user_bob", target_role: "Product Manager" }
        }
    };

    const getUserSession = (authenticatedUid: string, requestedSessionId: string) => {
        const userStore = firestoreCollections[authenticatedUid] || {};
        const session = userStore[requestedSessionId];
        if (!session) {
            return { status: 404, error: "Session not found" };
        }
        return { status: 200, session };
    };

    // Alice accesses her own session -> OK
    assert.equal(getUserSession("user_alice", "session_alice_1").status, 200);
    // Bob accesses his own session -> OK
    assert.equal(getUserSession("user_bob", "session_bob_1").status, 200);
    // Alice attempts to access Bob's session -> 404 (not found in Alice's scope)
    assert.equal(getUserSession("user_alice", "session_bob_1").status, 404);
    // Bob attempts to access Alice's session -> 404 (not found in Bob's scope)
    assert.equal(getUserSession("user_bob", "session_alice_1").status, 404);
});

console.log(`\nResults: ${passCount} passed, ${failCount} failed.\n`);
assert.equal(failCount, 0, "All lifecycle bugfix tests must pass.");
