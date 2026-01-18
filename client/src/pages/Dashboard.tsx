import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ideasApi } from '../services/api';
import styles from './Dashboard.module.css';

interface Idea {
  id: string;
  title: string;
  description: string;
  phase: string;
  version: number;
  archived: boolean;
  killAssumption?: string;
  createdAt: string;
  updatedAt: string;
}

export function Dashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Load ideas on component mount
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideasApi.listIdeas({ archived: 'false' });
      if (response.success && response.data) {
        setIdeas(response.data);
      } else {
        toast.error(response.error?.message || 'Failed to load ideas');
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
      toast.error('Error loading ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await ideasApi.createIdea({
        title: formData.title,
        description: formData.description,
      });

      if (response.success) {
        toast.success('Idea created successfully!');
        setFormData({ title: '', description: '' });
        setShowCreateModal(false);
        await loadIdeas();
      } else {
        toast.error(response.error?.message || 'Failed to create idea');
      }
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error('Error creating idea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Phase 1':
        return '#fbbf24'; // yellow
      case 'Phase 2':
        return '#3b82f6'; // blue
      case 'Phase 3':
        return '#a855f7'; // purple
      default:
        return '#6b7280'; // gray
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.container}>
      {/* Animated background */}
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
        <div className={styles.headerActions}>
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
            + Create New Idea
          </button>
          <a href="/profile" className={styles.profileLink}>
            My Profile
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        {/* Ideas section */}
        <div className={styles.ideasSection}>
          <div className={styles.sectionHeader}>
            <h2>My Startup Ideas</h2>
            <p>Manage and validate your business concepts</p>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading your ideas...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💡</div>
              <h3>No ideas yet</h3>
              <p>Get started by creating your first startup idea</p>
              <button
                className={styles.emptyStateButton}
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Idea
              </button>
            </div>
          ) : (
            <div className={styles.ideasGrid}>
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className={styles.ideaCard}
                  onClick={() => navigate(`/idea/${idea.id}`)}
                >
                  <div className={styles.cardHeader}>
                    <div
                      className={styles.phaseBadge}
                      style={{ backgroundColor: getPhaseColor(idea.phase) }}
                    >
                      {idea.phase}
                    </div>
                    <span className={styles.versionBadge}>v{idea.version}</span>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.ideaTitle}>{idea.title}</h3>
                    <p className={styles.ideaDescription}>
                      {idea.description.substring(0, 150)}
                      {idea.description.length > 150 ? '...' : ''}
                    </p>

                    {idea.killAssumption && (
                      <div className={styles.killAssumption}>
                        <span className={styles.killLabel}>Kill Assumption:</span>
                        <p className={styles.killText}>
                          {idea.killAssumption.substring(0, 100)}
                          {idea.killAssumption.length > 100 ? '...' : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.dateInfo}>
                      Edited {formatDate(idea.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Idea Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Startup Idea</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Idea Title</label>
                <input
                  id="title"
                  type="text"
                  maxLength={200}
                  placeholder="e.g., AI-powered customer support platform"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  disabled={isSubmitting}
                  required
                />
                <small>{formData.title.length}/200</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Idea Description</label>
                <textarea
                  id="description"
                  maxLength={5000}
                  placeholder="Describe your startup idea, the problem it solves, and your target market..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isSubmitting}
                  required
                  rows={6}
                />
                <small>{formData.description.length}/5000</small>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
