# 🤖 FINAL AGENTIC SETUP - Complete Architecture

**6 LLM Agents orchestrated in 3 sequential pipelines producing 3-phase startup validation.**

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ INPUT: Founder's raw idea (title + 5000 char description)           │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
  ┌──────────────┐            ┌──────────────┐
  │  PHASE 1     │            │  PHASE 2     │
  │  Discovery   │            │  Business    │
  │  (4 agents)  │            │  Model       │
  │              │            │  (1 agent)   │
  └──────┬───────┘            └──────┬───────┘
         │                           │
         │ Market Analysis           │ Strategy + Risks
         │ Competition              │ Revenue Model
         │ Kill Assumptions         │ Customer Acquisition
         │                          │
         └──────────────┬───────────┘
                        │
                        ▼
                  ┌──────────────┐
                  │  PHASE 3     │
                  │  Pitch Deck  │
                  │  (1 agent)   │
                  └──────┬───────┘
                         │
                         │ 10-slide deck
                         │ + Changelog
                         │
                         ▼
              ┌─────────────────────┐
              │ OUTPUT: Founder can │
              │ - View insights     │
              │ - Refine sections   │
              │ - Export PDF        │
              │ - Track pivots      │
              └─────────────────────┘
```

---

## 🧠 The 6 Agents

### **PHASE 1: Discovery** (4 Agents in Sequence)

#### **Agent 1: Idea Understanding Agent**
```
Name:          IdeaUnderstandingAgent
Role:          "Idea Translator"
Input:         Raw founder idea (title + description)
Output Schema: IdeaUnderstandingOutput
Output Key:    idea_structured

What it does:
  ├─ Separates problem from solution
  ├─ Identifies target users
  ├─ Extracts domain/industry
  ├─ Detects hidden assumptions
  └─ Outputs structured concept

Prompt Focus:
  "Convert messy human ideas into clean structured business concept"
  "Read carefully, even if vague/emotional"
  "What do they ACTUALLY mean, not what they said?"

Sample Output:
{
  "problem": "Founders waste 6 months validating before building",
  "solution": "AI-powered structured validation in 2 hours",
  "target_users": "Technical founders (Y Combinator stage)",
  "domain": "B2B SaaS / Founder Tools",
  "assumptions": [
    "Founders will pay for validation",
    "Validation before building increases success rate",
    "Market is large enough for venture returns"
  ]
}

LLM Model:    Groq (llama-3.3-70b-versatile)
Temperature:  0.2 (deterministic)
Time:         ~5 seconds
```

---

#### **Agent 2: Market Feasibility Agent**
```
Name:          MarketFeasibilityAgent
Role:          "Market Reality Checker"
Input:         {idea_structured} from Agent 1
Output Schema: MarketFeasibilityOutput
Output Key:    market_analysis

What it does:
  ├─ Estimates market size (TAM)
  ├─ Calculates CAGR (Compound Annual Growth Rate)
  ├─ Identifies growth trends
  ├─ Evaluates feasibility (1-10 score)
  ├─ Provides market data by year
  └─ Outputs key insights

Prompt Focus:
  "Is the problem serious enough people care?"
  "How many people have this problem?"
  "Provide specific USD figures and CAGR where possible"
  "Include market_trend_data as {2020: X, 2021: Y, ...}"

Sample Output:
{
  "market_need": "Founder validation is critical to startup success",
  "market_size_estimate": "$50B+ in startup advisory/tools market globally, growing at 25% CAGR",
  "market_trend_data": {
    "2020": 20.0,
    "2021": 25.0,
    "2022": 31.0,
    "2023": 38.0,
    "2024": 48.0,
    "2025": 60.0
  },
  "growth_potential": "Strong - driven by increasing startup formation, AI adoption in business tools, remote work trends",
  "feasibility_score": "8.5",
  "key_insights": [
    "Market is growing 25% annually",
    "Peak demand in Q1-Q2 (fundraising seasons)",
    "Enterprise expansion opportunity ($100M+)"
  ]
}

LLM Model:    Groq (llama-3.3-70b-versatile)
Temperature:  0.2
Time:         ~7 seconds
Depends on:   idea_structured (Agent 1)
```

---

#### **Agent 3: Competitor Analysis Agent**
```
Name:          CompetitorAnalysisAgent
Role:          "Competitive Intelligence Analyst"
Input:         {idea_structured} + {market_analysis}
Output Schema: CompetitorAnalysisOutput
Output Key:    competitor_analysis

