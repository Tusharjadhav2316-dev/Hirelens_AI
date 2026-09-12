import os
import sys
import json
import pytest
import asyncio

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from crew.event_bus import EventBus
from crew.manager import process_manager_request_async
from schemas.events import (
    AgentStartedEvent,
    AgentCompletedEvent,
    ToolStartedEvent,
    ToolCompletedEvent,
    MessageDeltaEvent,
    ArtifactEvent,
    ActionRequiredEvent,
    ErrorEvent,
    CompletedEvent,
)
from schemas.interview_session import InterviewSessionState
from crew.interview_manager import MAX_QUESTIONS_PER_SESSION

EXISTING_9_EVENT_TYPES = {
    "agent_started",
    "agent_completed",
    "tool_started",
    "tool_completed",
    "message_delta",
    "artifact",
    "action_required",
    "error",
    "completed",
}

def test_interview_start_event_stream_uses_only_existing_9_event_types():
    """
    Verify Route 4a (start mock interview):
    The event stream uses strictly a subset of the 9 canonical event types.
    """
    async def run_test():
        bus = EventBus()
        task = asyncio.create_task(
            process_manager_request_async(
                message="start mock interview for Software Engineer",
                resume_text="Experienced in Python and React.",
                job_description=None,
                attachments=[],
                bus=bus,
                interview_session=None,
            )
        )

        events = [e async for e in bus.stream()]
        result = await task

        assert len(events) > 0

        seen_types = {e["type"] for e in events}
        assert seen_types.issubset(EXISTING_9_EVENT_TYPES), f"Found unauthorized event types: {seen_types - EXISTING_9_EVENT_TYPES}"

        # Verify completed event is the final event
        assert events[-1]["type"] == "completed"

        # Verify question card artifact was emitted
        artifact_events = [e for e in events if e["type"] == "artifact"]
        assert len(artifact_events) >= 1
        assert artifact_events[0]["artifact"]["type"] == "interview_question_card"

    asyncio.run(run_test())


def test_interview_answer_feedback_event_stream_uses_only_existing_9_event_types():
    """
    Verify Route 4b (submit answer and receive feedback + follow-up/next question):
    The event stream uses strictly a subset of the 9 canonical event types.
    """
    async def run_test():
        session = InterviewSessionState(
            session_id="sess-stream-test",
            interview_type="technical",
            target_role="Full Stack Engineer",
            difficulty="intermediate",
            question_index=0,
            questions_asked=[
                {
                    "id": "q1",
                    "question": "How do you optimize React render cycles?",
                    "category": "Frontend Architecture",
                    "difficulty": "intermediate",
                }
            ],
            answers_given=[],
            status="in_progress",
        )

        bus = EventBus()
        task = asyncio.create_task(
            process_manager_request_async(
                message="I use React.memo, useMemo, and useCallback to prevent unnecessary child re-renders.",
                resume_text="Experienced in React, TypeScript, and Node.js.",
                job_description=None,
                attachments=[],
                bus=bus,
                interview_session=session,
            )
        )

        events = [e async for e in bus.stream()]
        result = await task

        assert len(events) > 0

        seen_types = {e["type"] for e in events}
        assert seen_types.issubset(EXISTING_9_EVENT_TYPES), f"Found unauthorized event types: {seen_types - EXISTING_9_EVENT_TYPES}"

        # Verify tool events and artifact events
        tool_completed_events = [e for e in events if e["type"] == "tool_completed"]
        assert any(e.get("tool") == "evaluate_interview_answer" for e in tool_completed_events)

        artifact_events = [e for e in events if e["type"] == "artifact"]
        artifact_types = [e["artifact"]["type"] for e in artifact_events]
        assert "interview_feedback_card" in artifact_types
        assert "interview_question_card" in artifact_types

        assert events[-1]["type"] == "completed"

    asyncio.run(run_test())


def test_interview_completion_report_event_stream_uses_only_existing_9_event_types():
    """
    Verify Route 4b/4c completion turn:
    When reaching MAX_QUESTIONS_PER_SESSION, emits report artifact and only canonical event types.
    """
    async def run_test():
        total_q = MAX_QUESTIONS_PER_SESSION
        questions = [
            {"id": f"q{i}", "question": f"Question {i}", "category": "Technical", "difficulty": "intermediate"}
            for i in range(1, total_q + 1)
        ]
        answers = [
            {
                "question_id": f"q{i}",
                "answer": f"Answer {i}",
                "feedback": {
                    "clarity": "clear",
                    "structure": "structured",
                    "specificity": "concrete",
                    "technical_depth": "proficient",
                    "strengths": ["Good point"],
                    "improvements": ["Elaborate"],
                    "suggested_answer_direction": "Add metrics",
                },
            }
            for i in range(1, total_q)
        ]

        session = InterviewSessionState(
            session_id="sess-stream-complete-test",
            interview_type="technical",
            target_role="Full Stack Engineer",
            difficulty="intermediate",
            question_index=total_q - 1,
            questions_asked=questions,
            answers_given=answers,
            status="in_progress",
        )

        bus = EventBus()
        task = asyncio.create_task(
            process_manager_request_async(
                message="Final detailed answer addressing caching and database indexing.",
                resume_text="Senior Developer with 5 years experience.",
                job_description=None,
                attachments=[],
                bus=bus,
                interview_session=session,
            )
        )

        events = [e async for e in bus.stream()]
        result = await task

        assert len(events) > 0

        seen_types = {e["type"] for e in events}
        assert seen_types.issubset(EXISTING_9_EVENT_TYPES), f"Found unauthorized event types: {seen_types - EXISTING_9_EVENT_TYPES}"

        artifact_events = [e for e in events if e["type"] == "artifact"]
        artifact_types = [e["artifact"]["type"] for e in artifact_events]
        assert "interview_feedback_card" in artifact_types
        assert "interview_report_card" in artifact_types

        assert events[-1]["type"] == "completed"

    asyncio.run(run_test())
