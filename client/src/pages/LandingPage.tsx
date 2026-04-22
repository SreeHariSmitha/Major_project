import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      {/* ================================ NAV ================================ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className={`font-bold text-[17px] tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                Startup Validator
              </span>
            </Link>

            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={isNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>

            <div
              className={`${
                isNavOpen ? 'flex' : 'hidden'
              } md:flex flex-col md:flex-row absolute md:relative top-16 md:top-0 left-0 right-0 md:left-auto md:right-auto bg-white md:bg-transparent p-4 md:p-0 gap-4 md:gap-8 items-center shadow-lg md:shadow-none border-b md:border-0 border-slate-200`}
            >
              <a href="#how" className={`text-sm font-medium transition-colors ${scrolled || isNavOpen ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`} onClick={() => setIsNavOpen(false)}>How it works</a>
              <a href="#agents" className={`text-sm font-medium transition-colors ${scrolled || isNavOpen ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`} onClick={() => setIsNavOpen(false)}>AI agents</a>
              <a href="#kill" className={`text-sm font-medium transition-colors ${scrolled || isNavOpen ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`} onClick={() => setIsNavOpen(false)}>Kill assumption</a>
              {isAuthenticated ? (
                <Link to="/dashboard" className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${scrolled || isNavOpen ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className={`text-sm font-medium transition-colors ${scrolled || isNavOpen ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>Sign in</Link>
                  <Link to="/register" className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${scrolled || isNavOpen ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                    Start free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ================================ HERO ================================ */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 80%)',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-40 left-1/4 w-[520px] h-[520px] bg-indigo-500/25 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-60 right-1/4 w-[420px] h-[420px] bg-violet-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-40 lg:pb-32">
          {/* Eyebrow */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>Powered by 6 specialized AI agents</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] max-w-4xl mx-auto text-white">
            From raw idea to{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              investor-ready
            </span>
            , in three structured phases.
          </h1>

          {/* Subhead */}
          <p className="mt-6 text-center text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop building decks for ideas that should have been killed on day one.
            Validate market feasibility, pressure-test your kill assumption, and ship
            a structured pitch deck — all backed by a sequential agent pipeline.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-white/10"
            >
              Start validating free
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              See how it works
            </a>
          </div>
          <p className="mt-5 text-center text-xs text-slate-400">
            Free to start · No credit card · Uses real market reasoning, not rehashed ChatGPT
          </p>

          {/* Hero visual — real-looking product preview */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-2xl rounded-3xl" />
            <div className="relative bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-900/80">
                <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <div className="ml-4 text-xs text-slate-500 font-mono">
                  startup-validator / FishFinder Pro / v9
                </div>
              </div>
              {/* Content */}
              <div className="p-8 grid md:grid-cols-3 gap-6">
                {/* Phase 1 card */}
                <div className="rounded-xl bg-slate-800/50 border border-white/10 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">1</div>
                    <div className="text-xs text-slate-400">Phase 1 · Validation</div>
                  </div>
                  <div className="text-sm font-medium text-white mb-2">Market Feasibility</div>
                  <div className="text-xs text-slate-400 leading-relaxed mb-4">
                    $1.5B global market · 8% CAGR · Timing: <span className="text-emerald-400">Now</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[80%] bg-gradient-to-r from-indigo-500 to-violet-500" />
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[60%] bg-gradient-to-r from-indigo-500 to-violet-500" />
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-gradient-to-r from-indigo-500 to-violet-500" />
                    </div>
                  </div>
                </div>

                {/* Phase 2 card */}
                <div className="rounded-xl bg-slate-800/50 border border-white/10 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold">2</div>
                    <div className="text-xs text-slate-400">Phase 2 · Business Model</div>
                  </div>
                  <div className="text-sm font-medium text-white mb-2">Strategy & Risks</div>
                  <div className="text-xs text-slate-400 leading-relaxed mb-4">
                    4 milestones · 4 structural risks · 4 operational risks
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={`h-8 rounded-md ${i < 4 ? 'bg-violet-500/30 border border-violet-400/30' : 'bg-slate-700/40 border border-slate-600/30'}`} />
                    ))}
                  </div>
                </div>

                {/* Phase 3 card */}
                <div className="rounded-xl bg-slate-800/50 border border-white/10 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center text-xs font-bold">3</div>
                    <div className="text-xs text-slate-400">Phase 3 · Pitch Deck</div>
                  </div>
                  <div className="text-sm font-medium text-white mb-2">10-slide Deck</div>
                  <div className="text-xs text-slate-400 leading-relaxed mb-4">
                    Problem → Solution → Ask · Speaker notes included
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="aspect-[4/3] rounded bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-400/20" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== PROBLEM =============================== */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
              The problem
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Most startup ideas die because nobody killed them early enough.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Founders spend months on decks, landing pages, and MVPs before realising
              the core assumption was never going to hold. By then, time and runway
              are gone.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Blank-page paralysis',
                body: 'You have an idea. You stare at a deck template. Three hours later nothing useful exists yet.',
              },
              {
                title: 'Generic AI chats',
                body: 'ChatGPT gives you plausible-sounding paragraphs with no structure, no versioning, no audit trail.',
              },
              {
                title: 'Untested assumptions',
                body: 'The one thing that will kill your startup is hiding in plain sight — and nobody made you name it.',
              },
            ].map((p) => (
              <div key={p.title} className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="text-base font-semibold text-slate-900 mb-2">{p.title}</div>
                <div className="text-sm text-slate-600 leading-relaxed">{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== HOW IT WORKS ============================== */}
      <section id="how" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
              How it works
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Three phases. Each one locked until the previous is confirmed.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              No phase unlocks until you've reviewed and confirmed the one before it.
              Regenerate any phase and downstream work is cleanly invalidated — like
              git, for startup reasoning.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                phase: '01',
                title: 'Validate',
                subtitle: 'Market feasibility + competitive analysis + kill assumption',
                body: 'A four-agent pipeline breaks your idea into target users, domain, assumptions; sizes the market with CAGR; finds real competitors (not "OpenAI"); and names the single assumption that would kill the idea if wrong.',
                outputs: ['Clean summary', 'Market size + CAGR', 'Named competitors', 'Kill assumption', 'Test guidance'],
                tint: 'indigo',
              },
              {
                phase: '02',
                title: 'Model',
                subtitle: 'Business model + go-to-market + structural/operational risks',
                body: 'Once Phase 1 is confirmed, Phase 2 uses it as context to produce a full business model canvas, phased go-to-market plan with concrete milestones, plus four structural and four operational risks with mitigation paths.',
                outputs: ['Business model canvas', 'GTM strategy', 'Key milestones', 'Structural risks', 'Operational risks'],
                tint: 'violet',
              },
              {
                phase: '03',
                title: 'Pitch',
                subtitle: '10-slide investor deck with speaker notes',
                body: 'Finally, a 10-slide pitch deck grounded in every decision you just confirmed — problem, solution, market, business model, traction, competition, team, financials, ask. Each slide has speaker notes and a changelog.',
                outputs: ['10 structured slides', 'Speaker notes', 'Changelog', 'PDF export'],
                tint: 'fuchsia',
              },
            ].map((step) => (
              <div key={step.phase} className="relative bg-white rounded-2xl border border-slate-200 p-8 hover:border-slate-300 transition-colors">
                <div className="grid md:grid-cols-[auto_1fr_auto] gap-8 items-start">
                  <div
                    className={`text-5xl font-bold tracking-tighter ${
                      step.tint === 'indigo'
                        ? 'text-indigo-500/30'
                        : step.tint === 'violet'
                        ? 'text-violet-500/30'
                        : 'text-fuchsia-500/30'
                    }`}
                  >
                    {step.phase}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-1">{step.title}</h3>
                    <div className="text-sm text-slate-500 mb-4">{step.subtitle}</div>
                    <p className="text-slate-700 leading-relaxed max-w-2xl">{step.body}</p>
                  </div>
                  <div className="flex flex-wrap md:flex-col gap-2 md:min-w-[180px]">
                    {step.outputs.map((o) => (
                      <div
                        key={o}
                        className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                          step.tint === 'indigo'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : step.tint === 'violet'
                            ? 'bg-violet-50 text-violet-700 border border-violet-100'
                            : 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100'
                        }`}
                      >
                        {o}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== AGENTS ============================== */}
      <section id="agents" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
                Under the hood
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-6">
                Not a chatbot. A <span className="text-indigo-600">pipeline</span>.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Six specialized LLM agents run in sequence, each with a narrow job and
                a strict output schema. No freeform prose. No hallucinated numbers.
                Every phase produces structured data that downstream agents can read.
              </p>
              <ul className="space-y-3 text-slate-700">
                {[
                  'Structured outputs enforced by Pydantic schemas',
                  'Session state piped agent-to-agent via output keys',
                  'Full version history — regenerate cascades downstream invalidation',
                  'Fail-closed: if the agent service is down, you get an error, never dummy data',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Agent pipeline diagram */}
            <div className="bg-slate-950 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="text-xs text-slate-500 font-mono mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SequentialAgent pipeline
                </div>
                <div className="space-y-2">
                  {[
                    { n: 1, name: 'IdeaUnderstandingAgent', out: 'idea_structured' },
                    { n: 2, name: 'MarketFeasibilityAgent', out: 'market_analysis' },
                    { n: 3, name: 'CompetitorAnalysisAgent', out: 'competitor_analysis' },
                    { n: 4, name: 'Phase1SynthesizerAgent', out: 'phase1_output' },
                    { n: 5, name: 'Phase2BusinessModelAgent', out: 'phase2_output' },
                    { n: 6, name: 'Phase3PitchDeckAgent', out: 'phase3_output' },
                  ].map((a, i, arr) => (
                    <div key={a.n}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-mono font-bold">
                          {a.n}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{a.name}</div>
                          <div className="text-xs text-slate-400 font-mono">→ {a.out}</div>
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex justify-center py-1">
                          <svg className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== KILL ASSUMPTION ============================== */}
      <section id="kill" className="py-24 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
              The method
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              The kill assumption
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              The one assumption that, if false, makes the rest of your idea worthless.
              We surface it explicitly — and give you a concrete plan to test it this week.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                </svg>
                Critical to validate
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Example — FishFinder Pro
                </div>
                <div className="text-slate-800 text-base leading-relaxed">
                  "The assumption that commercial fishermen will adopt new technology
                  <span className="font-semibold text-slate-900"> AND </span>
                  wholesalers will be interested in purchasing fish through the app
                  is critical to the success of FishFinder Pro."
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  How to test this week
                </div>
                <ol className="space-y-2 text-slate-700 text-sm">
                  <li className="flex gap-3">
                    <span className="text-indigo-600 font-mono font-semibold">1.</span>
                    <span>Conduct surveys or interviews with 15+ commercial fishermen on technology adoption</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 font-mono font-semibold">2.</span>
                    <span>Reach out to local wholesalers to assess willingness to purchase via app</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 font-mono font-semibold">3.</span>
                    <span>Test with a pilot group, gather feedback, refine before building</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.4), transparent 60%)',
        }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6 text-white">
            Put your idea under real scrutiny.
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
            First validation takes about a minute. Either you'll feel more confident
            building, or you'll save yourself six months.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              Start free — no card needed
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer id="contact" className="bg-slate-950 border-t border-white/5 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <span className="font-bold text-[17px]">Startup Validator</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                A sequential AI pipeline for going from raw startup idea to investor-ready
                pitch deck — with the kill assumption made explicit.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold mb-3">Product</div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#how" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#agents" className="hover:text-white transition-colors">AI agents</a></li>
                <li><a href="#kill" className="hover:text-white transition-colors">Kill assumption</a></li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold mb-3">Get started</div>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Create account</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign in</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} Startup Validator</div>
            <div className="font-mono">Built with Google ADK · Llama 3.3 · React</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
