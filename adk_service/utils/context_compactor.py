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