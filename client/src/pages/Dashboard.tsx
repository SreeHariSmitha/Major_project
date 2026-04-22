import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ideasApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type PhaseKey = 'Phase 1' | 'Phase 2' | 'Phase 3';

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

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function HighlightedText({ text, searchQuery }: { text: string; searchQuery: string }) {
  if (!searchQuery.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <mark key={index} className="bg-yellow-100 text-yellow-900 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// ============== STAT CARD (hero ribbon) ==============
function StatCard({
  label,
  value,
  tint,
  icon,
}: {
  label: string;
  value: number;
  tint: 'indigo' | 'amber' | 'emerald' | 'fuchsia';
  icon: React.ReactNode;
}) {
  const tintClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
  }[tint];

  return (
    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{label}</span>
        <div className={`w-7 h-7 rounded-md border flex items-center justify-center ${tintClasses}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
    </div>
  );
}

// ============== IDEA CARD ==============
interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    description: string;
    phase: string;
    version: number;
    archived: boolean;
    killAssumption?: string;
    updatedAt: string;
  };
  onClick: () => void;
  searchQuery: string;
  phaseStyles: string;
  statusBadge: React.ReactNode;
  formattedDate: string;
  currentStep: number;
}

function IdeaCard({
  idea,
  onClick,
  searchQuery,
  phaseStyles,
  statusBadge,
  formattedDate,
  currentStep,
}: IdeaCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group text-left bg-white rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50 min-h-[250px] flex flex-col ${
        idea.archived
          ? 'border-slate-200 bg-slate-50/50 opacity-70'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${phaseStyles}`}>
          {idea.phase}
        </span>
        <div className="flex items-center gap-2">
          {statusBadge}
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
            v{idea.version}
          </span>
        </div>
      </div>

      {/* Phase progress mini */}
      <div className="flex items-center gap-1.5 mb-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex-1 flex items-center gap-1.5">
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${
                step <= currentStep
                  ? step === 1
                    ? 'bg-indigo-500'
                    : step === 2
                    ? 'bg-violet-500'
                    : 'bg-fuchsia-500'
                  : 'bg-slate-100'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Title + description */}
      <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
        <HighlightedText text={idea.title} searchQuery={searchQuery} />
      </h3>
      <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
        <HighlightedText text={idea.description} searchQuery={searchQuery} />
      </p>

      {/* Kill assumption */}
      {idea.killAssumption && (
        <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-3 mb-4 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3 h-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Kill assumption</p>
          </div>
          <p className="text-xs text-amber-900/80 line-clamp-2 leading-relaxed">
            <HighlightedText text={idea.killAssumption} searchQuery={searchQuery} />
          </p>
        </div>
      )}

      {/* Card footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formattedDate}
        </span>
        <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-600 transition-colors inline-flex items-center gap-1">
          Open
          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
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
  const { logout, user } = useAuth();

  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadIdeas = useCallback(async (filter: FilterStatus) => {
    try {
      setLoading(true);
      let response;

      if (filter === 'archived') {
        response = await ideasApi.listIdeas({ archived: 'true' });
      } else if (filter === 'in_progress') {
        response = await ideasApi.listIdeas({ archived: 'false' });
        if (response.success && response.data) {
          response.data = response.data.filter((idea: Idea) => !idea.phase3Data?.confirmedAt);
        }
      } else if (filter === 'completed') {
        response = await ideasApi.listIdeas({ archived: 'false' });
        if (response.success && response.data) {
          response.data = response.data.filter((idea: Idea) => idea.phase3Data?.confirmedAt);
        }
      } else {
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
        toast.success('Idea created');
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
        return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      case 'Phase 2':
        return 'bg-violet-50 text-violet-700 border border-violet-100';
      case 'Phase 3':
        return 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  const getStatusBadge = (idea: Idea) => {
    if (idea.archived) {
      return <span className="text-xs font-medium text-slate-500">Archived</span>;
    }
    if (idea.phase3Data?.confirmedAt) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        In progress
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'archived', label: 'Archived' },
  ];

  const filterCounts = useMemo(() => {
    if (searchQuery.trim()) return null;
    return {
      all: ideas.length,
      in_progress: ideas.filter(i => !i.archived && !i.phase3Data?.confirmedAt).length,
      completed: ideas.filter(i => !i.archived && i.phase3Data?.confirmedAt).length,
      archived: 0,
    };
  }, [ideas, searchQuery]);

  const phaseCounts = useMemo(() => {
    const counts: Record<PhaseKey, number> = { 'Phase 1': 0, 'Phase 2': 0, 'Phase 3': 0 };
    ideas.forEach(i => {
      if (i.phase in counts) counts[i.phase as PhaseKey]++;
    });
    return counts;
  }, [ideas]);

  const totalIdeas = ideas.length;
  const completedCount = filterCounts?.completed ?? 0;
  const inProgressCount = filterCounts?.in_progress ?? 0;

  const userName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const phaseStep = (phase: string): number => {
    if (phase === 'Phase 3') return 3;
    if (phase === 'Phase 2') return 2;
    return 1;
  };

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* =============== HEADER =============== */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="font-bold text-[17px] tracking-tight text-slate-900">
                Startup Validator
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <Link
                to="/profile"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Profile"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =============== HERO BANNER =============== */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-b border-white/5">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 60% 80% at 50% 0%, black 30%, transparent 80%)',
          }}
        />
        <div className="absolute -top-20 left-1/4 w-[500px] h-[300px] bg-indigo-500/25 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -top-10 right-10 w-[400px] h-[300px] bg-violet-500/20 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-10 py-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-medium text-indigo-300 mb-2 tracking-wider uppercase">
                Workspace
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2 text-white">
                Welcome back, {userName}.
              </h1>
              <p className="text-slate-400 text-sm max-w-xl">
                {totalIdeas === 0
                  ? 'Your workspace is empty. Drop an idea and watch the pipeline go to work.'
                  : `You have ${totalIdeas} ${totalIdeas === 1 ? 'idea' : 'ideas'} in progress. Pick up where you left off or kick off a new one.`}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-white/10 w-fit"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New idea
            </button>
          </div>

          {/* Inline stats ribbon */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Total ideas"
              value={totalIdeas}
              tint="indigo"
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              }
            />
            <StatCard
              label="In progress"
              value={inProgressCount}
              tint="amber"
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />
            <StatCard
              label="Completed"
              value={completedCount}
              tint="emerald"
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            />
            <StatCard
              label="At Phase 3"
              value={phaseCounts['Phase 3']}
              tint="fuchsia"
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* =============== MAIN =============== */}
      <main className="w-full px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* ==== LEFT COLUMN ==== */}
          <div>
            {/* Search + filter bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Search ideas…"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                {filterButtons.map((filter) => {
                  const isActive = activeFilter === filter.key;
                  const count = filterCounts ? filterCounts[filter.key] : null;
                  return (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all inline-flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {filter.label}
                      {count !== null && filter.key !== 'archived' && count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-700'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-3" />
                <p className="text-sm text-slate-500">Loading your ideas…</p>
              </div>
            ) : ideas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                {searchQuery.trim() || activeFilter !== 'all' ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">No matches</h3>
                    <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">
                      {searchQuery.trim()
                        ? `No ideas match "${searchQuery}"`
                        : `No ${activeFilter.replace('_', ' ')} ideas yet.`}
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Clear filters
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">No ideas yet</h3>
                    <p className="text-sm text-slate-500 mb-5 text-center max-w-sm">
                      Get started by creating your first startup idea.
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Create your first idea
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {ideas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onClick={() => navigate(`/idea/${idea.id}`)}
                    searchQuery={debouncedSearch}
                    phaseStyles={getPhaseStyles(idea.phase)}
                    statusBadge={getStatusBadge(idea)}
                    formattedDate={formatDate(idea.updatedAt)}
                    currentStep={phaseStep(idea.phase)}
                  />
                ))}
                {/* Inline "create new" tile to fill grid */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="group text-left bg-white rounded-xl border-2 border-dashed border-slate-200 p-5 min-h-[250px] flex flex-col items-center justify-center gap-2 hover:border-slate-400 hover:bg-slate-50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-slate-900 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">New idea</div>
                  <div className="text-xs text-slate-500 text-center max-w-[200px]">
                    Start a new validation pipeline
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* ==== RIGHT SIDEBAR ==== */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {/* Pipeline status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Pipeline status</h3>
                <span className="text-[10px] font-mono text-slate-400">LIVE</span>
              </div>
              <div className="space-y-3">
                {([
                  { label: 'Phase 1 · Validation', key: 'Phase 1', dot: 'bg-indigo-500', bar: 'bg-indigo-500' },
                  { label: 'Phase 2 · Business Model', key: 'Phase 2', dot: 'bg-violet-500', bar: 'bg-violet-500' },
                  { label: 'Phase 3 · Pitch Deck', key: 'Phase 3', dot: 'bg-fuchsia-500', bar: 'bg-fuchsia-500' },
                ] as const).map((p) => {
                  const count = phaseCounts[p.key];
                  const pct = totalIdeas === 0 ? 0 : Math.round((count / totalIdeas) * 100);
                  return (
                    <div key={p.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                          <span className="text-xs text-slate-700">{p.label}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">{count}</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${p.bar} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How it works tip */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-white/5 p-5 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] font-mono text-indigo-300 mb-3">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  6 AI agents · Groq
                </div>
                <h3 className="text-sm font-semibold mb-2 text-white">How the pipeline works</h3>
                <ol className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="font-mono text-indigo-400">01</span>
                    <span>Create an idea — describe the problem and target user.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-violet-400">02</span>
                    <span>Run Phase 1 to get market feasibility + kill assumption.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-mono text-fuchsia-400">03</span>
                    <span>Confirm each phase to unlock the next. End with a pitch deck.</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Quick add</div>
                  <div className="text-sm font-semibold text-slate-900">New idea</div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  aria-label="Create new idea"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* =============== CREATE MODAL =============== */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">New idea</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Describe your startup — the agents will do the rest.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                  Idea title
                </label>
                <input
                  id="title"
                  type="text"
                  maxLength={200}
                  placeholder="e.g. AI-powered invoicing for freelance designers"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
                <p className="text-[11px] text-slate-400 text-right">{formData.title.length}/200</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="description"
                  maxLength={5000}
                  rows={5}
                  placeholder="The problem, the target user, the proposed solution. Be specific — vague inputs produce vague analysis."
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
                <p className="text-[11px] text-slate-400 text-right">{formData.description.length}/5000</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      Create idea
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
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
