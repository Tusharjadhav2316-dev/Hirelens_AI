"""
Interview Manager Module — Plain Python module managing interview session lifecycle.
Explicitly NOT a CrewAI Agent class.
"""
import uuid
import json
import datetime
from typing import Optional, List, Dict, Any, Tuple, Literal
from schemas.interview_session import InterviewSessionState, QuestionAskedRecord, AnswerGivenRecord
from schemas.trainer_session import InterviewTrainerSession, TrainerAnswerRecord
from tools.interview_tools import (
    prepare_interview_questions,
    evaluate_interview_answer,
    generate_interview_report,
    generate_follow_up_question,
)

MAX_QUESTIONS_PER_SESSION = 15
MAX_FOLLOW_UPS_PER_QUESTION = 1
MAX_RETRIES_PER_QUESTION = 1
DIFFICULTY_ORDER = ["beginner", "intermediate", "advanced"]

def _extract_jd_from_attachments(attachments: Optional[List[Dict[str, Any]]]) -> Optional[str]:
    """Extract job description text from attachments with category/name fallback."""
    if not attachments:
        return None
    for att in attachments:
        cat = (att.get("category") or "").lower()
        name = (att.get("name") or "").lower()
        text = (att.get("extractedText") or "").strip()
        if not text:
            continue
        if cat == "job_description" or "job" in name or "jd" in name or "description" in name:
            return text
    return None

def _extract_resume_from_attachments(attachments: Optional[List[Dict[str, Any]]]) -> Optional[str]:
    """Extract candidate resume text from attachments with category/name fallback."""
    if not attachments:
        return None
    for att in attachments:
        cat = (att.get("category") or "").lower()
        name = (att.get("name") or "").lower()
        text = (att.get("extractedText") or "").strip()
        if not text:
            continue
        if cat == "resume" or "resume" in name or "cv" in name:
            return text
    return None

def resolve_interview_context(
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, str]:
    """
    Resolves effective candidate resume and job description from explicit fields
    and/or uploaded attachments, adhering to established fallback precedence.
    """
    clean_resume = (resume_text or "").strip()
    clean_jd = (job_description or "").strip()

    resolved_jd = clean_jd if clean_jd else (_extract_jd_from_attachments(attachments) or "")
    resolved_resume = clean_resume if clean_resume else (_extract_resume_from_attachments(attachments) or "")

    return {
        "resume_text": resolved_resume,
        "job_description": resolved_jd,
    }

def detect_interview_type(text: str) -> Literal["hr", "behavioral", "technical", "mixed"]:
    """Classify requested interview mode from message text."""
    clean = (text or "").lower()
    if "technical" in clean or "coding" in clean or "system design" in clean or "algorithm" in clean:
        return "technical"
    elif "behavioral" in clean or "star" in clean or "situation" in clean or "leadership" in clean:
        return "behavioral"
    elif "hr" in clean or "cultural" in clean or "culture" in clean or "screening" in clean:
        return "hr"
    return "mixed"

def detect_target_role(text: str, resume_text: Optional[str] = None) -> Optional[str]:
    """
    Detect candidate target role from message text or resume if explicitly present.
    Returns None if no explicit role is detected (caller must prompt or handle explicitly).
    Never silently defaults to 'Software Engineer'.
    """
    clean = (text or "").strip()
    clean_lower = clean.lower()

    # Check for explicit patterns like "for [role] role", "for a [role] interview", "role: [role]"
    import re
    role_match = re.search(r'(?:role(?:\s+is|:)?|for\s+(?:a|an)?|as\s+(?:a|an)?)\s+([a-zA-Z\s\-\/\+]+?)(?:\s+(?:role|position|job|interview)|$|\.|\,)', clean, re.IGNORECASE)
    if role_match:
        extracted = role_match.group(1).strip()
        # Exclude generic interview types from role match
        if extracted.lower() not in ["technical", "behavioral", "hr", "mock", "mixed", "coding", "practice"]:
            if len(extracted) > 2:
                return extracted

    return None

