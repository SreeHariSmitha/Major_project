# 🚀 Startup Validator Platform

## What Is This?

A platform that helps founders validate startup ideas through **AI-driven structural analysis**. Instead of guessing whether an idea is viable, the platform breaks down the idea into three phases of analysis:

1. **Phase 1 (Discovery)** — Is this even a real problem? How big is the market? Who are the competitors?
2. **Phase 2 (Business Model)** — How do we make money? What are the structural and operational risks?
3. **Phase 3 (Pitch Deck)** — Can we convince investors? Generate a professional 10-slide presentation.

**Core Insight:** Validation is a sequential process. You can't build a business model without understanding the market. You can't pitch without understanding your business model.

---

## The Problem It Solves

**Founders spend months building before validating.**

Current approaches:
- ❌ Subjective feedback from friends ("sounds cool!")
- ❌ Hours of research to answer basic questions
- ❌ Consulting expensive mentors
- ❌ Building first, pivoting later (expensive)

**This platform:**
- ✅ Structured validation in minutes
- ✅ AI-generated insights based on real data
- ✅ Risk identification before capital is spent
- ✅ Professional pitch deck auto-generated
- ✅ Version history to track pivots

---

## How It Works: The Full Flow

```
┌──────────────────────────────────┐
│  Founder Enters Idea             │
│  - Title                         │
│  - Description (what + why)      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 1: DISCOVERY (Market Validation)                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Question 1: Is this a real problem?                            │
│  → AI analyzes problem statement                                 │
│  → Outputs: Problem severity, target market, use cases          │
│                                                                  │
│  Question 2: How big is the market?                             │
│  → AI researches TAM (Total Addressable Market)                 │
│  → Outputs: Market size, CAGR, growth trends, seasonality       │
│                                                                  │
│  Question 3: Who else is solving this?                          │
│  → AI identifies competitors                                     │
│  → Outputs: Key competitors, their positioning, threats         │
│                                                                  │
│  Question 4: What could kill this idea?                         │
│  → AI identifies critical assumptions                           │
│  → Outputs: Kill assumptions (must validate these first)        │
│                                                                  │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ Founder reviews Phase 1
           │ (confirms or refines sections)
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 2: BUSINESS MODEL (Revenue & Risk Strategy)                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Question 1: How do we make money?                              │
│  → AI designs business model canvas                             │
│  → Outputs: Revenue streams, unit economics, key metrics        │
│                                                                  │
│  Question 2: How do we get customers?                           │
│  → AI outlines go-to-market strategy                            │
│  → Outputs: Pricing, distribution channels, marketing approach  │
│                                                                  │
│  Question 3: What breaks the business?                          │
│  → AI identifies structural risks                               │
│  → Outputs: Market risk, model risk, scaling risk, dependency   │
│                                                                  │
│  Question 4: Can we execute?                                    │
│  → AI identifies operational risks                              │
│  → Outputs: Team risk, resource risk, execution risk            │
│                                                                  │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ Founder reviews Phase 2
           │ (confirms or refines strategy)
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 3: PITCH DECK (Investor Presentation)                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AI generates professional 10-slide deck:                       │
│  1. Title Slide (name, tagline, image)                          │
│  2. Problem (customer pain point)                               │
│  3. Solution (your differentiator)                              │
│  4. Market Opportunity (TAM, TAM, growth)                       │
│  5. Traction (initial metrics, validation)                      │
│  6. Business Model (revenue, unit economics)                    │
│  7. Go-to-Market Strategy (path to customers)                   │
│  8. Team (founders, expertise, track record)                    │
│  9. Financial Projections (3-5 year forecast)                   │
│ 10. Call to Action (funding ask, use of funds)                  │
│                                                                  │
│  BONUS:                                                         │
│  - Changelog (all versions + when they were created)            │
│  - Export options (HTML, PDF, PNG)                              │
│                                                                  │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Founder has:     │
    │ ✅ Validation    │
    │ ✅ Strategy      │
    │ ✅ Pitch Deck    │
    │ ✅ Risk Map      │
    └──────────────────┘
```

