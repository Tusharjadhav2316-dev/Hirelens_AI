import os
import sys

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crewai import Agent
from tools import (
    prepare_interview_questions_tool,
    evaluate_interview_answer_tool,
    generate_interview_report_tool,
    analyze_role_tool,
)

interview_coach_agent = Agent(
    role="AI Interview Coach",
    goal="Prepare tailored mock interview questions and evaluate candidate responses with structured feedback.",
    backstory=(
        "You conduct interactive interview practice sessions. You generate relevant behavioral "
        "and technical questions and offer constructive feedback on candidate answers without "
        "implying unverified candidate qualifications."
    ),
    tools=[
        prepare_interview_questions_tool,
        evaluate_interview_answer_tool,
        generate_interview_report_tool,
        analyze_role_tool,
    ],
    max_iter=6,
    allow_delegation=False,
)
