import os
import sys
import pytest

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crew.interview_manager import (
    start_session,
    resolve_interview_context,
    _extract_jd_from_attachments,
    _extract_resume_from_attachments,
)

def test_resolve_context_direct_fields_only():
    res = resolve_interview_context(
        resume_text="Senior React Developer with 5 years experience",
        job_description="Looking for a Senior Frontend Engineer proficient in Next.js",
        attachments=None
    )
    assert res["resume_text"] == "Senior React Developer with 5 years experience"
    assert res["job_description"] == "Looking for a Senior Frontend Engineer proficient in Next.js"

def test_resolve_context_attachment_fallback_categorized():
    attachments = [
        {
            "id": "att-1",
            "name": "document1.pdf",
            "category": "job_description",
            "extractedText": "Staff Backend Engineer job description: Python, Distributed Systems",
        },
        {
            "id": "att-2",
            "name": "document2.pdf",
            "category": "resume",
            "extractedText": "Jane Doe - Python Engineer with 8 years building scalable APIs",
        }
    ]
    res = resolve_interview_context(
        resume_text="",
        job_description="",
        attachments=attachments
    )
    assert "Staff Backend Engineer" in res["job_description"]
    assert "Jane Doe" in res["resume_text"]

def test_resolve_context_attachment_fallback_by_filename():
    attachments = [
        {
            "id": "att-1",
            "name": "Company_JD_Software_Engineer.pdf",
            "extractedText": "Requirements: AWS, Kubernetes, Go",
        },
        {
            "id": "att-2",
            "name": "John_Doe_CV.pdf",
            "extractedText": "John Doe - DevOps Engineer with Kubernetes expertise",
        }
    ]
    res = resolve_interview_context(
        resume_text="",
        job_description="",
        attachments=attachments
    )
    assert "Requirements: AWS, Kubernetes, Go" in res["job_description"]
    assert "John Doe" in res["resume_text"]

def test_resolve_context_direct_field_takes_precedence_over_attachment():
    attachments = [
        {
            "id": "att-1",
            "name": "old_job_description.txt",
            "category": "job_description",
            "extractedText": "Old JD content from attachment",
        }
    ]
    res = resolve_interview_context(
        resume_text="Candidate Profile",
        job_description="Directly supplied fresh Job Description",
        attachments=attachments
    )
    assert res["job_description"] == "Directly supplied fresh Job Description"
    assert res["resume_text"] == "Candidate Profile"

def test_resolve_context_empty_and_none_handled_gracefully():
    res = resolve_interview_context(
        resume_text=None,
        job_description=None,
        attachments=[]
    )
    assert res["resume_text"] == ""
    assert res["job_description"] == ""

def test_start_session_with_context_parameters():
    attachments = [
        {
            "id": "att-1",
            "name": "job.pdf",
            "category": "job_description",
            "extractedText": "Lead Architect role requirements",
        }
    ]
    session = start_session(
        interview_type="technical",
        target_role="Lead Architect",
        difficulty="advanced",
        resume_text="Experienced Architect with cloud native experience",
        job_description=None,
        attachments=attachments,
    )
    assert session.session_id is not None
    assert session.interview_type == "technical"
    assert session.target_role == "Lead Architect"
    assert session.difficulty == "advanced"
    assert session.status == "in_progress"