---

## Technical Architecture: The Stack

### **Layer 1: Frontend (React 19 + Vite)**
**What it does:** User interface where founders see results and manage ideas

```typescript
// The user sees:
Dashboard       → List all ideas, search, filter by phase status
IdeaDetailPage  → Full validation flow (see all 3 phases)
PhaseCards      → Visual representation of progress
PitchDeckViewer → Slideshow of generated deck
VersionHistory  → See what changed and when
SectionEditor   → Refine individual sections with AI
PDFExport       → Download deck as PDF

// Under the hood:
- React Router for navigation
- React Hook Form + Zod for validation
- Tailwind CSS for styling (modern dark/light theme)
- Sonner for toast notifications
- html2pdf for client-side PDF generation
```

**Key Components:**
```typescript
// Phase stepper shows current progress
Phase 1: Discovery [✓ Generated] [○ Confirmed] [○ Locked]
Phase 2: Business  [○ Locked]   [○ Pending]   [○ Generated]
Phase 3: Pitch     [○ Locked]   [○ Locked]    [○ Pending]

// Status machine for each phase:
Locked → Pending → Generated → Confirmed
         ↑        ↓
         └── Invalidated (if upstream phase regenerates)
```

### **Layer 2: Backend (Express + TypeScript)**
**What it does:** API layer that orchestrates the validation pipeline

```typescript
// Express routes organized by feature:

POST /api/v1/auth/register
  → Input: email, password, name
  → Validation: Zod schema (email format, password strength)
  → Hash: bcrypt (12 salt rounds)
  → Output: JWT tokens (access + refresh)

POST /api/v1/auth/login
  → Input: email, password
  → Verify: bcrypt password comparison
  → Output: JWT tokens + user profile

GET /api/v1/ideas
  → Input: query params (search, filters, page)
  → Database: MongoDB find with $text search
  → Output: Ideas array with pagination

POST /api/v1/ideas/:id/generate/phase1
  → Input: idea title + description
  → Call: FastAPI agent sidecar (HTTP POST)
  → Wait: 10-30 seconds (4 agents in sequence)
  → Response: Structured JSON (market analysis, competitors, risks)
  → Save: MongoDB (phase1Data field)
  → Cascade: Invalidate Phase 2 & 3 if they exist
  → Output: Updated idea with new phase1Data

POST /api/v1/ideas/:id/confirm/phase1
  → Input: none (just locks the phase)
  → Update: phaseStatus.phase1 = "confirmed"
  → Enable: Phase 2 becomes "pending" instead of "locked"
  → Version: Create version snapshot for audit trail
  → Output: Updated idea

POST /api/v1/ideas/:id/sections/:name
  → Input: section name + feedback ("make it more aggressive")
  → Call: Agent to refine JUST that section
  → Update: Only that section in phase1Data
  → Output: Updated section + new version

GET /api/v1/ideas/:id/versions
  → Input: idea ID
  → Database: Query all versions for this idea
  → Output: Array of {version, type, timestamp, changes}

GET /api/v1/ideas/:id/versions/compare?v1=1&v2=2
  → Input: two version numbers
  → Compare: Deep diff of snapshots
  → Output: { v1: {...}, v2: {...}, diffs: {...} }
```

**Key Patterns:**
- **Zod Validation:** All inputs validated before processing
- **JWT Auth:** Every request checks Authorization header
- **MongoDB Transactions:** Version creation is atomic with idea update
- **Cascade Invalidation:** Regenerating Phase 1 invalidates Phase 2/3

### **Layer 3: Agent Service (FastAPI + Python)**
**What it does:** Runs AI agents that analyze and generate content

