import os
import sys
import pytest
from unittest.mock import patch

# Ensure agent-service root directory is on Python path
AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from schemas.trainer_session import InterviewTrainerSession, TrainerAnswerRecord
from schemas.interview_session import QuestionAskedRecord
from schemas.role_intelligence import RoleIntelligence
from crew import interview_manager

@pytest.fixture
def sample_role_intelligence():
    return RoleIntelligence(
        target_role="Senior Product Manager",
        role_summary="Oversees end-to-end product discovery, roadmap strategy, and execution.",
        likely_competencies=[
            "Product Strategy & Vision",
            "Customer Discovery & Data-Driven Insights",
            "Execution & Cross-Functional Leadership",
            "Stakeholder Management"
        ],
        interview_categories=[
            {"category": "Product Strategy", "weight": 0.35},
            {"category": "Analytical & Metrics", "weight": 0.25},
            {"category": "Execution & Delivery", "weight": 0.25},
            {"category": "Leadership & Stakeholder Alignment", "weight": 0.15}
        ],
        technical_balance="balanced",
        suggested_topics=["Product Launch Roadmaps", "A/B Testing Experiments", "Stakeholder Trade-offs"],
        evidence_basis="role_inference",
        assumptions=["Standard PM market scope."]
    )

@pytest.fixture
def coaching_session(sample_role_intelligence):
    return InterviewTrainerSession(
        session_id="test-coach-session-001",
        target_role="Senior Product Manager",
        interview_type="behavioral",
        difficulty="intermediate",
        training_mode="coaching",
        role_intelligence=sample_role_intelligence,
        question_index=0,
        questions_asked=[
            QuestionAskedRecord(
                id="1",
                question="Can you describe a time you had to pivot a product roadmap due to unexpected data?",
                category="Product Strategy",
                difficulty="Intermediate"
            )
        ],
        answers_given=[],
        voice_enabled=True,
        camera_enabled=False,
        status="in_progress"
    )

@pytest.fixture
def mock_session(sample_role_intelligence):
    return InterviewTrainerSession(
        session_id="test-mock-session-002",
        target_role="Senior Product Manager",
        interview_type="behavioral",
        difficulty="intermediate",
        training_mode="realistic_mock",
        role_intelligence=sample_role_intelligence,
        question_index=0,
        questions_asked=[
            QuestionAskedRecord(
                id="1",
                question="Can you describe a time you had to pivot a product roadmap due to unexpected data?",
                category="Product Strategy",
                difficulty="Intermediate"
            )
        ],
        answers_given=[],
        voice_enabled=True,
        camera_enabled=False,
        status="in_progress"
    )


# ============================================================================
# 1. TRAINING MODE ISOLATION TESTS
# ============================================================================

def test_coaching_mode_weak_answer_triggers_coaching_and_retry(coaching_session):
    """In coaching mode, a weak answer should trigger coaching feedback and offer a retry."""
    weak_answer = "I changed the plan because the numbers didn't look good."
    
    with patch("tools.interview_tools.evaluate_interview_answer._run") as mock_eval, \
         patch("tools.interview_tools.generate_follow_up_question._run") as mock_fu:
        
        mock_eval.return_value = '''{
            "clarity": "Answer is brief and lacks detail.",
            "structure": "Missing STAR method elements.",
            "specificity": "No specific metrics, data points, or timelines mentioned.",
            "technical_depth": "Surface level overview.",
            "strengths": ["Acknowledged the need to pivot based on data."],
            "improvements": [
                "Quantify the specific metric changes that triggered the pivot.",
                "Detail the stakeholder communication and trade-off process."
            ],
            "suggested_answer_direction": "Use the STAR method: describe the initial product goal, the specific data anomaly, your analysis, and the outcome."
        }'''
        mock_fu.return_value = '{"question": "Could you provide specific metric changes that triggered the pivot?"}'
        
        result = interview_manager.process_trainer_answer(
            session=coaching_session,
            answer=weak_answer
        )
        
        # In coaching mode, first weak answer triggers a follow-up or coach_retry_offer
        assert result["action"] in ["follow_up", "coach_retry_offer"]
        assert result["artifact"]["type"] == "trainer_answer_feedback"
        assert "feedback" in result["artifact"]["data"]
        assert len(result["session"].answers_given) == 1
        assert result["session"].answers_given[0].answer == weak_answer

