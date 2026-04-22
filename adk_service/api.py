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
import logging
import os
import traceback
import uuid
from typing import Any

logger = logging.getLogger("startup_validator.api")
logging.basicConfig(level=logging.INFO)

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
from utils.context_compactor import (
    compact_phase1_context,
    compact_phase2_context,
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


def _normalize_output(raw: Any) -> Any:
    """An `output_schema`'d agent may leave the state value as a JSON string,
    a plain dict, or a Pydantic model depending on the ADK / LiteLlm path.
    Normalise to a plain dict/list for the HTTP response.
    """
    if raw is None:
        return None
    if hasattr(raw, "model_dump"):
        return raw.model_dump()
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return raw  # let caller decide; better than silently dropping
    return raw


async def _run_pipeline_state(
    pipeline,
    initial_state: dict[str, Any],
    user_message: str,
) -> dict[str, Any]:
    """Create an ephemeral session, run the pipeline, return the full final state.

    `user_message` is delivered to the first agent as Content — this is how
    ADK's LlmAgent receives the user's input. Subsequent sub-agents read
    earlier outputs via `{placeholder}` substitution in their prompts.

    Errors are logged with a full traceback server-side (plain 502 detail
    returned to the client) so pipeline failures are debuggable without
    turning on `litellm._turn_on_debug()`.
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
            pass  # intermediate events not needed; we read state at the end
    except Exception as exc:
        logger.error(
            "Pipeline %s failed (user=%s session=%s): %s\n%s",
            getattr(pipeline, "name", pipeline.__class__.__name__),
            user_id,
            session_id,
            exc,
            traceback.format_exc(),
        )
        raise HTTPException(
            status_code=502, detail=f"Agent pipeline error: {exc}"
        ) from exc

    final_session = await _session_service.get_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )

    if not final_session:
        raise HTTPException(
            status_code=502, detail="Pipeline completed but session was lost."
        )

    return dict(final_session.state)


async def _run_pipeline(
    pipeline,
    initial_state: dict[str, Any],
    output_key: str,
    user_message: str,
) -> Any:
    """Run a pipeline and return a single normalised state value."""
    state = await _run_pipeline_state(pipeline, initial_state, user_message)
    if output_key not in state:
        logger.error(
            "Pipeline %s finished but '%s' missing. State keys: %s",
            getattr(pipeline, "name", pipeline.__class__.__name__),
            output_key,
            list(state.keys()),
        )
        raise HTTPException(
            status_code=502,
            detail=f"Pipeline completed but '{output_key}' missing from session state.",
        )
    return _normalize_output(state[output_key])


def _format_phase1_context(phase1_data: dict[str, Any]) -> str:
    """Render Phase 1 Mongo data for downstream prompts.

    Uses compact JSON (no indentation, tight separators) — every Phase 2 and
    Phase 3 sub-agent receives this string, and Groq free-tier is capped at
    100K TPD. Compact serialization is ~30% smaller than `indent=2` for the
    same content, which multiplies across the ~8 LLM calls per full cycle.
    """
    return json.dumps(phase1_data, separators=(",", ":"), default=str)


def _format_phase2_context(phase2_data: dict[str, Any]) -> str:
    return json.dumps(phase2_data, separators=(",", ":"), default=str)


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
    """Run the Phase 3 pipeline and return IPhase3Data-shaped JSON.

    The three slide bundles are written to session state by the sub-agents;
    the final 10-slide `pitchDeck` is assembled here in Python rather than by
    a synthesizer LLM. Only the `changelog` is LLM-generated (last sub-agent).
    """
    user_message = (
        f"Generate the Phase 3 investor pitch deck for:\n\n"
        f"Title: {req.ideaTitle}\nDescription: {req.ideaDescription}"
    )
    compact_p1 = compact_phase1_context(req.phase1Data)
    compact_p2 = compact_phase2_context(req.phase2Data)
    state = await _run_pipeline_state(
        pipeline=phase3_pipeline,
        initial_state={
            "idea_title": req.ideaTitle,
            "idea_description": req.ideaDescription,                    
            "phase1_context": json.dumps(compact_p1, separators=(",", ":")),
            "phase2_context": json.dumps(compact_p2, separators=(",", ":")),
            # "phase1_context": _format_phase1_context(req.phase1Data),
            # "phase2_context": _format_phase2_context(req.phase2Data),
        },
        user_message=user_message,
    )

    required_keys = (
        "story_slides",
        "market_and_model_slides",
        "execution_slides",
        "phase3_changelog",
    )
    missing = [k for k in required_keys if k not in state]
    if missing:
        logger.error(
            "Phase 3 pipeline finished but state is missing keys: %s. "
            "Present keys: %s",
            missing,
            list(state.keys()),
        )
        raise HTTPException(
            status_code=502,
            detail=f"Phase 3 pipeline missing state keys: {missing}",
        )

    story = _normalize_output(state["story_slides"]) or {}
    market = _normalize_output(state["market_and_model_slides"]) or {}
    execution = _normalize_output(state["execution_slides"]) or {}
    changelog_wrapper = _normalize_output(state["phase3_changelog"]) or {}

    pitch_deck = {
        "titleSlide": story.get("titleSlide"),
        "problemSlide": story.get("problemSlide"),
        "solutionSlide": story.get("solutionSlide"),
        "marketOpportunitySlide": market.get("marketOpportunitySlide"),
        "businessModelSlide": market.get("businessModelSlide"),
        "tractionSlide": execution.get("tractionSlide"),
        "competitionSlide": market.get("competitionSlide"),
        "teamSlide": execution.get("teamSlide"),
        "financialsSlide": execution.get("financialsSlide"),
        "askSlide": execution.get("askSlide"),
    }

    missing_slides = [name for name, slide in pitch_deck.items() if not slide]
    if missing_slides:
        logger.error(
            "Phase 3 sub-agents returned incomplete slide bundles. Missing: %s",
            missing_slides,
        )
        raise HTTPException(
            status_code=502,
            detail=f"Phase 3 slide bundles incomplete: {missing_slides}",
        )

    return {
        "pitchDeck": pitch_deck,
        "changelog": changelog_wrapper.get("changelog", []),
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