```python
# Three pipelines, each a sequence of agents

Phase1Pipeline (4 agents in sequence):
  ├─ Agent 1: IdeaUnderstandingAgent
  │  Input: Raw founder idea
  │  Output: {
  │      problemStatement: "Founders waste time validating ideas",
  │      targetMarket: "SaaS founders",
  │      useCases: ["pre-launch validation", "pivot decisions", ...],
  │      painPoints: ["no structured framework", "expensive mentors", ...]
  │  }
  │
  ├─ Agent 2: MarketFeasibilityAgent
  │  Uses: Prior output (idea_structured)
  │  Output: {
  │      tam: "$50B TAM in startup advisory market",
  │      cagr: "25% annual growth",
  │      trends: ["AI adoption in business tools", ...],
  │      seasonality: "Higher in Q1-Q2 (fundraising seasons)"
  │  }
  │
  ├─ Agent 3: CompetitorAnalysisAgent
  │  Uses: Prior output (idea_structured)
  │  Output: {
  │      competitors: [
  │          { name: "Y Combinator", threat: "MEDIUM", 
  │            differentiators: ["network effect", "funding"] },
  │          ...
  │      ],
  │      competitionLevel: "MODERATE",
  │      marketShare: { ycombinator: "20%", others: "80%" }
  │  }
  │
  └─ Agent 4: Phase1SynthesizerAgent
     Uses: All prior outputs
     Output: {
         phases1Report: {
             summary: "Market validation appears strong...",
             marketAnalysis: {...},
             competitorAnalysis: {...},
             killAssumptions: [
                 "Founders will pay for validation",
                 "SaaS pricing model is sustainable",
                 ...
             ]
         }
     }

Phase2Pipeline (1 agent):
  └─ BusinessModelAgent
     Uses: Phase 1 context (from MongoDB, formatted as text)
     Input: Phase 1 data + founder's business model questions
     Output: {
         businessModel: {
             valueProposition: "Structured AI-driven validation",
             revenueStreams: ["SaaS subscription", "enterprise contracts"],
             unitEconomics: { arpu: "$500/month", cac: "$100", ltv: "$6000" },
             keyMetrics: ["activation rate", "retention", "expansion MRR"]
         },
         gtoStrategy: {
             pricingTiers: ["Starter: $99/mo", "Pro: $299/mo", ...],
             distribution: ["direct", "partnerships with accelerators"],
             marketing: ["content marketing", "community"]
         },
         risks: {
             structural: ["market adoption", "pricing model validation"],
             operational: ["team execution", "customer support scaling"]
         }
     }

Phase3Pipeline (1 agent):
  └─ PitchDeckAgent
     Uses: Phase 1 + Phase 2 context
     Input: All validated information + pitch guidelines
     Output: {
         slides: [
             {
                 slideNumber: 1,
                 title: "Startup Validator",
                 subtitle: "AI-Driven Idea Validation",
                 content: "Helping founders validate before building",
                 speaker: "We solve the founder validation problem..."
             },
             {
                 slideNumber: 2,
                 title: "The Problem",
                 content: "Most founders spend months building...",
                 speaker: "..."
             },
             // ... 8 more slides
         ],
         changelog: [
             { version: 1, timestamp: "2026-04-20T10:00:00Z", changes: ["Created idea", "Generated Phase 1"] },
             { version: 2, timestamp: "2026-04-20T14:30:00Z", changes: ["Confirmed Phase 1", "Generated Phase 2"] },
             ...
         ]
     }
```

**Agent Architecture Deep Dive:**

