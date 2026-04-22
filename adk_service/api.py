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

# Weave tracing — must init BEFORE agent imports so LiteLlm auto-patch is in
# place when agents construct their model clients. Config lives in
# utils/weave_tracing.py to keep this file focused on HTTP wiring.
from utils.weave_tracing import init_weave, trace as _trace  # noqa: E402

init_weave(logger)

from startup_validator.agent import (  # noqa: E402  — load_dotenv must run first
    large_model,
    phase1_pipeline,
    phase2_pipeline,
    phase3_pipeline,
    small_model,
)
from startup_validator.regen_agents import SECTION_REGISTRY  # noqa: E402
from utils.context_compactor import (
    compact_phase1_context,
    compact_phase2_context,
)
from google.adk.agents import LlmAgent  # noqa: E402
from pydantic import BaseModel as _PydanticBaseModel  # noqa: E402
from typing import Literal as _Literal  # noqa: E402


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


@_trace
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
@_trace
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
@_trace
async def generate_phase2(req: Phase2Request) -> dict[str, Any]:
    """Run the Phase 2 pipeline and return IPhase2Data-shaped JSON.

    The final object is assembled here in Python from the 3 sub-agent outputs
    rather than by a synthesizer LLM. The old synthesizer was a pure field-
    copy step — removing it saves ~5K tokens and avoids Groq's per-minute
    rate ceiling on large combined prompts.
    """
    user_message = (
        f"Generate the Phase 2 business model for:\n\n"
        f"Title: {req.ideaTitle}\nDescription: {req.ideaDescription}"
    )
    state = await _run_pipeline_state(
        pipeline=phase2_pipeline,
        initial_state={
            "idea_title": req.ideaTitle,
            "idea_description": req.ideaDescription,
            "phase1_context": _format_phase1_context(req.phase1Data),
        },
        user_message=user_message,
    )

    required = ("business_model", "strategy", "risk_analysis")
    missing = [k for k in required if k not in state]
    if missing:
        logger.error(
            "Phase 2 pipeline finished but state missing: %s. Present: %s",
            missing,
            list(state.keys()),
        )
        raise HTTPException(
            status_code=502,
            detail=f"Phase 2 pipeline missing state keys: {missing}",
        )

    business_model = _normalize_output(state["business_model"]) or {}
    strategy = _normalize_output(state["strategy"]) or {}
    risk_analysis = _normalize_output(state["risk_analysis"]) or {}

    return {
        "businessModel": business_model,
        "strategy": strategy,
        "structuralRisks": risk_analysis.get("structuralRisks", []),
        "operationalRisks": risk_analysis.get("operationalRisks", []),
    }


@app.post("/agents/phase3")
@_trace
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
# Section regeneration — runs ONE sub-agent, not the whole phase pipeline.
# Saves ~4x tokens vs POST /agents/phaseN when the user only wants to tweak
# a single section from the chat/section-editor UI.
# ---------------------------------------------------------------------------


class RegenerateSectionRequest(_PydanticBaseModel):
    section: str
    feedback: str
    ideaTitle: str
    ideaDescription: str
    existingSection: dict[str, Any] | list[Any] | str
    phase1Data: dict[str, Any] | None = None
    phase2Data: dict[str, Any] | None = None


@app.post("/agents/regenerate-section")
@_trace
async def regenerate_section(req: RegenerateSectionRequest) -> dict[str, Any]:
    spec = SECTION_REGISTRY.get(req.section)
    if spec is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown section '{req.section}'. Valid: {sorted(SECTION_REGISTRY.keys())}",
        )

    existing_text = json.dumps(req.existingSection, separators=(",", ":"), default=str)
    feedback_text = req.feedback.strip() or "(no feedback provided — regenerate with fresh perspective)"

    phase1_ctx = (
        json.dumps(req.phase1Data, separators=(",", ":"), default=str)
        if req.phase1Data
        else "{}"
    )
    phase2_ctx = (
        json.dumps(req.phase2Data, separators=(",", ":"), default=str)
        if req.phase2Data
        else "{}"
    )

    initial_state = {
        "idea_title": req.ideaTitle,
        "idea_description": req.ideaDescription,
        "phase1_context": phase1_ctx,
        "phase2_context": phase2_ctx,
        "existing_section": existing_text,
        "user_feedback": feedback_text,
    }

    user_message = (
        f"Regenerate the '{spec.label}' section based on the feedback: {feedback_text}"
    )

    raw = await _run_pipeline(
        pipeline=spec.agent,
        initial_state=initial_state,
        output_key=spec.output_key,
        user_message=user_message,
    )
    raw = raw if isinstance(raw, dict) else {}
    patch = spec.apply(raw)
    return {
        "section": req.section,
        "phase": spec.phase,
        "patch": patch,
    }


