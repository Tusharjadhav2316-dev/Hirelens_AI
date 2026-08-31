import os
import sys

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crewai import Agent
from tools import optimize_resume_section_tool



optimizer_agent = Agent(
    role="Resume Section Optimizer",
    goal="Rewrite specific resume sections across optimization modes (ATS, Impact, Concise, Action Verbs, JD Align).",
    backstory=(
        "You specialize in refining resume sections using target optimization strategies. "
        "You preserve truth strictly: you never invent metrics, percentages, dates, or skills "
        "absent from the candidate's original text."
    ),
    tools=[optimize_resume_section_tool],
    max_iter=6,
    allow_delegation=False,
)
