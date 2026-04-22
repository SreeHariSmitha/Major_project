"""Single-agent regeneration for individual sections.

Running the entire phase pipeline (4 sub-agents, 1 synthesizer) just to update
`marketFeasibility` is wasteful — ~4x the tokens needed. This module exposes
one `LlmAgent` per regeneratable section that takes the existing content plus
the user's feedback and emits only that section, matching the Mongo shape.

Registered in SECTION_REGISTRY; invoked by the /agents/regenerate-section
endpoint in api.py via a single-agent Runner call.
"""

from __future__ import annotations

from typing import Any, Callable

from google.adk.agents import LlmAgent
from pydantic import BaseModel, Field

from .agent import large_model, small_model
from .schemas import (
    BusinessModel,
    Competitor,
    ExecutionSlides,
    MarketAndModelSlides,
    MarketFeasibility,
    RiskAnalysisOutput,
    StorySlides,
    Strategy,
)


# ---------------------------------------------------------------------------
# Wrapper schemas (output_schema requires a BaseModel; primitives/lists need
# a containing model).
# ---------------------------------------------------------------------------

class CleanSummaryOutput(BaseModel):
    cleanSummary: str = Field(description="2-3 sentence neutral summary.")


class CompetitorListOutput(BaseModel):
    competitiveAnalysis: list[Competitor] = Field(default_factory=list, max_length=5)


class KillAssumptionOutput(BaseModel):
    killAssumption: str
    killAssumptionTestGuidance: str


# ---------------------------------------------------------------------------
# Generic regeneration prompt — one template parameterised per section.
# ---------------------------------------------------------------------------

_REGEN_PROMPT = """You are regenerating the "{section_label}" section of a startup validation plan.

The user has requested a specific change via feedback. Apply ONLY that change.
Keep everything else aligned with the existing content unless the feedback
contradicts it. Do NOT introduce unrelated changes.

=== Idea ===
Title: {{idea_title}}
Description: {{idea_description}}

=== Phase 1 context (for grounding) ===
{{phase1_context}}

=== Phase 2 context (for grounding, if applicable) ===
{{phase2_context}}

=== Existing "{section_label}" content ===
{{existing_section}}

=== User feedback (what to change) ===
{{user_feedback}}

{extra_guidance}

Output MUST match the schema exactly. Do not add commentary outside JSON.
"""


def _build_agent(
    section_key: str,
    section_label: str,
    output_schema: type[BaseModel],
    output_key: str,
    *,
    extra_guidance: str = "",
    use_large: bool = False,
) -> LlmAgent:
    instruction = _REGEN_PROMPT.format(
        section_label=section_label,
        extra_guidance=extra_guidance,
    )
    return LlmAgent(
        name=f"Regen_{section_key}",
        model=large_model if use_large else small_model,
        description=f"Regenerates the {section_label} section based on user feedback.",
        instruction=instruction,
        output_schema=output_schema,
        output_key=output_key,
    )


# ---------------------------------------------------------------------------
# Registry — section name → metadata for single-agent dispatch.
#
# `apply` is applied to the agent's raw output dict to produce the patch
# merged into the Mongo phase data. Keeps controller logic thin.
# ---------------------------------------------------------------------------


class SectionSpec:
    def __init__(
        self,
        phase: str,
        label: str,
        agent: LlmAgent,
        output_key: str,
        apply: Callable[[dict[str, Any]], dict[str, Any]],
    ):
        self.phase = phase
        self.label = label
        self.agent = agent
        self.output_key = output_key
        self.apply = apply


