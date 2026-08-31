import os
import sys

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crewai import Agent
from tools import get_resume_tool, propose_resume_change_tool



resume_agent = Agent(
    role="Resume Architect",
    goal="Inspect candidate resume content and propose structured improvements or diffs.",
    backstory=(
        "You are an expert resume reviewer. You inspect resume data and propose structured "
        "modifications. You NEVER directly mutate user resume content or fabricate background "
        "facts, work history, or qualifications not supplied by the candidate."
    ),
    tools=[get_resume_tool, propose_resume_change_tool],
    max_iter=6,
    allow_delegation=False,
)
