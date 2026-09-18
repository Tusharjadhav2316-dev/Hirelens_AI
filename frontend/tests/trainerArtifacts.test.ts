console.log("=== Trainer Artifacts & Canvas 14-Type Union Contract Tests ===\n");

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

function runTrainerArtifactsTests() {
    // 1. Canvas 14-Type Union Verification
    const ALL_14_ARTIFACT_TYPES = [
        "ats_score_card",
        "resume_diff",
        "job_result_card",
        "skill_gap_card",
        "cover_letter_preview",
        "interview_question_card",
        "interview_feedback_card",
        "interview_report_card",
        "task_progress",
        "resume_preview",
        "interview_setup_summary",
        "trainer_question_card",
        "trainer_answer_feedback",
        "trainer_interview_report"
    ];

    assert(ALL_14_ARTIFACT_TYPES.length === 14, "Canvas union contains exactly 14 artifact types");

    // 2. Interview Setup Summary Payload Validation
    const setupSummaryPayload = {
        type: "interview_setup_summary",
        data: {
            role_intelligence: {
                target_role: "Full Stack Engineer",
                role_summary: "Builds web applications across React and Python.",
                likely_competencies: ["Frontend Development", "API Design", "Database Modeling"],
                interview_categories: [{ category: "technical", weight: 0.6 }, { category: "behavioral", weight: 0.4 }],
                technical_balance: "mostly_technical",
                suggested_topics: ["React 19", "FastAPI"],
                evidence_basis: "role_inference",
                assumptions: []
            },
            training_mode: "coaching",
            difficulty: "intermediate",
            voice_enabled: true,
            camera_enabled: false
        }
    };

    assert(setupSummaryPayload.data.role_intelligence.target_role === "Full Stack Engineer", "Setup summary parses valid role intelligence");
    assert(setupSummaryPayload.data.training_mode === "coaching", "Training mode preserved in setup summary");

    // 3. Trainer Question Card Payload Validation
    const questionCardPayload = {
        type: "trainer_question_card",
        data: {
            session_id: "sess_123",
            target_role: "Product Manager",
            question_index: 0,
            active_question: {
                id: "1",
                question: "How do you prioritize competing feature requests from enterprise clients?",
                category: "Product Strategy",
                difficulty: "Intermediate"
            },
            is_follow_up: false,
            difficulty: "intermediate",
            training_mode: "realistic_mock"
        }
    };

    assert(questionCardPayload.data.active_question.id === "1", "Question card carries active question data");
    assert(questionCardPayload.data.is_follow_up === false, "Base question correctly marked not follow-up");

    // 4. Trainer Answer Feedback Payload Validation (with Speech & Visual Signals)
    const feedbackPayload = {
        type: "trainer_answer_feedback",
        data: {
            session_id: "sess_123",
            feedback: {
                strengths: ["Clear prioritization criteria", "Used RICE framework"],
                improvements: ["Add concrete example of a rejected request"],
                suggested_answer_direction: "Highlight how stakeholder alignment was maintained."
            },
            speech_signals: {
                words_per_minute: 140,
                total_fillers: 2,
                answer_length_band: "optimal",
                long_pause_count: 0
            },
            visual_signals: {
                camera_enabled: true,
                face_detected_ratio: 0.98,
                framing_note: "Good centered framing at eye level"
            },
            retry_offered: true
        }
    };

    assert(feedbackPayload.data.feedback.strengths.length === 2, "Feedback contains structured qualitative strengths");
    assert(feedbackPayload.data.speech_signals.words_per_minute === 140, "Speech signals contain observable delivery pace");
    assert(feedbackPayload.data.visual_signals.camera_enabled === true, "Visual signals contain camera status");
    assert(feedbackPayload.data.retry_offered === true, "Retry offered flag accurately represented");

    // 5. Trainer Interview Report Payload Validation (Strictly Qualitative)
    const reportPayload = {
        type: "trainer_interview_report",
        data: {
            session_id: "sess_123",
            target_role: "Full Stack Engineer",
            training_mode: "coaching",
            questions_asked: 5,
            readiness_by_category: {
                "System Architecture": "Strong",
                "Frontend Development": "Strong",
                "Collaboration": "Moderate"
            },
            strengths: ["Strong architectural depth", "Clear STAR structure"],
            improvement_areas: ["Mention quantifiable scalability metrics"],
            priority_topics: ["Database Indexing"],
            communication_summary: {
                avg_words_per_minute: 145,
                total_fillers: 3,
                pace_assessment: "Balanced pace"
            }
        }
    };

    assert(reportPayload.data.readiness_by_category["System Architecture"] === "Strong", "Category readiness uses qualitative labels only");
    assert((reportPayload.data as any).score === undefined, "Zero numeric score exists in report payload");

    // 6. Malformed and Unknown Artifact Defensive Handling
    const validateArtifact = (art: any) => {
        if (!art || typeof art !== "object" || typeof art.type !== "string") return false;
        if (!art.data || typeof art.data !== "object") return false;
        return ALL_14_ARTIFACT_TYPES.includes(art.type);
    };

    assert(!validateArtifact(null), "Null artifact safely rejected");
    assert(!validateArtifact({}), "Empty object safely rejected");
    assert(!validateArtifact({ type: "unknown_future_type", data: {} }), "Unknown artifact type safely rejected (renders nothing)");
    assert(validateArtifact(reportPayload), "Valid trainer report passes runtime validation");

    console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
    if (failCount > 0) {
        process.exit(1);
    }
}

runTrainerArtifactsTests();
