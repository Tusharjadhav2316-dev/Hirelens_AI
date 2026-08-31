import os
import sys
import json
import pytest
import time
import jwt
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import patch

AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

from main import app
from crew.event_bus import EventBus
from schemas.events import (
    AgentStartedEvent,
    AgentCompletedEvent,
    ToolStartedEvent,
    ToolCompletedEvent,
    MessageDeltaEvent,
    ArtifactEvent,
    ActionRequiredEvent,
    ErrorEvent,
    CompletedEvent
)

SECRET = "test_internal_secret_key_32_bytes_len!!"

def test_event_bus_isolation():
    bus1 = EventBus()
    bus2 = EventBus()

    async def run_test():
        await bus1.push({"type": "agent_started", "agent": "user1_agent"})
        await bus2.push({"type": "agent_started", "agent": "user2_agent"})
        await bus1.push_end()
        await bus2.push_end()

        bus1_events = [e async for e in bus1.stream()]
        bus2_events = [e async for e in bus2.stream()]

        assert len(bus1_events) == 1
        assert bus1_events[0]["agent"] == "user1_agent"

        assert len(bus2_events) == 1
        assert bus2_events[0]["agent"] == "user2_agent"

    asyncio.run(run_test())

def test_all_9_event_types_model_validation():
    events = [
        AgentStartedEvent(agent="manager"),
        AgentCompletedEvent(agent="manager"),
        ToolStartedEvent(agent="ats_agent", tool="get_ats_analysis"),
        ToolCompletedEvent(agent="ats_agent", tool="get_ats_analysis"),
        MessageDeltaEvent(agent="manager", text="Processing..."),
        ArtifactEvent(artifact={"type": "ats_score_card", "data": {"score": 90}}),
        ActionRequiredEvent(actions=[{"action": "confirm"}]),
        ErrorEvent(message="Safe user error"),
        CompletedEvent()
    ]

    for ev in events:
        dumped = ev.model_dump_json()
        data = json.loads(dumped)
        assert "type" in data
        assert data["type"] == ev.type

@patch.dict(os.environ, {"INTERNAL_AGENT_JWT_SECRET": SECRET})
def test_streaming_events_endpoint_sequence():
    client = TestClient(app)
    now = int(time.time())
    token = jwt.encode(
        {"uid": "user_stream_test", "sub": "user_stream_test", "iat": now, "exp": now + 60},
        SECRET,
        algorithm="HS256"
    )

    payload = {
        "message": "Help me apply to this job",
        "resume_text": "Senior Developer with Java & React experience.",
        "job_description": "Senior Engineer role requiring Java, React, Spring Boot."
    }

    response = client.post(
        "/chat",
        headers={"X-Internal-Auth": token},
        json=payload
    )

    assert response.status_code == 200
    assert "application/x-ndjson" in response.headers["content-type"]

    lines = [line.strip() for line in response.text.split("\n") if line.strip()]
    assert len(lines) >= 4

    events = [json.loads(line) for line in lines]
    
    # Assert start event is agent_started manager
    assert events[0]["type"] == "agent_started"
    assert events[0]["agent"] == "manager"

    # Assert end event is completed
    assert events[-1]["type"] == "completed"

    # Assert artifact events exist in the stream
    artifact_types = [e["artifact"]["type"] for e in events if e.get("type") == "artifact"]
    assert "ats_score_card" in artifact_types
    assert "skill_gap_card" in artifact_types
    assert "resume_diff" in artifact_types
    assert "cover_letter_preview" in artifact_types
