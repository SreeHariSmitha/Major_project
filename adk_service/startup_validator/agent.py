"""ADK agent definitions.

Three pipelines, all SequentialAgents, one per phase:

* `phase1_pipeline` — 4 sub-agents, produces `phase1_output`.
* `phase2_pipeline` — 4 sub-agents, produces `phase2_output`.
* `phase3_pipeline` — 4 sub-agents, produces `phase3_output`.

Each pipeline follows the same shape: 3 focused analytical agents feeding a
final synthesizer that packs the Express-shaped output. Splitting each phase
this way keeps every sub-agent on one cognitive task — canvas thinking,
strategy, risk — instead of asking one prompt to juggle everything at once.

`root_agent` points at the full Phase-1 pipeline for the `adk run` CLI and for
the ADK Web dev UI — it's the only pipeline whose input is just a raw idea.
Phase 2 and Phase 3 need prior-phase context and are invoked by name from the
FastAPI layer.

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
    PHASE2_RISK_ANALYSIS_PROMPT,
    PHASE2_STRATEGY_PROMPT,
    PHASE2_SYNTHESIZER_PROMPT,
    PHASE3_CHANGELOG_PROMPT,
    PHASE3_EXECUTION_SLIDES_PROMPT,
    PHASE3_MARKET_AND_MODEL_PROMPT,
    PHASE3_STORY_SLIDES_PROMPT,
)
from .schemas import (
    BusinessModel,
    ChangelogOutput,
    CompetitorAnalysisOutput,
    ExecutionSlides,
    IdeaUnderstandingOutput,
    MarketAndModelSlides,
    MarketFeasibilityOutput,
    Phase1Output,
    Phase2Output,
    RiskAnalysisOutput,
    StorySlides,
    Strategy,
)


# ---------------------------------------------------------------------------
# Model — LiteLlm lets us point ADK at Groq (or any OpenAI-compatible provider)
# without touching agent code. Default is Llama 3.3-70b to match legacy behavior.
# ---------------------------------------------------------------------------

_LARGE_MODEL_NAME = os.getenv("LARGE_ADK_MODEL", "groq/llama-3.3-70b-versatile")
_SMALL_MODEL_NAME = os.getenv("SMALL_ADK_MODEL", "groq/llama-3.1-8b-instant")
# Low temperature = fewer hallucinations and fewer format-drift bugs
# (string-vs-array, mismatched quotes, missing fields). 0.2 is a good balance
# between determinism and natural-language quality for structured outputs.
_TEMPERATURE = float(os.getenv("ADK_TEMPERATURE", "0.2"))
# model = LiteLlm(model=_MODEL_NAME, temperature=_TEMPERATURE)
large_model = LiteLlm(model=_LARGE_MODEL_NAME,temperature=_TEMPERATURE)
small_model = LiteLlm(model=_SMALL_MODEL_NAME,temperature=_TEMPERATURE )  # or claude


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
    model=small_model,
    description="Translates raw founder ideas into a structured business concept.",
    instruction=IDEA_UNDERSTANDING_PROMPT,
    output_schema=IdeaUnderstandingOutput,
    output_key="idea_structured",
)

market_feasibility_agent = LlmAgent(
    name="MarketFeasibilityAgent",
    model=small_model,
    description="Analyses market size, CAGR, trends, and feasibility.",
    instruction=MARKET_FEASIBILITY_PROMPT,
    output_schema=MarketFeasibilityOutput,
    output_key="market_analysis",
)

competitor_analysis_agent = LlmAgent(
    name="CompetitorAnalysisAgent",
    model=small_model,
    description="Identifies competitors, scores them, and assesses competition risk.",
    instruction=COMPETITOR_ANALYSIS_PROMPT,
    output_schema=CompetitorAnalysisOutput,
    output_key="competitor_analysis",
)

phase1_synthesizer_agent = LlmAgent(
    name="Phase1SynthesizerAgent",
    model=large_model,
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
# Phase 2 pipeline — 4 agents in sequence
#
# State keys produced (passed forward via {placeholder} substitution):
#   business_model   ← Agent 1
#   strategy         ← Agent 2 (reads business_model)
#   risk_analysis    ← Agent 3 (reads business_model + strategy)
#   phase2_output    ← Agent 4 (final, Express-shaped)
#
# Required state inputs (seeded by api.py): idea_title, idea_description,
# phase1_context.
# ---------------------------------------------------------------------------

business_model_agent = LlmAgent(
    name="BusinessModelAgent",
    model=small_model,
    description="Designs the business model canvas for the idea.",
    instruction=PHASE2_BUSINESS_MODEL_PROMPT,
    output_schema=BusinessModel,
    output_key="business_model",
)

strategy_agent = LlmAgent(
    name="StrategyAgent",
    model=small_model,
    description="Builds the go-to-market strategy on top of the confirmed business model.",
    instruction=PHASE2_STRATEGY_PROMPT,
    output_schema=Strategy,
    output_key="strategy",
)

risk_analysis_agent = LlmAgent(
    name="RiskAnalysisAgent",
    model=small_model,
    description="Identifies structural and operational risks for the chosen model + strategy.",
    instruction=PHASE2_RISK_ANALYSIS_PROMPT,
    output_schema=RiskAnalysisOutput,
    output_key="risk_analysis",
)

phase2_synthesizer_agent = LlmAgent(
    name="Phase2SynthesizerAgent",
    model=large_model,
    description="Packs business model, strategy, and risks into the Phase 2 output.",
    instruction=PHASE2_SYNTHESIZER_PROMPT,
    output_schema=Phase2Output,
    output_key="phase2_output",
)

phase2_pipeline = SequentialAgent(
    name="Phase2Pipeline",
    description="Full Phase 2: business model → strategy → risks → synthesis.",
    sub_agents=[
        business_model_agent,
        strategy_agent,
        risk_analysis_agent,
        phase2_synthesizer_agent,
    ],
)


# ---------------------------------------------------------------------------
# Phase 3 pipeline — 4 agents in sequence
#
# 10-slide pitch deck + changelog. Slides are split across three content
# agents by narrative function; the final 10-slide deck is assembled
# deterministically in api.py (not by an LLM synthesizer). A synthesizer
# that re-emits ~2000 tokens of slide content under Groq's JSON mode is
# brittle — any single nested-schema miss kills the whole response. Python
# does the mapping reliably, so the 4th agent only produces the changelog.
#
# State keys produced:
#   story_slides              ← Agent 1 (slides 1-3)
#   market_and_model_slides   ← Agent 2 (slides 4, 5, 7)
#   execution_slides          ← Agent 3 (slides 6, 8, 9, 10)
#   phase3_changelog          ← Agent 4 (small LLM output — changelog only)
#
# The endpoint `/agents/phase3` reads all four keys and assembles the
# Express-shaped `Phase3Output` (pitchDeck + changelog) from them.
#
# Required state inputs (seeded by api.py): idea_title, idea_description,
# phase1_context, phase2_context.
# ---------------------------------------------------------------------------

story_slides_agent = LlmAgent(
    name="StorySlidesAgent",
    model=small_model,
    description="Writes the opening 3 slides: title, problem, solution.",
    instruction=PHASE3_STORY_SLIDES_PROMPT,
    output_schema=StorySlides,
    output_key="story_slides",
)

market_and_model_slides_agent = LlmAgent(
    name="MarketAndModelSlidesAgent",
    model=small_model,
    description="Writes the market opportunity, business model, and competition slides.",
    instruction=PHASE3_MARKET_AND_MODEL_PROMPT,
    output_schema=MarketAndModelSlides,
    output_key="market_and_model_slides",
)

execution_slides_agent = LlmAgent(
    name="ExecutionSlidesAgent",
    model=small_model,
    description="Writes the traction, team, financials, and ask slides.",
    instruction=PHASE3_EXECUTION_SLIDES_PROMPT,
    output_schema=ExecutionSlides,
    output_key="execution_slides",
)

phase3_changelog_agent = LlmAgent(
    name="Phase3ChangelogAgent",
    model=large_model,
    description="Produces the changelog summarising what this Phase-3 generation added/modified.",
    instruction=PHASE3_CHANGELOG_PROMPT,
    output_schema=ChangelogOutput,
    output_key="phase3_changelog",
)

phase3_pipeline = SequentialAgent(
    name="Phase3Pipeline",
    description="Full Phase 3: story slides → market+model slides → execution slides → changelog.",
    sub_agents=[
        story_slides_agent,
        market_and_model_slides_agent,
        execution_slides_agent,
        phase3_changelog_agent,
    ],
)


# ---------------------------------------------------------------------------
# Root agent — used by `adk run` / ADK dev UI. Points at Phase 1 by default
# because it's the only pipeline that works with just a raw idea as input.
# Phase 2 and 3 need prior-phase context and are invoked by name from FastAPI.
# ---------------------------------------------------------------------------

root_agent = phase1_pipeline