SECTION_REGISTRY: dict[str, SectionSpec] = {
    # Phase 1
    "cleanSummary": SectionSpec(
        phase="phase1",
        label="Clean Idea Summary",
        agent=_build_agent(
            "cleanSummary", "Clean Idea Summary", CleanSummaryOutput, "regen_output"
        ),
        output_key="regen_output",
        apply=lambda o: {"cleanSummary": o.get("cleanSummary", "")},
    ),
    "marketFeasibility": SectionSpec(
        phase="phase1",
        label="Market Feasibility",
        agent=_build_agent(
            "marketFeasibility",
            "Market Feasibility",
            MarketFeasibility,
            "regen_output",
            extra_guidance=(
                "Include specific USD market size figures and a CAGR/growth "
                "rate. Key trends should be concrete, not generic."
            ),
        ),
        output_key="regen_output",
        apply=lambda o: {"marketFeasibility": o},
    ),
    "competitiveAnalysis": SectionSpec(
        phase="phase1",
        label="Competitive Analysis",
        agent=_build_agent(
            "competitiveAnalysis",
            "Competitive Analysis",
            CompetitorListOutput,
            "regen_output",
            extra_guidance="Up to 5 competitors; each needs name, difference, advantage.",
        ),
        output_key="regen_output",
        apply=lambda o: {"competitiveAnalysis": o.get("competitiveAnalysis", [])},
    ),
    "killAssumption": SectionSpec(
        phase="phase1",
        label="Kill Assumption",
        agent=_build_agent(
            "killAssumption",
            "Kill Assumption + Test Guidance",
            KillAssumptionOutput,
            "regen_output",
            use_large=True,
        ),
        output_key="regen_output",
        apply=lambda o: {
            "killAssumption": o.get("killAssumption", ""),
            "killAssumptionTestGuidance": o.get("killAssumptionTestGuidance", ""),
        },
    ),
    # Phase 2
    "businessModel": SectionSpec(
        phase="phase2",
        label="Business Model Canvas",
        agent=_build_agent(
            "businessModel", "Business Model Canvas", BusinessModel, "regen_output"
        ),
        output_key="regen_output",
        apply=lambda o: {"businessModel": o},
    ),
    "strategy": SectionSpec(
        phase="phase2",
        label="Go-to-Market Strategy",
        agent=_build_agent(
            "strategy", "Go-to-Market Strategy", Strategy, "regen_output"
        ),
        output_key="regen_output",
        apply=lambda o: {"strategy": o},
    ),
    "risks": SectionSpec(
        phase="phase2",
        label="Structural + Operational Risks",
        agent=_build_agent(
            "risks",
            "Structural and Operational Risks",
            RiskAnalysisOutput,
            "regen_output",
        ),
        output_key="regen_output",
        apply=lambda o: {
            "structuralRisks": o.get("structuralRisks", []),
            "operationalRisks": o.get("operationalRisks", []),
        },
    ),
    # Phase 3 — slide bundles (cheaper than 10 per-slide agents)
    "storySlides": SectionSpec(
        phase="phase3",
        label="Story Slides (title, problem, solution)",
        agent=_build_agent(
            "storySlides", "Story Slides (1-3)", StorySlides, "regen_output"
        ),
        output_key="regen_output",
        apply=lambda o: {
            "titleSlide": o.get("titleSlide"),
            "problemSlide": o.get("problemSlide"),
            "solutionSlide": o.get("solutionSlide"),
        },
    ),
    "marketModelSlides": SectionSpec(
        phase="phase3",
        label="Market + Business Model + Competition Slides",
        agent=_build_agent(
            "marketModelSlides",
            "Market / Model / Competition Slides",
            MarketAndModelSlides,
            "regen_output",
        ),
        output_key="regen_output",
        apply=lambda o: {
            "marketOpportunitySlide": o.get("marketOpportunitySlide"),
            "businessModelSlide": o.get("businessModelSlide"),
            "competitionSlide": o.get("competitionSlide"),
        },
    ),
    "executionSlides": SectionSpec(
        phase="phase3",
        label="Execution Slides (traction, team, financials, ask)",
        agent=_build_agent(
            "executionSlides",
            "Execution Slides (6, 8-10)",
            ExecutionSlides,
            "regen_output",
        ),
        output_key="regen_output",
        apply=lambda o: {
            "tractionSlide": o.get("tractionSlide"),
            "teamSlide": o.get("teamSlide"),
            "financialsSlide": o.get("financialsSlide"),
            "askSlide": o.get("askSlide"),
        },
    ),
}