def test_realistic_mock_mode_suppresses_mid_interview_coaching(mock_session):
    """In realistic_mock mode, the same weak answer produces NO coaching feedback artifact mid-interview."""
    weak_answer = "I changed the plan because the numbers didn't look good."
    
    with patch("tools.interview_tools.evaluate_interview_answer._run") as mock_eval, \
         patch("tools.interview_tools.prepare_interview_questions._run") as mock_prep:
        
        mock_eval.return_value = '''{
            "clarity": "Answer is brief and lacks detail.",
            "structure": "Missing STAR method elements.",
            "specificity": "No specific metrics mentioned.",
            "technical_depth": "Surface level overview.",
            "strengths": ["Acknowledged the need to pivot based on data."],
            "improvements": [
                "Quantify the specific metric changes.",
                "Detail the stakeholder communication process."
            ],
            "suggested_answer_direction": "Use the STAR method."
        }'''
        
        mock_prep.return_value = '{"questions": [{"id": 2, "question": "How do you align cross-functional engineering teams?"}]}'
        
        result = interview_manager.process_trainer_answer(
            session=mock_session,
            answer=weak_answer
        )
        
        # In realistic_mock mode, artifact is trainer_question_card, never trainer_answer_feedback mid-interview
        assert result["artifact"]["type"] == "trainer_question_card"
        assert result["artifact"]["data"]["training_mode"] == "realistic_mock"
        assert "feedback" not in result["artifact"]["data"]


# ============================================================================
# 2. RETRY CEILING TESTS (MAX_RETRIES_PER_QUESTION = 1)
# ============================================================================

def test_retry_loop_attempt_1_and_attempt_2_progression(coaching_session):
    """
    Attempt 1: weak answer -> offers retry (retry_count=0 -> candidate can retry).
    Attempt 2: candidate submits retry (is_retry=True) -> updates answer record with retry_count=1 and advances.
    Attempt 3: candidate cannot retry a second time on the same question.
    """
    with patch("tools.interview_tools.evaluate_interview_answer._run") as mock_eval, \
         patch("tools.interview_tools.prepare_interview_questions._run") as mock_prep:
        
        mock_eval.return_value = '''{
            "clarity": "Clear message.",
            "structure": "Good STAR method structure.",
            "specificity": "Moderate details.",
            "technical_depth": "Solid.",
            "strengths": ["Clear communication.", "Relevant example."],
            "improvements": ["Add quantitative metrics."],
            "suggested_answer_direction": "Include user retention percentage impact."
        }'''
        mock_prep.return_value = '{"questions": [{"id": 2, "question": "Next question: How do you prioritize feature requests?"}]}'
        
        # Step 1: Initial answer to Q1 with delivery speech signals triggering coaching
        res1 = interview_manager.process_trainer_answer(
            session=coaching_session,
            answer="First attempt: We saw drop-off in funnel step 3 and adjusted.",
            speech_signals={"wpm": 210, "filler_words_count": 7},
            is_retry=False
        )
        
        # Check retry eligibility
        retry_check = interview_manager.offer_retry(coaching_session, question_id="1")
        assert retry_check["eligible"] is True
        assert retry_check["current_retry_count"] == 0
        assert retry_check["max_retries"] == 1
        
        # Step 2: Retry submitted on Q1 (Attempt 2)
        res2 = interview_manager.process_trainer_answer(
            session=coaching_session,
            answer="Second attempt (Retry): Funnel conversion dropped 15% in checkout. I aligned engineering to fix it.",
            is_retry=True
        )
        
        # After retry, record has retry_count = 1
        ans_rec = next(a for a in coaching_session.answers_given if a.question_id == "1")
        assert ans_rec.retry_count == 1
        assert res2["action"] == "advance"
        
        # Step 3: Check that further retries on Q1 are ineligible
        retry_check_after = interview_manager.offer_retry(coaching_session, question_id="1")
        assert retry_check_after["eligible"] is False
        assert retry_check_after["current_retry_count"] == 1


