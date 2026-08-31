import os
import sys
import json
import asyncio
from typing import Optional, Dict, Any, List

# Ensure local imports work
AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from tools.ats_tools import get_ats_analysis
from tools.skill_gap_tools import analyze_skill_gap
from tools.optimizer_tools import optimize_resume_section
from tools.cover_letter_tools import generate_cover_letter
from tools.resume_tools import propose_resume_change
from crew.event_bus import EventBus

APPLICATION_WORKFLOW_STEPS = ["ats", "skill_gap", "optimize", "cover_letter"]

COMPOUND_INTENT_KEYWORDS = [
    "help me apply",
    "apply to this job",
    "prepare my application",
    "apply for this role",
    "prepare application",
    "optimize my resume and write a cover letter",
    "analyze this job and prepare",
    "tailor my resume and cover letter"
]

SINGLE_INTENT_KEYWORDS = [
    "check my ats score",
    "ats score",
    "improve my resume",
    "optimize summary",
    "write a cover letter",
    "search jobs",
    "interview questions"
]

def detect_compound_intent(message: str, has_jd: bool = False) -> Optional[str]:
    """
    Classify whether a user query matches a compound application workflow intent.
    Returns 'application_workflow' if matched, otherwise None for single-intent routing.
    """
    clean = (message or "").lower().strip()
    if not clean:
        return None

    # Priority 1: Check compound intent keyword matchers
    if any(compound_kw in clean for compound_kw in COMPOUND_INTENT_KEYWORDS):
        return "application_workflow"

    # Priority 2: Check for presence of JD with application request
    if has_jd and ("apply" in clean or "application" in clean or "full review" in clean):
        return "application_workflow"

    return None

async def emit_event_helper(bus: Optional[EventBus], event_data: Dict[str, Any]) -> None:
    if bus:
        await bus.push(event_data)