What it does:
  ├─ Identifies real competitors
  ├─ Scores them (1-10)
  ├─ Analyzes strengths/weaknesses
  ├─ Identifies differentiation
  ├─ Assesses scalability
  └─ Scores competition risk (Low/Medium/High)

Prompt Focus:
  "IMPORTANT: Every market has competitors"
  "If no direct competitors, identify:"
    "- Status quo (manual process)"
    "- DIY alternatives"
        "- Adjacent tools being repurposed"
    "- Open-source/free alternatives"
  "Must return AT LEAST ONE competitor (never empty list)"

Sample Output:
{
  "competitors": [
    {
      "name": "Y Combinator",
      "strength": "Legendary brand, network effect, $500K check",
      "weakness": "Only accepts 2% of startups, location-based, 3-month batch"
    },
    {
      "name": "Lean Canvas / Business Model Canvas (DIY)",
      "strength": "Free, widely known framework",
      "weakness": "Manual, no AI insights, subjective interpretation"
    },
    {
      "name": "Linear Spreadsheet Analysis",
      "strength": "Founder-controlled, flexible",
      "weakness": "Time-consuming (20-40 hours), gaps in analysis, no market data"
    }
  ],
  "competitor_scores": {
    "Y Combinator": 9,
    "DIY Canvas": 4,
    "Spreadsheet": 2,
    "Our Solution": 8
  },
  "differentiation": "Real-time AI analysis in 2 hours vs 6 months; market data from actual sources; risk assessment; automated pitch deck",
  "scalability_analysis": "Highly scalable - LLM-based, no geographic limits, can serve unlimited founders",
  "competition_risk": "Medium"
}

LLM Model:    Groq (llama-3.3-70b-versatile)
Temperature:  0.2
Time:         ~6 seconds
Depends on:   idea_structured, market_analysis
```

---

#### **Agent 4: Phase 1 Synthesizer Agent**
```
Name:          Phase1SynthesizerAgent
Role:          "Phase 1 Validator & Synthesizer"
Input:         All 3 prior agents' outputs
Output Schema: Phase1Output (FINAL - returned to Express)
Output Key:    phase1_output

What it does:
  ├─ Synthesizes all prior analyses
  ├─ Creates clean summary
  ├─ Formats market feasibility
  ├─ Lists competitive analysis
  ├─ Identifies kill assumption
  └─ Outputs test guidance

Prompt Focus:
  "Combine prior analyses into final investor-ready output"
  "CRITICAL: Kill assumption must be ONE sentence, specific, testable"
  "Test guidance must be 2-3 numbered concrete steps"
  "keyTrends MUST be JSON array, NOT comma-joined string"

Sample Output (Phase1Output):
{
  "cleanSummary": "Startup Validator is an AI-powered platform that helps technical founders validate startup ideas through structured analysis of market feasibility, competitive landscape, and critical assumptions before committing 6-12 months to building.",
  
  "marketFeasibility": {
    "marketSize": "$50B+ global founder tools and startup advisory market",
    "growthTrajectory": "25% CAGR through 2027, driven by AI adoption and increasing startup formation",
    "keyTrends": [
      "AI adoption in business tools (Copilot effect)",
      "Increasing founder education demand",
      "Shift to remote-first founder communities"
    ],
    "timing": "Now"
  },
  
  "competitiveAnalysis": [
    {
      "name": "Y Combinator",
      "difference": "Venture fund + mentorship model vs. pure software tool",
      "advantage": "We're 24/7 available, no geographic limits, affordable to all founders"
    },
    {
      "name": "DIY Canvas Tools",
      "difference": "Manual spreadsheets vs. AI-driven analysis",
      "advantage": "We provide market data, remove guesswork, save 20+ hours"
    }
  ],
  
  "killAssumption": "Founders are willing to pay for early-stage validation when it can prevent 6-month pivots.",
  
  "killAssumptionTestGuidance": "Validate by: (1) Survey 20 founders on pricing acceptance, (2) Create landing page, run $500 ads, measure conversion, (3) Pre-sell 5 founders at $99/month"
}

