import os
import sys
import time
import json
import jwt
import pytest
from fastapi.testclient import TestClient

# Ensure agent-service root directory is on Python path
AGENT_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AGENT_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AGENT_SERVICE_DIR)

TEST_SECRET = "a-very-secure-cryptographically-random-test-secret-key-32bytes!"
os.environ["INTERNAL_AGENT_JWT_SECRET"] = TEST_SECRET



from main import app

client = TestClient(app)

def create_token(
    payload: dict,
    secret: str = TEST_SECRET,
    algorithm: str = "HS256"
) -> str:
    return jwt.encode(payload, secret, algorithm=algorithm)

def test_1_health_endpoint_unauthenticated():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_2_chat_missing_header():
    response = client.post("/chat")
    assert response.status_code == 401
    assert "Missing required authentication header" in response.json().get("detail", "")

def test_3_chat_garbage_token():
    response = client.post("/chat", headers={"X-Internal-Auth": "garbage-token-string"})
    assert response.status_code == 401

def test_4_chat_malformed_jwt():
    response = client.post("/chat", headers={"X-Internal-Auth": "header.payload.signature_extra_junk"})
    assert response.status_code == 401

def test_5_chat_wrong_secret():
    now = int(time.time())
    token = create_token(
        {"uid": "user_123", "sub": "user_123", "iat": now, "exp": now + 60},
        secret="different-secret-key-entirely!"
    )
    response = client.post("/chat", headers={"X-Internal-Auth": token})
    assert response.status_code == 401

def test_6_chat_expired_jwt():
    now = int(time.time())
    token = create_token(
        {"uid": "user_123", "sub": "user_123", "iat": now - 120, "exp": now - 60}
    )
    response = client.post("/chat", headers={"X-Internal-Auth": token})
    assert response.status_code == 401
    assert "expired" in response.json().get("detail", "").lower()

def test_7_chat_wrong_algorithm():
    now = int(time.time())
    token = create_token(
        {"uid": "user_123", "sub": "user_123", "iat": now, "exp": now + 60},
        algorithm="HS512"
    )
    response = client.post("/chat", headers={"X-Internal-Auth": token})
    assert response.status_code == 401
    assert "algorithm" in response.json().get("detail", "").lower()

def test_8a_chat_missing_uid():
    now = int(time.time())
    token = create_token(
        {"sub": "user_123", "iat": now, "exp": now + 60}
    )
    response = client.post("/chat", headers={"X-Internal-Auth": token})
    assert response.status_code == 401
    assert "uid claim" in response.json().get("detail", "").lower()

def test_8b_chat_missing_sub():
    now = int(time.time())
    token = create_token(
        {"uid": "user_123", "iat": now, "exp": now + 60}
    )
    response = client.post("/chat", headers={"X-Internal-Auth": token})
    assert response.status_code == 401
    assert "sub claim" in response.json().get("detail", "").lower()

def test_8c_chat_mismatched_uid_sub():
    now = int(time.time())
    token = create_token(
        {"uid": "user_123", "sub": "user_456_different", "iat": now, "exp": now + 60}
    )
    response = client.post("/chat", headers={"X-Internal-Auth": token})
    assert response.status_code == 401
    assert "do not match" in response.json().get("detail", "").lower()

def test_9_chat_valid_token_matching_uid_sub():
    now = int(time.time())
    token = create_token(
        {"uid": "test_firebase_uid_888", "sub": "test_firebase_uid_888", "iat": now, "exp": now + 60}
    )
    response = client.post("/chat", headers={"X-Internal-Auth": token})
    assert response.status_code == 200
    assert "application/x-ndjson" in response.headers["content-type"]
    lines = [l for l in response.text.split("\n") if l.strip()]
    assert len(lines) >= 1
    events = [json.loads(l) for l in lines]
    assert events[0]["type"] == "agent_started"
    assert events[-1]["type"] == "completed"

