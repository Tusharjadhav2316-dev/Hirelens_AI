import os
import json
import httpx
from typing import Optional, List, Dict, Any
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

@tool("prepare_interview_questions")
def prepare_interview_questions(
    role: str = "Software Engineer",
    count: int = 5,
    resume_text: Optional[str] = None,
    job_description: Optional[str] = None
) -> str:
    """
    Generate tailored mock interview questions for a specified role.
    Grounded in candidate resume and target job description with strict anti-fabrication guardrails.
    """
    clean_role = (role or "Software Engineer").strip()
    safe_count = max(1, min(10, count))

    truncated_resume = (resume_text or "").strip()[:3000]
    truncated_jd = (job_description or "").strip()[:3000]

    system_prompt = f"{INTERVIEW_GUARDRAIL}\nOutput ONLY valid JSON containing a list of {safe_count} structured interview questions."

    user_prompt = f"""
Target Role: {clean_role}
Question Count: {safe_count}

Candidate Resume Context:
{truncated_resume if truncated_resume else 'No resume context provided.'}

Target Job Description Context:
{truncated_jd if truncated_jd else 'No job description context provided.'}

Instructions:
1. Generate exactly {safe_count} relevant technical and behavioral interview questions.
2. Ensure questions test required skills from the Job Description without falsely assuming the candidate already possesses missing skills.
3. Return JSON format:
{{
  "questions": [
    {{
      "id": 1,
      "category": "Technical / Behavioral",
      "question": "Question text",
      "rationale": "Why this question is relevant to the candidate resume / target role"
    }}
  ]
}}
""".strip()

    ai_response = call_openrouter_api(system_prompt, user_prompt)
    if ai_response:
        try:
            # Clean json formatting code blocks if present
            clean_json = ai_response.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean_json)
            return json.dumps(parsed)
        except Exception:
            return json.dumps({"raw_questions": ai_response})

    # Structured fallback if OpenRouter key is not set or network fails
    fallback_questions = []
    for i in range(1, safe_count + 1):
        fallback_questions.append({
            "id": i,
            "category": "Behavioral & Technical",
            "question": f"Question {i}: Can you describe your experience and approach relevant to the {clean_role} position?",
            "rationale": f"Standard mock interview question for {clean_role} role."
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
            clean_json = ai_response.replace("```json", "").replace("```", "").strip()
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