LLM Model:    Groq (llama-3.3-70b-versatile)
Temperature:  0.2
Time:         ~5 seconds
Depends on:   All 3 prior agents
Final Output: ✅ Returned to Express backend, saved to MongoDB
```

---

### **PHASE 2: Business Model** (1 Agent)

#### **Agent 5: Business Model & Strategy Agent**
```
Name:          Phase2BusinessModelAgent
Role:          "Business Architect"
Input:         Phase 1 output + idea context
Output Schema: Phase2Output (FINAL - returned to Express)
Output Key:    phase2_output

What it does:
  ├─ Designs business model canvas
  ├─ Outlines GTM strategy
  ├─ Identifies structural risks
  ├─ Identifies operational risks
  └─ Provides 3-year growth plan

Prompt Focus:
  "Design how this idea makes money, reaches customers, survives reality"
  "Given: Phase 1 validation (market, competition, kill assumption)"
  "Produce 4 sections: Business Model, Strategy, Structural Risks, Operational Risks"

Sample Output (Phase2Output):
{
  "businessModel": {
    "customerSegments": "Technical founders (bootstrapped/seed stage), Y Combinator cohorts, accelerators",
    "valueProposition": "Validate in 2 hours vs 6 months; Market data + competitive analysis + risk assessment; Professional pitch deck auto-generated",
    "revenueStreams": "SaaS subscription ($99/mo Starter, $299/mo Pro); Enterprise contracts ($5K+/year); API access for accelerators",
    "costStructure": "LLM inference (30%), Engineering (25%), Cloud infra (20%), Sales/Marketing (15%), G&A (10%)",
    "keyPartnerships": "Y Combinator (distribution), AngelList (cross-sell), Stripe (payments), OpenAI/Groq (LLM APIs)",
    "keyResources": "AI/ML engineering team, LLM APIs, Proprietary market datasets, Founder network"
  },
  
  "strategy": {
    "customerAcquisition": "Content marketing (blog on startup validation); Partnership with accelerators (batch integration); Founder community engagement (Slack, Twitter); $2K CAC target",
    "pricingStrategy": "Freemium (Phase 1 only, free); Starter $99/mo (all 3 phases); Pro $299/mo (plus custom sections + private advisor); Enterprise custom pricing",
    "growthStrategy": "Phase 1 (Months 1-6): Launch, 1K MRR. Phase 2 (Months 7-12): Accelerator partnerships, $20K MRR. Phase 3 (Months 13-24): Enterprise sales, $100K MRR",
    "keyMilestones": [
      "Month 3: 500 active ideas validated",
      "Month 6: $10K MRR, 10 accelerator partnerships",
      "Month 12: $50K MRR, enterprise customers",
      "Month 18: $200K ARR, Series A ready"
    ]
  },
  
  "structuralRisks": [
    {
      "name": "Market adoption risk",
      "description": "Founders may prefer free DIY tools or trust mentors. Kill assumption may not hold at scale.",
      "implications": "Mitigation: Focus on convenience + time savings. Target early adopters first (Y Combinator, TechCrunch founders). Freemium model reduces barrier."
    },
    {
      "name": "LLM accuracy risk",
      "description": "AI-generated market data may be inaccurate or hallucinated, damaging founder trust.",
      "implications": "Mitigation: Validation agent checks outputs for consistency. Human review for edge cases. Transparent uncertainty estimates. Data sources clearly cited."
    }
  ],
  
  "operationalRisks": [
    {
      "name": "Team execution risk",
      "description": "Need AI/ML expertise + startup domain knowledge. High burn rate initially.",
      "implications": "Mitigation: Hire experienced founders. Start with small team (3-4). Focus on MVP first. Extend team as revenue grows."
    }
  ]
}

LLM Model:    Groq (llama-3.3-70b-versatile)
Temperature:  0.2
Time:         ~8 seconds
Depends on:   Phase 1 output (phase1_output)
Final Output: ✅ Returned to Express backend, saved to MongoDB
```

---

### **PHASE 3: Pitch Deck** (1 Agent)

#### **Agent 6: Pitch Deck Generator Agent**
```
Name:          Phase3PitchDeckAgent
Role:          "Investor Pitch Deck Generator"
Input:         Phase 1 + Phase 2 outputs + idea context
Output Schema: Phase3Output (FINAL - returned to Express)
Output Key:    phase3_output

What it does:
  ├─ Generates 10-slide pitch deck
  ├─ Creates speaker notes for each slide
  ├─ Produces changelog
  └─ Investor-ready presentation

