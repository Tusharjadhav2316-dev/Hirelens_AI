from crewai import Task

def create_user_request_task(user_message: str) -> Task:
    return Task(
        description=f"Respond to the user's career request: '{user_message}'",
        expected_output="A structured, helpful response addressing the user's intent.",
    )
