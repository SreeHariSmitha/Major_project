"""FastAPI sidecar that exposes the Startup Validator ADK agents over HTTP.

Three endpoints match the Express backend's expectations one-to-one:

  POST /agents/phase1  →  runs Phase1Pipeline, returns IPhase1Data-shaped JSON.
  POST /agents/phase2  →  runs Phase2Pipeline, returns IPhase2Data-shaped JSON.
  POST /agents/phase3  →  runs Phase3Pipeline, returns IPhase3Data-shaped JSON.

The ADK-built-in routes from `get_fast_api_app()` (e.g. /run, /run_sse,
/list-sessions, /dev-ui) are also mounted. The dev UI at `/dev-ui` is handy for
iterating on prompts without hitting the Express layer.

Runs on port 8000 by default. Configure via `.env` (see .env.example).
"""

from __future__ import annotations

# Use the OS certificate store for SSL. On Windows corporate/home networks the
# system cert chain often intercepts outbound HTTPS; without truststore,
# tiktoken's download of cl100k_base.tiktoken (used by LiteLlm for token
# counting) fails with SSL_CERT_VERIFICATION_FAILED. Must run before any
# module that imports requests/urllib3 under the hood.
import truststore

truststore.inject_into_ssl()

import json
import os
import uuid
from typing import Any

import uvicorn
from dotenv import load_dotenv
from fastapi import HTTPException
from google.adk.cli.fast_api import get_fast_api_app
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel, Field

# Load .env before importing agent module (ADK reads env at import time)
load_dotenv()

from startup_validator.agent import (  # noqa: E402  — load_dotenv must run first
    phase1_pipeline,
    phase2_pipeline,
    phase3_pipeline,
)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Async-capable driver required by ADK's DatabaseSessionService. Default to
# aiosqlite; user can override with any LiteLlm-supported async URL.
SESSION_DB_URL = os.getenv(
    "SESSION_DB_URL",
    f"sqlite+aiosqlite:///{os.path.join(BASE_DIR, 'sessions.db')}",
)
ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:5173").split(",")
]
APP_NAME = "startup_validator"


# ---------------------------------------------------------------------------
# ADK built-in FastAPI app (provides /run, /run_sse, /list-sessions, /dev-ui)
# ---------------------------------------------------------------------------

app = get_fast_api_app(
    agents_dir=BASE_DIR,
    session_service_uri=SESSION_DB_URL,
    allow_origins=ALLOWED_ORIGINS,
    web=True,
)


# ---------------------------------------------------------------------------
# Custom phase endpoints
# ---------------------------------------------------------------------------

class Phase1Request(BaseModel):
    ideaTitle: str = Field(min_length=1, max_length=200)
    ideaDescription: str = Field(min_length=1, max_length=5000)


class Phase2Request(BaseModel):
    ideaTitle: str
    ideaDescription: str
    phase1Data: dict[str, Any] = Field(description="Confirmed Phase 1 output from Mongo.")


class Phase3Request(BaseModel):
    ideaTitle: str
    ideaDescription: str
    phase1Data: dict[str, Any]
    phase2Data: dict[str, Any]


# Ephemeral session service for phase endpoints — each request creates a
# short-lived session, runs the pipeline, reads final state, discards. The
# persistent DatabaseSessionService is already managed by get_fast_api_app()
# for its own /run, /list-sessions, and /dev-ui routes.
_session_service = InMemorySessionService()


async def _run_pipeline(
    pipeline,
    initial_state: dict[str, Any],
    output_key: str,
    user_message: str,
) -> Any:
    """Create an ephemeral session, run the pipeline, return the final output.

    `user_message` is delivered to the first agent as Content — this is how
    ADK's LlmAgent receives the user's input. Subsequent sub-agents read prior
    outputs from `initial_state` (plus any keys set by `output_key=` upstream)
    via `{placeholder}` substitution in their prompts.
    """
    user_id = f"express-{uuid.uuid4().hex[:8]}"
    session_id = uuid.uuid4().hex

    await _session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
        state=initial_state,
    )

    runner = Runner(
        agent=pipeline,
        app_name=APP_NAME,
        session_service=_session_service,
    )

    content = types.Content(role="user", parts=[types.Part(text=user_message)])

    try:
        async for _event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=content,
        ):
            pass  # we don't need intermediate events here; we read state at the end
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Agent pipeline error: {exc}") from exc

    final_session = await _session_service.get_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )

    if not final_session or output_key not in final_session.state:
        raise HTTPException(
            status_code=502,
            detail=f"Pipeline completed but '{output_key}' missing from session state.",
        )

    raw = final_session.state[output_key]

    # output_schema'd agents may return a JSON string OR a dict depending on
    # the ADK / LiteLlm path; normalize to a plain dict for the HTTP response.
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Pipeline produced non-JSON output for '{output_key}'.",
            ) from exc
    return raw


def _format_phase1_context(phase1_data: dict[str, Any]) -> str:
    """Render Phase 1 Mongo data into a compact text block for downstream prompts."""
    return json.dumps(phase1_data, indent=2, default=str)


def _format_phase2_context(phase2_data: dict[str, Any]) -> str:
    return json.dumps(phase2_data, indent=2, default=str)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": APP_NAME}


@app.post("/agents/phase1")
async def generate_phase1(req: Phase1Request) -> dict[str, Any]:
    """Run the 4-agent Phase 1 pipeline and return IPhase1Data-shaped JSON."""
    idea_text = f"Title: {req.ideaTitle}\n\nDescription: {req.ideaDescription}"
    output = await _run_pipeline(
        pipeline=phase1_pipeline,
        initial_state={},
        output_key="phase1_output",
        user_message=idea_text,
    )
    return output


@app.post("/agents/phase2")
async def generate_phase2(req: Phase2Request) -> dict[str, Any]:
    """Run the Phase 2 pipeline and return IPhase2Data-shaped JSON."""
    user_message = (
        f"Generate the Phase 2 business model for:\n\n"
        f"Title: {req.ideaTitle}\nDescription: {req.ideaDescription}"
    )
    output = await _run_pipeline(
        pipeline=phase2_pipeline,
        initial_state={
            "idea_title": req.ideaTitle,
            "idea_description": req.ideaDescription,
            "phase1_context": _format_phase1_context(req.phase1Data),
        },
        output_key="phase2_output",
        user_message=user_message,
    )
    return output


@app.post("/agents/phase3")
async def generate_phase3(req: Phase3Request) -> dict[str, Any]:
    """Run the Phase 3 pipeline and return IPhase3Data-shaped JSON (10-slide deck)."""
    user_message = (
        f"Generate the Phase 3 investor pitch deck for:\n\n"
        f"Title: {req.ideaTitle}\nDescription: {req.ideaDescription}"
    )
    output = await _run_pipeline(
        pipeline=phase3_pipeline,
        initial_state={
            "idea_title": req.ideaTitle,
            "idea_description": req.ideaDescription,
            "phase1_context": _format_phase1_context(req.phase1Data),
            "phase2_context": _format_phase2_context(req.phase2Data),
        },
        output_key="phase3_output",
        user_message=user_message,
    )
    return output


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