```
Input: { title: "Startup Validator", description: "..." }
  ↓
Create ADK Session (in-memory, ephemeral)
  ↓
Create Runner (orchestrates agent sequence)
  ↓
Format input as "Content" message
  ↓
┌─────────────────────────────────────────────────────────┐
│ Agent 1 runs                                            │
│ - Receives: user message (raw idea)                    │
│ - Calls: Groq API with system prompt                   │
│ - System Prompt: "Extract key business concept..."    │
│ - Response: Pydantic model (idea_structured)           │
│ - Stored: session.state["idea_structured"]             │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ Agent 2 runs                                            │
│ - Receives: session.state (has idea_structured)       │
│ - Prompts substitutes {idea_structured} placeholder   │
│ - Calls: Groq API with market prompt                  │
│ - Response: Pydantic model (market_analysis)          │
│ - Stored: session.state["market_analysis"]            │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ Agent 3 runs                                            │
│ - Receives: session.state (has idea_structured)       │
│ - Prompts substitutes {idea_structured}               │
│ - Calls: Groq API with competitor prompt              │
│ - Response: Pydantic model (competitor_analysis)      │
│ - Stored: session.state["competitor_analysis"]        │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ Agent 4 runs                                            │
│ - Receives: session.state (all prior outputs)         │
│ - Prompts substitutes ALL placeholders                 │
│ - Calls: Groq API with synthesizer prompt             │
│ - Response: Pydantic model (phase1_output) ← FINAL    │
│ - Stored: session.state["phase1_output"]              │
└─────────────────────────────────────────────────────────┘
  ↓
Read session.state["phase1_output"]
  ↓
Return as JSON dict
  ↓
Express receives, saves to MongoDB, returns to React
```

**Why This Architecture?**
- **Agents in sequence:** Each output informs next agent
- **Pydantic schemas:** Enforce strict JSON structure (no garbage)
- **Temperature 0.2:** Low randomness = consistent outputs
- **Ephemeral sessions:** No persistence between requests (stateless)
- **Groq + LiteLlm:** Fast inference + easy model switching

### **Layer 4: Database (MongoDB Atlas)**
**What it does:** Stores ideas, validation results, user accounts, and version history

```javascript
// users collection
{
  _id: ObjectId,
  email: "founder@example.com",        // unique index
  password: "$2b$12$...(bcrypt hash)", // never returned in API
  name: "Jane Doe",
  createdAt: Date,
  updatedAt: Date
}

// ideas collection
{
  _id: ObjectId,
  userId: ObjectId,                   // reference to user
  title: "Startup Validator",
  description: "AI-powered validation platform...",
  
  // Phase status machine
  phaseStatus: {
    phase1: "confirmed",              // locked | pending | generated | confirmed | invalidated
    phase2: "generated",
    phase3: "locked"
  },
  
  // Phase 1 data (AI-generated)
  phase1Data: {
    problemStatement: "Founders waste time validating...",
    solution: "AI-powered structured validation",
    marketAnalysis: {
      tam: "$50B",
      cagr: "25%",
      trends: ["AI adoption", "startup culture"],
      seasonality: "Q1-Q2 peak"
    },
    competitorAnalysis: [
      {
        name: "Y Combinator",
        threat: "MEDIUM",
        positioning: "Network + funding + education",
        ourDifferentiator: "Real-time AI validation"
      }
    ],
    killAssumptions: [
      "Founders will pay for validation",
      "SaaS pricing works for this market",
      "Validation is before building (not during)"
    ],
    generatedAt: Date
  },
  
  // Phase 2 data
  phase2Data: {
    businessModelCanvas: {
      valueProposition: "Validate before building",
      revenueStreams: ["SaaS subscription", "Enterprise"],
      keyMetrics: ["activation", "retention", "expansion"],
      unitEconomics: { arpu: "$500", cac: "$100", ltv: "$6000" }
    },
    gotoMarketStrategy: {
      pricing: ["Starter $99", "Pro $299", "Enterprise custom"],
      distribution: ["direct", "partners", "content"],
      marketing: ["SEO", "community", "partnerships"]
    },
    structuralRisks: ["market size", "adoption risk", "competition"],
    operationalRisks: ["team scaling", "customer support", "execution"],
    generatedAt: Date
  },
  
  // Phase 3 data (pitch deck)
  phase3Data: {
    slides: [
      {
        slideNumber: 1,
        title: "Startup Validator",
        subtitle: "AI-Driven Validation Platform",
        content: "Help founders validate ideas before building",
        speaker: "Script for founder to read"
      },
      // ... 9 more slides
    ],
    changelog: [
      { version: 1, timestamp: Date, changes: ["Created idea"] },
      { version: 2, timestamp: Date, changes: ["Generated Phase 1"] }
    ],
    generatedAt: Date
  },
  
  version: 3,                         // incremented on each change
  archived: false,
  createdAt: Date,
  updatedAt: Date
}

// versions collection (audit trail)
{
  _id: ObjectId,
  ideaId: ObjectId,
  version: 1,
  type: "initial",                    // initial | phase1_generated | phase1_confirmed | etc
  snapshot: {                         // full copy of idea at this version
    title: "...",
    description: "...",
    phaseStatus: {...},
    phase1Data: {...}
  },
  message: "Initial idea creation",
  createdAt: Date
}
```

