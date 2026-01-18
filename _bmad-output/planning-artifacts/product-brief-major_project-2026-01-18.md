---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - '_bmad-output/analysis/brainstorming-session-2026-01-18.md'
  - '_bmad-output/planning-artifacts/research/technical-startup-validator-stack-research-2026-01-18.md'
  - '_bmad-output/planning-artifacts/research/market-startup-validator-competitive-research-2026-01-18.md'
date: '2026-01-18'
author: 'Major project'
project_name: 'Startup Validator Platform'
workflow_status: 'complete'
completed_at: '2026-01-18'
---

# Product Brief: Startup Validator Platform

## Executive Summary

**Startup Validator** is a decision-version engine that transforms messy startup ideas into investor-ready pitch decks through a structured 3-phase validation workflow. Unlike chat-based AI tools that generate conversations, Startup Validator produces versioned, editable decisions—giving founders clarity on their biggest risks before they build.

**Market Opportunity:** The AI presentation tools market is growing from $5.69B (2023) to $54.22B (2032) at 28.46% CAGR. With 42% of startups failing due to "no market need," the validation gap represents a significant underserved segment.

**Key Differentiators:**
- Structured 3-phase workflow (Validation → Business Model → Pitch Deck)
- Full version control with changelog tracking
- Section-level editing (edit one part, keep the rest)
- Explicit "Kill Assumption" identification per idea

---

## Core Vision

### Problem Statement

Founders waste months building products nobody wants. 42% of startups fail because they never validated their core assumptions. The tools that exist today—ValidatorAI, PitchBob, Tome—either focus on single outputs (just pitch decks) or offer unstructured chat-based interactions that produce conversations instead of actionable decisions.

### Problem Impact

- **Time Lost:** Founders spend 20-40 hours manually building pitch decks, often for ideas that should have been killed early
- **Money Burned:** Average cost of agency pitch deck: $1,000-$7,000—yet the underlying idea may be fundamentally flawed
- **Emotional Cost:** 58% of founders regret skipping proper research and validation
- **Market Reality:** Most founders don't know their "kill assumption"—the single risk that could sink their startup

### Why Existing Solutions Fall Short

| Competitor | What They Do | What They Miss |
|------------|--------------|----------------|
| **ValidatorAI** | Basic idea validation | No business model, no pitch deck, no versioning |
| **PitchBob** | Validation + pitch deck | No version control, no section editing, all-or-nothing regeneration |
| **Tome/Gamma** | Beautiful presentations | Zero validation—just makes slides |
| **IdeaBuddy** | Business planning | Form-based, no AI generation, no pitch output |

**The Gap:** No tool offers validation + business model + pitch deck with version control and section-level editing.

### Proposed Solution

**Startup Validator** is a decision-version engine with three phases:

| Phase | Outputs |
|-------|---------|
| **Phase 1: Validation** | Clean Idea Summary, Market Feasibility, Competitive Analysis, Kill Assumption |
| **Phase 2: Business Model** | Business Model, Strategy, Structural Risks, Operational Risks |
| **Phase 3: Pitch Deck** | Investor-ready deck with "What Changed" changelog |

**Core Mechanics:**
- Edit any section → only that section regenerates
- Every edit creates a new version (immutable history)
- Phase 1 edits invalidate Phase 2 & 3 (cascade logic)
- Download reports at every phase

### Key Differentiators

| Differentiator | Competitor Reality | Our Advantage |
|----------------|-------------------|---------------|
| **Decision Engine** | Chat-based responses | "Get decisions, not conversations" |
| **Version Control** | No competitor has it | "Your idea's evolution, tracked" |
| **Section-Level Editing** | All-or-nothing regeneration | "Edit what you want, keep what works" |
| **Kill Assumption** | Generic risk assessment | "Know your biggest risk upfront" |
| **Structured Workflow** | Linear or chat-based | "Proven 3-phase methodology" |

---

## Target Users

### Primary Users

#### 1. First-Time Founder ("Alex")
**Profile:** First-time entrepreneur, 25-35, working full-time job while exploring startup ideas. Has domain expertise but no startup experience.

**Context:**
- Has 2-3 ideas bouncing around but doesn't know which to pursue
- Watched YouTube videos on startups but never built a pitch deck
- Afraid of quitting job for an idea that might not work

**Pain Points:**
- Doesn't know HOW to validate—no structured process
- Overwhelmed by conflicting advice online
- Scared of wasting months on a bad idea

**Success Moment:** Sees messy idea transformed into structured validation report with clear "Kill Assumption"—finally knows what to test first.