Prompt Focus:
  "Produce exactly 10 slides with fixed names and numbers"
  "Each slide: slideNumber, title, content (plain text + bullets), speakerNotes"
  "Keep concrete, grounded in Phase 1 & 2 data"
  "No invented numbers that contradict earlier phases"

The 10 Slides:
  1. titleSlide         → Company name, mission, hook
  2. problemSlide       → Pain point, specifics, kill assumption
  3. solutionSlide      → Product, 3-4 bullet features
  4. marketOpportunitySlide → TAM, CAGR, timing
  5. businessModelSlide → Revenue, unit economics (LTV/CAC)
  6. tractionSlide      → Momentum, 4 key milestones
  7. competitionSlide   → Landscape, differentiation
  8. teamSlide          → Founders, roles, background
  9. financialsSlide    → 3-year ARR/user projections
  10. askSlide          → Funding amount, use of funds, CTA

Sample Output (Phase3Output):
{
  "pitchDeck": {
    "titleSlide": {
      "slideNumber": 1,
      "title": "Startup Validator",
      "content": "AI-Powered Idea Validation Platform\n\nHelp founders validate startups before building\n\nTurning 6-month pivots into 2-hour decisions",
      "speakerNotes": "Open with the pain: 90% of startups fail because they built the wrong thing. We solve that."
    },
    
    "problemSlide": {
      "slideNumber": 2,
      "title": "The Problem",
      "content": "Founders spend 6-12 months building before validating\n\n• Result: Expensive pivots or complete failure\n• Cost: $50-200K in lost capital per failed pivot\n• Time: 6 months better spent on validated ideas\n\nKill Assumption: Without market validation before building, founders waste years on bad ideas",
      "speakerNotes": "Show real founder story: built for 6 months, discovered no market, had to pivot."
    },
    
    "solutionSlide": {
      "slideNumber": 3,
      "title": "The Solution",
      "content": "• AI analyzes ideas in 2 hours (vs 6 months manually)\n• Structured validation: market feasibility, competitive analysis, risk assessment\n• Professional pitch deck auto-generated (ready for investor meetings)\n• Founder can refine sections with AI, track pivots, export PDF",
      "speakerNotes": "Demo: Run idea through system, show output in 2 minutes."
    },
    
    "marketOpportunitySlide": {
      "slideNumber": 4,
      "title": "Market Opportunity",
      "content": "Total Addressable Market: $50B+ global\n\nGrowth: 25% CAGR through 2027\n\nKey Trends:\n• AI adoption in business tools\n• 50K+ startups founded annually (USA)\n• $250B+ in venture funding annually\n\nOur SAM: $2B (founder tools segment)",
      "speakerNotes": "We're going after 5% of the founder tools market by year 3."
    },
    
    "businessModelSlide": {
      "slideNumber": 5,
      "title": "Business Model",
      "content": "Subscription Tiers:\n• Starter: $99/mo (all 3 phases)\n• Pro: $299/mo (+ custom sections)\n• Enterprise: Custom pricing\n\nUnit Economics:\n• CAC: $2,000 (content + partnerships)\n• LTV: $35,000 (3-year lifetime)\n• LTV/CAC: 17.5x ✅\n\nGross Margin: 75%+ (LLM-based, no COGS)",
      "speakerNotes": "Highlight unit economics: this is a venture-scale business."
    },
    
    "tractionSlide": {
      "slideNumber": 6,
      "title": "Traction & Milestones",
      "content": "Current: MVP complete, 100+ beta users\n\nMilestones (Next 18 months):\n• Month 3: 500 active validated ideas\n• Month 6: $10K MRR, 10 accelerator partnerships\n• Month 12: $50K MRR, first enterprise customer\n• Month 18: $200K ARR, Series A ready",
      "speakerNotes": "We're ahead of the curve on founder adoption of AI tools."
    },
    
    "competitionSlide": {
      "slideNumber": 7,
      "title": "Competition",
      "content": "Our Advantages:\n\n• vs Y Combinator: 24/7 available, $99 vs $500K, no rejection\n• vs DIY tools: AI + market data, 20 hours saved, no guesswork\n• vs Spreadsheets: Real data, professional output, scalable\n\nUniverse of competitors: All are either expensive, manual, or inaccessible",
      "speakerNotes": "No single competitor addresses all three: Speed, Data Quality, Accessibility."
    },
    
    "teamSlide": {
      "slideNumber": 8,
      "title": "Team",
      "content": "CEO: Jane Doe\n• Stanford CS, ex-Y Combinator\n• 5 years founding experience, 2 exits\n\nCTO: John Smith\n• PhD ML, ex-OpenAI\n• 8 years building AI systems at scale\n\nAdvisors:\n• Sarah Chen (Sequoia VC, founder mentor)\n• David Park (Y Combinator Partner)",
      "speakerNotes": "This is a team that has been through the founder journey."
    },
    
    "financialsSlide": {
      "slideNumber": 9,
      "title": "Financial Projections",
      "content": "Conservative 3-Year Model:\n\nYear 1:\n• 5,000 ideas validated\n• $50K ARR\n• Burn rate: $150K/mo\n\nYear 2:\n• 50,000 ideas validated\n• $1.2M ARR\n• Breakeven achieved\n\nYear 3:\n• 200,000 ideas validated\n• $5M ARR\n• 3x net revenue retention",
      "speakerNotes": "Conservative because founders may take time to adopt. Upside: Enterprise expansion to $50M+."
    },
    
    "askSlide": {
      "slideNumber": 10,
      "title": "The Ask",
      "content": "Seeking: $2M Seed Round\n\nUse of Funds:\n• Product & Engineering: $1M (60%)\n• Sales & Marketing: $500K (25%)\n• Operations & Runway: $500K (15%)\n\nRunway: 18 months to breakeven\n\nLet's help founders validate before they build.",
      "speakerNotes": "Close with vision: Imagine a world where no founder wastes time on bad ideas."
    }
  },
  
  "changelog": [
    {
      "section": "Pitch Deck",
      "changeType": "added",
      "description": "Generated complete 10-slide investor pitch deck"
    },
    {
      "section": "Financial Projections",
      "changeType": "added",
      "description": "3-year conservative ARR projections with LTV/CAC analysis"
    },
    {
      "section": "Team Section",
      "changeType": "modified",
      "description": "Added advisor bios and combined team expertise"
    }
  ]
}

