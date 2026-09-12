import os
import json
import httpx
from typing import Optional, List, Dict, Any, Literal
from crewai.tools import tool

INTERVIEW_GUARDRAIL = (
    "Base every question and every piece of feedback ONLY on skills, experience, and projects "
    "explicitly present in the provided resume and job description. Never fabricate candidate skills, "
    "experience, projects, certifications, or employment history. Never assume a candidate possesses a skill "
    "unless stated in their resume. Clearly distinguish resume facts from job-description requirements. "
    "If a skill appears in the job description but not in the candidate's resume, phrase questions as a target "
    "job requirement (e.g., 'How would you approach X?'), NEVER as an accomplished candidate experience. "
    "Never claim a candidate definitely passed or failed an interview. Never predict hiring decisions, "
    "invent recruiter feedback, or invent company-specific processes. Give constructive coaching "
    "addressing clarity, structure, and specificity rather than hiring verdicts. If context is missing, say so."
)

from tools.openrouter_client import call_openrouter_api
from schemas.interview_report import InterviewReportArtifactData

def _clean_json_str(raw: str) -> str:
    text = (raw or "").strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

@tool("prepare_interview_questions")
def prepare_interview_questions(
    role: str = "Software Engineer",
    count: int = 5,
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None,
    interview_type: Literal["hr", "behavioral", "technical", "mixed"] = "mixed",
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate",
) -> str:
    """
    Generate tailored mock interview questions for a specified role.
    Grounded in candidate resume and target job description with strict anti-fabrication guardrails.
    Supports interview_type (hr, behavioral, technical, mixed) and difficulty (beginner, intermediate, advanced).
    """
    clean_role = (role or "Software Engineer").strip()
    safe_count = max(1, min(10, count))

    truncated_resume = (resume_text or "").strip()[:3000]
    truncated_jd = (job_description or "").strip()[:3000]

    system_prompt = (
        f"{INTERVIEW_GUARDRAIL}\n"
        f"Focus questions on the '{interview_type}' category. Target difficulty: {difficulty}. "
        f"When the resume lists specific projects, prefer project-specific questions (architecture, technical decisions, challenges, contribution, trade-offs) over generic technical trivia, progressively increasing specificity for questions about the same project if multiple are asked. "
        f"Tag each question's own difficulty field, which may vary slightly around the target (Easy, Medium, Hard). "
        f"Output ONLY valid JSON containing a list of {safe_count} structured interview questions."
    )

    user_prompt = f"""
Target Role: {clean_role}
Question Count: {safe_count}
Interview Type: {interview_type}
Target Difficulty: {difficulty}

Candidate Resume Context:
{truncated_resume if truncated_resume else 'No resume context provided.'}

Target Job Description Context:
{truncated_jd if truncated_jd else 'No job description context provided.'}

Instructions:
1. Generate exactly {safe_count} relevant interview questions focusing on '{interview_type}' mode and '{difficulty}' difficulty.
2. Ensure questions test required skills from the Job Description without falsely assuming the candidate already possesses missing skills.
3. Return JSON format:
{{
  "questions": [
    {{
      "id": 1,
      "category": "{interview_type.capitalize()}",
      "difficulty": "Easy / Medium / Hard",
      "question": "Question text",
      "rationale": "Why this question is relevant to the candidate resume / target role"
    }}
  ]
}}
""".strip()

    ai_response = call_openrouter_api(system_prompt, user_prompt)
    if ai_response:
        try:
            clean_json = _clean_json_str(ai_response)
            parsed = json.loads(clean_json)
            if isinstance(parsed, list):
                parsed = {"questions": parsed}
            return json.dumps(parsed)
        except Exception:
            return json.dumps({"raw_questions": ai_response})

    # Structured fallback if OpenRouter key is not set or network fails
    fallback_questions = []
    diff_label = "Easy" if difficulty == "beginner" else ("Hard" if difficulty == "advanced" else "Medium")
    category_label = "HR" if interview_type == "hr" else ("Behavioral" if interview_type == "behavioral" else ("Technical" if interview_type == "technical" else "Mixed"))

    for i in range(1, safe_count + 1):
        q_text = f"Question {i}: Can you describe your experience and approach relevant to the {clean_role} position?"
        if interview_type == "technical" and truncated_resume and ("project" in truncated_resume.lower() or "built" in truncated_resume.lower() or "developed" in truncated_resume.lower()):
            q_text = f"Question {i}: Can you walk through a major technical project mentioned on your resume, detailing your architectural decisions and challenges faced for the {clean_role} role?"

        fallback_questions.append({
            "id": i,
            "category": category_label,
            "difficulty": diff_label,
            "question": q_text,
            "rationale": f"Standard mock interview question for {clean_role} role ({interview_type}, {difficulty})."
        })
    return json.dumps({"questions": fallback_questions, "status": "simulated_fallback"})

