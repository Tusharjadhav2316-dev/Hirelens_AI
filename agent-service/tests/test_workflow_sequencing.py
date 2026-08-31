import os
import sys
import json
import pytest
from unittest.mock import patch, MagicMock

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crew.workflows import (
    APPLICATION_WORKFLOW_STEPS,
    detect_compound_intent,
    run_application_workflow
)
from crew.manager import process_manager_request

def test_workflow_steps_constant_order():
    assert APPLICATION_WORKFLOW_STEPS == ["ats", "skill_gap", "optimize", "cover_letter"]

def test_detect_compound_intent_positive():
    assert detect_compound_intent("Help me apply to this job", has_jd=True) == "application_workflow"
    assert detect_compound_intent("prepare my application", has_jd=True) == "application_workflow"
    assert detect_compound_intent("optimize my resume and write a cover letter", has_jd=True) == "application_workflow"

def test_detect_compound_intent_negative_simple_queries():
    assert detect_compound_intent("check my ats score") is None
    assert detect_compound_intent("improve my resume") is None
    assert detect_compound_intent("write a cover letter") is None

def test_workflow_missing_jd_returns_needs_input():
    result = run_application_workflow(
        message="Help me apply to this job",
        resume_text="Software Engineer with Java experience.",
        job_description="" # Missing JD
    )
    assert result["status"] == "needs_input"
    assert "Job Description is required" in result["message"]
    assert result["artifacts"] == []

@patch("crew.workflows.get_ats_analysis._run")
@patch("crew.workflows.analyze_skill_gap._run")
@patch("crew.workflows.optimize_resume_section._run")
@patch("crew.workflows.propose_resume_change._run")
@patch("crew.workflows.generate_cover_letter._run")
def test_full_application_workflow_execution_order_and_artifacts(
    mock_cl, mock_propose, mock_opt, mock_sg, mock_ats
):
    # Mock tool returns
    mock_ats.return_value = json.dumps({"overallScore": 85, "matchScore": 80})
    mock_sg.return_value = json.dumps({"matchScore": 82, "matchedKeywords": ["Java", "React"], "missingKeywords": ["Python"]})
    mock_opt.return_value = json.dumps({"improvedContent": "Enhanced Java and React experience."})
    mock_propose.return_value = json.dumps({
        "section": "experience",
        "before": "Java dev...",
        "after": "Enhanced Java and React experience.",
        "rationale": "Aligned existing wording."
    })
    mock_cl.return_value = json.dumps({"coverLetter": "Dear Hiring Manager..."})

    result = run_application_workflow(
        message="Help me apply to this job",
        resume_text="Senior Java Developer with Spring Boot experience.",
        job_description="Backend Engineer requiring Java, Spring Boot, React."
    )

    assert result["status"] == "completed"
    assert result["steps_completed"] == ["ats", "skill_gap", "optimize", "cover_letter"]

    artifacts = result["artifacts"]
    assert len(artifacts) == 4

    # Assert exact artifact order
    assert artifacts[0]["type"] == "ats_score_card"
    assert artifacts[1]["type"] == "skill_gap_card"
    assert artifacts[2]["type"] == "resume_diff"
    assert artifacts[3]["type"] == "cover_letter_preview"

    # Assert resume_diff is proposal-only
    assert artifacts[2]["status"] == "proposal_only"
    assert artifacts[2]["applied"] is False

    # Assert non-fabrication constraint was passed to optimization step
    opt_call_args = mock_opt.call_args[1]
    assert "CONSTRAINED OPTIMIZATION RULE" in opt_call_args["content"]
    assert "NEVER invent missing skills" in opt_call_args["content"]

@patch("crew.workflows.get_ats_analysis._run")
@patch("crew.workflows.analyze_skill_gap._run")
@patch("crew.workflows.optimize_resume_section._run")
@patch("crew.workflows.propose_resume_change._run")
@patch("crew.workflows.generate_cover_letter._run")
def test_partial_failure_preserves_successful_artifacts(
    mock_cl, mock_propose, mock_opt, mock_sg, mock_ats
):
    # Mock ATS failure, but remaining tools succeed
    mock_ats.side_effect = Exception("ATS connection timeout")
    mock_sg.return_value = json.dumps({"matchScore": 75})
    mock_opt.return_value = json.dumps({"improvedContent": "Improved text."})
    mock_propose.return_value = json.dumps({"before": "old", "after": "new"})
    mock_cl.return_value = json.dumps({"coverLetter": "Letter content"})

    result = run_application_workflow(
        message="Help me apply to this job",
        resume_text="Java developer.",
        job_description="Java job."
    )

    artifacts = result["artifacts"]
    assert len(artifacts) == 4

    # ATS artifact records failure safely
    assert artifacts[0]["type"] == "ats_score_card"
    assert artifacts[0]["status"] == "failed"
    assert "ATS connection timeout" in artifacts[0]["data"]["error"]

    # Skill gap, optimize, and cover letter artifacts succeeded and are preserved
    assert artifacts[1]["type"] == "skill_gap_card"
    assert artifacts[1]["status"] == "completed"

def test_manager_single_intent_delegation():
    # Simple query should route to single-intent delegation fallback
    result = process_manager_request(
        message="Check my ATS score",
        resume_text="Java developer."
    )
    assert result["status"] == "single_intent_delegation"