LLM Model:    Groq (llama-3.3-70b-versatile)
Temperature:  0.2
Time:         ~10 seconds
Depends on:   Phase 1 + Phase 2 outputs
Final Output: ✅ Returned to Express backend, saved to MongoDB
```

---

## 🔗 Agent Connection Flow

```
INPUT: { ideaTitle, ideaDescription }
  ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 1 PIPELINE                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Agent 1: Idea Understanding                           │
│  ├─ Input: raw idea                                    │
│  └─ Output: state["idea_structured"]                   │
│      ↓                                                 │
│      ├─→ Agent 2: Market Feasibility                  │
│      │   ├─ Input: {idea_structured}                  │
│      │   └─ Output: state["market_analysis"]          │
│      │       ↓                                         │
│      ├─→ Agent 3: Competitor Analysis                 │
│      │   ├─ Input: {idea_structured}                  │
│      │   └─ Output: state["competitor_analysis"]      │
│      │       ↓                                         │
│      └─→ Agent 4: Phase 1 Synthesizer                 │
│          ├─ Input: all 3 prior outputs                │
│          └─ Output: state["phase1_output"] ✅ FINAL   │
│                                                       │
└───────────────┬──────────────────────────────────────────┘
                │ Founder reviews Phase 1
                │ (confirms or refines sections)
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ PHASE 2 PIPELINE                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Agent 5: Business Model & Strategy                    │
│  ├─ Input: phase1_output + idea context               │
│  ├─ Input: {                                           │
│  │   idea_title,                                       │
│  │   idea_description,                                 │
│  │   phase1_context (formatted as text)                │
│  │ }                                                   │
│  └─ Output: state["phase2_output"] ✅ FINAL            │
│                                                         │
└───────────────┬──────────────────────────────────────────┘
                │ Founder reviews Phase 2
                │ (confirms or refines strategy)
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ PHASE 3 PIPELINE                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Agent 6: Pitch Deck Generator                         │
│  ├─ Input: phase1_output + phase2_output + idea       │
│  ├─ Input: {                                           │
│  │   idea_title,                                       │
│  │   idea_description,                                 │
│  │   phase1_context (formatted as text),               │
│  │   phase2_context (formatted as text)                │
│  │ }                                                   │
│  └─ Output: state["phase3_output"] ✅ FINAL            │
│      - 10 slides with speaker notes                    │
│      - Changelog (what was generated)                  │
│                                                         │
└───────────────┬──────────────────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │ OUTPUT: Phase │
        │ 1, 2, 3 data  │
        │ saved to      │
        │ MongoDB       │
        │ + versions    │
        │ + history     │
        └───────────────┘