@tool("evaluate_interview_answer")
def evaluate_interview_answer(
    question: str = "",
    answer: str = "",
    resume_text: Optional[str] = None
) -> str:
    """
    Evaluate candidate answer to an interview question and provide structured coaching feedback.
    Never issues pass/fail or hiring verdicts.
    """
    clean_q = (question or "").strip()
    clean_a = (answer or "").strip()

    if not clean_q or not clean_a:
        return json.dumps({"error": "Both question and candidate answer are required for evaluation."})

    truncated_resume = (resume_text or "").strip()[:3000]

    system_prompt = f"{INTERVIEW_GUARDRAIL}\nEvaluate the answer strictly on clarity, structure, and specificity. Do NOT include pass/fail verdicts or hire probabilities."

    user_prompt = f"""
Question Asked: {clean_q}
Candidate Answer: {clean_a}

Candidate Resume Context:
{truncated_resume if truncated_resume else 'No resume context provided.'}

Instructions:
Evaluate the response and return JSON in this exact structure:
{{
  "clarity": "Score or feedback on message clarity",
  "structure": "Feedback on response structure (e.g. STAR method usage)",
  "specificity": "Feedback on use of concrete details and metrics",
  "technical_depth": "Evaluation of technical concept depth",
  "strengths": ["Key strength 1", "Key strength 2"],
  "improvements": ["Suggested improvement 1", "Suggested improvement 2"],
  "suggested_answer_direction": "Constructive guidance on how to strengthen this response"
}}
""".strip()

    ai_response = call_openrouter_api(system_prompt, user_prompt)
    if ai_response:
        try:
            clean_json = _clean_json_str(ai_response)
            parsed = json.loads(clean_json)
            # Remove any forbidden verdict fields if present
            for forbidden_key in ["passed", "failed", "hired", "rejected", "hire_probability"]:
                parsed.pop(forbidden_key, None)
            return json.dumps(parsed)
        except Exception:
            return json.dumps({"raw_feedback": ai_response})

    # Fallback feedback when OpenRouter key is unavailable
    fallback_feedback = {
        "clarity": "Answer is understandable and addresses the core prompt.",
        "structure": "Consider structuring your answer using the STAR method (Situation, Task, Action, Result).",
        "specificity": "Include specific quantitative metrics or outcome figures to strengthen impact.",
        "technical_depth": "Good foundational points provided.",
        "strengths": ["Directly addresses the interview question."],
        "improvements": ["Add specific measurable results achieved in past roles."],
        "suggested_answer_direction": "Focus on highlighting your specific role, actions taken, and measurable impact."
    }
    return json.dumps(fallback_feedback)

def _fallback_report(target_role: str, interview_type: str, questions_count: int) -> str:
    category_label = "HR" if interview_type.lower() == "hr" else interview_type.capitalize()
    report_dict = {
        "interview_type": interview_type,
        "target_role": target_role,
        "questions_asked": max(1, questions_count),
        "readiness_by_category": {
            category_label: "Moderate"
        },
        "strengths": [
            "Demonstrated foundational understanding of required concepts.",
            "Communicated answers clearly and addressed the core prompts directly."
        ],
        "improvement_areas": [
            "Incorporate more quantifiable metrics and impact figures into your responses.",
            "Provide deeper technical trade-off rationale where applicable."
        ],
        "priority_topics": [
            f"Key architectural and practical design principles for {target_role}.",
            "STAR method response structuring for behavioral and situational questions."
        ],
        "note": "These are coaching recommendations, not guaranteed measurements."
    }
    return json.dumps(report_dict)

@tool("generate_interview_report")
def generate_interview_report(
    questions_asked: List[Dict[str, Any]],
    answers_given: List[Dict[str, Any]],
    target_role: str = "Software Engineer",
    interview_type: str = "mixed",
) -> str:
    """
    Generate a comprehensive, qualitative post-interview coaching report.
    Never produces numeric scores or pass/fail hiring verdicts.
    """
    clean_role = (target_role or "Software Engineer").strip()
    clean_type = (interview_type or "mixed").strip()
    q_count = len(questions_asked) if questions_asked else len(answers_given)

    system_prompt = (
        f"{INTERVIEW_GUARDRAIL}\n"
        "Summarize this completed mock interview session. Use ONLY qualitative readiness labels "
        "(Strong / Moderate / Needs Improvement) per category - NEVER a numeric score of any kind. "
        "If there is insufficient evidence to assess a category, say so explicitly rather than guessing. "
        "Output ONLY valid JSON matching the InterviewReportArtifactData schema."
    )

    q_and_a_summary = []
    for idx, ans_rec in enumerate(answers_given or []):
        q_id = ans_rec.get("question_id", str(idx + 1))
        matching_q = next((q.get("question", "") for q in (questions_asked or []) if str(q.get("id")) == str(q_id)), f"Question {q_id}")
        ans_text = ans_rec.get("answer", "")
        feedback = ans_rec.get("feedback", {})
        q_and_a_summary.append({
            "question": matching_q,
            "answer": ans_text,
            "feedback": feedback
        })

    user_prompt = f"""
Target Role: {clean_role}
Interview Type: {clean_type}
Questions Completed: {q_count}

Interview Transcript Summary:
{json.dumps(q_and_a_summary, indent=2)}

Instructions:
Generate a structured coaching summary report. Return ONLY valid JSON matching this schema:
{{
  "interview_type": "{clean_type}",
  "target_role": "{clean_role}",
  "questions_asked": {q_count},
  "readiness_by_category": {{
    "{clean_type.capitalize()}": "Strong / Moderate / Needs Improvement"
  }},
  "strengths": ["Summary strength 1", "Summary strength 2"],
  "improvement_areas": ["Key area for growth 1", "Key area for growth 2"],
  "priority_topics": ["Suggested study topic 1", "Suggested study topic 2"],
  "note": "These are coaching recommendations, not guaranteed measurements."
}}
""".strip()

    ai_response = call_openrouter_api(system_prompt, user_prompt)
    if ai_response:
        try:
            clean_json = _clean_json_str(ai_response)
            parsed = json.loads(clean_json)
            # Remove any forbidden verdict fields if present
            for forbidden_key in ["passed", "failed", "hired", "rejected", "hire_probability"]:
                parsed.pop(forbidden_key, None)
            validated = InterviewReportArtifactData.model_validate(parsed)
            return validated.model_dump_json()
        except Exception:
            pass

    return _fallback_report(clean_role, clean_type, q_count)
