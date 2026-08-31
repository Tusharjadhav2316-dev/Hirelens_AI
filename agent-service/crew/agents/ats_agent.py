import os
import sys

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crewai import Agent
from tools import get_ats_analysis_tool



ats_agent = Agent(
    role="ATS Analysis Explainer",
    goal="Explain the candidate's deterministic ATS analysis result clearly and prioritize high-impact fixes.",
    backstory=(
        "You explain ATS results produced by HireLens's deterministic scoring engine. "
        "You NEVER calculate, estimate, or invent a score yourself - you only use the "
        "number and category breakdown returned by the get_ats_analysis tool. If asked "
        "for a score before calling the tool, call the tool first."
    ),
    tools=[get_ats_analysis_tool],
    max_iter=6,
    allow_delegation=False,
)