**Why This Schema?**
- **Versioning:** Complete history of all changes
- **Embedded data:** Phase data in ideas (denormalized for speed)
- **Cascade tracking:** Version snapshots before each change
- **Phase status:** Explicit state machine prevents invalid transitions

---

## How the AI Actually Works: Technical Deep Dive

### **The Request-Response Flow**

```
1. User clicks "Generate Phase 1"
   ↓
2. React calls: POST /api/v1/ideas/:id/generate/phase1
   ↓
3. Express backend:
   - Validates JWT token
   - Checks idea exists + belongs to user
   - Checks phase1 not already confirmed
   ↓
4. Calls agentClient.callAgent('phase1', {
     ideaTitle: "Startup Validator",
     ideaDescription: "..."
   })
   ↓
5. agentClient makes HTTP POST to http://localhost:8000/agents/phase1
   (with 3-minute timeout)
   ↓
6. FastAPI receives request, calls _run_pipeline()
   ↓
7. _run_pipeline creates:
   - Unique session ID
   - Unique user ID (express-{random})
   - Initial state (empty dict)
   ↓
8. Creates Runner object with phase1_pipeline
   ↓
9. Formats input as "Content" message
   ↓
10. Executes runner.run_async() → streams events (we ignore them)
    ↓
11. While running: Each agent processes
    - Agent 1 output → state["idea_structured"]
    - Agent 2 output → state["market_analysis"]
    - Agent 3 output → state["competitor_analysis"]
    - Agent 4 output → state["phase1_output"]
    ↓
12. After completion: Reads state["phase1_output"]
    ↓
13. Converts to dict (if JSON string) and returns HTTP 200
    ↓
14. Express receives response, validates structure
    ↓
15. Saves to MongoDB:
    idea.phase1Data = response
    idea.phaseStatus.phase1 = "generated"
    version++
    ↓
16. Creates version snapshot:
    Version({ ideaId, version, type: "phase1_generated", snapshot })
    ↓
17. If phase2/3 were generated: Invalidate them
    ↓
18. Saves both idea + version
    ↓
19. Returns to React as JSON
    ↓
20. React receives, updates state, re-renders
    ↓
21. User sees Phase 1 data populated on page
```

### **Prompt Engineering: How AI Knows What to Do**

Each agent gets a system prompt (template) that:
- Explains the task
- Defines output structure (Pydantic schema)
- Gives examples
- Sets constraints