# ============================================================================
# 3. FOLLOW-UP BOUNDS TESTS (MAX_FOLLOW_UPS_PER_QUESTION = 1)
# ============================================================================

def test_follow_up_ceiling_enforces_max_one_follow_up(coaching_session):
    """
    Base Question -> Weak Answer -> Follow-up Question.
    Follow-up Question -> Answer -> Advances to Next Base Question (No recursive follow-ups).
    """
    with patch("tools.interview_tools.evaluate_interview_answer._run") as mock_eval, \
         patch("tools.interview_tools.generate_follow_up_question._run") as mock_fu, \
         patch("tools.interview_tools.prepare_interview_questions._run") as mock_prep:
        
        mock_eval.return_value = '''{
            "clarity": "Unclear details.",
            "structure": "Lacks structure.",
            "specificity": "Vague descriptions.",
            "technical_depth": "Minimal.",
            "strengths": ["Relevant context."],
            "improvements": ["Needs specific technical details.", "Clarify timeline."],
            "suggested_answer_direction": "Elaborate with concrete details."
        }'''
        mock_fu.return_value = '{"question": "Could you provide specific technical metrics on that decision?"}'
        mock_prep.return_value = '{"questions": [{"id": 2, "question": "Question 2: How do you handle tech debt?"}]}'
        
        # Turn 1: Base question answered
        res1 = interview_manager.process_trainer_answer(
            session=coaching_session,
            answer="We updated the system when traffic grew."
        )
        assert res1["is_follow_up"] is True
        assert res1["next_question"].id == "1_followup"
        assert len(coaching_session.questions_asked) == 2
        
        # Turn 2: Follow-up question answered (even with weak evaluation, it MUST advance and NOT branch into another follow-up)
        res2 = interview_manager.process_trainer_answer(
            session=coaching_session,
            answer="Traffic grew by 50% so we scaled up servers."
        )
        assert res2["is_follow_up"] is False
        assert res2["next_question"].id == "2"
        assert "_followup" not in res2["next_question"].id


# ============================================================================
# 4. DIFFICULTY PROGRESSION TESTS (BOUNDED STRATEGY ADJUSTMENT)
# ============================================================================

def test_difficulty_steps_up_on_strong_answer_capped_at_advanced(coaching_session):
    """
    Strong answer (<= 1 improvement, >= 2 strengths) advances difficulty:
    intermediate -> advanced.
    Another strong answer at advanced stays at advanced (capped).
    """
    strong_eval = '''{
        "clarity": "Exceptionally clear and concise.",
        "structure": "Exemplary STAR method structure with clear problem-action-result.",
        "specificity": "Concrete metrics included: 25% ARR growth, 4-week sprint delivery.",
        "technical_depth": "Deep architectural reasoning.",
        "strengths": [
            "Clear articulation of business impact with quantitative metrics.",
            "Well-structured narrative demonstrating leadership and technical depth."
        ],
        "improvements": ["Consider elaborating on subsequent maintenance cost impact."],
        "suggested_answer_direction": "Excellent answer."
    }'''
    
    with patch("tools.interview_tools.evaluate_interview_answer._run", return_value=strong_eval), \
         patch("tools.interview_tools.prepare_interview_questions._run", return_value='{"questions": [{"id": 2, "question": "Advanced Q2"}]}'):
        
        assert coaching_session.difficulty == "intermediate"
        
        # Submit strong answer 1
        res1 = interview_manager.process_trainer_answer(
            session=coaching_session,
            answer="Strong STAR response with 25% ARR growth and architectural trade-offs."
        )
        assert res1["session"].difficulty == "advanced"
        
        # Submit strong answer 2 at advanced
        res2 = interview_manager.process_trainer_answer(
            session=coaching_session,
            answer="Another exceptional response demonstrating principal-level leadership."
        )
        # Difficulty capped at advanced, does not error or exceed bounds
        assert res2["session"].difficulty == "advanced"


# ============================================================================
# 5. SESSION MEMORY TESTS (BOUNDED CHAR BUDGET & CONTINUITY)
# ============================================================================

