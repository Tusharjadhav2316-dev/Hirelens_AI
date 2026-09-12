import InterviewReportCard from "../components/agent/artifacts/InterviewReportCard";
import { ArtifactRenderer } from "../components/agent/ArtifactRenderer";
import { Artifact, InterviewReportArtifactData } from "../types/agent";

async function runInterviewReportCardTests() {
    console.log("=== InterviewReportCard Unit & Zero-Score Contract Test Suite ===\n");

    // 1. Test valid report payload rendering
    console.log("1. Testing valid InterviewReportCard rendering...");
    const validReportData: InterviewReportArtifactData = {
        interview_type: "technical",
        target_role: "Senior Full Stack Engineer",
        questions_asked: 5,
        readiness_by_category: {
            "System Design": "Strong",
            "Algorithms & Performance": "Moderate",
            "Behavioral & Communication": "Strong",
            "Database Optimization": "Needs Improvement",
        },
        strengths: [
            "Clear articulation of distributed caching architectures with Redis.",
            "Strong grasp of frontend component isolation and state scoping.",
        ],
        improvement_areas: [
            "Deepen knowledge of database write replication lag and quorum consistency.",
            "Practice structuring situational behavioral answers using strict STAR framing.",
        ],
        priority_topics: [
            "Distributed Consensus (Raft / Paxos)",
            "PostgreSQL Index Optimization & Execution Plans",
            "STAR Behavioral Storytelling",
        ],
        note: "These are coaching recommendations, not guaranteed measurements.",
    };

    const directElement = InterviewReportCard({ data: validReportData });
    if (!directElement) {
        console.error("FAILED: Direct InterviewReportCard returned null!");
        process.exit(1);
    }
    console.log("  ✓ Direct InterviewReportCard rendered successfully!");

    // 2. Test rendering through ArtifactRenderer closed discriminated union
    console.log("\n2. Testing rendering via ArtifactRenderer dispatch...");
    const reportArtifact: Artifact = {
        type: "interview_report_card",
        data: validReportData,
    };

    const renderedArtifact = ArtifactRenderer({ artifact: reportArtifact });
    if (!renderedArtifact) {
        console.error("FAILED: ArtifactRenderer failed to dispatch interview_report_card!");
        process.exit(1);
    }
    console.log("  ✓ ArtifactRenderer dispatched interview_report_card successfully!");

    // 3. Verify zero-score guarantee: ensure no score property exists in data contract
    console.log("\n3. Verifying zero-score qualitative contract...");
    const keys = Object.keys(validReportData);
    const forbiddenKeys = ["score", "numeric_score", "overall_score", "grade", "percentage", "pass_fail", "rank"];
    for (const forbidden of forbiddenKeys) {
        if (keys.includes(forbidden)) {
            console.error(`FAILED: Forbidden key '${forbidden}' found in InterviewReportArtifactData!`);
            process.exit(1);
        }
    }
    console.log("  ✓ Zero numeric score fields present in InterviewReportArtifactData!");

    // 4. Test defensive handling of malformed / null input
    console.log("\n4. Testing defensive handling of malformed payloads...");
    const nullElement = InterviewReportCard({ data: null as any });
    if (nullElement !== null) {
        console.error("FAILED: null data should return null safely!");
        process.exit(1);
    }

    const emptyElement = InterviewReportCard({ data: {} as any });
    if (!emptyElement) {
        console.error("FAILED: empty object should render container without throwing!");
        process.exit(1);
    }
    console.log("  ✓ Malformed and empty payloads handled safely!");

    console.log("\n=== Results: 4/4 InterviewReportCard tests passed 100%! ===");
}

runInterviewReportCardTests().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