```

---

## 📊 Pydantic Output Schemas

### **Phase 1 Output Structure**
```python
Phase1Output(
  cleanSummary: str,
  marketFeasibility: {
    marketSize: str,
    growthTrajectory: str,
    keyTrends: list[str],  # Must be array, not comma-joined
    timing: "Now" | "Soon" | "Waiting"
  },
  competitiveAnalysis: list[{
    name: str,
    difference: str,
    advantage: str
  }],
  killAssumption: str,  # ONE sentence, testable
  killAssumptionTestGuidance: str  # "Validate by: (1) ... (2) ... (3) ..."
)
```

### **Phase 2 Output Structure**
```python
Phase2Output(
  businessModel: {
    customerSegments: str,
    valueProposition: str,
    revenueStreams: str,
    costStructure: str,
    keyPartnerships: str,
    keyResources: str
  },
  strategy: {
    customerAcquisition: str,
    pricingStrategy: str,
    growthStrategy: str,
    keyMilestones: list[str]  # Must be array, not comma-joined
  },
  structuralRisks: list[{
    name: str,
    description: str,
    implications: str
  }],
  operationalRisks: list[{
    name: str,
    description: str,
    implications: str
  }]
)
```

### **Phase 3 Output Structure**
```python
Phase3Output(
  pitchDeck: {
    titleSlide: PitchSlide,
    problemSlide: PitchSlide,
    solutionSlide: PitchSlide,
    marketOpportunitySlide: PitchSlide,
    businessModelSlide: PitchSlide,
    tractionSlide: PitchSlide,
    competitionSlide: PitchSlide,
    teamSlide: PitchSlide,
    financialsSlide: PitchSlide,
    askSlide: PitchSlide
  },
  changelog: list[{
    section: str,
    changeType: "added" | "modified" | "removed",
    description: str
  }]
)

where PitchSlide = {
  slideNumber: 1-10,
  title: str,
  content: str (with \n and • bullets),
  speakerNotes: str
}
```

---

## 🎯 Key Design Decisions

### **1. Sequential Agents, Not Parallel**
- ✅ Each agent uses output from prior agents
- ✅ Clean data flow (Agent 2 uses Agent 1 output)
- ❌ Slower (20-30s vs 10-15s if parallel)
- **Reason:** Quality > Speed. Better data > Hallucinations

### **2. Pydantic Schema Enforcement**
- ✅ No garbage JSON (schema enforced)
- ✅ Predictable output shape
- ✅ Express backend knows exactly what to save
- **Reason:** Type safety. No surprises.

### **3. Temperature 0.2**
- ✅ Deterministic output (same input → same output)
- ✅ Few hallucinations (low randomness)
- ✅ Consistent JSON structure
- ❌ Less creative
- **Reason:** Validation is not creative. Accuracy > Originality.

### **4. Ephemeral Sessions**
- ✅ Stateless (each request independent)
- ✅ Scales horizontally (no server state)
- ✅ Simple debugging
- ❌ Can't resume interrupted runs
- **Reason:** Simplicity. Assume requests always complete.

### **5. Context Formatting**
- Agent 2 receives `{idea_structured}` (placeholder from state)
- Agent 3 receives `{idea_structured}` (separate input, can parallelize)
- Agent 4 receives all 3 outputs combined
- Phase 2 receives prior output as formatted text (not JSON)
- **Reason:** Flexibility. Agents can use data in different ways.

### **6. Kill Assumption**
- Every Phase 1 generates ONE critical assumption
- Founder can test this before building
- If wrong, pivots cheaply
- **Reason:** Lean startup methodology. Test riskiest assumption first.

---

## 🔄 Request-Response Flow (Technical)

```
1. User clicks "Generate Phase 1"
   ↓
2. Frontend: POST /api/v1/ideas/:id/generate/phase1
   (includes JWT token in Authorization header)
   ↓
