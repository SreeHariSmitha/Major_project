# utils/context_compactor.py

def compact_phase1_context(p1):
    return {
        "summary": p1["cleanSummary"],
        "market_size": p1["marketFeasibility"]["marketSize"],
        "growth": p1["marketFeasibility"]["growthTrajectory"],
        "top_trends": p1["marketFeasibility"]["keyTrends"][:3],
        "top_competitors": [
            c["name"] for c in p1["competitiveAnalysis"][:3]
        ],
        "kill_assumption": p1["killAssumption"],
    }


def compact_phase2_context(p2):
    return {
        "customer": p2["businessModel"]["customerSegments"],
        "value": p2["businessModel"]["valueProposition"],
        "revenue": p2["businessModel"]["revenueStreams"],
        "pricing": p2["strategy"]["pricingStrategy"],
        "growth": p2["strategy"]["growthStrategy"],
        "milestones": p2["strategy"]["keyMilestones"][:3],
        "top_risks": [
            r["name"] for r in p2["structuralRisks"][:2]
        ],
    }


# ---------------------------------------------------------------------------
# Intra-phase compactors — shrink an upstream sub-agent's output before it is
# fed to a downstream sub-agent inside the same pipeline. Saves Groq TPM by
# dropping fields the next agent doesn't reason over (e.g. the 5-year market
# trend dict, full competitor score map, cost structure, etc.).
# ---------------------------------------------------------------------------


def compact_market_analysis(m):
    """Trim MarketFeasibilityOutput for the competitor + synthesizer agents.

    Drops `market_trend_data` (5-year dict) entirely — it's purely a chart
    input and the downstream LLMs don't need it to reason.
    """
    return {
        "need": m.get("market_need", ""),
        "size": m.get("market_size_estimate", ""),
        "growth": m.get("growth_potential", ""),
        "score": m.get("feasibility_score", ""),
        "insights": m.get("key_insights", [])[:3],
    }


def compact_competitor_analysis(c):
    """Trim CompetitorAnalysisOutput for the synthesizer.

    Keeps top-3 competitors with just name + weakness (what our advantage
    plays against). Drops `competitor_scores` dict — score-per-name isn't
    needed for prose synthesis.
    """
    comps = c.get("competitors", [])[:3]
    return {
        "competitors": [
            {"name": x.get("name", ""), "weakness": x.get("weakness", "")}
            for x in comps
        ],
        "differentiation": c.get("differentiation", ""),
        "risk": c.get("competition_risk", ""),
    }


def compact_business_model(b):
    """Trim BusinessModel for strategy + risk agents.

    Keeps segments, value, revenue — the parts strategy and risk actually
    reason over. Drops costStructure, keyPartnerships, keyResources.
    """
    return {
        "segments": b.get("customerSegments", ""),
        "value": b.get("valueProposition", ""),
        "revenue": b.get("revenueStreams", ""),
    }


def compact_strategy(s):
    """Trim Strategy for the risk agent.

    Drops customerAcquisition (verbose channel/CAC prose); risk agent keys
    off pricing + growth + milestones.
    """
    return {
        "pricing": s.get("pricingStrategy", ""),
        "growth": s.get("growthStrategy", ""),
        "milestones": s.get("keyMilestones", [])[:4],
    }
