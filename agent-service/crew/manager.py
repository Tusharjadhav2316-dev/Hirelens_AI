import os
import sys
import asyncio
import json
from typing import Optional, Dict, Any, List

# Ensure agent-service root directory is on Python path
AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crewai import Agent, Crew, Process
from tools import (
    generate_cover_letter_tool,
    get_ats_analysis_tool,
    optimize_resume_section_tool,
    get_resume_tool,
    get_ats_analysis,
    optimize_resume_section,
    generate_cover_letter,
    prepare_interview_questions,
    search_jobs,
    analyze_skill_gap,
)
from tools.openrouter_client import call_openrouter_api
from crew.agents.resume_agent import resume_agent
from crew.agents.ats_agent import ats_agent
from crew.agents.optimizer_agent import optimizer_agent
from crew.agents.career_agent import career_agent
from crew.agents.job_search_agent import job_search_agent
from crew.agents.interview_coach_agent import interview_coach_agent
from crew.workflows import detect_compound_intent, run_application_workflow_async, run_application_workflow
from crew.grounded_resume import generate_grounded_structured_resume
from crew.event_bus import EventBus

manager = Agent(
    role="HireLens Career Agent Manager",
    goal="Understand what the user needs, delegate tasks to the appropriate specialized agent(s), and synthesize a final response.",
    backstory=(
        "You coordinate specialized career agents. You delegate tasks to domain specialists "
        "and never perform their specialized work yourself. You synthesize outputs into a coherent final answer."
    ),
    tools=[generate_cover_letter_tool],
    allow_delegation=True,
    max_iter=6,
)

def get_career_crew() -> Crew:
    return Crew(
        agents=[
            resume_agent,
            ats_agent,
            optimizer_agent,
            career_agent,
            job_search_agent,
            interview_coach_agent,
        ],
        manager_agent=manager,
        process=Process.hierarchical,
        memory=False,
    )

def is_empty_resume_json(text: str) -> bool:
    """Helper to check if resume_text is empty or just an empty JSON object/template."""
    cleaned = (text or "").strip()
    if not cleaned or len(cleaned) < 15:
        return True
    if cleaned.startswith("{") and cleaned.endswith("}"):
        try:
            parsed = json.loads(cleaned)
            if not isinstance(parsed, dict) or not parsed:
                return True
            # Check if all top-level keys contain empty values/arrays
            has_content = False
            for v in parsed.values():
                if v and (isinstance(v, str) or (isinstance(v, list) and len(v) > 0) or (isinstance(v, dict) and len(v) > 0)):
                    has_content = True
                    break
            return not has_content
        except Exception:
            return True
    return False

