import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ideasApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

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
  const { logout } = useAuth();

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getPhaseStyles = (phase: string) => {
    switch (phase) {
      case 'Phase 1':
        return 'bg-amber-100 text-amber-700';
      case 'Phase 2':
        return 'bg-blue-100 text-blue-700';
      case 'Phase 3':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Startup Validator</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Transform ideas into success</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Idea</span>
              </button>

              <Link
                to="/profile"
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Profile"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">My Startup Ideas</h2>
          <p className="text-slate-500">Manage and validate your business concepts</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500">Loading your ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No ideas yet</h3>
            <p className="text-slate-500 mb-6">Get started by creating your first startup idea</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Your First Idea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => navigate(`/idea/${idea.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPhaseStyles(idea.phase)}`}>
                    {idea.phase}
                  </span>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    v{idea.version}
                  </span>
                </div>

                {/* Card content */}
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {idea.title}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                  {idea.description}
                </p>

                {idea.killAssumption && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Kill Assumption</p>
                    <p className="text-xs text-amber-600 line-clamp-2">{idea.killAssumption}</p>
                  </div>
                )}

                {/* Card footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    Edited {formatDate(idea.updatedAt)}
                  </span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Idea Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Create New Startup Idea</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreateIdea} className="p-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                  Idea Title
                </label>
                <input
                  id="title"
                  type="text"
                  maxLength={200}
                  placeholder="e.g., AI-powered customer support platform"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-slate-400 text-right">{formData.title.length}/200</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                  Idea Description
                </label>
                <textarea
                  id="description"
                  maxLength={5000}
                  rows={5}
                  placeholder="Describe your startup idea, the problem it solves, and your target market..."
                  className="input resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-slate-400 text-right">{formData.description.length}/5000</p>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Idea'
                  )}
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