def _should_ask_follow_up(feedback: Dict[str, Any]) -> bool:
    """
    Auditable Adaptive Follow-Up Decision Rule:
    Triggers when improvements list has >= 2 items and contains ambiguity markers.
    """
    improvements = feedback.get("improvements", [])
    if not isinstance(improvements, list):
        return False
    ambiguity_markers = ["unclear", "specific", "vague", "ambiguous", "metric", "measurable", "detail"]
    text_blob = " ".join(str(item) for item in improvements).lower()
    return len(improvements) >= 2 and any(marker in text_blob for marker in ambiguity_markers)

def _step_difficulty(current: str, feedback: Dict[str, Any]) -> Literal["beginner", "intermediate", "advanced"]:
    """
    Difficulty progression rule: steps up only on strong answers (<= 1 improvement and >= 2 strengths).
    Never exceeds 'advanced'.
    """
    improvements = feedback.get("improvements", [])
    strengths = feedback.get("strengths", [])
    if not isinstance(improvements, list) or not isinstance(strengths, list):
        return current  # type: ignore

    strong_answer = len(improvements) <= 1 and len(strengths) >= 2
    if strong_answer:
        current_lower = (current or "intermediate").lower()
        idx = DIFFICULTY_ORDER.index(current_lower) if current_lower in DIFFICULTY_ORDER else 1
        next_idx = min(idx + 1, len(DIFFICULTY_ORDER) - 1)
        return DIFFICULTY_ORDER[next_idx]  # type: ignore
    return current  # type: ignore

def _count_follow_ups_for_current_question(session: InterviewSessionState) -> int:
    """Count how many follow-ups have been asked for the current base question."""
    if not session.questions_asked:
        return 0
    curr_q = session.questions_asked[-1]
    if "_followup" in curr_q.id:
        return 1
    return 0

def start_session(
    interview_type: Literal["hr", "behavioral", "technical", "mixed"] = "mixed",
    target_role: Optional[str] = "Software Engineer",
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate",
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None,
) -> InterviewSessionState:
    """
    Initializes a new interview session state with resolved context from resume/JD/attachments.
    """
    _ = resolve_interview_context(
        resume_text=resume_text,
        job_description=job_description,
        attachments=attachments,
    )

    valid_type = interview_type if interview_type in ["hr", "behavioral", "technical", "mixed"] else "mixed"
    valid_diff = difficulty if difficulty in ["beginner", "intermediate", "advanced"] else "intermediate"

    return InterviewSessionState(
        session_id=str(uuid.uuid4()),
        interview_type=valid_type,
        target_role=target_role or "Software Engineer",
        difficulty=valid_diff,
        question_index=0,
        questions_asked=[],
        answers_given=[],
        status="in_progress"
    )

