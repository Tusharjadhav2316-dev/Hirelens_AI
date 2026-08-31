import json
from typing import Dict, Any, Optional
from crewai.tools import tool

@tool("get_resume")
def get_resume(query: str = "") -> str:
    """Retrieve the candidate's current resume content snapshot from request context."""
    # Resume content is passed in the task/request context
    return json.dumps({
        "status": "success",
        "message": "Resume snapshot retrieved from authenticated session context.",
        "query": query
    })

@tool("propose_resume_change")
def propose_resume_change(
    section: str,
    item_id: Optional[str] = None,
    before: str = "",
    after: str = "",
    rationale: str = ""
) -> str:
    """
    Propose structured modifications or diffs to a specific resume section.
    
    IMPORTANT: This tool produces a PROPOSAL ONLY. It NEVER mutates Firestore,
    never updates ResumeContext directly, and never applies changes automatically.
    """
    proposal = {
        "type": "resume_diff_proposal",
        "status": "proposal_only",
        "applied": False,
        "section": section,
        "item_id": item_id,
        "before": before,
        "after": after,
        "rationale": rationale,
        "user_action_required": "Review and accept or reject this proposed change."
    }
    return json.dumps(proposal)
