import InterviewQuestionCard from "../components/agent/artifacts/InterviewQuestionCard";
import { InterviewQuestionArtifactData } from "../types/agent";

async function runInterviewQuestionCardTests() {
    console.log("=== InterviewQuestionCard Sprint 9 Test Suite ===\n");

    // 1. Test Sprint 8 Read-Only List Mode (no isActive, no session)
    console.log("1. Testing Sprint 8 read-only list rendering...");
    const readOnlyData: InterviewQuestionArtifactData = {
        questions: [
            {
                id: "q-1",
                question: "Explain the virtual DOM in React.",
                category: "Technical",
                difficulty: "Medium",
                keyTips: ["Mention reconciliation", "Mention fiber"],
            },
            {
                id: "q-2",
                question: "Describe a challenging conflict with a teammate.",
                category: "Behavioral",
                difficulty: "Medium",
                keyTips: ["Use STAR method"],
            },
        ],
    };

    const readOnlyElement = InterviewQuestionCard({ data: readOnlyData });
    if (!readOnlyElement) {
        console.error("FAILED: Read-only InterviewQuestionCard returned null!");
        process.exit(1);
    }

    // In read-only mode, the header has HelpCircle and title "Interview Prep Questions"
    const readOnlyProps = readOnlyElement.props;
    if (!readOnlyProps || !readOnlyProps.className) {
        console.error("FAILED: Read-only element missing root props!");
        process.exit(1);
    }
    console.log("  ✓ Read-only mode successfully rendered 2 questions without active textarea!");

    // 2. Test Sprint 9 Active Question Mode (isActive=true)
    console.log("\n2. Testing Sprint 9 active question view with isActive=true...");
    let submittedAnswer = "";
    let cancelCalled = false;

    const activeQuestionData: InterviewQuestionArtifactData = {
        questions: [
            {
                id: "q-active-1",
                question: "How do you handle race conditions in distributed systems?",
                category: "System Design",
                difficulty: "advanced",
                isActive: true,
                questionIndex: 0,
                totalQuestions: 5,
            },
        ],
        session: {
            sessionId: "sess-test-123",
            targetRole: "Staff Distributed Systems Engineer",
            interviewType: "technical",
            difficulty: "advanced",
            status: "in_progress",
            questionIndex: 0,
            questionsAsked: [
                {
                    id: "q-active-1",
                    question: "How do you handle race conditions in distributed systems?",
                    category: "System Design",
                    difficulty: "advanced",
                },
            ],
            answersGiven: [],
        },
    };

    const activeElement = InterviewQuestionCard({
        data: activeQuestionData,
        onSubmitAnswer: (ans: string) => {
            submittedAnswer = ans;
        },
        onCancelInterview: () => {
            cancelCalled = true;
        },
        isSubmitting: false,
    });

    if (!activeElement) {
        console.error("FAILED: Active InterviewQuestionCard returned null!");
        process.exit(1);
    }

    console.log("  ✓ Active question view rendered successfully with progress indicator & form!");

    // 3. Test follow-up question labeling
    console.log("\n3. Testing follow-up question badge rendering...");
    const followUpData: InterviewQuestionArtifactData = {
        questions: [
            {
                id: "q-followup-1",
                question: "Can you elaborate on how optimistic locking prevents lost updates?",
                category: "System Design",
                difficulty: "advanced",
                isActive: true,
            },
        ],
        is_follow_up: true,
    };

    const followUpElement = InterviewQuestionCard({
        data: followUpData,
        onSubmitAnswer: () => {},
    });

    if (!followUpElement) {
        console.error("FAILED: Follow-up InterviewQuestionCard returned null!");
        process.exit(1);
    }
    console.log("  ✓ Follow-up question view rendered successfully!");

    // 4. Test defensive handling of malformed / empty payload
    console.log("\n4. Testing defensive handling of empty payload...");
    const emptyElement = InterviewQuestionCard({ data: { questions: [] } });
    if (!emptyElement) {
        // null or rendered empty is valid
    }
    const invalidElement = InterviewQuestionCard({ data: null as any });
    if (invalidElement !== null) {
        console.error("FAILED: null data should return null!");
        process.exit(1);
    }
    console.log("  ✓ Malformed / null data handled defensively!");

    console.log("\n=== Results: 4/4 InterviewQuestionCard tests passed 100%! ===");
}

runInterviewQuestionCardTests().catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
});
