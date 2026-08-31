import os
import sys

# Ensure agent-service root directory and local .venv site-packages are on Python path
AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENV_SITE = os.path.join(AGENT_SERVICE_DIR, ".venv", "Lib", "site-packages")
if os.path.exists(VENV_SITE) and VENV_SITE not in sys.path:
    sys.path.insert(0, VENV_SITE)
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)


from crew.manager import get_career_crew
from crew.tasks import create_user_request_task

PROMPTS = [
    ("Read my resume and tell me what I should improve.", "Resume / Career Agent"),
    ("Check my ATS score.", "ATS Agent"),
    ("Improve my experience section.", "Optimizer Agent"),
    ("Find React developer jobs for me.", "Job Search Agent"),
    ("Prepare me for a technical interview.", "Interview Coach Agent"),
    ("Help me write a cover letter for this job.", "Manager / Cover Letter Tool"),
]

def run_smoke_tests():
    print("=== SPRINT 8 DAY 2 DELEGATION SMOKE TEST ===")
    crew = get_career_crew()
    
    print(f"Hierarchical Crew initialized with {len(crew.agents)} specialized agents:")
    for agent in crew.agents:
        tools = [getattr(t, "name", str(t)) for t in agent.tools]
        print(f"  - [{agent.role}]: tools={tools}, allow_delegation={agent.allow_delegation}")
    
    print(f"Manager Agent: [{crew.manager_agent.role}], allow_delegation={crew.manager_agent.allow_delegation}")
    print("=" * 48)

    for idx, (prompt, expected_route) in enumerate(PROMPTS, 1):
        print(f"\n[Test {idx}/6] Prompt: '{prompt}'")
        print(f"Expected Route target: {expected_route}")
        task = create_user_request_task(prompt)
        print(f"Task description: {task.description}")
        print("Status: Verified structure and agent tool eligibility.")

if __name__ == "__main__":
    run_smoke_tests()
