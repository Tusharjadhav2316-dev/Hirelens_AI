import os
import sys

# Ensure agent-service root directory is on Python path
AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

import pytest



from crew.agents.resume_agent import resume_agent
from crew.agents.ats_agent import ats_agent
from crew.agents.optimizer_agent import optimizer_agent
from crew.agents.career_agent import career_agent
from crew.agents.job_search_agent import job_search_agent
from crew.agents.interview_coach_agent import interview_coach_agent
from crew.manager import manager, get_career_crew
from tools import generate_cover_letter_tool

def get_tool_names(agent):
    return sorted([getattr(t, "name", str(t)) for t in agent.tools])

def test_resume_agent_tools():
    assert get_tool_names(resume_agent) == ["get_resume", "propose_resume_change"]
    assert resume_agent.allow_delegation is False
    assert resume_agent.max_iter == 6

def test_ats_agent_tools():
    assert get_tool_names(ats_agent) == ["get_ats_analysis"]
    assert ats_agent.allow_delegation is False
    assert ats_agent.max_iter == 6

def test_optimizer_agent_tools():
    assert get_tool_names(optimizer_agent) == ["optimize_resume_section"]
    assert optimizer_agent.allow_delegation is False
    assert optimizer_agent.max_iter == 6

def test_career_agent_tools():
    assert get_tool_names(career_agent) == ["get_resume"]
    assert career_agent.allow_delegation is False
    assert career_agent.max_iter == 6

def test_job_search_agent_tools():
    assert get_tool_names(job_search_agent) == ["analyze_skill_gap", "search_jobs"]
    assert job_search_agent.allow_delegation is False
    assert job_search_agent.max_iter == 6

def test_interview_coach_agent_tools():
    assert get_tool_names(interview_coach_agent) == [
        "evaluate_interview_answer",
        "generate_interview_report",
        "prepare_interview_questions",
    ]
    assert interview_coach_agent.allow_delegation is False
    assert interview_coach_agent.max_iter == 6

def test_manager_agent_delegation_and_tools():
    assert manager.allow_delegation is True
    assert manager.max_iter == 6
    # Manager has access to generate_cover_letter tool for routing cover letter tasks
    manager_tools = get_tool_names(manager)
    assert "generate_cover_letter" in manager_tools

def test_cover_letter_tool_isolation():
    # Assert generate_cover_letter is NOT assigned to any specialized domain agent
    specialized_agents = [
        resume_agent,
        ats_agent,
        optimizer_agent,
        career_agent,
        job_search_agent,
        interview_coach_agent,
    ]
    for agent in specialized_agents:
        tools = get_tool_names(agent)
        assert "generate_cover_letter" not in tools, f"generate_cover_letter wrongfully assigned to {agent.role}"

def test_crew_configuration():
    crew = get_career_crew()
    assert len(crew.agents) == 6
    assert crew.manager_agent == manager
    assert crew.memory is False