```python
# Example: IdeaUnderstandingAgent prompt

IDEA_UNDERSTANDING_PROMPT = """
You are an expert business analyst. Your task is to extract and structure a founder's raw idea.

INPUT: Unstructured idea description from founder

OUTPUT: Structured business concept with these fields:
- problemStatement: What problem does this solve? (1-2 sentences)
- solution: How does this product solve it? (1-2 sentences)
- targetMarket: Who benefits most? (specific segment, not "everyone")
- useCases: Top 3-5 use cases
- painPoints: Key customer pain points (array)
- marketSegment: TAM category (B2B, B2C, B2B2C)

RULES:
1. Be specific (no "people", say "SaaS founders")
2. Be realistic (no 10x growth claims)
3. Extract from description (don't invent)
4. Output valid JSON only

EXAMPLE INPUT:
"We help companies find remote workers quickly"

EXAMPLE OUTPUT:
{
  "problemStatement": "Hiring remote talent is slow and expensive",
  "solution": "AI-powered matching between companies and remote workers",
  "targetMarket": "Mid-market SaaS companies (10-100 employees)",
  "useCases": ["Rapid team expansion", "Emergency hiring", "Contractor matching"],
  "painPoints": ["Long hiring cycles (2-3 months)", "Expensive recruiters", "Skill mismatch"],
  "marketSegment": "B2B"
}

Now, structure this idea:
{idea_input}
"""
```

**Why This Works:**
- **Explicit schema:** AI knows exactly what structure to output
- **Examples:** Reduces hallucination and format errors
- **Temperature 0.2:** Low randomness means consistent output
- **Pydantic validation:** Server rejects malformed JSON, forcing retry

### **The Cascade Invalidation Logic**

When a founder regenerates Phase 1 (after initial confirmation):

```
Before (old state):
├─ Phase 1: confirmed ✓
├─ Phase 2: confirmed ✓  (depends on Phase 1)
└─ Phase 3: generated    (depends on Phase 1 & 2)

Founder clicks "Regenerate Phase 1" → System:

1. Check if Phase 1 is confirmed
   ✓ Yes, allow regeneration

2. Call agent service (get new phase1Data)

3. Save new phase1Data

4. Update phaseStatus:
   ├─ phase1: generated (new, not confirmed yet)
   ├─ phase2: invalidated (was confirmed, now invalid)
   └─ phase3: invalidated (was generated, now invalid)

5. Create version snapshot

After (new state):
├─ Phase 1: generated    (new analysis)
├─ Phase 2: invalidated  (must regenerate)
└─ Phase 3: invalidated  (must regenerate)

Founder must now:
1. Review Phase 1 (maybe accept or refine sections)
2. Confirm Phase 1
3. Regenerate Phase 2 (using new Phase 1 context)
4. Confirm Phase 2
5. Regenerate Phase 3 (using updated Phase 1 & 2)
```

**Why This Matters:**
- Prevents inconsistent data (Phase 3 relying on old Phase 1)
- Forces re-validation of downstream phases
- Maintains data integrity across the validation pipeline

---

## Key Technical Decisions & Tradeoffs

### **Decision 1: ADK for Agents (vs. LangChain or custom)**
- ✅ **Pro:** Built-in session management, streaming, state handling
- ✅ **Pro:** Abstracts away agent complexity
- ✅ **Pro:** Pydantic output validation
- ❌ **Con:** Opinionated, less flexibility
- ❌ **Con:** Newer (less community)

### **Decision 2: Sequential agents (vs. parallel)**
- ✅ **Pro:** Each agent can use prior outputs
- ✅ **Pro:** Cleaner data flow (Agent 2 uses Agent 1 output)
- ❌ **Con:** Slower (10-30s for 4 agents vs. 5-10s if parallel)
- ❌ **Con:** One agent failure breaks whole pipeline

### **Decision 3: Groq + LiteLlm (vs. OpenAI or Anthropic)**
- ✅ **Pro:** Fast inference (token/ms = cheap)
- ✅ **Pro:** LiteLlm abstraction (easy to switch)
- ✅ **Pro:** No rate limiting for hobby projects
- ❌ **Con:** Less capable than Claude/GPT-4
- ❌ **Con:** Less control over output format (needs 0.2 temp)

