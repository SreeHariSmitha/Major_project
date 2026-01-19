import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: '✨', title: 'Validate Ideas', description: 'Test your startup hypotheses with AI-powered market analysis and insights from real data.' },
    { icon: '📊', title: 'Track Progress', description: 'Monitor your validation journey with detailed metrics and progress tracking across phases.' },
    { icon: '🎯', title: 'Generate Pitch Deck', description: 'Create investor-ready pitch decks automatically based on your validated data.' },
    { icon: '🔄', title: 'Version Control', description: 'Track all iterations of your ideas with immutable version history and comparison tools.' },
    { icon: '🧠', title: 'AI-Powered Analysis', description: 'Leverage AI to generate market feasibility assessments and competitive analysis.' },
    { icon: '🚀', title: 'Launch Ready', description: 'Get your startup from idea to launch-ready with our comprehensive validation framework.' },
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className={`font-bold text-xl ${scrolled ? 'text-slate-900' : 'text-white'}`}>Startup Validator</span>
            </div>

            <button
              className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-slate-900' : 'text-white'}`}
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className={`${isNavOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-16 md:top-0 left-0 right-0 md:left-auto md:right-auto bg-white md:bg-transparent p-4 md:p-0 gap-4 md:gap-6 items-center shadow-lg md:shadow-none`}>
              <a href="#features" className={`text-sm font-medium ${scrolled || isNavOpen ? 'text-slate-700 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`} onClick={() => setIsNavOpen(false)}>Features</a>
              <a href="#mission" className={`text-sm font-medium ${scrolled || isNavOpen ? 'text-slate-700 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`} onClick={() => setIsNavOpen(false)}>About</a>
              <a href="#contact" className={`text-sm font-medium ${scrolled || isNavOpen ? 'text-slate-700 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`} onClick={() => setIsNavOpen(false)}>Contact</a>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className={`text-sm font-medium ${scrolled || isNavOpen ? 'text-slate-700 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}>Sign In</Link>
                  <Link to="/register" className="btn btn-primary">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
          <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl -bottom-40 -right-40 animate-pulse delay-1000" />
          <div className="absolute w-64 h-64 bg-white/5 rounded-full blur-2xl top-1/3 right-1/4 animate-pulse delay-500" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero text */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Transform Your Startup <span className="text-yellow-300">Ideas</span> Into Reality
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto lg:mx-0">
                Startup Validator is the complete platform for validating startup ideas, generating investor-ready pitch decks, and launching with confidence.
              </p>

              <div className="space-y-3 mb-8">
                {['Validate your market assumptions with real data', 'Create professional pitch decks in minutes', 'Track progress through all validation phases'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/90 justify-center lg:justify-start">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Link to="/register" className="btn btn-primary px-8 py-3 text-base bg-white text-indigo-600 hover:bg-slate-100">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline px-8 py-3 text-base border-white text-white hover:bg-white hover:text-indigo-600">
                  Sign In
                </Link>
              </div>

              <p className="text-sm text-white/60">Free to start. No credit card required.</p>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-white/20 rounded w-full" />
                  <div className="h-4 bg-white/20 rounded w-4/5" />
                  <div className="h-4 bg-white/20 rounded w-3/5" />
                  <div className="h-20 bg-white/10 rounded mt-4" />
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="h-16 bg-white/10 rounded" />
                    <div className="h-16 bg-white/10 rounded" />
                    <div className="h-16 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-center animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2 mx-auto mb-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
          <p className="text-sm">Scroll to explore</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Powerful Features Built for Success</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to validate, build, and launch your startup</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-8">
                We believe every great startup begins with a validated idea. Our mission is to empower entrepreneurs
                with the tools and insights needed to transform their vision into a thriving business.
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { icon: '🎯', title: 'Innovation', desc: 'Cutting-edge AI tools' },
                  { icon: '🤝', title: 'Support', desc: 'Complete guidance' },
                  { icon: '💎', title: 'Quality', desc: 'Investor-ready outputs' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-slate-50">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { num: '1000+', label: 'Ideas Validated' },
                { num: '500+', label: 'Funded Startups' },
                { num: '$2B+', label: 'Capital Raised' },
              ].map((stat, i) => (
                <div key={i} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-center text-white">
                  <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.num}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Validate Your Startup Idea?</h2>
          <p className="text-lg text-white/80 mb-8">Join hundreds of entrepreneurs building the future</p>
          <Link to="/register" className="btn bg-white text-indigo-600 hover:bg-slate-100 px-8 py-3 text-base font-semibold">
            Start for Free Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚀</span>
                <span className="font-bold text-xl">Startup Validator</span>
              </div>
              <p className="text-slate-400 mb-4">Transform your startup ideas into investor-ready pitches with our AI-powered validation platform.</p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <a key={social} href="#" className="text-slate-400 hover:text-white transition-colors">{social}</a>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Documentation', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 Startup Validator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