def test_session_memory_budget_and_continuity(coaching_session):
    """
    Verifies that _build_session_memory():
    1. Returns formatted Q/A pairs.
    2. Enforces a strict character budget (<= 1500 chars).
    3. Preserves newest/most relevant context upon truncation.
    """
    # Populate 10 Q/A turns
    coaching_session.questions_asked = [
        QuestionAskedRecord(id=str(i), question=f"Question {i}: Describe your methodology for area {i}?", category="Product", difficulty="Intermediate")
        for i in range(1, 11)
    ]
    coaching_session.answers_given = [
        TrainerAnswerRecord(
            question_id=str(i),
            answer=f"Answer {i}: In my previous role I implemented solution {i} using Python, distributed caching, and microservices architecture with a team of 8 engineers.",
            retry_count=0
        )
        for i in range(1, 11)
    ]
    
    memory = interview_manager._build_session_memory(coaching_session, char_budget=500)
    
    # Assert strict budget enforcement
    assert len(memory) <= 500
    # Assert newest context is preserved (Question 10 should be present)
    assert "Question 10" in memory or "Answer 10" in memory
    assert "Q:" in memory
    assert "A:" in memory


# ============================================================================
# 6. PAUSE AND RESUME LIFECYCLE TESTS
# ============================================================================

def test_pause_and_resume_state_transitions(coaching_session):
    """
    Tests valid and invalid lifecycle jumps for pause / resume:
    - setup -> pause ❌
    - in_progress -> pause ✅
    - paused -> resume ✅
    - completed -> resume ❌
    - completed -> pause ❌
    """
    # 1. in_progress -> pause ✅
    assert coaching_session.status == "in_progress"
    paused_sess = interview_manager.pause_session(coaching_session)
    assert paused_sess.status == "paused"
    assert paused_sess.updated_at is not None
    
    # 2. paused -> resume ✅
    resumed_sess = interview_manager.resume_session(paused_sess)
    assert resumed_sess.status == "in_progress"
    
    # 3. setup -> pause ❌
    setup_sess = InterviewTrainerSession(
        session_id="test-setup",
        target_role="Data Engineer",
        status="setup"
    )
    with pytest.raises(ValueError, match="Only 'in_progress' sessions can be paused"):
        interview_manager.pause_session(setup_sess)
        
    # 4. completed -> pause ❌ & resume ❌
    completed_sess = InterviewTrainerSession(
        session_id="test-completed",
        target_role="Data Engineer",
        status="completed"
    )
    with pytest.raises(ValueError, match="Only 'in_progress' sessions can be paused"):
        interview_manager.pause_session(completed_sess)
        
    with pytest.raises(ValueError, match="Only 'paused' sessions can be resumed"):
        interview_manager.resume_session(completed_sess)


# ============================================================================
# 7. SESSION COMPLETION & QUALITATIVE REPORT TESTS
# ============================================================================

def test_complete_trainer_session_generates_qualitative_report(coaching_session):
    """Verifies that complete_trainer_session sets status, timestamps, and compiles report without scores."""
    coaching_session.answers_given = [
        TrainerAnswerRecord(
            question_id="1",
            answer="I managed the release with agile methodology and stakeholder reviews.",
            feedback={"strengths": ["Clear communication"], "improvements": ["Add metrics"]}
        )
    ]
    
    with patch("tools.interview_tools.generate_interview_report._run") as mock_report:
        mock_report.return_value = '''{
            "interview_type": "behavioral",
            "target_role": "Senior Product Manager",
            "questions_asked": 1,
            "readiness_by_category": {
                "Behavioral": "Moderate"
            },
            "strengths": ["Demonstrated foundational product execution principles."],
            "improvement_areas": ["Incorporate more quantifiable metrics into responses."],
            "priority_topics": ["A/B Testing Experiments and Metric Frameworks"],
            "note": "These are coaching recommendations, not guaranteed measurements."
        }'''
        
        session, report_data = interview_manager.complete_trainer_session(coaching_session)
        
        assert session.status == "completed"
        assert session.completed_at is not None
        assert session.final_report is not None
        assert report_data["readiness_by_category"]["Behavioral"] == "Moderate"
        # Structural check: no numeric score or pass/fail verdict
        assert "score" not in report_data
        assert "passed" not in report_data
        assert "failed" not in report_data
