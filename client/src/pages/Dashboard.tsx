import { useState, useEffect, useCallback, useMemo } from 'react';
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
  phase3Data?: {
    confirmedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

type FilterStatus = 'all' | 'in_progress' | 'completed' | 'archived';

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Highlight component for search results
function HighlightedText({ text, searchQuery }: { text: string; searchQuery: string }) {
  if (!searchQuery.trim()) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function Dashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load ideas based on filter
  const loadIdeas = useCallback(async (filter: FilterStatus) => {
    try {
      setLoading(true);
      let response;

      if (filter === 'archived') {
        response = await ideasApi.listIdeas({ archived: 'true' });
      } else if (filter === 'in_progress') {
        // Get non-archived ideas that are not completed
        response = await ideasApi.listIdeas({ archived: 'false' });
        if (response.success && response.data) {
          response.data = response.data.filter((idea: Idea) =>
            !idea.phase3Data?.confirmedAt
          );
        }
      } else if (filter === 'completed') {
        // Get ideas that have completed Phase 3
        response = await ideasApi.listIdeas({ archived: 'false' });
        if (response.success && response.data) {
          response.data = response.data.filter((idea: Idea) =>
            idea.phase3Data?.confirmedAt
          );
        }
      } else {
        // 'all' - show all non-archived ideas
        response = await ideasApi.listIdeas({ archived: 'false' });
      }

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
  }, []);

  // Search ideas
  const searchIdeas = useCallback(async (query: string, filter: FilterStatus) => {
    if (!query.trim()) {
      loadIdeas(filter);
      return;
    }

    try {
      setIsSearching(true);
      const params: { q: string; archived?: string; status?: string } = { q: query };

      if (filter === 'archived') {
        params.archived = 'true';
      } else if (filter === 'in_progress') {
        params.status = 'in_progress';
        params.archived = 'false';
      } else if (filter === 'completed') {
        params.status = 'completed';
        params.archived = 'false';
      } else {
        params.archived = 'false';
      }

      const response = await ideasApi.searchIdeas(params);

      if (response.success && response.data) {
        setIdeas(response.data);
      } else {
        toast.error(response.error?.message || 'Failed to search ideas');
      }
    } catch (error) {
      console.error('Error searching ideas:', error);
      toast.error('Error searching ideas');
    } finally {
      setIsSearching(false);
    }
  }, [loadIdeas]);

  // Effect to load/search ideas when filter or search changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchIdeas(debouncedSearch, activeFilter);
    } else {
      loadIdeas(activeFilter);
    }
  }, [debouncedSearch, activeFilter, loadIdeas, searchIdeas]);

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
        loadIdeas(activeFilter);
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || activeFilter !== 'all';

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

  const getStatusBadge = (idea: Idea) => {
    if (idea.archived) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">Archived</span>;
    }
    if (idea.phase3Data?.confirmedAt) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Completed</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">In Progress</span>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filterButtons: { key: FilterStatus; label: string; icon: string }[] = [
    { key: 'all', label: 'All Ideas', icon: '📋' },
    { key: 'in_progress', label: 'In Progress', icon: '🔄' },
    { key: 'completed', label: 'Completed', icon: '✅' },
    { key: 'archived', label: 'Archived', icon: '📦' },
  ];

  // Count ideas for each filter (only when not searching)
  const filterCounts = useMemo(() => {
    if (searchQuery.trim()) return null;
    return {
      all: ideas.length,
      in_progress: ideas.filter(i => !i.archived && !i.phase3Data?.confirmedAt).length,
      completed: ideas.filter(i => !i.archived && i.phase3Data?.confirmedAt).length,
      archived: 0, // We'd need a separate call for this
    };
  }, [ideas, searchQuery]);

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">My Startup Ideas</h2>
          <p className="text-slate-500">Manage and validate your business concepts</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              placeholder="Search ideas by title, description, or content..."
              className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600 mr-2">Filter:</span>
            {filterButtons.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  activeFilter === filter.key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                {filterCounts && activeFilter !== filter.key && filter.key === 'all' && (
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full text-xs">
                    {filterCounts.all}
                  </span>
                )}
              </button>
            ))}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-2 ml-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            )}
          </div>

          {/* Active filter indicator */}
          {(searchQuery.trim() || activeFilter !== 'all') && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Showing:</span>
              {searchQuery.trim() && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  Search: "{searchQuery}"
                </span>
              )}
              {activeFilter !== 'all' && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full capitalize">
                  {activeFilter.replace('_', ' ')}
                </span>
              )}
              <span className="text-slate-400">• {ideas.length} result{ideas.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500">Loading your ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            {searchQuery.trim() || activeFilter !== 'all' ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No matching ideas found</h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery.trim()
                    ? `No ideas match "${searchQuery}"`
                    : `No ${activeFilter.replace('_', ' ')} ideas`}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn btn-secondary"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💡</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No ideas yet</h3>
                <p className="text-slate-500 mb-6">Get started by creating your first startup idea</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  Create Your First Idea
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => navigate(`/idea/${idea.id}`)}
                className={`bg-white rounded-xl border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group ${
                  idea.archived
                    ? 'border-slate-300 bg-slate-50 opacity-75'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPhaseStyles(idea.phase)}`}>
                      {idea.phase}
                    </span>
                    {getStatusBadge(idea)}
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    v{idea.version}
                  </span>
                </div>

                {/* Card content */}
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  <HighlightedText text={idea.title} searchQuery={debouncedSearch} />
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                  <HighlightedText text={idea.description} searchQuery={debouncedSearch} />
                </p>

                {idea.killAssumption && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Kill Assumption</p>
                    <p className="text-xs text-amber-600 line-clamp-2">
                      <HighlightedText text={idea.killAssumption} searchQuery={debouncedSearch} />
                    </p>
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
