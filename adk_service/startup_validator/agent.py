"""ADK agent definitions.

Three pipelines, all SequentialAgents:

* `phase1_pipeline`  — 4 sub-agents, produces final `phase1_output` state key.
* `phase2_pipeline`  — 1 sub-agent, produces final `phase2_output` state key.
* `phase3_pipeline`  — 1 sub-agent, produces final `phase3_output` state key.

`root_agent` points at the full Phase-1 pipeline for the `adk run` CLI and for
the ADK Web dev UI. The FastAPI layer (api.py) invokes the phase-specific
pipelines directly.

All LLM calls route through LiteLlm → Groq (Llama 3.3-70b-versatile). Switch
the `ADK_MODEL` env var to swap providers without touching this file.
"""

from __future__ import annotations

import os

from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.models.lite_llm import LiteLlm

from .prompts import (
    COMPETITOR_ANALYSIS_PROMPT,
    IDEA_UNDERSTANDING_PROMPT,
    MARKET_FEASIBILITY_PROMPT,
    PHASE1_SYNTHESIZER_PROMPT,
    PHASE2_BUSINESS_MODEL_PROMPT,
    PHASE3_PITCH_DECK_PROMPT,
)
from .schemas import (
    CompetitorAnalysisOutput,
    IdeaUnderstandingOutput,
    MarketFeasibilityOutput,
    Phase1Output,
    Phase2Output,
    Phase3Output,
)


# ---------------------------------------------------------------------------
# Model — LiteLlm lets us point ADK at Groq (or any OpenAI-compatible provider)
# without touching agent code. Default is Llama 3.3-70b to match legacy behavior.
# ---------------------------------------------------------------------------

_MODEL_NAME = os.getenv("ADK_MODEL", "groq/llama-3.3-70b-versatile")
# Low temperature = fewer hallucinations and fewer format-drift bugs
# (string-vs-array, mismatched quotes, missing fields). 0.2 is a good balance
# between determinism and natural-language quality for structured outputs.
_TEMPERATURE = float(os.getenv("ADK_TEMPERATURE", "0.2"))
model = LiteLlm(model=_MODEL_NAME, temperature=_TEMPERATURE)


# ---------------------------------------------------------------------------
# Phase 1 pipeline — 4 agents in sequence
#
# State keys produced (passed between agents via {placeholder} substitution):
#   idea_structured    ← Agent 1
#   market_analysis    ← Agent 2
#   competitor_analysis ← Agent 3
#   phase1_output      ← Agent 4 (final, Express-shaped)
#
# Input: session state must contain `idea_input` (the raw user idea).
# ---------------------------------------------------------------------------

idea_understanding_agent = LlmAgent(
    name="IdeaUnderstandingAgent",
    model=model,
    description="Translates raw founder ideas into a structured business concept.",
    instruction=IDEA_UNDERSTANDING_PROMPT,
    output_schema=IdeaUnderstandingOutput,
    output_key="idea_structured",
)

market_feasibility_agent = LlmAgent(
    name="MarketFeasibilityAgent",
    model=model,
    description="Analyses market size, CAGR, trends, and feasibility.",
    instruction=MARKET_FEASIBILITY_PROMPT,
    output_schema=MarketFeasibilityOutput,
    output_key="market_analysis",
)

competitor_analysis_agent = LlmAgent(
    name="CompetitorAnalysisAgent",
    model=model,
    description="Identifies competitors, scores them, and assesses competition risk.",
    instruction=COMPETITOR_ANALYSIS_PROMPT,
    output_schema=CompetitorAnalysisOutput,
    output_key="competitor_analysis",
)

phase1_synthesizer_agent = LlmAgent(
    name="Phase1SynthesizerAgent",
    model=model,
    description="Synthesises prior agents into the Phase-1 output shown to the founder.",
    instruction=PHASE1_SYNTHESIZER_PROMPT,
    output_schema=Phase1Output,
    output_key="phase1_output",
)

phase1_pipeline = SequentialAgent(
    name="Phase1Pipeline",
    description="Full Phase 1 validation: idea understanding → market → competitors → synthesis.",
    sub_agents=[
        idea_understanding_agent,
        market_feasibility_agent,
        competitor_analysis_agent,
        phase1_synthesizer_agent,
    ],
)


# ---------------------------------------------------------------------------
# Phase 2 pipeline — 1 agent
#
# Required state inputs: idea_title, idea_description, phase1_context
# Produces: phase2_output (Express-shaped)
# ---------------------------------------------------------------------------

phase2_business_model_agent = LlmAgent(
    name="Phase2BusinessModelAgent",
    model=model,
    description="Produces business model + strategy + risks from confirmed Phase 1 context.",
    instruction=PHASE2_BUSINESS_MODEL_PROMPT,
    output_schema=Phase2Output,
    output_key="phase2_output",
)

phase2_pipeline = SequentialAgent(
    name="Phase2Pipeline",
    description="Phase 2 business model generation.",
    sub_agents=[phase2_business_model_agent],
)


# ---------------------------------------------------------------------------
# Phase 3 pipeline — 1 agent
#
# Required state inputs: idea_title, idea_description, phase1_context, phase2_context
# Produces: phase3_output (10-slide deck + changelog, Express-shaped)
# ---------------------------------------------------------------------------

phase3_pitch_deck_agent = LlmAgent(
    name="Phase3PitchDeckAgent",
    model=model,
    description="Generates a 10-slide investor pitch deck and changelog.",
    instruction=PHASE3_PITCH_DECK_PROMPT,
    output_schema=Phase3Output,
    output_key="phase3_output",
)

phase3_pipeline = SequentialAgent(
    name="Phase3Pipeline",
    description="Phase 3 pitch deck generation.",
    sub_agents=[phase3_pitch_deck_agent],
)


# ---------------------------------------------------------------------------
# Root agent — used by `adk run` / ADK dev UI. Points at Phase 1 by default
# because it's the only pipeline that works with just a raw idea as input.
# Phase 2 and 3 need prior-phase context and are invoked by name from FastAPI.
# ---------------------------------------------------------------------------

root_agent = phase1_pipeline
