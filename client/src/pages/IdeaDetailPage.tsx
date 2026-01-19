import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ideasApi } from '../services/api';
import html2pdf from 'html2pdf.js';
import { VersionHistoryPanel } from '../components/VersionHistoryPanel';
import { SectionEditor } from '../components/SectionEditor';

interface MarketFeasibility {
  marketSize: string;
  growthTrajectory: string;
  keyTrends: string[];
  timing: 'Now' | 'Soon' | 'Waiting';
}

interface Competitor {
  name: string;
  difference: string;
  advantage: string;
}

interface Phase1Data {
  cleanSummary?: string;
  marketFeasibility?: MarketFeasibility;
  competitiveAnalysis?: Competitor[];
  killAssumption?: string;
  killAssumptionTestGuidance?: string;
  generatedAt?: string;
  confirmedAt?: string;
}

interface PhaseStatus {
  // New format
  phase1?: 'pending' | 'generated' | 'confirmed';
  phase2?: 'locked' | 'pending' | 'generated' | 'confirmed' | 'invalidated';
  phase3?: 'locked' | 'pending' | 'generated' | 'confirmed' | 'invalidated';
  // Old format (backwards compatibility)
  phase1Confirmed?: boolean;
  phase2Confirmed?: boolean;
  phase3Confirmed?: boolean;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  phase: string;
  phaseStatus: PhaseStatus;
  phase1Data?: Phase1Data;
  version: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const phase1ContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadIdea();
    }
  }, [id]);

  const loadIdea = async () => {
    try {
      setLoading(true);
      const response = await ideasApi.getIdea(id!);
      if (response.success && response.data) {
        setIdea(response.data);
      } else {
        toast.error(response.error?.message || 'Failed to load idea');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading idea:', error);
      toast.error('Error loading idea');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePhase1 = async () => {
    if (!id) return;

    try {
      setGenerating(true);
      toast.info('Generating Phase 1 analysis...');
      const response = await ideasApi.generatePhase1(id);
      if (response.success && response.data) {
        setIdea(response.data);
        toast.success('Phase 1 analysis generated successfully!');
      } else {
        toast.error(response.error?.message || 'Failed to generate Phase 1');
      }
    } catch (error) {
      console.error('Error generating Phase 1:', error);
      toast.error('Error generating Phase 1 analysis');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmPhase1 = async () => {
    if (!id) return;

    try {
      setConfirming(true);
      const response = await ideasApi.confirmPhase1(id);
      if (response.success && response.data) {
        setIdea(response.data);
        toast.success('Phase 1 confirmed! Phase 2 is now available.');
      } else {
        toast.error(response.error?.message || 'Failed to confirm Phase 1');
      }
    } catch (error) {
      console.error('Error confirming Phase 1:', error);
      toast.error('Error confirming Phase 1');
    } finally {
      setConfirming(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!idea || !idea.phase1Data) {
      toast.error('No Phase 1 data to download');
      return;
    }

    try {
      setDownloading(true);
      toast.info('Generating PDF...');

      // Create a temporary element with styled content for PDF
      const pdfContent = document.createElement('div');
      pdfContent.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px;">
            <h1 style="color: #1E293B; margin: 0 0 10px 0;">${idea.title}</h1>
            <p style="color: #64748B; margin: 0;">Phase 1 Validation Report</p>
            <p style="color: #64748B; font-size: 12px; margin: 5px 0 0 0;">Version ${idea.version} | Generated: ${new Date(idea.phase1Data.generatedAt || '').toLocaleDateString()}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #4F46E5; font-size: 18px; margin: 0 0 10px 0;">📝 Original Idea</h2>
            <p style="color: #475569; line-height: 1.6;">${idea.description}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #4F46E5; font-size: 18px; margin: 0 0 10px 0;">✨ Clean Idea Summary</h2>
            <p style="color: #475569; line-height: 1.6;">${idea.phase1Data.cleanSummary}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #4F46E5; font-size: 18px; margin: 0 0 10px 0;">📊 Market Feasibility</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tr>
                <td style="padding: 10px; background: #F1F5F9; border-radius: 8px; width: 50%;">
                  <strong style="color: #64748B; font-size: 12px;">MARKET SIZE</strong><br/>
                  <span style="color: #1E293B; font-size: 16px;">${idea.phase1Data.marketFeasibility?.marketSize}</span>
                </td>
                <td style="padding: 10px; background: #F1F5F9; border-radius: 8px; width: 50%;">
                  <strong style="color: #64748B; font-size: 12px;">GROWTH</strong><br/>
                  <span style="color: #1E293B; font-size: 16px;">${idea.phase1Data.marketFeasibility?.growthTrajectory}</span>
                </td>
              </tr>
            </table>
            <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0;">KEY TRENDS</p>
            <p style="color: #475569;">${idea.phase1Data.marketFeasibility?.keyTrends.join(' • ')}</p>
            <p style="margin-top: 10px;"><span style="background: ${idea.phase1Data.marketFeasibility?.timing === 'Now' ? '#22C55E' : '#F59E0B'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">Timing: ${idea.phase1Data.marketFeasibility?.timing}</span></p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #4F46E5; font-size: 18px; margin: 0 0 15px 0;">🎯 Competitive Analysis</h2>
            ${idea.phase1Data.competitiveAnalysis?.map(c => `
              <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #4F46E5;">
                <h3 style="color: #1E293B; margin: 0 0 10px 0; font-size: 16px;">${c.name}</h3>
                <p style="color: #64748B; font-size: 12px; margin: 0;">HOW THEY DIFFER</p>
                <p style="color: #475569; margin: 5px 0 10px 0;">${c.difference}</p>
                <p style="color: #22C55E; font-size: 12px; margin: 0;">YOUR ADVANTAGE</p>
                <p style="color: #475569; margin: 5px 0 0 0;">${c.advantage}</p>
              </div>
            `).join('')}
          </div>

          <div style="background: linear-gradient(135deg, #EF4444, #F97316); padding: 25px; border-radius: 12px; color: white;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px;">⚠️ Kill Assumption - Critical to Validate</h2>
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">${idea.phase1Data.killAssumption}</p>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
              <p style="font-weight: bold; margin: 0 0 5px 0;">How to Test:</p>
              <p style="margin: 0; opacity: 0.9;">${idea.phase1Data.killAssumptionTestGuidance}</p>
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; color: #94A3B8; font-size: 12px;">
            <p style="margin: 0;">Generated by Startup Validator Platform</p>
            <p style="margin: 5px 0 0 0;">${new Date().toLocaleDateString()} | Phase 1 Validation Report</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `${idea.title.replace(/[^a-zA-Z0-9]/g, '_')}_Phase1_Report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(pdfContent).save();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleRefineSection = async (sectionName: string, feedback: string) => {
    if (!id) return;

    try {
      setIsRefining(true);
      toast.info(`Refining ${getSectionTitle(sectionName)}...`);
      const response = await ideasApi.refineSection(id, sectionName, feedback);
      if (response.success && response.data) {
        setIdea(response.data);
        toast.success('Section refined successfully!');
        setEditingSection(null);
      } else {
        toast.error(response.error?.message || 'Failed to refine section');
      }
    } catch (error) {
      console.error('Error refining section:', error);
      toast.error('Error refining section');
    } finally {
      setIsRefining(false);
    }
  };

  const getSectionTitle = (sectionName: string): string => {
    switch (sectionName) {
      case 'cleanSummary':
        return 'Clean Idea Summary';
      case 'marketFeasibility':
        return 'Market Feasibility';
      case 'competitiveAnalysis':
        return 'Competitive Analysis';
      case 'killAssumption':
        return 'Kill Assumption';
      default:
        return sectionName;
    }
  };

  const getSectionContent = (sectionName: string): string => {
    if (!idea?.phase1Data) return '';
    switch (sectionName) {
      case 'cleanSummary':
        return idea.phase1Data.cleanSummary || '';
      case 'marketFeasibility':
        const mf = idea.phase1Data.marketFeasibility;
        if (!mf) return '';
        return `Market Size: ${mf.marketSize}\nGrowth: ${mf.growthTrajectory}\nTiming: ${mf.timing}\nKey Trends: ${mf.keyTrends.join(', ')}`;
      case 'competitiveAnalysis':
        const ca = idea.phase1Data.competitiveAnalysis;
        if (!ca || ca.length === 0) return '';
        return ca.map(c => `${c.name}: ${c.difference} (Your advantage: ${c.advantage})`).join('\n\n');
      case 'killAssumption':
        return idea.phase1Data.killAssumption || '';
      default:
        return '';
    }
  };

  const canEditSection = (): boolean => {
    // Can only edit if Phase 1 is generated but not confirmed
    const status = getPhaseStepperStatus(1);
    return status === 'generated';
  };

  const getPhaseStepperStatus = (phase: 1 | 2 | 3): string => {
    if (!idea) return 'locked';
    const status = idea.phaseStatus;

    // Handle new format
    if (status.phase1 !== undefined) {
      if (phase === 1) return status.phase1;
      if (phase === 2) return status.phase2 || 'locked';
      return status.phase3 || 'locked';
    }

    // Handle old format (backwards compatibility)
    if (phase === 1) {
      if (status.phase1Confirmed) return 'confirmed';
      if (idea.phase1Data?.cleanSummary) return 'generated';
      return 'pending';
    } else if (phase === 2) {
      if (status.phase2Confirmed) return 'confirmed';
      if (!status.phase1Confirmed) return 'locked';
      return 'pending';
    } else {
      if (status.phase3Confirmed) return 'confirmed';
      if (!status.phase2Confirmed) return 'locked';
      return 'pending';
    }
  };

  const getTimingColor = (timing: string) => {
    switch (timing) {
      case 'Now':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Soon':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Waiting':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading idea details...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Idea not found</p>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const phase1Status = getPhaseStepperStatus(1);
  const hasPhase1Data = idea.phase1Data && idea.phase1Data.cleanSummary;

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-900 line-clamp-1">{idea.title}</h1>
                <p className="text-xs text-slate-500">Version {idea.version}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <VersionHistoryPanel
                ideaId={idea.id}
                currentVersion={idea.version}
              />
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                idea.phase === 'Phase 1' ? 'bg-amber-100 text-amber-700' :
                idea.phase === 'Phase 2' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {idea.phase}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Phase Stepper */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((phase) => {
              const status = getPhaseStepperStatus(phase as 1 | 2 | 3);
              const isActive = idea.phase === `Phase ${phase}`;
              const isCompleted = status === 'confirmed';
              const isGenerated = status === 'generated';
              const isLocked = status === 'locked';
              const isInvalidated = status === 'invalidated';

              return (
                <div key={phase} className="flex items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isInvalidated ? 'bg-orange-100' :
                    isActive ? 'bg-indigo-100' :
                    isCompleted ? 'bg-green-50' :
                    isGenerated ? 'bg-amber-50' :
                    'bg-slate-50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isInvalidated ? 'bg-orange-500 text-white' :
                      isCompleted ? 'bg-green-500 text-white' :
                      isGenerated ? 'bg-amber-500 text-white' :
                      isActive ? 'bg-indigo-500 text-white' :
                      isLocked ? 'bg-slate-300 text-slate-500' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isInvalidated ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : isLocked ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        phase
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${
                        isInvalidated ? 'text-orange-700' :
                        isActive ? 'text-indigo-700' :
                        isCompleted ? 'text-green-700' :
                        isGenerated ? 'text-amber-700' :
                        'text-slate-500'
                      }`}>
                        Phase {phase}
                      </span>
                      {isInvalidated && (
                        <span className="text-xs text-orange-600">Needs Update</span>
                      )}
                    </div>
                  </div>
                  {phase < 3 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      getPhaseStepperStatus(phase as 1 | 2 | 3) === 'confirmed' ? 'bg-green-300' :
                      getPhaseStepperStatus(phase as 1 | 2 | 3) === 'invalidated' ? 'bg-orange-300' :
                      'bg-slate-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Idea Description Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Your Idea</h2>
          <p className="text-slate-600">{idea.description}</p>
        </div>

        {/* Phase 1 Content */}
        <div className="space-y-6">
          {/* Generate Button (if Phase 1 not generated) */}
          {phase1Status === 'pending' && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Validate Your Idea?</h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Generate your Phase 1 analysis including market feasibility, competitive analysis, and your critical kill assumption.
              </p>
              <button
                onClick={handleGeneratePhase1}
                disabled={generating}
                className="btn bg-white text-indigo-600 hover:bg-slate-100 px-8 py-3 text-base font-semibold disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Phase 1 Analysis
                  </>
                )}
              </button>
            </div>
          )}

          {/* Phase 1 Generated Content */}
          {hasPhase1Data && (
            <>
              {/* Clean Idea Summary */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-semibold text-slate-900">Clean Idea Summary</h3>
                  {canEditSection() && (
                    <button
                      onClick={() => setEditingSection('cleanSummary')}
                      className="ml-auto p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit this section"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">{idea.phase1Data?.cleanSummary}</p>
              </div>

              {/* Market Feasibility */}
              {idea.phase1Data?.marketFeasibility && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📊</span>
                    <h3 className="text-lg font-semibold text-slate-900">Market Feasibility</h3>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border ${
                      getTimingColor(idea.phase1Data.marketFeasibility.timing)
                    }`}>
                      Timing: {idea.phase1Data.marketFeasibility.timing}
                    </span>
                    {canEditSection() && (
                      <button
                        onClick={() => setEditingSection('marketFeasibility')}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit this section"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1">Market Size</h4>
                      <p className="text-lg font-semibold text-slate-900">
                        {idea.phase1Data.marketFeasibility.marketSize}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1">Growth Trajectory</h4>
                      <p className="text-lg font-semibold text-slate-900">
                        {idea.phase1Data.marketFeasibility.growthTrajectory}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-slate-500 mb-3">Key Market Trends</h4>
                    <div className="flex flex-wrap gap-2">
                      {idea.phase1Data.marketFeasibility.keyTrends.map((trend, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm"
                        >
                          {trend}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Competitive Analysis */}
              {idea.phase1Data?.competitiveAnalysis && idea.phase1Data.competitiveAnalysis.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-lg font-semibold text-slate-900">Competitive Analysis</h3>
                    {canEditSection() && (
                      <button
                        onClick={() => setEditingSection('competitiveAnalysis')}
                        className="ml-auto p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit this section"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {idea.phase1Data.competitiveAnalysis.map((competitor, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-100"
                      >
                        <h4 className="font-semibold text-slate-900 mb-2">{competitor.name}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">How They Differ</p>
                            <p className="text-sm text-slate-600">{competitor.difference}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-600 uppercase mb-1">Your Advantage</p>
                            <p className="text-sm text-slate-600">{competitor.advantage}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kill Assumption - Prominently Displayed */}
              {idea.phase1Data?.killAssumption && (
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-lg font-bold">Kill Assumption</h3>
                    <span className="ml-auto px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                      Critical to Validate
                    </span>
                    {canEditSection() && (
                      <button
                        onClick={() => setEditingSection('killAssumption')}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                        title="Edit this section"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <p className="text-lg leading-relaxed mb-4">{idea.phase1Data.killAssumption}</p>

                  {idea.phase1Data.killAssumptionTestGuidance && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-sm font-semibold mb-2">How to Test:</p>
                      <p className="text-sm text-white/90">{idea.phase1Data.killAssumptionTestGuidance}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                <div className="text-sm text-slate-500">
                  {idea.phase1Data?.generatedAt && (
                    <span>Generated: {new Date(idea.phase1Data.generatedAt).toLocaleDateString()}</span>
                  )}
                  {idea.phase1Data?.confirmedAt && (
                    <span className="ml-4 text-green-600 font-medium">
                      Confirmed: {new Date(idea.phase1Data.confirmedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  {/* PDF Download Button - always visible when Phase 1 data exists */}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="btn btn-secondary"
                  >
                    {downloading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </>
                    )}
                  </button>

                  {phase1Status === 'generated' && (
                    <>
                      <button
                        onClick={handleGeneratePhase1}
                        disabled={generating}
                        className="btn btn-secondary"
                      >
                        {generating ? 'Regenerating...' : 'Regenerate'}
                      </button>
                      <button
                        onClick={handleConfirmPhase1}
                        disabled={confirming}
                        className="btn btn-primary"
                      >
                        {confirming ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm Phase 1
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {phase1Status === 'confirmed' && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Phase 1 Confirmed
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Section Editor */}
      {editingSection && (
        <SectionEditor
          isOpen={!!editingSection}
          onClose={() => setEditingSection(null)}
          sectionName={editingSection}
          sectionTitle={getSectionTitle(editingSection)}
          currentContent={getSectionContent(editingSection)}
          onRefine={(feedback) => handleRefineSection(editingSection, feedback)}
          isRefining={isRefining}
        />
      )}
    </div>
  );
}

export default IdeaDetailPage;