### **Decision 4: Ephemeral sessions (vs. persistent)**
- ✅ **Pro:** Stateless (each request independent)
- ✅ **Pro:** Simpler debugging (no session cleanup)
- ✅ **Pro:** Scales horizontally
- ❌ **Con:** Can't resume interrupted runs
- ❌ **Con:** No in-process caching

### **Decision 5: Versioning at DB level (vs. git-style)**
- ✅ **Pro:** Full snapshots (can restore any version)
- ✅ **Pro:** Works with unstructured data (JSON documents)
- ✅ **Pro:** Audit trail built-in
- ❌ **Con:** Storage cost (full copies)
- ❌ **Con:** Harder to see diffs

---

## System Constraints & Limitations

### **Design Constraints**
- **Max idea size:** 5000 characters per description (API validation)
- **Max sections:** 20 sections per phase (scalability)
- **Version history:** Keep last 50 versions per idea (storage)
- **Phase timeout:** 3 minutes per phase generation (Agent service timeout)

### **AI Limitations**
- **Hallucination:** AI might invent competitor names (founders must verify)
- **Data freshness:** Uses Groq's training data (cutoff 2024)
- **Cost estimates:** Rough approximations (not financial advice)
- **Kill assumptions:** Generated, not exhaustive (founders must think of more)

### **Technical Limitations**
- **Single region:** MongoDB in US (higher latency from other regions)
- **No multi-tenancy:** Each idea tied to single user
- **No webhooks:** Must poll for completion (React polling)
- **No real-time:** WebSocket not implemented (could add)

---

## How to Actually Use This

### **For a Founder**

```
1. Sign up (email + password)

2. Create idea
   - Title: "Startup Validator"
   - Description: "Platform that helps founders..."

3. See Phase 1 card (locked)
   - Click "Generate Phase 1"
   - Wait 10-30 seconds
   - See results

4. Review Phase 1 data
   - Read each section
   - Understand market size, competitors, risks
   - Click pencil to refine a section (e.g., "make the market analysis more aggressive")
   - AI regenerates just that section

5. Confirm Phase 1
   - Confirms you agree with the analysis
   - Locks Phase 1 (can't regenerate unless you reset)
   - Unlocks Phase 2 (turns from gray to blue)

6. Generate Phase 2
   - AI uses Phase 1 context (reads it as text, runs Business Model Agent)
   - Generates business model, GTM, risks
   - Takes 5-15 seconds

7. Review Phase 2, Confirm

8. Generate Phase 3
   - AI uses Phase 1 + Phase 2 context
   - Generates 10-slide investor pitch deck
   - Takes 8-20 seconds

9. View Pitch Deck
   - See all 10 slides in a grid
   - Click slide to expand
   - See speaker notes for each slide

10. Export Pitch Deck
    - Download as PDF (uses html2pdf)
    - Share with investors

11. See Version History
    - Timeline of all changes
    - What was regenerated, when
    - Why (phase confirmed, section refined, etc.)

12. (Optional) Pivot
    - Edit idea description
    - Regenerate Phase 1
    - Phases 2/3 auto-invalidated
    - Repeat from step 4
```

### **For a Developer**

```
1. Clone repo, install dependencies

2. Start 3 servers
   - Express: npm run dev (port 5000)
   - FastAPI: python api.py (port 8000)
   - React: npm run dev (port 5173)

3. Register & login

4. Create idea via UI (or curl API)

5. Generate Phase 1 (wait for agents to run)

6. Check MongoDB to see phase1Data saved

7. Modify prompt in adk_service/prompts.py

8. Restart FastAPI

9. Regenerate Phase 1 again (see new output)

10. Review MongoDB versions collection (see history)

11. Modify section in UI (trigger refineSection API)

12. Check that only one section was regenerated
```

---

## What Makes This Project Different

### **vs. Y Combinator's approach**
- YC does human evaluation (expensive, 2% acceptance)
- This does AI evaluation (fast, available 24/7)
- YC's output is yes/no + mentorship
- This output is structured data + insights

