"""Pydantic output schemas for each agent.

Every `Phase*Output` schema matches the Mongo shape that the Express backend
expects at `server/src/models/Idea.ts`. ADK uses these via `output_schema=` on
each `LlmAgent` to force the LLM to emit structured JSON.
"""

from typing import Literal

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Intermediate Phase-1 schemas (used between sub-agents within the phase-1
# pipeline; NOT returned to Express directly).
# ---------------------------------------------------------------------------

class IdeaUnderstandingOutput(BaseModel):
    """Structured representation of the raw user idea (Agent 1)."""

    problem: str = Field(description="The real underlying problem the user is trying to solve.")
    solution: str = Field(description="The proposed solution, stated neutrally.")
    target_users: str = Field(description="Who is affected by this problem.")
    domain: str = Field(description="Business or industry domain.")
    assumptions: list[str] = Field(
        default_factory=list, description="Hidden assumptions implicit in the idea."
    )


class MarketFeasibilityOutput(BaseModel):
    """Market analysis results (Agent 2)."""

    market_need: str
    market_size_estimate: str = Field(
        description="Market size in plain terms plus specific USD figures and CAGR where possible."
    )
    market_trend_data: dict[str, float] = Field(
        default_factory=dict,
        description="Estimated market values keyed by year, e.g. {'2020': 10.0, '2021': 12.5}.",
    )
    growth_potential: str
    feasibility_score: str = Field(description="Score 1-10 as a string.")
    key_insights: list[str] = Field(default_factory=list)


class CompetitorEntry(BaseModel):
    name: str
    strength: str
    weakness: str


class CompetitorAnalysisOutput(BaseModel):
    """Competitive landscape (Agent 3)."""

    # Intentionally NOT using min_length=1 — Groq rejects outputs that violate
    # schema constraints hard-stop (no retry). Empty list is preferable to a
    # pipeline crash; the prompt nudges the LLM to always populate at least
    # one competitor (status-quo / DIY alternative) for quality.
    competitors: list[CompetitorEntry] = Field(default_factory=list)
    competitor_scores: dict[str, float] = Field(
        default_factory=dict,
        description="Map of competitor name to 1-10 strength score. Include 'Our Solution' as a key.",
    )
    differentiation: str
    scalability_analysis: str
    competition_risk: Literal["Low", "Medium", "High"]


# ---------------------------------------------------------------------------
# Phase 1 output — matches server/src/models/Idea.ts IPhase1Data exactly.
# This is what the Phase-1 pipeline's final synthesizer agent must emit.
# ---------------------------------------------------------------------------

class MarketFeasibility(BaseModel):
    marketSize: str = Field(
        description="Market size with specific USD figures, e.g. '$150B+ global AI market by 2026'."
    )
    growthTrajectory: str = Field(description="Growth rate and CAGR, e.g. '25%+ CAGR through 2027'.")
    keyTrends: list[str] = Field(default_factory=list, max_length=6)
    timing: Literal["Now", "Soon", "Waiting"]


class Competitor(BaseModel):
    name: str
    difference: str = Field(description="What they do differently (their approach).")
    advantage: str = Field(description="Our advantage over them.")


class Phase1Output(BaseModel):
    """Final Phase-1 output — served directly to Express."""

    cleanSummary: str = Field(
        description="2-3 sentence neutral summary of the idea synthesizing problem, solution, target users."
    )
    marketFeasibility: MarketFeasibility
    competitiveAnalysis: list[Competitor] = Field(default_factory=list, max_length=5)
    killAssumption: str = Field(
        description="The single most critical assumption that could invalidate the idea if wrong."
    )
    killAssumptionTestGuidance: str = Field(
        description="Concrete, numbered steps to test/validate the kill assumption."
    )


# ---------------------------------------------------------------------------
# Phase 2 output — matches IPhase2Data exactly.
# ---------------------------------------------------------------------------

class BusinessModel(BaseModel):
    customerSegments: str
    valueProposition: str
    revenueStreams: str
    costStructure: str
    keyPartnerships: str
    keyResources: str


class Strategy(BaseModel):
    customerAcquisition: str
    pricingStrategy: str
    growthStrategy: str
    keyMilestones: list[str] = Field(default_factory=list, max_length=6)


class Risk(BaseModel):
    name: str
    description: str
    implications: str


class Phase2Output(BaseModel):
    """Final Phase-2 output — served directly to Express."""

    businessModel: BusinessModel
    strategy: Strategy
    structuralRisks: list[Risk] = Field(default_factory=list, max_length=5)
    operationalRisks: list[Risk] = Field(default_factory=list, max_length=5)


# ---------------------------------------------------------------------------
# Phase 3 output — matches IPhase3Data exactly (10-slide pitch deck).
# ---------------------------------------------------------------------------

class PitchSlide(BaseModel):
    slideNumber: int = Field(ge=1, le=10)
    title: str
    content: str = Field(description="Slide body content as plain text with newlines and bullet markers.")
    speakerNotes: str


class PitchDeck(BaseModel):
    titleSlide: PitchSlide
    problemSlide: PitchSlide
    solutionSlide: PitchSlide
    marketOpportunitySlide: PitchSlide
    businessModelSlide: PitchSlide
    tractionSlide: PitchSlide
    competitionSlide: PitchSlide
    teamSlide: PitchSlide
    financialsSlide: PitchSlide
    askSlide: PitchSlide


class ChangelogEntry(BaseModel):
    section: str
    changeType: Literal["added", "modified", "removed"]
    description: str


class Phase3Output(BaseModel):
    """Final Phase-3 output — served directly to Express."""

    pitchDeck: PitchDeck
    changelog: list[ChangelogEntry] = Field(default_factory=list, max_length=8)
