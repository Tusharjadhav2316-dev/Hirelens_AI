import os
import sys
import json
import asyncio
from typing import Optional
from fastapi import FastAPI, Depends, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

# Ensure local modules can be imported smoothly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routes.health import router as health_router
from auth import verify_internal_jwt
from schemas.events import ChatRequest
from crew.event_bus import EventBus
from crew.manager import process_manager_request_async

load_dotenv()

app = FastAPI(title="HireLens Agent Service", version="1.0.0")

app.include_router(health_router)

@app.post("/chat")
async def chat_endpoint(
    request: Request,
    body: Optional[ChatRequest] = None,
    authenticated_uid: str = Depends(verify_internal_jwt)
):
    # Parse request payload safely
    msg = ""
    resume = ""
    jd = None
    attachments = []
    interview_session = None

    if body:
        msg = body.message or ""
        if not msg and body.messages:
            user_msgs = [m.get("content", "") for m in body.messages if isinstance(m, dict) and m.get("role") == "user"]
            if user_msgs:
                msg = user_msgs[-1]

        resume = body.resume_text or ""
        if not resume and body.resume:
            if isinstance(body.resume, str):
                resume = body.resume
            elif isinstance(body.resume, dict):
                resume = json.dumps(body.resume)

        jd = body.job_description
        if body.attachments:
            attachments = [a.model_dump() for a in body.attachments]
        interview_session = body.interview_session
    else:
        try:
            raw_json = await request.json()
            msg = raw_json.get("message", "")
            if not msg and "messages" in raw_json:
                user_msgs = [m.get("content", "") for m in raw_json.get("messages", []) if isinstance(m, dict) and m.get("role") == "user"]
                if user_msgs:
                    msg = user_msgs[-1]

            resume = raw_json.get("resume_text", "")
            if not resume and "resume" in raw_json:
                res_obj = raw_json.get("resume")
                resume = res_obj if isinstance(res_obj, str) else json.dumps(res_obj)

            jd = raw_json.get("job_description")
            attachments = raw_json.get("attachments", [])
            raw_sess = raw_json.get("interview_session")
            if raw_sess and isinstance(raw_sess, dict):
                from schemas.interview_session import InterviewSessionState
                interview_session = InterviewSessionState(**raw_sess)
        except Exception:
            pass

    # Extract raw internal JWT header to pass down to internal HTTP tool calls
    internal_jwt = request.headers.get("X-Internal-Auth")

    bus = EventBus()

    # Launch background agent workflow task concurrently with event stream draining
    workflow_task = asyncio.create_task(
        process_manager_request_async(
            message=msg,
            resume_text=resume,
            job_description=jd,
            attachments=attachments,
            internal_jwt=internal_jwt,
            bus=bus,
            interview_session=interview_session
        )
    )

    async def event_generator():
        try:
            async for event in bus.stream():
                yield json.dumps(event) + "\n"
        except asyncio.CancelledError:
            # Client disconnected mid-stream; cancel background task cleanly to avoid orphan tasks
            workflow_task.cancel()
            raise
        except Exception as e:
            workflow_task.cancel()
            yield json.dumps({"type": "error", "message": f"Stream error: {str(e)}"}) + "\n"

    return StreamingResponse(
        event_generator(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