**Value Proposition:** Guided 3-phase workflow that teaches validation while doing it.

---

#### 2. Serial Entrepreneur ("Jordan")
**Profile:** Experienced founder, 30-45, has launched 2+ startups before. Values speed and iteration over perfection.

**Context:**
- Knows validation matters but hates slow, clunky tools
- Has multiple ideas in various stages
- Wants to quickly compare and iterate on concepts

**Pain Points:**
- Current tools force all-or-nothing regeneration
- No way to track how ideas evolved over time
- Context-switching between ideas loses progress

**Success Moment:** Edits one section, keeps everything else intact. Sees version history showing exactly what changed and why.

**Value Proposition:** Version control + section-level editing for rapid iteration.

---

#### 3. Idea Explorer ("Sam")
**Profile:** Creative thinker, 22-40, constantly generates new business ideas. May be a designer, developer, or consultant with many concepts.

**Context:**
- Has 10+ ideas in notes app, none validated
- Loves ideation but struggles with execution
- Wants to quickly filter ideas worth pursuing

**Pain Points:**
- No organized way to track and compare ideas
- Validation feels like a heavy commitment per idea
- Loses momentum switching between concepts

**Success Moment:** Sees all ideas in one dashboard with phase status badges. Quickly identifies which ideas passed Phase 1 validation.

**Value Proposition:** Idea history management with quick comparison and filtering.

---

#### 4. Pre-Seed Fundraiser ("Morgan")
**Profile:** Founder actively preparing for investor conversations, 28-45. May have MVP or strong concept ready for funding.

**Context:**
- Investor meeting in 2-4 weeks
- Needs professional pitch deck FAST
- Wants to show structured thinking, not just slides

**Pain Points:**
- Agency pitch decks cost $1,000-$7,000
- Generic AI tools make pretty slides but lack substance
- Investors ask hard questions about validation and risks

**Success Moment:** Downloads investor-ready pitch deck with clear business model AND explicit risk analysis. Walks into meeting confident.

**Value Proposition:** Complete validation-to-pitch-deck pipeline with downloadable outputs.

---

### Secondary Users

#### Startup Coaches / Mentors
**Role:** Guide founders through validation process using Startup Validator as a teaching tool.
**Value:** Structured framework to teach; can review founder's version history to see thinking evolution.

#### Accelerator Programs
**Role:** Evaluate applicants or onboard cohort members with consistent validation framework.
**Value:** Standardized validation outputs for comparing startups; bulk idea assessment.

---

### User Journey

| Stage | First-Time Founder (Alex) | Serial Entrepreneur (Jordan) |
|-------|---------------------------|------------------------------|
| **Discovery** | Google search "how to validate startup idea" or Product Hunt | Word of mouth, founder community, Twitter |
| **Onboarding** | Enters first idea, sees guided Phase 1 workflow | Creates account, imports 3 ideas immediately |
| **First Value** | Receives structured validation report + Kill Assumption | Edits one section, sees only that section regenerate |
| **Aha Moment** | "This told me my biggest risk in 5 minutes" | "Finally, version control for my ideas" |
| **Retention** | Returns to complete Phase 2 & 3, then tries new idea | Manages idea portfolio, iterates weekly |
| **Advocacy** | Shares pitch deck with co-founder, recommends to friends | Posts on Twitter about version control feature |

---

## Success Metrics

### User Success Metrics

| Metric | Definition | Target | Why It Matters |
|--------|------------|--------|----------------|
| **Phase 1 Completion Rate** | % of users who complete Phase 1 validation | 70%+ | Proves core value delivery |
| **Full Journey Completion** | % of users completing all 3 phases | 30%+ | Shows product solves the full problem |
| **Section Edit Usage** | % of users who use section-level editing | 40%+ | Validates key differentiator |
| **Version Creation Rate** | Average versions created per idea | 2+ | Shows iteration behavior |
| **Time to First Value** | Time from signup to Phase 1 completion | <10 min | Measures onboarding friction |
| **Download Rate** | % of Phase 3 completers who download | 80%+ | Confirms output value |

### North Star Metric

**Phase 3 Completion Rate** — The percentage of ideas that reach investor-ready pitch deck status.

*Rationale:* A user who completes all 3 phases has:
1. Validated their idea (Phase 1)
2. Built a business model (Phase 2)
3. Created a pitch deck (Phase 3)

This represents the full value promise of Startup Validator.

---

### Business Objectives