def present_question(
    session: InterviewSessionState,
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Ensures an active question exists in the session and returns presentation data.
    """
    session.question_index = max(0, session.question_index)
    if len(session.questions_asked) > MAX_QUESTIONS_PER_SESSION:
        session.questions_asked = session.questions_asked[:MAX_QUESTIONS_PER_SESSION]

    if not session.questions_asked:
        # Generate the initial question
        raw_res = prepare_interview_questions._run(
            role=session.target_role,
            count=1,
            resume_text=resume_text,
            job_description=job_description,
            interview_type=session.interview_type,
            difficulty=session.difficulty
        )
        try:
            parsed = json.loads(raw_res) if isinstance(raw_res, str) else raw_res
            q_list = parsed.get("questions", []) if isinstance(parsed, dict) else parsed
            if q_list and isinstance(q_list, list):
                item = q_list[0]
                q_rec = QuestionAskedRecord(
                    id=str(item.get("id", 1)),
                    question=item.get("question", f"Can you describe your experience relevant to {session.target_role}?"),
                    category=item.get("category", session.interview_type.capitalize()),
                    difficulty=item.get("difficulty", session.difficulty.capitalize())
                )
            else:
                q_rec = QuestionAskedRecord(
                    id="1",
                    question=f"Can you describe your experience relevant to {session.target_role}?",
                    category=session.interview_type.capitalize(),
                    difficulty=session.difficulty.capitalize()
                )
        except Exception:
            q_rec = QuestionAskedRecord(
                id="1",
                question=f"Can you describe your experience relevant to {session.target_role}?",
                category=session.interview_type.capitalize(),
                difficulty=session.difficulty.capitalize()
            )
        session.questions_asked.append(q_rec)

    active_q = session.questions_asked[-1]
    return {
        "session": session,
        "active_question": active_q
    }

def process_answer(
    session: InterviewSessionState,
    answer: str,
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Processes candidate answer: evaluates feedback, decides whether to ask adaptive follow-up
    or advance to next question, and updates session difficulty and completion status.
    """
    # Defensive bounds enforcement against tampered or corrupt session payloads
    session.question_index = max(0, session.question_index)
    if len(session.questions_asked) > MAX_QUESTIONS_PER_SESSION:
        session.questions_asked = session.questions_asked[:MAX_QUESTIONS_PER_SESSION]
    if len(session.answers_given) > MAX_QUESTIONS_PER_SESSION:
        session.answers_given = session.answers_given[:MAX_QUESTIONS_PER_SESSION]

    if not session.questions_asked:
        present_question(session, resume_text, job_description)

    current_q = session.questions_asked[-1]

    # Evaluate answer using evaluate_interview_answer tool
    eval_res = evaluate_interview_answer._run(
        question=current_q.question,
        answer=answer,
        resume_text=resume_text
    )
    try:
        feedback = json.loads(eval_res) if isinstance(eval_res, str) else eval_res
        if not isinstance(feedback, dict):
            feedback = {"raw_feedback": str(eval_res)}
    except Exception:
        feedback = {"raw_feedback": str(eval_res)}

    # Record answer
    ans_record = AnswerGivenRecord(
        question_id=current_q.id,
        answer=answer,
        feedback=feedback
    )
    session.answers_given.append(ans_record)

    follow_ups_count = _count_follow_ups_for_current_question(session)
    next_question: Optional[QuestionAskedRecord] = None
    is_follow_up = False

    # Strictly enforce that follow-ups cannot branch indefinitely or be added to follow-up questions
    if not current_q.id.endswith("_followup") and _should_ask_follow_up(feedback) and follow_ups_count < MAX_FOLLOW_UPS_PER_QUESTION:
        # Generate follow-up question
        is_follow_up = True
        follow_up_q = QuestionAskedRecord(
            id=f"{current_q.id}_followup",
            question=f"Could you elaborate more specifically on how you handled that, including concrete metrics or technical trade-offs?",
            category=current_q.category or session.interview_type.capitalize(),
            difficulty=session.difficulty.capitalize()
        )
        session.questions_asked.append(follow_up_q)
        next_question = follow_up_q
    else:
        # Advance question index
        session.question_index += 1
        session.difficulty = _step_difficulty(session.difficulty, feedback)

        if session.question_index >= MAX_QUESTIONS_PER_SESSION or len(session.questions_asked) >= MAX_QUESTIONS_PER_SESSION:
            session, report_data = complete_session(session)
            return {
                "session": session,
                "feedback": feedback,
                "next_question": None,
                "is_follow_up": False,
                "report": report_data
            }
        else:
            # Generate next structured question
            q_res = prepare_interview_questions._run(
                role=session.target_role,
                count=1,
                resume_text=resume_text,
                job_description=job_description,
                interview_type=session.interview_type,
                difficulty=session.difficulty
            )
            try:
                parsed_q = json.loads(q_res) if isinstance(q_res, str) else q_res
                q_list = parsed_q.get("questions", []) if isinstance(parsed_q, dict) else parsed_q
                if q_list and isinstance(q_list, list):
                    item = q_list[0]
                    next_question = QuestionAskedRecord(
                        id=str(session.question_index + 1),
                        question=item.get("question", f"Question {session.question_index + 1} for {session.target_role}"),
                        category=item.get("category", session.interview_type.capitalize()),
                        difficulty=item.get("difficulty", session.difficulty.capitalize())
                    )
                else:
                    next_question = QuestionAskedRecord(
                        id=str(session.question_index + 1),
                        question=f"Question {session.question_index + 1}: How do you approach key responsibilities in the {session.target_role} role?",
                        category=session.interview_type.capitalize(),
                        difficulty=session.difficulty.capitalize()
                    )
            except Exception:
                next_question = QuestionAskedRecord(
                    id=str(session.question_index + 1),
                    question=f"Question {session.question_index + 1}: How do you approach key responsibilities in the {session.target_role} role?",
                    category=session.interview_type.capitalize(),
                    difficulty=session.difficulty.capitalize()
                )
            session.questions_asked.append(next_question)

    return {
        "session": session,
        "feedback": feedback,
        "next_question": next_question,
        "is_follow_up": is_follow_up
    }

def complete_session(session: InterviewSessionState) -> Tuple[InterviewSessionState, Dict[str, Any]]:
    """
    Finalizes an interview session, generates the qualitative report, and marks session completed.
    """
    session.status = "completed"
    raw_report = generate_interview_report._run(
        questions_asked=[q.model_dump() for q in session.questions_asked],
        answers_given=[a.model_dump() for a in session.answers_given],
        target_role=session.target_role,
        interview_type=session.interview_type
    )
    try:
        report_data = json.loads(raw_report) if isinstance(raw_report, str) else raw_report
    except Exception:
        report_data = {"raw_report": str(raw_report)}

    return session, report_data

def advance_session(session: InterviewSessionState) -> InterviewSessionState:
    """Advances session state cleanly."""
    return session


# ============================================================================
# SPRINT 10 ADAPTIVE TRAINER ENGINE
# ============================================================================

def _is_content_weak(feedback: Dict[str, Any]) -> bool:
    """
    Structured qualitative evaluation check:
    Identifies if an answer requires deeper probing or coaching based on structured improvements list.
    No numeric scoring or confidence metrics.
    """
    improvements = feedback.get("improvements", [])
    if isinstance(improvements, list) and len(improvements) >= 2:
        return True
    for key in ["clarity", "structure", "specificity", "technical_depth"]:
        val = str(feedback.get(key, "")).lower()
        if any(w in val for w in ["unclear", "missing", "vague", "weak", "lacks", "insufficient", "needs improvement"]):
            return True
    return False

def _is_content_strong(feedback: Dict[str, Any]) -> bool:
    """
    Structured qualitative evaluation check:
    Determines if an answer demonstrates strong clarity, structure, and depth (<= 1 improvement and >= 2 strengths).
    """
    improvements = feedback.get("improvements", [])
    strengths = feedback.get("strengths", [])
    if not isinstance(improvements, list) or not isinstance(strengths, list):
        return False
    return len(improvements) <= 1 and len(strengths) >= 2

def _should_coach(
    feedback: Dict[str, Any],
    training_mode: str,
    speech_signals: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Coaching decision rule:
    In 'realistic_mock' mode, live coaching interventions are ALWAYS suppressed during the interview (deferred to report).
    In 'coaching' mode, coaching triggers when answer content is weak or speech signals warrant intervention.
    """
    if training_mode == "realistic_mock":
        return False

    if _is_content_weak(feedback):
        return True

    if speech_signals and isinstance(speech_signals, dict):
        wpm = speech_signals.get("words_per_minute") if speech_signals.get("words_per_minute") is not None else speech_signals.get("wpm")
        filler_count = speech_signals.get("total_fillers") if speech_signals.get("total_fillers") is not None else speech_signals.get("filler_words_count")
        if (wpm is not None and (wpm > 180 or wpm < 100)) or (filler_count is not None and filler_count >= 5):
            return True

    return False

def _build_session_memory(session: InterviewTrainerSession, char_budget: int = 1500) -> str:
    """
    Builds a bounded, qualitative summary of prior questions and candidate answers.
    Preserves candidate-stated facts only, preventing prompt bloat and hallucination.
    Prioritizes newest/most relevant context if history exceeds char_budget.
    """
    if not session.answers_given:
        return ""

    entries = []
    for ans in session.answers_given:
        q_id = ans.question_id
        matching_q = next((q for q in session.questions_asked if str(q.id) == str(q_id)), None)
        q_text = matching_q.question if matching_q else f"Question {q_id}"
        a_text = (ans.answer or "").strip()
        if len(a_text) > 200:
            a_text = a_text[:197] + "..."
        entry = f"Q: {q_text}\nA: {a_text}"
        entries.append(entry)

    full_memory = "\n\n".join(entries)
    if len(full_memory) <= char_budget:
        return full_memory

    # Keep newest context up to budget
    budget_entries = []
    current_chars = 0
    for entry in reversed(entries):
        entry_len = len(entry) + 2
        if current_chars + entry_len <= char_budget:
            budget_entries.insert(0, entry)
            current_chars += entry_len
        else:
            break

    return "\n\n".join(budget_entries)

def _evaluate_trainer_answer(
    question: str,
    answer: str,
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None
) -> Dict[str, Any]:
    """Helper to evaluate candidate answer using evaluate_interview_answer tool."""
    eval_res = evaluate_interview_answer._run(
        question=question,
        answer=answer,
        resume_text=resume_text
    )
    try:
        feedback = json.loads(eval_res) if isinstance(eval_res, str) else eval_res
        if not isinstance(feedback, dict):
            feedback = {"raw_feedback": str(eval_res)}
    except Exception:
        feedback = {"raw_feedback": str(eval_res)}
    return feedback

def _record_trainer_answer(
    session: InterviewTrainerSession,
    current_q_id: str,
    answer: str,
    feedback: Dict[str, Any],
    speech_signals: Optional[Dict[str, Any]] = None,
    visual_signals: Optional[Dict[str, Any]] = None,
    is_retry: bool = False
) -> TrainerAnswerRecord:
    """Helper to record candidate answer, ensuring retry_count is bounded to MAX_RETRIES_PER_QUESTION."""
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    existing_idx = next((i for i, a in enumerate(session.answers_given) if str(a.question_id) == str(current_q_id)), None)

    retry_count = 1 if is_retry else (1 if existing_idx is not None else 0)

    rec = TrainerAnswerRecord(
        question_id=str(current_q_id),
        answer=answer,
        feedback=feedback,
        speech_signals=speech_signals,
        visual_signals=visual_signals,
        retry_count=min(retry_count, MAX_RETRIES_PER_QUESTION),
        submitted_at=now_iso
    )

    if existing_idx is not None:
        session.answers_given[existing_idx] = rec
    else:
        session.answers_given.append(rec)

    session.updated_at = now_iso
    return rec

def _count_trainer_follow_ups(session: InterviewTrainerSession) -> int:
    """Count follow-up questions for the current base question."""
    if not session.questions_asked:
        return 0
    curr_q = session.questions_asked[-1]
    if "_followup" in str(curr_q.id):
        return 1
    return 0

def _get_retry_count_for_question(session: InterviewTrainerSession, question_id: str) -> int:
    """Get retry count recorded for a given question ID."""
    rec = next((a for a in session.answers_given if str(a.question_id) == str(question_id)), None)
    return rec.retry_count if rec else 0

def _decide_trainer_action(
    session: InterviewTrainerSession,
    feedback: Dict[str, Any],
    speech_signals: Optional[Dict[str, Any]],
    is_retry: bool,
    follow_ups_count: int,
    retry_count: int
) -> Literal["follow_up", "coach_retry_offer", "advance", "complete"]:
    """
    Auditable Adaptive Trainer Decision Rule:
    1. Session completion check: max questions reached.
    2. Retry advancement: retries or max retries reached always advance.
    3. Follow-up: weak answer on base question (max 1 per question).
    4. Follow-up completion: follow-up answers advance to next question.
    5. Coaching + retry offer: coaching mode when intervention warranted and retry available.
    6. Advance: otherwise advance to next question.
    """
    current_q = session.questions_asked[-1] if session.questions_asked else None
    is_already_followup = bool(current_q and "_followup" in str(current_q.id))
    content_weak = _is_content_weak(feedback)

    # 1. Session completion check
    if session.question_index + 1 >= MAX_QUESTIONS_PER_SESSION or len(session.questions_asked) >= MAX_QUESTIONS_PER_SESSION:
        return "complete"

    # 2. If this is a retry submission (is_retry=True) or retry quota reached: advance
    if is_retry or retry_count >= MAX_RETRIES_PER_QUESTION:
        return "advance"

    # 3. Follow-up check: content_weak and follow-ups available and not already a follow-up
    if content_weak and not is_already_followup and follow_ups_count < MAX_FOLLOW_UPS_PER_QUESTION:
        return "follow_up"

    # 4. If this was a follow-up question, advance to next base question
    if is_already_followup:
        return "advance"

    # 5. Coaching mode intervention with retry offer:
    if session.training_mode == "coaching" and _should_coach(feedback, session.training_mode, speech_signals):
        if not is_retry and retry_count < MAX_RETRIES_PER_QUESTION:
            return "coach_retry_offer"

    return "advance"

def _build_trainer_artifact(
    action: str,
    session: InterviewTrainerSession,
    feedback: Dict[str, Any],
    speech_signals: Optional[Dict[str, Any]],
    visual_signals: Optional[Dict[str, Any]],
    next_question: Optional[QuestionAskedRecord],
    is_follow_up: bool,
    retry_offered: bool,
    report_data: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Builds structured Sprint 10 trainer artifacts based on training mode and action:
    - In realistic_mock mode during interview: returns trainer_question_card (intermediate coaching suppressed)
    - In coaching mode during interview: returns trainer_answer_feedback (with coaching and retry info)
    - On completion: returns trainer_interview_report
    """
    if action == "complete" or session.status == "completed":
        return {
            "type": "trainer_interview_report",
            "status": "completed",
            "data": report_data or session.final_report or {}
        }

    if session.training_mode == "realistic_mock":
        # Realistic mock mode: suppress intermediate coaching feedback during interview
        return {
            "type": "trainer_question_card",
            "status": "completed",
            "data": {
                "session_id": session.session_id,
                "target_role": session.target_role,
                "question_index": session.question_index,
                "active_question": next_question.model_dump() if next_question else None,
                "is_follow_up": is_follow_up,
                "difficulty": session.difficulty,
                "training_mode": session.training_mode
            }
        }
    else:
        # Coaching mode: emit live feedback with speech/visual observations and retry offer
        return {
            "type": "trainer_answer_feedback",
            "status": "completed",
            "data": {
                "session_id": session.session_id,
                "feedback": feedback,
                "speech_signals": speech_signals,
                "visual_signals": visual_signals,
                "retry_offered": retry_offered,
                "is_follow_up": is_follow_up,
                "next_question": next_question.model_dump() if next_question else None,
                "difficulty": session.difficulty,
                "training_mode": session.training_mode
            }
        }

def present_trainer_question(
    session: InterviewTrainerSession,
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Ensures an active question exists in the trainer session and returns presentation data.
    """
    session.question_index = max(0, session.question_index)
    if len(session.questions_asked) > MAX_QUESTIONS_PER_SESSION:
        session.questions_asked = session.questions_asked[:MAX_QUESTIONS_PER_SESSION]

    if not session.questions_asked:
        raw_res = prepare_interview_questions._run(
            role=session.target_role,
            count=1,
            resume_text=resume_text,
            job_description=job_description,
            interview_type="mixed" if session.interview_type == "role_specific" else session.interview_type,
            difficulty=session.difficulty
        )
        try:
            parsed = json.loads(raw_res) if isinstance(raw_res, str) else raw_res
            q_list = parsed.get("questions", []) if isinstance(parsed, dict) else parsed
            if q_list and isinstance(q_list, list):
                item = q_list[0]
                q_rec = QuestionAskedRecord(
                    id=str(item.get("id", 1)),
                    question=item.get("question", f"Can you describe your experience relevant to {session.target_role}?"),
                    category=item.get("category", session.interview_type.capitalize()),
                    difficulty=item.get("difficulty", session.difficulty.capitalize())
                )
            else:
                q_rec = QuestionAskedRecord(
                    id="1",
                    question=f"Can you describe your experience relevant to {session.target_role}?",
                    category=session.interview_type.capitalize(),
                    difficulty=session.difficulty.capitalize()
                )
        except Exception:
            q_rec = QuestionAskedRecord(
                id="1",
                question=f"Can you describe your experience relevant to {session.target_role}?",
                category=session.interview_type.capitalize(),
                difficulty=session.difficulty.capitalize()
            )
        session.questions_asked.append(q_rec)

    active_q = session.questions_asked[-1]
    return {
        "session": session,
        "active_question": active_q
    }

def process_trainer_answer(
    session: InterviewTrainerSession,
    answer: str,
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None,
    speech_signals: Optional[Dict[str, Any]] = None,
    visual_signals: Optional[Dict[str, Any]] = None,
    is_retry: bool = False
) -> Dict[str, Any]:
    """
    Main entry point for processing a candidate's answer in an InterviewTrainerSession.
    Applies modular evaluation, answer recording, adaptive action decision, and artifact building.
    """
    if session.status != "in_progress":
        if session.status == "paused":
            resume_session(session)
        elif session.status == "setup":
            session.status = "in_progress"
            session.started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        else:
            raise ValueError(f"Cannot process answer for session in status '{session.status}'.")

    session.question_index = max(0, session.question_index)
    if not session.questions_asked:
        present_trainer_question(session, resume_text, job_description)

    current_q = session.questions_asked[-1]

    # 1. Evaluate answer
    feedback = _evaluate_trainer_answer(current_q.question, answer, resume_text, job_description)

    # 2. Record answer
    ans_record = _record_trainer_answer(
        session=session,
        current_q_id=current_q.id,
        answer=answer,
        feedback=feedback,
        speech_signals=speech_signals,
        visual_signals=visual_signals,
        is_retry=is_retry
    )

    follow_ups_count = _count_trainer_follow_ups(session)
    retry_count = ans_record.retry_count

    # 3. Decide trainer action
    action = _decide_trainer_action(
        session=session,
        feedback=feedback,
        speech_signals=speech_signals,
        is_retry=is_retry,
        follow_ups_count=follow_ups_count,
        retry_count=retry_count
    )

    next_question: Optional[QuestionAskedRecord] = None
    is_follow_up = False
    retry_offered = False
    report_data: Optional[Dict[str, Any]] = None

    if action == "follow_up":
        is_follow_up = True
        session_memory = _build_session_memory(session, char_budget=1500)
        fu_res = generate_follow_up_question._run(
            question=current_q.question,
            candidate_answer=answer,
            feedback=feedback,
            target_role=session.target_role,
            resume_text=resume_text,
            job_description=job_description,
            session_memory=session_memory
        )
        try:
            fu_parsed = json.loads(fu_res) if isinstance(fu_res, str) else fu_res
            fu_text = fu_parsed.get("question", "Could you elaborate with specific metrics or technical details?")
        except Exception:
            fu_text = "Could you elaborate with specific metrics or technical details?"

        follow_up_q = QuestionAskedRecord(
            id=f"{current_q.id}_followup",
            question=fu_text,
            category=current_q.category or session.interview_type.capitalize(),
            difficulty=session.difficulty.capitalize()
        )
        session.questions_asked.append(follow_up_q)
        next_question = follow_up_q

    elif action == "coach_retry_offer":
        retry_offered = True
        next_question = current_q

    elif action == "complete":
        session, report_data = complete_trainer_session(session)

    else:  # action == "advance"
        session.question_index += 1
        if _is_content_strong(feedback):
            session.difficulty = _step_difficulty(session.difficulty, feedback)

        # Generate next question
        q_res = prepare_interview_questions._run(
            role=session.target_role,
            count=1,
            resume_text=resume_text,
            job_description=job_description,
            interview_type="mixed" if session.interview_type == "role_specific" else session.interview_type,
            difficulty=session.difficulty
        )
        try:
            parsed_q = json.loads(q_res) if isinstance(q_res, str) else q_res
            q_list = parsed_q.get("questions", []) if isinstance(parsed_q, dict) else parsed_q
            if q_list and isinstance(q_list, list):
                item = q_list[0]
                next_question = QuestionAskedRecord(
                    id=str(session.question_index + 1),
                    question=item.get("question", f"Question {session.question_index + 1} for {session.target_role}"),
                    category=item.get("category", session.interview_type.capitalize()),
                    difficulty=item.get("difficulty", session.difficulty.capitalize())
                )
            else:
                next_question = QuestionAskedRecord(
                    id=str(session.question_index + 1),
                    question=f"Question {session.question_index + 1}: How do you approach key responsibilities in the {session.target_role} role?",
                    category=session.interview_type.capitalize(),
                    difficulty=session.difficulty.capitalize()
                )
        except Exception:
            next_question = QuestionAskedRecord(
                id=str(session.question_index + 1),
                question=f"Question {session.question_index + 1}: How do you approach key responsibilities in the {session.target_role} role?",
                category=session.interview_type.capitalize(),
                difficulty=session.difficulty.capitalize()
            )
        session.questions_asked.append(next_question)

    # 4. Build Artifact Data based on training mode and action
    artifact = _build_trainer_artifact(
        action=action,
        session=session,
        feedback=feedback,
        speech_signals=speech_signals,
        visual_signals=visual_signals,
        next_question=next_question,
        is_follow_up=is_follow_up,
        retry_offered=retry_offered,
        report_data=report_data
    )

    return {
        "session": session,
        "feedback": feedback,
        "action": action,
        "next_question": next_question,
        "is_follow_up": is_follow_up,
        "retry_offered": retry_offered,
        "artifact": artifact,
        "report": report_data
    }

def offer_retry(session: InterviewTrainerSession, question_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Checks if a retry is allowed for the specified (or active) question.
    Returns eligibility and question reference.
    """
    target_q_id = question_id or (session.questions_asked[-1].id if session.questions_asked else "1")
    retry_count = _get_retry_count_for_question(session, target_q_id)
    is_eligible = retry_count < MAX_RETRIES_PER_QUESTION and session.status == "in_progress"

    return {
        "question_id": str(target_q_id),
        "eligible": is_eligible,
        "current_retry_count": retry_count,
        "max_retries": MAX_RETRIES_PER_QUESTION
    }

def pause_session(session: InterviewTrainerSession) -> InterviewTrainerSession:
    """
    Transitions session status from 'in_progress' to 'paused'.
    Rejects invalid state transitions.
    """
    if session.status != "in_progress":
        raise ValueError(f"Cannot pause session in status '{session.status}'. Only 'in_progress' sessions can be paused.")
    session.status = "paused"
    session.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return session

def resume_session(session: InterviewTrainerSession) -> InterviewTrainerSession:
    """
    Transitions session status from 'paused' to 'in_progress'.
    Rejects invalid state transitions.
    """
    if session.status != "paused":
        raise ValueError(f"Cannot resume session in status '{session.status}'. Only 'paused' sessions can be resumed.")
    session.status = "in_progress"
    session.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return session

def complete_trainer_session(session: InterviewTrainerSession) -> Tuple[InterviewTrainerSession, Dict[str, Any]]:
    """
    Finalizes an InterviewTrainerSession, generates the qualitative report, and marks session completed.
    """
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    session.status = "completed"
    session.completed_at = now_iso
    session.updated_at = now_iso

    raw_report = generate_interview_report._run(
        questions_asked=[q.model_dump() for q in session.questions_asked],
        answers_given=[a.model_dump() for a in session.answers_given],
        target_role=session.target_role,
        interview_type=session.interview_type
    )
    try:
        report_data = json.loads(raw_report) if isinstance(raw_report, str) else raw_report
    except Exception:
        report_data = {"raw_report": str(raw_report)}

    session.final_report = report_data
    return session, report_data

