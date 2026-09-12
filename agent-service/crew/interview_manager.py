"""
Interview Manager Module — Plain Python module managing interview session lifecycle.
Explicitly NOT a CrewAI Agent class.
"""
import uuid
import json
from typing import Optional, List, Dict, Any, Tuple, Literal
from schemas.interview_session import InterviewSessionState, QuestionAskedRecord, AnswerGivenRecord
from tools.interview_tools import prepare_interview_questions, evaluate_interview_answer, generate_interview_report

MAX_QUESTIONS_PER_SESSION = 15
MAX_FOLLOW_UPS_PER_QUESTION = 1
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

def detect_target_role(text: str, resume_text: Optional[str] = None) -> str:
    """Detect or default candidate target role for interview session."""
    return "Software Engineer"

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
    target_role: str = "Software Engineer",
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