#### Phase 1: Launch (Months 1-3) — FREE, Build User Base
| Objective | Target | Measurement |
|-----------|--------|-------------|
| User Acquisition | 1,000 registered users | Signup count |
| Activation Rate | 60% create first idea | Ideas created / Signups |
| Engagement Depth | 50% complete Phase 1 | Phase 1 completions / Ideas |
| Product Hunt Launch | Top 5 of the day | PH ranking |

#### Phase 2: Growth (Months 4-6) — Engagement & Retention
| Objective | Target | Measurement |
|-----------|--------|-------------|
| Monthly Active Users | 500 MAU | Users with activity in 30 days |
| Retention (Week 1) | 40% return within 7 days | Cohort analysis |
| Multi-Idea Users | 30% create 2+ ideas | Users with multiple ideas |
| Full Journey Users | 20% complete all 3 phases | Phase 3 completions / Users |

#### Phase 3: Monetization (Months 7+) — Revenue Introduction
| Objective | Target | Measurement |
|-----------|--------|-------------|
| Free → Paid Conversion | 5% of active users | Paid users / MAU |
| Monthly Recurring Revenue | $1,500 MRR | Stripe dashboard |
| Average Revenue Per User | $20/month | MRR / Paid users |
| Churn Rate | <10% monthly | Cancelled / Total paid |

---

### Key Performance Indicators (KPIs)

#### Leading Indicators (Predict Future Success)
| KPI | Formula | Target |
|-----|---------|--------|
| **Activation Rate** | Ideas Created / Signups | 60% |
| **Phase 1 → Phase 2 Rate** | Phase 2 Starts / Phase 1 Completions | 50% |
| **Edit Engagement** | Users Using Section Edit / Total Users | 40% |
| **Version Depth** | Versions Created / Ideas Created | 2.0+ |

#### Lagging Indicators (Confirm Success)
| KPI | Formula | Target |
|-----|---------|--------|
| **Full Journey Rate** | Phase 3 Completions / Total Ideas | 20% |
| **Download Completion** | Downloads / Phase 3 Completions | 80% |
| **7-Day Retention** | Users Active Day 7 / Signups | 40% |
| **NPS Score** | Promoters - Detractors | 50+ |

#### Future Revenue KPIs (Post-Monetization)
| KPI | Formula | Target |
|-----|---------|--------|
| **Conversion Rate** | Paid Users / Free Users | 5% |
| **LTV:CAC Ratio** | Lifetime Value / Acquisition Cost | 3:1 |
| **Payback Period** | CAC / Monthly Revenue per User | <3 months |

---

## MVP Scope

### Core Features

#### Authentication & User Management
| Feature | Description | Priority |
|---------|-------------|----------|
| **User Registration** | Email/password signup with JWT | P0 |
| **User Login** | JWT-based authentication (access token 15min, refresh 7d) | P0 |
| **User Profile** | View/edit profile information | P0 |
| **Protected Routes** | JWT auth on all APIs except public routes | P0 |

#### Landing Page
| Feature | Description | Priority |
|---------|-------------|----------|
| **Hero Section** | Value prop, CTA, live demo preview | P0 |
| **About Section** | Product explanation and benefits | P0 |
| **Vision/Mission** | Company story and purpose | P0 |
| **Contact Section** | Contact form or email signup | P0 |

#### Idea Management
| Feature | Description | Priority |
|---------|-------------|----------|
| **Create Idea** | Input startup idea description | P0 |
| **Idea History** | Sidebar list + card grid view | P0 |
| **Idea Dashboard** | View all ideas with phase status badges | P0 |
| **Delete Idea** | Remove ideas from history | P0 |

#### Phase 1: Initial Analysis
| Feature | Description | Priority |
|---------|-------------|----------|
| **Clean Idea Summary** | Distilled version of user's idea | P0 |
| **Market Feasibility** | Market analysis and opportunity assessment | P0 |
| **Competitive Analysis** | Competitor landscape and positioning | P0 |
| **Kill Assumption** | One clearly identified assumption that could kill the idea | P0 |
| **Phase 1 Download** | PDF export of Phase 1 report | P0 |

#### Phase 2: Business Model Generation
| Feature | Description | Priority |
|---------|-------------|----------|
| **Business Model** | How the business works | P0 |
| **Strategy** | Go-to-market and growth strategy | P0 |
| **Structural Risks** | Fundamental business model risks | P0 |
| **Operational Risks** | Execution and operational risks | P0 |
| **Phase 2 Download** | PDF export of Phase 2 report | P0 |

#### Phase 3: Pitch Deck Generation
| Feature | Description | Priority |
|---------|-------------|----------|
| **Investor-Ready Content** | Complete pitch deck content | P0 |
| **What Changed Changelog** | Explicit changelog section showing evolution | P0 |
| **Phase 3 Download** | PDF export of pitch deck | P0 |