async def run_application_workflow_async(
    message: str,
    resume_text: str,
    job_description: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None,
    internal_jwt: Optional[str] = None,
    bus: Optional[EventBus] = None
) -> Dict[str, Any]:
    """
    Asynchronously executes the 4-step Application Workflow sequentially:
    1. ATS Analysis (get_ats_analysis) -> ats_score_card artifact
    2. Skill Gap Analysis (analyze_skill_gap) -> skill_gap_card artifact
    3. Targeted Resume Optimization (optimize_resume_section) -> resume_diff artifact
    4. Cover Letter Generation (generate_cover_letter) -> cover_letter_preview artifact
    Pushes NDJSON events to event_bus as each step progresses.
    """
    clean_jd = (job_description or "").strip()

    await emit_event_helper(bus, {"type": "agent_started", "agent": "manager"})

    # Step 0: Job Description requirement check
    if not clean_jd:
        err_msg = "A Job Description is required to run the full application workflow. Please provide the target Job Description."
        await emit_event_helper(bus, {"type": "error", "message": err_msg})
        await emit_event_helper(bus, {"type": "completed"})
        if bus:
            await bus.push_end()
        return {
            "status": "needs_input",
            "workflow": "application_workflow",
            "message": err_msg,
            "artifacts": []
        }

    artifacts: List[Dict[str, Any]] = []
    completed_steps: List[str] = []

    # Step 1: ATS Analysis
    await emit_event_helper(bus, {"type": "agent_started", "agent": "ats_agent"})
    await emit_event_helper(bus, {"type": "tool_started", "agent": "ats_agent", "tool": "get_ats_analysis"})
    
    try:
        ats_response = get_ats_analysis._run(
            resume_text=resume_text,
            job_description=clean_jd,
            internal_jwt=internal_jwt
        )
        ats_data = json.loads(ats_response) if isinstance(ats_response, str) else ats_response
        await emit_event_helper(bus, {"type": "tool_completed", "agent": "ats_agent", "tool": "get_ats_analysis"})

        if "error" in ats_data:
            art = {"type": "ats_score_card", "status": "failed", "data": {"error": ats_data["error"]}}
        else:
            completed_steps.append("ats")
            ats_result_obj = ats_data.get("result") if (isinstance(ats_data, dict) and "result" in ats_data) else ats_data
            overall = 0
            if isinstance(ats_result_obj, dict):
                overall = ats_result_obj.get("finalScore") or ats_result_obj.get("overallScore") or ats_result_obj.get("score") or 0
                if "finalScore" in ats_result_obj and "overallScore" not in ats_result_obj:
                    ats_result_obj["overallScore"] = ats_result_obj["finalScore"]
            art = {
                "type": "ats_score_card",
                "status": "completed",
                "source": "deterministic_hirelens_ats_engine",
                "data": {
                    "result": ats_result_obj,
                    "explanation": f"Deterministic ATS Analysis completed. Score: {overall}/100."
                }
            }
        artifacts.append(art)
        await emit_event_helper(bus, {"type": "artifact", "artifact": art})
    except Exception as e:
        await emit_event_helper(bus, {"type": "tool_completed", "agent": "ats_agent", "tool": "get_ats_analysis"})
        art = {"type": "ats_score_card", "status": "failed", "data": {"error": f"ATS error: {str(e)}"}}
        artifacts.append(art)
        await emit_event_helper(bus, {"type": "artifact", "artifact": art})

    await emit_event_helper(bus, {"type": "agent_completed", "agent": "ats_agent"})

    # Step 2: Skill Gap Analysis
    await emit_event_helper(bus, {"type": "agent_started", "agent": "job_search_agent"})
    await emit_event_helper(bus, {"type": "tool_started", "agent": "job_search_agent", "tool": "analyze_skill_gap"})

    try:
        sg_response = analyze_skill_gap._run(
            job_description=clean_jd,
            resume_text=resume_text,
            internal_jwt=internal_jwt
        )
        sg_data = json.loads(sg_response) if isinstance(sg_response, str) else sg_response
        await emit_event_helper(bus, {"type": "tool_completed", "agent": "job_search_agent", "tool": "analyze_skill_gap"})

        if "error" in sg_data:
            art = {"type": "skill_gap_card", "status": "failed", "data": {"error": sg_data["error"]}}
        else:
            completed_steps.append("skill_gap")
            art = {
                "type": "skill_gap_card",
                "status": "completed",
                "source": "deterministic_hirelens_jd_matcher",
                "data": sg_data
            }
        artifacts.append(art)
        await emit_event_helper(bus, {"type": "artifact", "artifact": art})
    except Exception as e:
        await emit_event_helper(bus, {"type": "tool_completed", "agent": "job_search_agent", "tool": "analyze_skill_gap"})
        art = {"type": "skill_gap_card", "status": "failed", "data": {"error": f"Skill gap error: {str(e)}"}}
        artifacts.append(art)
        await emit_event_helper(bus, {"type": "artifact", "artifact": art})

    await emit_event_helper(bus, {"type": "agent_completed", "agent": "job_search_agent"})

    # Step 3: Targeted Resume Optimization
    await emit_event_helper(bus, {"type": "agent_started", "agent": "optimizer_agent"})
    await emit_event_helper(bus, {"type": "tool_started", "agent": "optimizer_agent", "tool": "optimize_resume_section"})

    try:
        opt_constraint = (
            "CONSTRAINED OPTIMIZATION RULE: Only reword, clarify, or surface skills already evidenced "
            "in the candidate's resume. NEVER invent missing skills, experiences, or tools absent from the resume."
        )
        opt_response = optimize_resume_section._run(
            section="experience",
            content=f"{opt_constraint}\n\n{resume_text}",
            mode="jd-align",
            job_description=clean_jd,
            internal_jwt=internal_jwt
        )
        opt_data = json.loads(opt_response) if isinstance(opt_response, str) else opt_response
        await emit_event_helper(bus, {"type": "tool_completed", "agent": "optimizer_agent", "tool": "optimize_resume_section"})

        if "error" in opt_data:
            art = {"type": "resume_diff", "status": "failed", "data": {"error": opt_data["error"]}}
        else:
            improved = opt_data.get("improvedContent", opt_response)
            diff_json = propose_resume_change._run(
                section="experience",
                item_id="exp_workflow",
                before=resume_text[:200] + "...",
                after=improved,
                rationale="Aligned existing resume experience to target job requirements without inventing unevidenced skills."
            )
            art = {
                "type": "resume_diff",
                "status": "proposal_only",
                "applied": False,
                "data": json.loads(diff_json)
            }
            completed_steps.append("optimize")
        artifacts.append(art)
        await emit_event_helper(bus, {"type": "artifact", "artifact": art})
    except Exception as e:
        await emit_event_helper(bus, {"type": "tool_completed", "agent": "optimizer_agent", "tool": "optimize_resume_section"})
        art = {"type": "resume_diff", "status": "failed", "data": {"error": f"Optimization error: {str(e)}"}}
        artifacts.append(art)
        await emit_event_helper(bus, {"type": "artifact", "artifact": art})

    await emit_event_helper(bus, {"type": "agent_completed", "agent": "optimizer_agent"})

    # Step 4: Cover Letter Generation
    await emit_event_helper(bus, {"type": "agent_started", "agent": "manager"})
    await emit_event_helper(bus, {"type": "tool_started", "agent": "manager", "tool": "generate_cover_letter"})

    try:
        cl_response = generate_cover_letter._run(
            job_title="Target Role",
            company="Target Company",
            job_description=clean_jd,
            resume_text=resume_text,
            internal_jwt=internal_jwt
        )
        cl_data = json.loads(cl_response) if isinstance(cl_response, str) else cl_response
        await emit_event_helper(bus, {"type": "tool_completed", "agent": "manager", "tool": "generate_cover_letter"})

        if "error" in cl_data:
            art = {"type": "cover_letter_preview", "status": "failed", "data": {"error": cl_data["error"]}}
        else:
            completed_steps.append("cover_letter")
            art = {
                "type": "cover_letter_preview",
                "status": "completed",
                "data": cl_data
            }
        artifacts.append(art)
        await emit_event_helper(bus, {"type": "artifact", "artifact": art})
    except Exception as e:
        await emit_event_helper(bus, {"type": "tool_completed", "agent": "manager", "tool": "generate_cover_letter"})
        art = {"type": "cover_letter_preview", "status": "failed", "data": {"error": f"Cover letter error: {str(e)}"}}
        artifacts.append(art)
        await emit_event_helper(bus, {"type": "artifact", "artifact": art})

    await emit_event_helper(bus, {"type": "message_delta", "agent": "manager", "text": "Application workflow completed successfully with 4 reviewable artifacts."})
    await emit_event_helper(bus, {"type": "agent_completed", "agent": "manager"})
    await emit_event_helper(bus, {"type": "completed"})

    if bus:
        await bus.push_end()

    return {
        "status": "completed" if len(completed_steps) == 4 else "partial",
        "workflow": "application_workflow",
        "steps_completed": completed_steps,
        "artifacts": artifacts
    }

def run_application_workflow(
    message: str,
    resume_text: str,
    job_description: Optional[str] = None,
    internal_jwt: Optional[str] = None
) -> Dict[str, Any]:
    """Sync wrapper preserving Day 5 API compatibility."""
    return asyncio.run(run_application_workflow_async(
        message=message,
        resume_text=resume_text,
        job_description=job_description,
        internal_jwt=internal_jwt,
        bus=None
    ))