# ---------------------------------------------------------------------------
# Chat — classifies user message as question vs regenerate-request and
# either answers or returns a proposal (section + distilled feedback) that
# the server can pass to /agents/regenerate-section on user confirm.
#
# Intent classification runs on small_model to keep chat cheap. No change
# is applied here — the server handles apply/version after user approves.
# ---------------------------------------------------------------------------


class _ChatIntent(_PydanticBaseModel):
    intent: _Literal["answer", "regenerate"]
    answer: str = ""
    section: str = ""
    feedback: str = ""


_CHAT_PROMPT = """You are the assistant for a startup idea validation app. The user is reviewing the generated plan (3 phases) and may ask questions about it OR ask to change a specific section.

=== Idea ===
Title: {idea_title}
Description: {idea_description}

=== Current plan snapshot ===
Phase 1: {phase1_context}
Phase 2: {phase2_context}
Phase 3: {phase3_context}

=== Recent chat (most recent last) ===
{chat_history}

=== User message ===
{user_message}

Classify the user's intent into exactly one of:

1. "answer" — the user is asking a question, requesting analysis, or making a comment that does not require regenerating any section. Provide a helpful, concise answer (<=200 words) in the `answer` field.

2. "regenerate" — the user wants to change/update/redo a specific section of the plan. Set `section` to the EXACT matching key from this list:
   - cleanSummary, marketFeasibility, competitiveAnalysis, killAssumption  (phase 1)
   - businessModel, strategy, risks  (phase 2)
   - storySlides, marketModelSlides, executionSlides  (phase 3 slide bundles)
   Set `feedback` to a crisp, standalone instruction (<=200 chars) capturing exactly what to change. Include the user's key constraints (region, audience, metric, etc). Leave `answer` empty.

Rules:
- Pick the single closest section. If the user mentions "market feasibility for India", section="marketFeasibility", feedback="Focus on the Indian market instead of global".
- "redo the pitch deck team slide" → section="executionSlides", feedback="Rewrite the team slide with...".
- Never guess a section that isn't in the allowed list.
- If request is vague ("make it better"), set intent="answer" and ask a clarifying question in `answer`.
"""


_chat_intent_agent = LlmAgent(
    name="ChatIntentAgent",
    model=small_model,
    description="Classifies chat messages as Q&A or section-regeneration proposals.",
    instruction=_CHAT_PROMPT,
    output_schema=_ChatIntent,
    output_key="chat_intent",
)


class ChatRequest(_PydanticBaseModel):
    ideaTitle: str
    ideaDescription: str
    message: str
    phase1Data: dict[str, Any] | None = None
    phase2Data: dict[str, Any] | None = None
    phase3Data: dict[str, Any] | None = None
    history: list[dict[str, str]] = []  # [{role, content}, ...]


@app.post("/agents/chat")
@_trace
async def chat(req: ChatRequest) -> dict[str, Any]:
    def _ctx(d: dict[str, Any] | None) -> str:
        return json.dumps(d, separators=(",", ":"), default=str) if d else "(not generated yet)"

    history_text = (
        "\n".join(f"{m.get('role', 'user')}: {m.get('content', '')}" for m in req.history[-6:])
        or "(no prior messages)"
    )

    initial_state = {
        "idea_title": req.ideaTitle,
        "idea_description": req.ideaDescription,
        "phase1_context": _ctx(req.phase1Data),
        "phase2_context": _ctx(req.phase2Data),
        "phase3_context": _ctx(req.phase3Data),
        "chat_history": history_text,
        "user_message": req.message,
    }

    raw = await _run_pipeline(
        pipeline=_chat_intent_agent,
        initial_state=initial_state,
        output_key="chat_intent",
        user_message=req.message,
    )
    raw = raw if isinstance(raw, dict) else {}

    intent = raw.get("intent", "answer")
    if intent == "regenerate" and raw.get("section") in SECTION_REGISTRY:
        return {
            "type": "proposal",
            "section": raw["section"],
            "feedback": raw.get("feedback", "").strip(),
            "text": f"I can update **{SECTION_REGISTRY[raw['section']].label}** with: \"{raw.get('feedback', '').strip()}\". Apply this change?",
        }

    # Fallback to Q&A answer (covers both explicit answer intent and
    # regenerate intent with an unknown section).
    return {
        "type": "answer",
        "text": raw.get("answer", "I'm not sure how to help with that. Could you clarify?"),
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
