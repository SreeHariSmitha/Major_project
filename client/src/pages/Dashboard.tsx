import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated background elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>🚀</div>
          <div className={styles.headerTitle}>
            <h1>Startup Validator</h1>
            <p>Transform your ideas into investor-ready pitches</p>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        {/* Welcome card */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeContent}>
            <h2>Welcome back, {user?.name || user?.email}! 👋</h2>
            <p>You're all set to start validating your startup ideas.</p>
          </div>
        </div>

        {/* Feature cards grid */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✨</div>
            <h3>Validate Ideas</h3>
            <p>Test your startup hypotheses against market realities and gather insights from potential customers.</p>
            <button className={styles.actionButton}>Get Started</button>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your validation journey with detailed metrics and progress tracking across all your ideas.</p>
            <button className={styles.actionButton}>View Analytics</button>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎯</div>
            <h3>Build Success</h3>
            <p>Create investor-ready pitch decks and business plans backed by validated market data.</p>
            <button className={styles.actionButton}>Create Pitch</button>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💡</div>
            <h3>Discover Insights</h3>
            <p>Get AI-powered recommendations based on your validation data and market research.</p>
            <button className={styles.actionButton}>Explore Insights</button>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤝</div>
            <h3>Connect & Collaborate</h3>
            <p>Network with other entrepreneurs and potential investors in the Startup Validator community.</p>
            <button className={styles.actionButton}>Join Community</button>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3>Scale Your Impact</h3>
            <p>Use proven methodologies to scale your startup from idea to successful launch.</p>
            <button className={styles.actionButton}>Learn More</button>
          </div>
        </div>

        {/* Quick stats */}
        <div className={styles.statsSection}>
          <h2>Your Startup Validation Stats</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>0</div>
              <div className={styles.statLabel}>Ideas Tracked</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>0</div>
              <div className={styles.statLabel}>Validations Done</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>0</div>
              <div className={styles.statLabel}>Market Insights</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>0</div>
              <div className={styles.statLabel}>Pitches Created</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2024 Startup Validator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
