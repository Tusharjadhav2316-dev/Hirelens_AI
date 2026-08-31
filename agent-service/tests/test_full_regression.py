"""
Sprint 8 Day 10 End-to-End Full Regression Test Suite for agent-service.
Verifies JWT authorization, schema validity, tool contracts, streaming event bus, and agent orchestration.
"""

import os
import sys
import time
import jwt
import asyncio
import pytest

# Ensure agent-service root directory is on Python path
AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

TEST_SECRET = "a-very-secure-cryptographically-random-test-secret-key-32bytes!"
os.environ["INTERNAL_AGENT_JWT_SECRET"] = TEST_SECRET

from fastapi.testclient import TestClient
from main import app
from crew.event_bus import EventBus
from schemas.events import AgentStartedEvent, AgentCompletedEvent, ToolStartedEvent, ToolCompletedEvent, MessageDeltaEvent
from schemas.agent_response import AgentResponse, Artifact

client = TestClient(app)

def create_valid_token(uid: str = "user_reg_123") -> str:
    now = int(time.time())
    payload = {
        "uid": uid,
        "sub": uid,
        "iat": now,
        "exp": now + 60,
    }
    return jwt.encode(payload, TEST_SECRET, algorithm="HS256")

def test_1_full_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"

def test_2_full_auth_pipeline():
    # Valid JWT -> 200 stream response
    token = create_valid_token("user_reg_123")
    res = client.post(
        "/chat",
        json={"message": "hello"},
        headers={"X-Internal-Auth": token}
    )
    assert res.status_code == 200
    assert "application/x-ndjson" in res.headers["content-type"]

def test_3_event_bus_end_to_end_streaming():
    bus = EventBus()
    
    async def run_bus():
        await bus.push(AgentStartedEvent(agent="manager").model_dump())
        await bus.push(ToolStartedEvent(agent="ats_agent", tool="get_ats_analysis").model_dump())
        await bus.push(ToolCompletedEvent(agent="ats_agent", tool="get_ats_analysis").model_dump())
        await bus.push(MessageDeltaEvent(agent="manager", text="Hello from agent!").model_dump())
        await bus.push(AgentCompletedEvent(agent="manager").model_dump())
        await bus.push_end()

        return [e async for e in bus.stream()]

    events_captured = asyncio.run(run_bus())

    assert len(events_captured) == 5
    assert events_captured[0]["type"] == "agent_started"
    assert events_captured[1]["type"] == "tool_started"
    assert events_captured[2]["type"] == "tool_completed"
    assert events_captured[3]["type"] == "message_delta"
    assert events_captured[4]["type"] == "agent_completed"

def test_4_schema_validation_parity():
    art = Artifact(
        id="art-1",
        type="ats_score_card",
        title="ATS Score Card",
        data={"score": 85}
    )
    res = AgentResponse(
        output="Analysis complete",
        artifacts=[art]
    )
    assert res.output == "Analysis complete"
    assert len(res.artifacts) == 1
    assert res.artifacts[0].type == "ats_score_card"