async def process_manager_request_async(
    message: str,
    resume_text: str,
    job_description: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None,
    internal_jwt: Optional[str] = None,
    bus: Optional[EventBus] = None
) -> Dict[str, Any]:
    """
    Asynchronous Manager entry point.
    Executes compound application workflows or delegates single-intent tool workflows cleanly.
    Emits real NDJSON events, real structured artifacts, and friendly conversational responses.
    """
    effective_resume = resume_text or ""
    effective_jd = job_description or ""

    # Infer resume_text and job_description from attachments if present
    if attachments:
        for att in attachments:
            name_lower = att.get("name", "").lower()
            text = att.get("extractedText", "").strip()
            if not text:
                continue

            # Diagnostic log (safe metadata only, no sensitive content)
            print(f"[Attachment Context] Document '{att.get('name')}' attached. Character count: {len(text)}")

            if ("resume" in name_lower or "cv" in name_lower) or is_empty_resume_json(effective_resume):
                effective_resume = text
            elif ("job" in name_lower or "jd" in name_lower or "description" in name_lower) and len(effective_jd.strip()) < 20:
                effective_jd = text
            elif is_empty_resume_json(effective_resume):
                effective_resume = text

    has_jd = bool(effective_jd and effective_jd.strip())
    clean = (message or "").lower().strip()

    # Special check: Resume building from scratch / reference document request
    if ("build" in clean or "create" in clean) and ("resume" in clean):
        if bus:
            await bus.push({"type": "agent_started", "agent": "manager"})
            await bus.push({"type": "agent_started", "agent": "resume_agent"})

        if effective_resume and len(effective_resume.strip()) > 30 and not is_empty_resume_json(effective_resume):
            # Read reference resume & structure into grounded Resume object
            structured_res = generate_grounded_structured_resume(
                resume_text=effective_resume,
                target_role_or_instruction=message,
                job_description=effective_jd
            )

            art = {
                "type": "resume_preview",
                "status": "completed",
                "data": {
                    "resume": structured_res,
                    "summaryNote": "Structured ATS-optimized resume generated from reference document."
                }
            }
            msg_text = "I've analyzed your reference resume and generated a structured, ATS-optimized resume proposal. You can review, edit, and export it as a PDF in the Artifact Canvas."

            if bus:
                await bus.push({"type": "artifact", "artifact": art})
                await bus.push({"type": "message_delta", "agent": "resume_agent", "text": msg_text})
                await bus.push({"type": "agent_completed", "agent": "resume_agent"})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()

            return {"status": "single_intent_delegation", "message": msg_text, "artifacts": [art]}
        else:
            msg_text = (
                "To build an ATS-optimized resume, please upload or attach your reference resume (PDF, DOCX, TXT), "
                "or provide your details for the following sections:\n\n"
                "1. **Contact Info**: Full Name, Email, Phone, Location\n"
                "2. **Professional Summary**: 2-3 sentence overview\n"
                "3. **Work Experience**: Titles, companies, bullet points\n"
                "4. **Technical Skills**: Languages, frameworks, tools\n"
                "5. **Education**: Degrees, institutions\n\n"
                "Once provided, I will generate a structured, ATS-tailored resume proposal for you."
            )

            if bus:
                await bus.push({"type": "message_delta", "agent": "resume_agent", "text": msg_text})
                await bus.push({"type": "agent_completed", "agent": "resume_agent"})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()

            return {"status": "single_intent_delegation", "message": msg_text, "artifacts": []}

    intent = detect_compound_intent(message, has_jd=has_jd)

    if intent == "application_workflow":
        return await run_application_workflow_async(
            message=message,
            resume_text=effective_resume,
            job_description=effective_jd,
            attachments=attachments,
            internal_jwt=internal_jwt,
            bus=bus
        )

    # Route 1: ATS Score Analysis
    if "ats" in clean or "score" in clean:
        target_agent = "ats_agent"
        tool_name = "get_ats_analysis"

        if bus:
            await bus.push({"type": "agent_started", "agent": "manager"})
            await bus.push({"type": "agent_started", "agent": target_agent})
            await bus.push({"type": "tool_started", "agent": target_agent, "tool": tool_name})

        try:
            res_str = get_ats_analysis._run(
                resume_text=effective_resume,
                job_description=effective_jd,
                internal_jwt=internal_jwt
            )
            ats_data = json.loads(res_str) if isinstance(res_str, str) else res_str
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})

            if isinstance(ats_data, dict) and "error" in ats_data:
                art = {"type": "ats_score_card", "status": "failed", "data": {"error": ats_data["error"]}}
                msg_text = f"ATS Analysis error: {ats_data['error']}"
            else:
                ats_result_obj = ats_data.get("result") if (isinstance(ats_data, dict) and "result" in ats_data) else ats_data
                overall = 0
                if isinstance(ats_result_obj, dict):
                    overall = (
                        ats_result_obj.get("finalScore") or
                        ats_result_obj.get("overallScore") or
                        ats_result_obj.get("score") or
                        0
                    )
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
                msg_text = f"I've analyzed your resume against the deterministic ATS engine. Your overall ATS score is {overall}/100. Check the ATS Score Card artifact for the complete breakdown."

            if bus:
                await bus.push({"type": "artifact", "artifact": art})
                await bus.push({"type": "message_delta", "agent": target_agent, "text": msg_text})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()

            return {"status": "single_intent_delegation", "artifacts": [art]}
        except Exception as e:
            err_msg = f"ATS analysis tool error: {str(e)}"
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})
                await bus.push({"type": "error", "message": err_msg})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()
            return {"status": "failed", "error": err_msg}

    # Route 2: Targeted Resume Optimization
    elif "improve" in clean or "optimize" in clean or "reword" in clean or "rewrite" in clean or "summary" in clean or "experience" in clean:
        target_agent = "optimizer_agent"
        tool_name = "optimize_resume_section"

        if bus:
            await bus.push({"type": "agent_started", "agent": "manager"})
            await bus.push({"type": "agent_started", "agent": target_agent})
            await bus.push({"type": "tool_started", "agent": target_agent, "tool": tool_name})

        try:
            target_sec = "summary" if "summary" in clean else "experience"
            opt_res = optimize_resume_section._run(
                section=target_sec,
                content=effective_resume or "Candidate Experience",
                mode="ats",
                job_description=effective_jd,
                internal_jwt=internal_jwt
            )
            opt_data = json.loads(opt_res) if isinstance(opt_res, str) else opt_res
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})

            if isinstance(opt_data, dict) and "error" in opt_data:
                art = {"type": "resume_diff", "status": "failed", "data": {"error": opt_data["error"]}}
                msg_text = f"Resume optimization error: {opt_data['error']}"
            else:
                improved = ""
                if isinstance(opt_data, dict):
                    improved = opt_data.get("improvedContent") or opt_data.get("content") or json.dumps(opt_data)
                else:
                    improved = str(opt_res)

                art = {
                    "type": "resume_diff",
                    "status": "proposal_only",
                    "applied": False,
                    "data": {
                        "section": "experience",
                        "itemId": "exp_opt",
                        "before": (effective_resume[:250] + "...") if len(effective_resume) > 250 else (effective_resume or "Original Resume Content"),
                        "after": improved,
                        "rationale": "Optimized bullet points for ATS keyword visibility without inventing unevidenced skills."
                    }
                }
                msg_text = "I've generated an optimized proposal for your resume section. Review the proposed diff in the Artifact Canvas."

            if bus:
                await bus.push({"type": "artifact", "artifact": art})
                await bus.push({"type": "message_delta", "agent": target_agent, "text": msg_text})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()

            return {"status": "single_intent_delegation", "artifacts": [art]}
        except Exception as e:
            err_msg = f"Resume optimization tool error: {str(e)}"
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})
                await bus.push({"type": "error", "message": err_msg})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()
            return {"status": "failed", "error": err_msg}

    # Route 3: Cover Letter Generation
    elif "cover letter" in clean or "letter" in clean:
        target_agent = "manager"
        tool_name = "generate_cover_letter"

        if bus:
            await bus.push({"type": "agent_started", "agent": "manager"})
            await bus.push({"type": "tool_started", "agent": "manager", "tool": tool_name})

        try:
            cl_res = generate_cover_letter._run(
                job_title="Software Engineer",
                company="Target Company",
                job_description=effective_jd,
                resume_text=effective_resume,
                tone="Professional and Confident",
                internal_jwt=internal_jwt
            )
            cl_data = json.loads(cl_res) if isinstance(cl_res, str) else cl_res
            if bus:
                await bus.push({"type": "tool_completed", "agent": "manager", "tool": tool_name})

            if isinstance(cl_data, dict) and "error" in cl_data:
                art = {"type": "cover_letter_preview", "status": "failed", "data": {"error": cl_data["error"]}}
                msg_text = f"Cover letter error: {cl_data['error']}"
            else:
                cl_content = ""
                if isinstance(cl_data, dict):
                    cl_content = cl_data.get("coverLetter") or cl_data.get("content") or json.dumps(cl_data)
                else:
                    cl_content = str(cl_res)

                art = {
                    "type": "cover_letter_preview",
                    "status": "completed",
                    "data": {
                        "content": cl_content,
                        "jobTitle": "Software Engineer",
                        "companyName": "Target Company"
                    }
                }
                msg_text = "I've generated a tailored cover letter based on your resume and target role. You can review and edit it in the Artifact Canvas."

            if bus:
                await bus.push({"type": "artifact", "artifact": art})
                await bus.push({"type": "message_delta", "agent": "manager", "text": msg_text})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()

            return {"status": "single_intent_delegation", "artifacts": [art]}
        except Exception as e:
            err_msg = f"Cover letter generation tool error: {str(e)}"
            if bus:
                await bus.push({"type": "tool_completed", "agent": "manager", "tool": tool_name})
                await bus.push({"type": "error", "message": err_msg})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()
            return {"status": "failed", "error": err_msg}

    # Route 4: Mock Interview Question Preparation
    elif "interview" in clean or "mock" in clean or "questions" in clean or "prep" in clean:
        target_agent = "interview_coach_agent"
        tool_name = "prepare_interview_questions"

        if bus:
            await bus.push({"type": "agent_started", "agent": "manager"})
            await bus.push({"type": "agent_started", "agent": target_agent})
            await bus.push({"type": "tool_started", "agent": target_agent, "tool": tool_name})

        try:
            q_res = prepare_interview_questions._run(
                role="Software Engineer",
                count=5,
                resume_text=effective_resume,
                job_description=effective_jd
            )
            q_data = json.loads(q_res) if isinstance(q_res, str) else q_res
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})

            questions_list = []
            if isinstance(q_data, list):
                questions_list = q_data
            elif isinstance(q_data, dict):
                questions_list = q_data.get("questions", [])

            art = {
                "type": "interview_question_card",
                "status": "completed",
                "data": {
                    "questions": questions_list
                }
            }
            msg_text = "I've generated 5 tailored mock interview questions based on your background and target role. Check the Interview Questions artifact to review key tips and practice your answers."

            if bus:
                await bus.push({"type": "artifact", "artifact": art})
                await bus.push({"type": "message_delta", "agent": target_agent, "text": msg_text})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()

            return {"status": "single_intent_delegation", "artifacts": [art]}
        except Exception as e:
            err_msg = f"Interview prep tool error: {str(e)}"
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})
                await bus.push({"type": "error", "message": err_msg})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()
            return {"status": "failed", "error": err_msg}

    # Route 5: Job Search (NullJobProvider state)
    elif "job" in clean or "search" in clean or "find" in clean or "listing" in clean:
        target_agent = "job_search_agent"
        tool_name = "search_jobs"

        if bus:
            await bus.push({"type": "agent_started", "agent": "manager"})
            await bus.push({"type": "agent_started", "agent": target_agent})
            await bus.push({"type": "tool_started", "agent": target_agent, "tool": tool_name})

        try:
            job_res = search_jobs._run(query=clean)
            job_data = json.loads(job_res) if isinstance(job_res, str) else job_res
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})

            art = {
                "type": "job_result_card",
                "status": "completed",
                "data": {
                    "status": job_data.get("status", "not_configured") if isinstance(job_data, dict) else "not_configured",
                    "listings": job_data.get("listings", []) if isinstance(job_data, dict) else [],
                    "message": job_data.get("message", "Job search provider isn't connected yet.") if isinstance(job_data, dict) else "Job search provider isn't connected yet."
                }
            }
            msg_text = "Live job search integration isn't connected yet. You can view provider status details in the Job Results artifact card."

            if bus:
                await bus.push({"type": "artifact", "artifact": art})
                await bus.push({"type": "message_delta", "agent": target_agent, "text": msg_text})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()

            return {"status": "single_intent_delegation", "artifacts": [art]}
        except Exception as e:
            err_msg = f"Job search tool error: {str(e)}"
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})
                await bus.push({"type": "error", "message": err_msg})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()
            return {"status": "failed", "error": err_msg}

    # Route 6: Skill Gap Analysis
    elif "skill" in clean or "gap" in clean or "missing" in clean:
        target_agent = "job_search_agent"
        tool_name = "analyze_skill_gap"

        if bus:
            await bus.push({"type": "agent_started", "agent": "manager"})
            await bus.push({"type": "agent_started", "agent": target_agent})
            await bus.push({"type": "tool_started", "agent": target_agent, "tool": tool_name})

        try:
            sg_res = analyze_skill_gap._run(
                job_description=effective_jd or "Target Job Description",
                resume_text=effective_resume,
                internal_jwt=internal_jwt
            )
            sg_data = json.loads(sg_res) if isinstance(sg_res, str) else sg_res
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})

            if isinstance(sg_data, dict) and "error" in sg_data:
                art = {"type": "skill_gap_card", "status": "failed", "data": {"error": sg_data["error"]}}
                msg_text = f"Skill gap error: {sg_data['error']}"
            else:
                art = {
                    "type": "skill_gap_card",
                    "status": "completed",
                    "source": "deterministic_hirelens_jd_matcher",
                    "data": sg_data
                }
                match_score = sg_data.get("matchScore", 0) if isinstance(sg_data, dict) else 0
                msg_text = f"I've completed a skill gap analysis comparing your resume to the target role requirements. Match score: {match_score}%."

            if bus:
                await bus.push({"type": "artifact", "artifact": art})
                await bus.push({"type": "message_delta", "agent": target_agent, "text": msg_text})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()

            return {"status": "single_intent_delegation", "artifacts": [art]}
        except Exception as e:
            err_msg = f"Skill gap tool error: {str(e)}"
            if bus:
                await bus.push({"type": "tool_completed", "agent": target_agent, "tool": tool_name})
                await bus.push({"type": "error", "message": err_msg})
                await bus.push({"type": "agent_completed", "agent": target_agent})
                await bus.push({"type": "agent_completed", "agent": "manager"})
                await bus.push({"type": "completed"})
                await bus.push_end()
            return {"status": "failed", "error": err_msg}

    # Route 7: Conversational & Grounded Inquiries ("hii", "Tell me my strongest skills", etc.)
    else:
        target_agent = "career_agent"
        if bus:
            await bus.push({"type": "agent_started", "agent": "manager"})
            await bus.push({"type": "agent_started", "agent": target_agent})

        msg_text = ""

        # Ground answer in uploaded resume if resume text is present
        if effective_resume and len(effective_resume.strip()) > 30 and not is_empty_resume_json(effective_resume):
            system_prompt = (
                "You are the HireLens AI Career Agent. Base your response ONLY on the provided candidate resume context. "
                "Never fabricate candidate experience, skills, or projects not mentioned in the resume. "
                "Be direct, encouraging, concise, and professional."
            )
            user_prompt = f"Candidate Resume Context:\n{effective_resume[:3000]}\n\nUser Question:\n{message}"
            llm_reply = call_openrouter_api(system_prompt, user_prompt, max_tokens=600)
            if llm_reply:
                msg_text = llm_reply

        if not msg_text:
            msg_text = (
                "Hello! I'm your HireLens AI Career Agent. I'm here to assist you with every step of your job application:\n\n"
                "• **ATS Score Analysis**: Get a deterministic match score and keyword breakdown.\n"
                "• **Resume Optimization**: Improve bullet points and experience summaries for target roles.\n"
                "• **Tailored Cover Letters**: Craft compelling, customized cover letters.\n"
                "• **Skill Gap Analysis**: Identify missing keywords and skills required by employers.\n"
                "• **Interview Prep**: Practice with mock interview questions and structured feedback.\n\n"
                "How can I help you advance your career today?"
            )

        if bus:
            await bus.push({"type": "message_delta", "agent": target_agent, "text": msg_text})
            await bus.push({"type": "agent_completed", "agent": target_agent})
            await bus.push({"type": "agent_completed", "agent": "manager"})
            await bus.push({"type": "completed"})
            await bus.push_end()

        return {"status": "single_intent_delegation", "message": msg_text, "artifacts": []}

def process_manager_request(
    message: str,
    resume_text: str,
    job_description: Optional[str] = None,
    internal_jwt: Optional[str] = None
) -> Dict[str, Any]:
    """Sync wrapper preserving Day 2/Day 5 API compatibility."""
    return asyncio.run(process_manager_request_async(
        message=message,
        resume_text=resume_text,
        job_description=job_description,
        internal_jwt=internal_jwt,
        bus=None
    ))
