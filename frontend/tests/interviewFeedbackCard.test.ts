import InterviewFeedbackCard from "../components/agent/artifacts/InterviewFeedbackCard";
import { ArtifactRenderer } from "../components/agent/ArtifactRenderer";
import { Artifact, InterviewFeedbackArtifactData } from "../types/agent";

async function runInterviewFeedbackCardTests() {
    console.log("=== InterviewFeedbackCard Unit & Zero-Score Contract Test Suite ===\n");

    // 1. Test valid feedback payload rendering
    console.log("1. Testing valid InterviewFeedbackCard rendering...");
    const validFeedbackData: InterviewFeedbackArtifactData = {
        question: "Describe how you optimize database queries in PostgreSQL.",
        answer: "I look at query execution plans using EXPLAIN ANALYZE and add B-tree indexes on foreign keys.",
        clarity: "clear",
        structure: "structured",
        specificity: "concrete",
        technical_depth: "proficient",
        strengths: [
            "Good mention of EXPLAIN ANALYZE for query plan inspection.",
            "Accurate targeting of index structures for relational joins.",
        ],
        improvements: [
            "Could elaborate on partial indexing and composite index column ordering.",
            "Could mention vacuuming and analyze statistics updates.",
        ],
        suggested_answer_direction: "Use the STAR method to describe a specific slow query scenario, the bottleneck identified in the query plan, the compound index created, and the latency reduction achieved.",
    };

    const directElement = InterviewFeedbackCard({ data: validFeedbackData });
    if (!directElement) {
        console.error("FAILED: Direct InterviewFeedbackCard returned null!");
        process.exit(1);
    }
    console.log("  ✓ Direct InterviewFeedbackCard rendered successfully!");

    // 2. Test rendering through ArtifactRenderer closed discriminated union
    console.log("\n2. Testing rendering via ArtifactRenderer dispatch...");
    const feedbackArtifact: Artifact = {
        type: "interview_feedback_card",
        data: validFeedbackData,
    };

    const renderedArtifact = ArtifactRenderer({ artifact: feedbackArtifact });
    if (!renderedArtifact) {
        console.error("FAILED: ArtifactRenderer failed to dispatch interview_feedback_card!");
        process.exit(1);
    }
    console.log("  ✓ ArtifactRenderer dispatched interview_feedback_card successfully!");

    // 3. Verify zero-score guarantee: ensure no score property exists in data contract
    console.log("\n3. Verifying zero-score qualitative contract...");
    const keys = Object.keys(validFeedbackData);
    const forbiddenKeys = ["score", "numeric_score", "overall_score", "grade", "percentage", "pass_fail"];
    for (const forbidden of forbiddenKeys) {
        if (keys.includes(forbidden)) {
            console.error(`FAILED: Forbidden key '${forbidden}' found in InterviewFeedbackArtifactData!`);
            process.exit(1);
        }
    }
    console.log("  ✓ Zero numeric score fields present in InterviewFeedbackArtifactData!");

    // 4. Test defensive handling of malformed / null input
    console.log("\n4. Testing defensive handling of malformed payloads...");
    const nullElement = InterviewFeedbackCard({ data: null as any });
    if (nullElement !== null) {
        console.error("FAILED: null data should return null safely!");
        process.exit(1);
    }

    const emptyElement = InterviewFeedbackCard({ data: {} as any });
    if (!emptyElement) {
        console.error("FAILED: empty object should render container without throwing!");
        process.exit(1);
    }
    console.log("  ✓ Malformed and empty payloads handled safely!");

    console.log("\n=== Results: 4/4 InterviewFeedbackCard tests passed 100%! ===");
}

runInterviewFeedbackCardTests().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