#### Section-Level Editing (Key Differentiator)
| Feature | Description | Priority |
|---------|-------------|----------|
| **Edit Single Section** | Click to edit any section individually | P0 |
| **Section Regeneration** | Only edited section regenerates, others preserved | P0 |
| **Edit Input UI** | Slide-out drawer or modal for edit input | P0 |

#### Versioning System (Key Differentiator)
| Feature | Description | Priority |
|---------|-------------|----------|
| **Immutable Versions** | Each edit creates new version | P0 |
| **Version History** | View all versions with timestamps | P0 |
| **Version Comparison** | See what changed between versions | P0 |
| **Cascade Invalidation** | Phase 1 edits invalidate Phase 2 & 3 | P0 |
| **Active Version** | Latest version is active, old versions viewable | P0 |

#### UI/UX Essentials
| Feature | Description | Priority |
|---------|-------------|----------|
| **Toast Notifications** | Sonner toasts for all user feedback | P0 |
| **Phase Navigation** | Horizontal stepper showing 1-2-3 progress | P0 |
| **Phase Lock** | Phase 2 & 3 locked until previous confirmed | P0 |
| **Loading States** | Skeleton/spinner during AI generation | P0 |
| **Responsive Design** | Mobile-friendly layout | P0 |

---

### Out of Scope for MVP

| Feature | Rationale | Target Version |
|---------|-----------|----------------|
| **PPTX Export** | PDF sufficient for MVP validation | v1.1 |
| **Word/DOCX Export** | PDF covers core use case | v1.1 |
| **Collaboration/Sharing** | Single-user focus first | v2.0 |
| **Public Shareable Links** | Build user base before sharing | v2.0 |
| **Folders/Tags for Ideas** | Simple list sufficient initially | v1.2 |
| **Real AI Integration** | Dummy data validates UX; Google ADK later | v1.1 |
| **Payment/Stripe Integration** | Free tier first, monetize later | v2.0 |
| **Achievement Badges** | Delight feature after core is solid | v1.2 |
| **Social Login (Google/GitHub)** | Email/password sufficient for MVP | v1.1 |
| **Team Accounts** | Individual users first | v2.0 |
| **API Access** | UI-only for MVP | v2.0 |
| **Markdown Export** | PDF covers core need | v1.1 |

---

### MVP Success Criteria

#### Launch Gate (Go/No-Go for Public Launch)
| Criteria | Target | Measurement |
|----------|--------|-------------|
| Core flow works end-to-end | 100% | Manual QA pass |
| Phase 1 completion possible | Yes | Test user can complete |
| All 3 phases functional | Yes | Full journey testable |
| Section editing works | Yes | Edit preserves other sections |
| Versioning creates history | Yes | Multiple versions visible |
| PDF downloads work | Yes | All 3 phases downloadable |

#### Post-Launch Validation (Weeks 1-4)
| Criteria | Target | Signal |
|----------|--------|--------|
| Users complete Phase 1 | 50%+ | Core value delivered |
| Users use section editing | 30%+ | Differentiator validated |
| Users create multiple versions | 20%+ | Iteration behavior confirmed |
| Users reach Phase 3 | 15%+ | Full journey works |
| Positive user feedback | NPS 40+ | Product-market fit signal |

#### Scale Decision Point (Month 3)
| Criteria | Target | Decision |
|----------|--------|----------|
| 500+ registered users | Yes | Proceed to Growth phase |
| 40% Week-1 retention | Yes | Users find ongoing value |
| Users request paid features | Yes | Monetization viable |

---

### Future Vision

#### Version 1.1 (Post-MVP Polish)
- Real AI integration (Google ADK)
- PPTX and DOCX export options
- Social login (Google, GitHub)
- Markdown export for developers

#### Version 1.2 (Enhanced UX)
- Folders and tags for idea organization
- Achievement badges and gamification
- Keyboard shortcuts
- Dark mode

#### Version 2.0 (Scale & Monetize)
- Freemium pricing tiers ($0 / $15 / $29)
- Team accounts and collaboration
- Public shareable links
- Stripe payment integration
- API access for integrations

#### Long-Term Vision (Year 2-3)
- **Platform Play:** Become the "GitHub for startup ideas"
- **Ecosystem:** Integrations with accelerators, VCs, startup tools
- **AI Enhancement:** Real-time market data, competitor monitoring
- **Enterprise:** White-label for accelerator programs
- **Community:** Founder networking based on idea themes
