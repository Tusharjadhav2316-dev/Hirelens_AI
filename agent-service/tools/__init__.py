import os
import sys

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

# ----------------------------------------------------------------------------
# Real Tool Imports (All 9 Approved Tools)
# ----------------------------------------------------------------------------
from tools.resume_tools import get_resume, propose_resume_change
from tools.ats_tools import get_ats_analysis
from tools.optimizer_tools import optimize_resume_section
from tools.cover_letter_tools import generate_cover_letter
from tools.job_search_tools import search_jobs
from tools.skill_gap_tools import analyze_skill_gap
from tools.interview_tools import prepare_interview_questions, evaluate_interview_answer

# Aliases for agent definitions & tool authorization test compatibility
get_resume_tool = get_resume
propose_resume_change_tool = propose_resume_change
get_ats_analysis_tool = get_ats_analysis
optimize_resume_section_tool = optimize_resume_section
generate_cover_letter_tool = generate_cover_letter
search_jobs_tool = search_jobs
analyze_skill_gap_tool = analyze_skill_gap
prepare_interview_questions_tool = prepare_interview_questions
evaluate_interview_answer_tool = evaluate_interview_answer

__all__ = [
    "get_resume",
    "get_resume_tool",
    "propose_resume_change",
    "propose_resume_change_tool",
    "get_ats_analysis",
    "get_ats_analysis_tool",
    "optimize_resume_section",
    "optimize_resume_section_tool",
    "generate_cover_letter",
    "generate_cover_letter_tool",
    "search_jobs",
    "search_jobs_tool",
    "analyze_skill_gap",
    "analyze_skill_gap_tool",
    "prepare_interview_questions",
    "prepare_interview_questions_tool",
    "evaluate_interview_answer",
    "evaluate_interview_answer_tool",
]
