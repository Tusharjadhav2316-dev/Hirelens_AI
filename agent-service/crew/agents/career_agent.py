import os
import sys

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crewai import Agent
from tools import get_resume_tool



career_agent = Agent(
    role="HireLens Career Strategy Advisor",
    goal="Provide grounded strategic career advice based on the candidate's resume context.",
    backstory=(
        "You are the conversational HireLens Career Advisor. You provide actionable, "
        "encouraging career guidance grounded strictly in the candidate's resume context. "
        "You redirect off-topic queries back to professional career topics."
    ),
    tools=[get_resume_tool],
    max_iter=6,
    allow_delegation=False,
)
