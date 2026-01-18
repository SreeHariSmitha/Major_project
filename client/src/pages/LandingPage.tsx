import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './LandingPage.module.css';

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
    {
      icon: '✨',
      title: 'Validate Ideas',
      description: 'Test your startup hypotheses with AI-powered market analysis and insights from real data.',
    },
    {
      icon: '📊',
      title: 'Track Progress',
      description: 'Monitor your validation journey with detailed metrics and progress tracking across phases.',
    },
    {
      icon: '🎯',
      title: 'Generate Pitch Deck',
      description: 'Create investor-ready pitch decks automatically based on your validated data.',
    },
    {
      icon: '🔄',
      title: 'Version Control',
      description: 'Track all iterations of your ideas with immutable version history and comparison tools.',
    },
    {
      icon: '🧠',
      title: 'AI-Powered Analysis',
      description: 'Leverage AI to generate market feasibility assessments and competitive analysis.',
    },
    {
      icon: '🚀',
      title: 'Launch Ready',
      description: 'Get your startup from idea to launch-ready with our comprehensive validation framework.',
    },
  ];

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContent}>
          <div className={styles.navBrand}>
            <span className={styles.logo}>🚀</span>
            <span className={styles.brandName}>Startup Validator</span>
          </div>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            ☰
          </button>

          <div className={`${styles.navLinks} ${isNavOpen ? styles.open : ''}`}>
            <a href="#features" className={styles.navLink} onClick={() => setIsNavOpen(false)}>
              Features
            </a>
            <a href="#mission" className={styles.navLink} onClick={() => setIsNavOpen(false)}>
              About
            </a>
            <a href="#contact" className={styles.navLink} onClick={() => setIsNavOpen(false)}>
              Contact
            </a>
            {isAuthenticated ? (
              <Link to="/dashboard" className={styles.navButton}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>
                  Sign In
                </Link>
                <Link to="/register" className={styles.navButton}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section (Story 2.1) */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
          <div className={styles.blob3}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Transform Your Startup <span className={styles.highlight}>Ideas</span> Into Reality
            </h1>
            <p className={styles.heroSubtitle}>
              Startup Validator is the complete platform for validating startup ideas, generating investor-ready pitch decks, and launching with confidence.
            </p>

            <div className={styles.heroValueProps}>
              <div className={styles.valueProp}>
                <span className={styles.checkmark}>✓</span>
                <span>Validate your market assumptions with real data</span>
              </div>
              <div className={styles.valueProp}>
                <span className={styles.checkmark}>✓</span>
                <span>Create professional pitch decks in minutes</span>
              </div>
              <div className={styles.valueProp}>
                <span className={styles.checkmark}>✓</span>
                <span>Track progress through all validation phases</span>
              </div>
            </div>

            <div className={styles.heroCTA}>
              <Link to="/register" className={styles.ctaPrimary}>
                Get Started Free
              </Link>
              <Link to="/login" className={styles.ctaSecondary}>
                Sign In
              </Link>
            </div>

            <p className={styles.heroFootnote}>
              Free to start. No credit card required. Start validating in seconds.
            </p>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.mockupCard}>
              <div className={styles.mockupHeader}>
                <div className={styles.mockupDot}></div>
                <div className={styles.mockupDot}></div>
                <div className={styles.mockupDot}></div>
              </div>
              <div className={styles.mockupBody}>
                <div className={styles.mockupLine}></div>
                <div className={styles.mockupLine} style={{ width: '80%' }}></div>
                <div className={styles.mockupLine} style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollDot}></div>
          <p>Scroll to explore</p>
        </div>
      </section>

      {/* Features Section (Story 2.2) */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>Powerful Features Built for Success</h2>
            <p>Everything you need to validate, build, and launch your startup</p>
          </div>

          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section (Story 2.3) */}
      <section id="mission" className={styles.mission}>
        <div className={styles.sectionContainer}>
          <div className={styles.missionContent}>
            <div className={styles.missionText}>
              <h2>Our Mission</h2>
              <p>
                We believe every great startup begins with a validated idea. Our mission is to empower entrepreneurs
                with the tools and insights needed to transform their vision into a thriving business. By combining AI,
                data, and proven methodologies, we make startup validation accessible, affordable, and effective.
              </p>

              <div className={styles.values}>
                <div className={styles.valueItem}>
                  <h4>🎯 Innovation</h4>
                  <p>Cutting-edge AI and analysis tools</p>
                </div>
                <div className={styles.valueItem}>
                  <h4>🤝 Support</h4>
                  <p>Complete guidance through every phase</p>
                </div>
                <div className={styles.valueItem}>
                  <h4>💎 Quality</h4>
                  <p>Professional, investor-ready outputs</p>
                </div>
              </div>
            </div>

            <div className={styles.missionVisual}>
              <div className={styles.statBox}>
                <div className={styles.statNumber}>1000+</div>
                <div className={styles.statLabel}>Ideas Validated</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNumber}>500+</div>
                <div className={styles.statLabel}>Funded Startups</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNumber}>$2B+</div>
                <div className={styles.statLabel}>Capital Raised</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionContainer}>
          <h2>Ready to Validate Your Startup Idea?</h2>
          <p>Join hundreds of entrepreneurs building the future with Startup Validator</p>
          <Link to="/register" className={styles.ctaPrimary}>
            Start for Free Today
          </Link>
        </div>
      </section>

      {/* Footer (Story 2.4) */}
      <footer id="contact" className={styles.footer}>
        <div className={styles.sectionContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h4>Startup Validator</h4>
              <p>Transform your startup ideas into investor-ready pitches with our AI-powered validation platform.</p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>Twitter</a>
                <a href="#" className={styles.socialLink}>LinkedIn</a>
                <a href="#" className={styles.socialLink}>GitHub</a>
              </div>
            </div>

            <div className={styles.footerSection}>
              <h4>Product</h4>
              <ul>
                <li><Link to="/dashboard">Features</Link></li>
                <li><Link to="/">Pricing</Link></li>
                <li><Link to="/">Documentation</Link></li>
                <li><Link to="/">API</Link></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4>Company</h4>
              <ul>
                <li><a href="#mission">About</a></li>
                <li><a href="#mission">Blog</a></li>
                <li><a href="#mission">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Compliance</a></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4>Get In Touch</h4>
              <p>Email: hello@startupvalidator.com</p>
              <p>Support: support@startupvalidator.com</p>
              <p>Status: status.startupvalidator.com</p>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>&copy; 2024 Startup Validator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