3. Express validates JWT, checks idea exists
   ↓
4. Express calls agentClient.callAgent('phase1', {
     ideaTitle: "...",
     ideaDescription: "..."
   })
   ↓
5. agentClient makes HTTP POST to FastAPI:
   http://localhost:8000/agents/phase1
   (3-minute timeout)
   ↓
6. FastAPI /agents/phase1 endpoint:
   ├─ Creates ephemeral session
   ├─ Creates Runner with phase1_pipeline
   ├─ Formats input as "Content" message
   ├─ Executes runner.run_async()
   │  ├─ Agent 1 runs
   │  │  └─ Output: state["idea_structured"]
   │  ├─ Agent 2 runs
   │  │  └─ Output: state["market_analysis"]
   │  ├─ Agent 3 runs
   │  │  └─ Output: state["competitor_analysis"]
   │  └─ Agent 4 runs
   │     └─ Output: state["phase1_output"]
   ├─ Reads state["phase1_output"]
   └─ Returns as JSON
   ↓
7. Express receives phase1_output (JSON)
   ├─ Validates structure (Pydantic-shaped)
   ├─ Saves to MongoDB: idea.phase1Data = output
   ├─ Sets idea.phaseStatus.phase1 = "generated"
   ├─ Invalidates Phase 2/3 if they existed
   ├─ Increments idea.version
   ├─ Creates version snapshot
   └─ Saves both idea + version
   ↓
8. Express returns to React as JSON
   ↓
9. React receives, updates state, re-renders
   ↓
10. User sees Phase 1 data populated on page
```

---

## 📈 Performance Characteristics

| Phase | Time | Tokens | Cost | Quality |
|-------|------|--------|------|---------|
| **Phase 1** | 20-30s | ~8,000 | $0.012 | 8/10 |
| **Phase 2** | 5-15s | ~4,000 | $0.006 | 8/10 |
| **Phase 3** | 8-20s | ~5,000 | $0.007 | 8.5/10 |
| **Total** | **33-65s** | **~17,000** | **$0.025** | **8.2/10** |

---

## 🚀 How to Extend

### **Add a new agent to Phase 1:**
```python
# adk_service/startup_validator/agent.py

# 1. Define new agent
risk_assessment_agent = LlmAgent(
    name="RiskAssessmentAgent",
    model=model,
    description="Identifies top 5 risks",
    instruction=RISK_ASSESSMENT_PROMPT,
    output_schema=RiskAssessmentOutput,
    output_key="risk_assessment"
)

# 2. Add to pipeline
phase1_pipeline = SequentialAgent(
    name="Phase1Pipeline",
    sub_agents=[
        idea_understanding_agent,
        market_feasibility_agent,
        competitor_analysis_agent,
        risk_assessment_agent,  # ← NEW
        phase1_synthesizer_agent,
    ],
)

# 3. Update synthesizer prompt to include {risk_assessment}
```

### **Add a new phase:**
```python
# adk_service/api.py

@app.post("/agents/phase4")
async def generate_phase4(req: Phase4Request):
    output = await _run_pipeline(
        pipeline=phase4_pipeline,
        initial_state={
            "idea_title": req.ideaTitle,
            "phase1_context": _format_phase1_context(req.phase1Data),
            "phase2_context": _format_phase2_context(req.phase2Data),
            "phase3_context": _format_phase3_context(req.phase3Data),
        },
        output_key="phase4_output",
        user_message="Generate Phase 4..."
    )
    return output
```

---

## ✨ Summary

**6 Agents. 3 Pipelines. 1 Goal: Startup Validation.**

- **Agent 1** structures raw ideas
- **Agent 2** analyzes market size + trends
- **Agent 3** identifies competitors + risks
- **Agent 4** synthesizes into final Phase 1
- **Agent 5** designs business model + strategy
- **Agent 6** generates investor pitch deck

**Each agent is:**
- Specialized (one job, does it well)
- Deterministic (temperature 0.2)
- Schema-enforced (Pydantic)
- Fast (5-10 seconds each)
- Chainable (uses prior outputs)

**The result:**
- Founders understand their market
- Data-driven decisions
- Professional pitch deck
- Risk assessment
- All in 1 hour instead of 6 months

**Next enhancement:** Add tool use (search Crunchbase, fetch real data instead of hallucinating). See AGENT_ENHANCEMENTS.md.