### **vs. Existing SaaS tools**
- Gong/Chorus do sales coaching (post-deal)
- This does idea validation (pre-deal)
- Generic business planning tools (linear, not sequential)
- This respects phase dependencies (can't pitch without business model)

### **vs. DIY approach (Google Sheets)**
- Manual template filling (hours of work)
- No AI insights (founder has to know the answers)
- No version history (hard to pivot)
- This is automated + intelligent + temporal

---

## The Vision

**What could this become?**

**Short-term (current):**
- Validate ideas through structured phases
- Generate professional pitch decks
- Track versions as you pivot

**Medium-term (possible next):**
- Add financial model generation (pro-forma P&Ls)
- Add cap table calculator
- Add investor database (who funded similar ideas)
- Add co-founder matching (find teammates)
- Add customer feedback integration (validate with real users)

**Long-term (moonshot):**
- Predict funding success (based on historical patterns)
- Connect to VCs (auto-distribute pitch decks)
- Provide funding guidance (how much to raise, from whom)
- Build the entire founder toolkit (all tools in one platform)

---

## Why This Matters

Founders right now:
- Spend 6-12 months building before validation
- Burn $50-200k before knowing if idea is viable
- Make critical decisions with incomplete information
- Pivot too late, after sunk costs

With structured AI validation:
- Validate in 2-3 hours instead of 6 months
- Get market insights, competitive analysis, risk assessment
- Make data-driven pivots early
- Avoid expensive mistakes

**The impact:** More founders succeed. Less wasted capital. Better ideas reach market faster.

---

## Technical Debt & Known Issues

- [ ] No automated tests (unit/integration/e2e)
- [ ] PDF export not available on all browsers (html2pdf limitation)
- [ ] No real-time collaboration (single user per idea)
- [ ] Agent service might timeout on slow connections
- [ ] No analytics (which ideas succeed, which fail)
- [ ] No caching (each regenerate queries agents again)
- [ ] No rate limiting (could abuse API)

---

## How to Extend This

**Add new validation phase:**

```python
# adk_service/agent.py

# Define new agent
product_market_fit_agent = LlmAgent(
    name="ProductMarketFitAgent",
    model=model,
    instruction=PRODUCT_MARKET_FIT_PROMPT,
    output_schema=ProductMarketFitOutput,
    output_key="pmf_output"
)

# Add to pipeline
phase4_pipeline = SequentialAgent(
    agents=[phase1_synthesizer_agent, product_market_fit_agent]
)
```

**Add new validation rule:**

```typescript
// server/src/controllers/ideaController.ts

// Before generating Phase 2, check:
if (!idea.phase1Data.killAssumptions?.length) {
  res.status(400).json({
    error: "Phase 1 must have kill assumptions before Phase 2"
  });
  return;
}
```

**Add new UI export format:**

```typescript
// client/src/pages/IdeaDetailPage.tsx

const exportAsMarkdown = () => {
  const md = `# ${idea.title}\n\n`;
  md += `## Phase 1\n${JSON.stringify(idea.phase1Data)}\n\n`;
  md += `## Phase 2\n${JSON.stringify(idea.phase2Data)}\n\n`;
  // Download as .md file
};
```

---

**This is a working example of:**
- ✅ AI agents in production
- ✅ Multi-tier architecture (React → Express → FastAPI → MongoDB)
- ✅ Structured validation pipelines
- ✅ State machines (phase status)
- ✅ Version history & audit trails
- ✅ Real-time feedback (section refinement)
- ✅ Modern UI (Tailwind, responsive)
- ✅ Type safety (TypeScript, Pydantic)

Use it to understand how to build AI-powered SaaS applications.

---

**Built with:** React • Express • FastAPI • MongoDB • Google ADK • Groq Llama 3.3-70b • Tailwind CSS • TypeScript • Python

**Last Updated:** 2026-04-22
