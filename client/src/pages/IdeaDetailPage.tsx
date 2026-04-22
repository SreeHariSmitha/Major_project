import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ideasApi } from '../services/api';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { VersionHistoryPanel } from '../components/VersionHistoryPanel';
import { SectionEditor } from '../components/SectionEditor';
import { ChatPanel } from '../components/ChatPanel';

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

interface BusinessModel {
  customerSegments: string;
  valueProposition: string;
  revenueStreams: string;
  costStructure: string;
  keyPartnerships: string;
  keyResources: string;
}

interface Strategy {
  customerAcquisition: string;
  pricingStrategy: string;
  growthStrategy: string;
  keyMilestones: string[];
}

interface Risk {
  name: string;
  description: string;
  implications: string;
}

interface Phase2Data {
  businessModel?: BusinessModel;
  strategy?: Strategy;
  structuralRisks?: Risk[];
  operationalRisks?: Risk[];
  generatedAt?: string;
  confirmedAt?: string;
}

interface PitchDeckSlide {
  slideNumber: number;
  title: string;
  content: string;
  speakerNotes?: string;
}

interface ChangelogEntry {
  section: string;
  changeType: 'added' | 'modified' | 'removed';
  description: string;
}

interface Phase3Data {
  pitchDeck?: {
    titleSlide: PitchDeckSlide;
    problemSlide: PitchDeckSlide;
    solutionSlide: PitchDeckSlide;
    marketOpportunitySlide: PitchDeckSlide;
    businessModelSlide: PitchDeckSlide;
    tractionSlide: PitchDeckSlide;
    competitionSlide: PitchDeckSlide;
    teamSlide: PitchDeckSlide;
    financialsSlide: PitchDeckSlide;
    askSlide: PitchDeckSlide;
  };
  changelog?: ChangelogEntry[];
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
  phase2Data?: Phase2Data;
  phase3Data?: Phase3Data;
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
  const [downloadingPhase2, setDownloadingPhase2] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [generatingPhase2, setGeneratingPhase2] = useState(false);
  const [confirmingPhase2, setConfirmingPhase2] = useState(false);
  const [generatingPhase3, setGeneratingPhase3] = useState(false);
  const [confirmingPhase3, setConfirmingPhase3] = useState(false);
  const [downloadingPhase3, setDownloadingPhase3] = useState(false);
  const [viewedVersion, setViewedVersion] = useState<any>(null);
  const [regenPhase, setRegenPhase] = useState<null | 'phase1' | 'phase2' | 'phase3'>(null);
  const [regenFeedback, setRegenFeedback] = useState('');
  const [regenBusy, setRegenBusy] = useState(false);

  const displayIdea: Idea = (viewedVersion && idea) ? {
    ...idea,
    title: viewedVersion.title ?? idea.title,
    description: viewedVersion.description ?? idea.description,
    phase: viewedVersion.phase ?? idea.phase,
    phaseStatus: viewedVersion.phaseStatus ?? idea.phaseStatus,
    phase1Data: viewedVersion.phase1Data,
    phase2Data: viewedVersion.phase2Data,
    phase3Data: viewedVersion.phase3Data,
    version: viewedVersion.versionNumber,
    updatedAt: viewedVersion.createdAt,
  } : (idea as Idea);

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

  const requestRegen = (phase: 'phase1' | 'phase2' | 'phase3') => {
    if (viewedVersion) { toast.error('Viewing historical version. Exit read-only first.'); return; }
    setRegenFeedback('');
    setRegenPhase(phase);
  };

  const runFullPhaseRegen = async (phase: 'phase1' | 'phase2' | 'phase3') => {
    if (phase === 'phase1') await handleGeneratePhase1();
    else if (phase === 'phase2') await handleGeneratePhase2();
    else await handleGeneratePhase3();
  };

  const confirmRegen = async () => {
    if (!id || !regenPhase) return;
    const feedback = regenFeedback.trim();
    setRegenBusy(true);
    try {
      if (!feedback) {
        // No feedback → just run the full phase pipeline (legacy behavior)
        await runFullPhaseRegen(regenPhase);
        setRegenPhase(null);
        return;
      }
      // Route feedback through chat classifier. If it maps to a single
      // section, apply that targeted regen (cheap). Otherwise fall back to
      // full phase regen so the user's feedback still gets honoured.
      const chatResp = await ideasApi.sendChatMessage(id, feedback);
      const assistant = chatResp?.data?.assistant;
      const idx = chatResp?.data?.messageIndex;
      if (chatResp?.success && assistant?.proposal?.section && typeof idx === 'number') {
        const applyResp = await ideasApi.applyChatProposal(id, idx, feedback);
        if (applyResp?.success) {
          await loadIdea();
          toast.success(`Regenerated ${applyResp.data.section}`);
        } else {
          toast.error(applyResp?.error?.message || 'Apply failed');
        }
      } else {
        toast.info('Running full phase regeneration with your feedback in mind…');
        await runFullPhaseRegen(regenPhase);
      }
      setRegenPhase(null);
    } catch (e: any) {
      toast.error(e?.message || 'Regeneration failed');
    } finally {
      setRegenBusy(false);
    }
  };

  const handleGeneratePhase1 = async () => {
    if (!id) return;
    if (viewedVersion) { toast.error('You are viewing a historical version. Exit read-only mode first.'); return; }

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
    if (viewedVersion) { toast.error('You are viewing a historical version. Exit read-only mode first.'); return; }

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

  const handleGeneratePhase2 = async () => {
    if (!id) return;
    if (viewedVersion) { toast.error('You are viewing a historical version. Exit read-only mode first.'); return; }

    try {
      setGeneratingPhase2(true);
      toast.info('Generating Phase 2 business model analysis...');
      const response = await ideasApi.generatePhase2(id);
      if (response.success && response.data) {
        setIdea(response.data);
        toast.success('Phase 2 business model generated successfully!');
      } else {
        toast.error(response.error?.message || 'Failed to generate Phase 2');
      }
    } catch (error) {
      console.error('Error generating Phase 2:', error);
      toast.error('Error generating Phase 2 analysis');
    } finally {
      setGeneratingPhase2(false);
    }
  };

  const handleConfirmPhase2 = async () => {
    if (!id) return;
    if (viewedVersion) { toast.error('You are viewing a historical version. Exit read-only mode first.'); return; }

    try {
      setConfirmingPhase2(true);
      const response = await ideasApi.confirmPhase2(id);
      if (response.success && response.data) {
        setIdea(response.data);
        toast.success('Phase 2 confirmed! Phase 3 is now available.');
      } else {
        toast.error(response.error?.message || 'Failed to confirm Phase 2');
      }
    } catch (error) {
      console.error('Error confirming Phase 2:', error);
      toast.error('Error confirming Phase 2');
    } finally {
      setConfirmingPhase2(false);
    }
  };

  const handleGeneratePhase3 = async () => {
    if (!id) return;
    if (viewedVersion) { toast.error('You are viewing a historical version. Exit read-only mode first.'); return; }

    try {
      setGeneratingPhase3(true);
      toast.info('Generating Phase 3 pitch deck...');
      const response = await ideasApi.generatePhase3(id);
      if (response.success && response.data) {
        setIdea(response.data);
        toast.success('Phase 3 pitch deck generated successfully!');
      } else {
        toast.error(response.error?.message || 'Failed to generate Phase 3');
      }
    } catch (error) {
      console.error('Error generating Phase 3:', error);
      toast.error('Error generating Phase 3 pitch deck');
    } finally {
      setGeneratingPhase3(false);
    }
  };

  const handleConfirmPhase3 = async () => {
    if (!id) return;
    if (viewedVersion) { toast.error('You are viewing a historical version. Exit read-only mode first.'); return; }

    try {
      setConfirmingPhase3(true);
      const response = await ideasApi.confirmPhase3(id);
      if (response.success && response.data) {
        setIdea(response.data);
        toast.success('Phase 3 confirmed! Your startup idea validation is complete!');
      } else {
        toast.error(response.error?.message || 'Failed to confirm Phase 3');
      }
    } catch (error) {
      console.error('Error confirming Phase 3:', error);
      toast.error('Error confirming Phase 3');
    } finally {
      setConfirmingPhase3(false);
    }
  };

  const handleDownloadPhase3PDF = async () => {
    if (!idea || !displayIdea.phase3Data?.pitchDeck) {
      toast.error('No Phase 3 data to download');
      return;
    }

    try {
      setDownloadingPhase3(true);
      toast.info('Generating Pitch Deck PDF...');

      const deck = displayIdea.phase3Data.pitchDeck;
      const slides = [
        deck.titleSlide,
        deck.problemSlide,
        deck.solutionSlide,
        deck.marketOpportunitySlide,
        deck.businessModelSlide,
        deck.tractionSlide,
        deck.competitionSlide,
        deck.teamSlide,
        deck.financialsSlide,
        deck.askSlide,
      ];

      const slideLabels = ['TITLE', 'PROBLEM', 'SOLUTION', 'MARKET', 'BUSINESS MODEL', 'TRACTION', 'COMPETITION', 'TEAM', 'FINANCIALS', 'ASK'];
      const accents = ['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6', '#3B82F6', '#F43F5E'];

      const renderCover = () => `
        <div style="width: 1122px; height: 793px; background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #4C1D95 100%); color: white; padding: 70px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%);"></div>
          <div style="position: absolute; bottom: -120px; left: -120px; width: 450px; height: 450px; background: radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%);"></div>
          <div style="position: relative;">
            <div style="display: inline-block; padding: 6px 14px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 999px; font-size: 12px; letter-spacing: 2px; font-weight: 600; color: #ffffff;">INVESTOR PITCH DECK</div>
          </div>
          <div style="position: relative;">
            <h1 style="font-size: 72px; font-weight: 800; margin: 0 0 20px 0; letter-spacing: -2px; line-height: 1; color: #ffffff;">${displayIdea.title}</h1>
            <p style="font-size: 22px; color: #C7D2FE; margin: 0; max-width: 800px; line-height: 1.5;">${(slides[0].content || '').split('\n')[0] || ''}</p>
          </div>
          <div style="position: relative; display: flex; justify-content: space-between; align-items: flex-end; color: #94A3B8; font-size: 13px;">
            <div>Generated ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>Startup Validator · 10 slides</div>
          </div>
        </div>
      `;

      const renderSlide = (slide: any, i: number) => {
        const accent = accents[i] || '#6366F1';
        const label = slideLabels[i] || 'SLIDE';
        const bullets = (slide.content || '').split('\n').filter((l: string) => l.trim());
        return `
          <div style="width: 1122px; height: 793px; background: white; padding: 0; box-sizing: border-box; display: flex; flex-direction: column; font-family: -apple-system, 'Segoe UI', Arial, sans-serif; position: relative; overflow: hidden;">
            <div aria-hidden="true" style="position: absolute; right: -60px; bottom: -80px; font-size: 420px; font-weight: 900; color: ${accent}; opacity: 0.06; line-height: 1; letter-spacing: -20px; pointer-events: none; user-select: none;">${String(slide.slideNumber || i + 1).padStart(2, '0')}</div>
            <div aria-hidden="true" style="position: absolute; top: -120px; left: -120px; width: 380px; height: 380px; border-radius: 50%; background: ${accent}; opacity: 0.05; pointer-events: none;"></div>
            <div style="height: 6px; background: ${accent}; position: relative; z-index: 1;"></div>
            <div style="padding: 50px 60px 30px 60px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 44px; height: 44px; border-radius: 10px; background: ${accent}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">${slide.slideNumber || i + 1}</div>
                <div>
                  <div style="font-size: 11px; letter-spacing: 2px; color: ${accent}; font-weight: 700;">${label}</div>
                  <div style="font-size: 26px; font-weight: 700; color: #0F172A; margin-top: 2px;">${slide.title}</div>
                </div>
              </div>
              <div style="color: #94A3B8; font-size: 12px; font-weight: 500;">${displayIdea.title} · Slide ${slide.slideNumber || i + 1}/10</div>
            </div>
            <div style="flex: 1; padding: 30px 80px; display: flex; flex-direction: column; justify-content: center;">
              <div style="color: #1E293B; font-size: 24px; line-height: 1.65;">
                ${bullets.length > 1
                  ? `<ul style="margin: 0; padding: 0; list-style: none;">${bullets.map((b: string) => `<li style="padding: 18px 0 18px 36px; position: relative;"><span style="position: absolute; left: 0; top: 32px; width: 12px; height: 12px; border-radius: 50%; background: ${accent};"></span>${b.replace(/^[-•*]\s*/, '')}</li>`).join('')}</ul>`
                  : `<p style="margin: 0; font-size: 26px; line-height: 1.6;">${slide.content || ''}</p>`}
              </div>
            </div>
            ${slide.speakerNotes ? `
              <div style="margin: 0 60px 40px 60px; padding: 18px 22px; background: #0F172A; border-radius: 10px; display: flex; gap: 14px; align-items: flex-start;">
                <div style="font-size: 10px; letter-spacing: 1.5px; color: ${accent}; font-weight: 700; flex-shrink: 0; padding-top: 2px;">NOTES</div>
                <div style="color: #CBD5E1; font-size: 13px; line-height: 1.6;">${slide.speakerNotes}</div>
              </div>
            ` : '<div style="height: 40px;"></div>'}
          </div>
        `;
      };

      // Render each slide to its own canvas and its own PDF page — deterministic pagination.
      // Slide dims in px match A4 landscape at 96dpi (297mm × 210mm ≈ 1122px × 793px).
      const SLIDE_W_PX = 1122;
      const SLIDE_H_PX = 793;
      const PAGE_W_MM = 297;
      const PAGE_H_MM = 210;

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape', compress: true });

      // Offscreen host to mount each slide in turn
      const host = document.createElement('div');
      host.style.cssText = `position: fixed; left: -99999px; top: 0; width: ${SLIDE_W_PX}px; height: ${SLIDE_H_PX}px; margin: 0; padding: 0; background: white;`;
      document.body.appendChild(host);

      const pages: string[] = [renderCover(), ...slides.map((s, i) => renderSlide(s, i))];

      try {
        for (let i = 0; i < pages.length; i++) {
          host.innerHTML = pages[i];
          const slideEl = host.firstElementChild as HTMLElement;
          slideEl.style.width = `${SLIDE_W_PX}px`;
          slideEl.style.height = `${SLIDE_H_PX}px`;
          slideEl.style.margin = '0';

          const canvas = await html2canvas(slideEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            width: SLIDE_W_PX,
            height: SLIDE_H_PX,
            windowWidth: SLIDE_W_PX,
            windowHeight: SLIDE_H_PX,
            scrollX: 0,
            scrollY: 0,
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) pdf.addPage('a4', 'landscape');
          pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_W_MM, PAGE_H_MM, undefined, 'FAST');
        }
        pdf.save(`${displayIdea.title.replace(/[^a-zA-Z0-9]/g, '_')}_Pitch_Deck.pdf`);
        toast.success('Pitch Deck PDF downloaded successfully!');
      } finally {
        document.body.removeChild(host);
      }
    } catch (error) {
      console.error('Error generating Phase 3 PDF:', error);
      toast.error('Failed to generate Pitch Deck PDF');
    } finally {
      setDownloadingPhase3(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!idea || !displayIdea.phase1Data) {
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
            <h1 style="color: #1E293B; margin: 0 0 10px 0;">${displayIdea.title}</h1>
            <p style="color: #64748B; margin: 0;">Phase 1 Validation Report</p>
            <p style="color: #64748B; font-size: 12px; margin: 5px 0 0 0;">Version ${displayIdea.version} | Generated: ${new Date(displayIdea.phase1Data.generatedAt || '').toLocaleDateString()}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #4F46E5; font-size: 18px; margin: 0 0 10px 0;">📝 Original Idea</h2>
            <p style="color: #475569; line-height: 1.6;">${displayIdea.description}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #4F46E5; font-size: 18px; margin: 0 0 10px 0;">✨ Clean Idea Summary</h2>
            <p style="color: #475569; line-height: 1.6;">${displayIdea.phase1Data.cleanSummary}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #4F46E5; font-size: 18px; margin: 0 0 10px 0;">📊 Market Feasibility</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tr>
                <td style="padding: 10px; background: #F1F5F9; border-radius: 8px; width: 50%;">
                  <strong style="color: #64748B; font-size: 12px;">MARKET SIZE</strong><br/>
                  <span style="color: #1E293B; font-size: 16px;">${displayIdea.phase1Data.marketFeasibility?.marketSize}</span>
                </td>
                <td style="padding: 10px; background: #F1F5F9; border-radius: 8px; width: 50%;">
                  <strong style="color: #64748B; font-size: 12px;">GROWTH</strong><br/>
                  <span style="color: #1E293B; font-size: 16px;">${displayIdea.phase1Data.marketFeasibility?.growthTrajectory}</span>
                </td>
              </tr>
            </table>
            <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0;">KEY TRENDS</p>
            <p style="color: #475569;">${displayIdea.phase1Data.marketFeasibility?.keyTrends.join(' • ')}</p>
            <p style="margin-top: 10px;"><span style="background: ${displayIdea.phase1Data.marketFeasibility?.timing === 'Now' ? '#22C55E' : '#F59E0B'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">Timing: ${displayIdea.phase1Data.marketFeasibility?.timing}</span></p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #4F46E5; font-size: 18px; margin: 0 0 15px 0;">🎯 Competitive Analysis</h2>
            ${displayIdea.phase1Data.competitiveAnalysis?.map(c => `
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
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">${displayIdea.phase1Data.killAssumption}</p>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
              <p style="font-weight: bold; margin: 0 0 5px 0;">How to Test:</p>
              <p style="margin: 0; opacity: 0.9;">${displayIdea.phase1Data.killAssumptionTestGuidance}</p>
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
        filename: `${displayIdea.title.replace(/[^a-zA-Z0-9]/g, '_')}_Phase1_Report.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
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

  const handleDownloadPhase2PDF = async () => {
    if (!idea || !displayIdea.phase2Data) {
      toast.error('No Phase 2 data to download');
      return;
    }

    try {
      setDownloadingPhase2(true);
      toast.info('Generating Phase 2 PDF...');

      const phase2 = displayIdea.phase2Data;
      const pdfContent = document.createElement('div');
      pdfContent.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px;">
            <h1 style="color: #1E293B; margin: 0 0 10px 0;">${displayIdea.title}</h1>
            <p style="color: #64748B; margin: 0;">Phase 2 Business Model Report</p>
            <p style="color: #64748B; font-size: 12px; margin: 5px 0 0 0;">Version ${displayIdea.version} | Generated: ${new Date(phase2.generatedAt || '').toLocaleDateString()}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #4F46E5; font-size: 20px; margin: 0 0 15px 0;">🎯 Business Model Canvas</h2>

            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Customer Segments</h3>
              <p style="color: #475569; margin: 0; line-height: 1.5;">${phase2.businessModel?.customerSegments}</p>
            </div>

            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Value Proposition</h3>
              <p style="color: #475569; margin: 0; line-height: 1.5;">${phase2.businessModel?.valueProposition}</p>
            </div>

            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Revenue Streams</h3>
              <p style="color: #475569; margin: 0; line-height: 1.5;">${phase2.businessModel?.revenueStreams}</p>
            </div>

            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Cost Structure</h3>
              <p style="color: #475569; margin: 0; line-height: 1.5;">${phase2.businessModel?.costStructure}</p>
            </div>

            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Key Partnerships</h3>
              <p style="color: #475569; margin: 0; line-height: 1.5;">${phase2.businessModel?.keyPartnerships}</p>
            </div>

            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Key Resources</h3>
              <p style="color: #475569; margin: 0; line-height: 1.5;">${phase2.businessModel?.keyResources}</p>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #4F46E5; font-size: 20px; margin: 0 0 15px 0;">🚀 Go-To-Market Strategy</h2>

            <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #22C55E;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Customer Acquisition</h3>
              <p style="color: #475569; margin: 0; line-height: 1.5;">${phase2.strategy?.customerAcquisition}</p>
            </div>

            <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #22C55E;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Pricing Strategy</h3>
              <p style="color: #475569; margin: 0; line-height: 1.5;">${phase2.strategy?.pricingStrategy}</p>
            </div>

            <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #22C55E;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Growth Strategy</h3>
              <p style="color: #475569; margin: 0; line-height: 1.5; white-space: pre-line;">${phase2.strategy?.growthStrategy?.replace(/\s*(Phase \d+:)/g, '\n\n$1').trim()}</p>
            </div>

            <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #22C55E;">
              <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">Key Milestones</h3>
              <ol style="color: #475569; margin: 0; line-height: 1.8; padding-left: 20px;">
                ${phase2.strategy?.keyMilestones?.map(m => `<li>${m}</li>`).join('') || ''}
              </ol>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #EF4444; font-size: 20px; margin: 0 0 15px 0;">⚡ Structural Risks</h2>
            ${phase2.structuralRisks?.map(r => `
              <div style="background: #FEF2F2; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #EF4444;">
                <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">${r.name}</h3>
                <p style="color: #475569; margin: 0 0 8px 0; line-height: 1.5;">${r.description}</p>
                <p style="color: #DC2626; font-size: 13px; margin: 0; font-style: italic;">${r.implications}</p>
              </div>
            `).join('') || ''}
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #F59E0B; font-size: 20px; margin: 0 0 15px 0;">⚙️ Operational Risks</h2>
            ${phase2.operationalRisks?.map(r => `
              <div style="background: #FFFBEB; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #F59E0B;">
                <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 14px;">${r.name}</h3>
                <p style="color: #475569; margin: 0 0 8px 0; line-height: 1.5;">${r.description}</p>
                <p style="color: #D97706; font-size: 13px; margin: 0; font-style: italic;">${r.implications}</p>
              </div>
            `).join('') || ''}
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; color: #94A3B8; font-size: 12px;">
            <p style="margin: 0;">Generated by Startup Validator Platform</p>
            <p style="margin: 5px 0 0 0;">${new Date().toLocaleDateString()} | Phase 2 Business Model Report</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `${displayIdea.title.replace(/[^a-zA-Z0-9]/g, '_')}_Phase2_Report.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(pdfContent).save();
      toast.success('Phase 2 PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating Phase 2 PDF:', error);
      toast.error('Failed to generate Phase 2 PDF');
    } finally {
      setDownloadingPhase2(false);
    }
  };

  const handleRefineSection = async (sectionName: string, feedback: string) => {
    if (!id) return;
    if (viewedVersion) { toast.error('You are viewing a historical version. Exit read-only mode first.'); return; }

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
        return displayIdea.phase1Data.cleanSummary || '';
      case 'marketFeasibility':
        const mf = displayIdea.phase1Data.marketFeasibility;
        if (!mf) return '';
        return `Market Size: ${mf.marketSize}\nGrowth: ${mf.growthTrajectory}\nTiming: ${mf.timing}\nKey Trends: ${mf.keyTrends.join(', ')}`;
      case 'competitiveAnalysis':
        const ca = displayIdea.phase1Data.competitiveAnalysis;
        if (!ca || ca.length === 0) return '';
        return ca.map(c => `${c.name}: ${c.difference} (Your advantage: ${c.advantage})`).join('\n\n');
      case 'killAssumption':
        return displayIdea.phase1Data.killAssumption || '';
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
    const status = displayIdea.phaseStatus;

    // Handle new format
    if (status.phase1 !== undefined) {
      if (phase === 1) return status.phase1;
      if (phase === 2) return status.phase2 || 'locked';
      return status.phase3 || 'locked';
    }

    // Handle old format (backwards compatibility)
    if (phase === 1) {
      if (status.phase1Confirmed) return 'confirmed';
      if (displayIdea.phase1Data?.cleanSummary) return 'generated';
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
  const hasPhase1Data = displayIdea.phase1Data && displayIdea.phase1Data.cleanSummary;

  const phaseLabels: Record<number, string> = {
    1: 'Discovery',
    2: 'Business Model',
    3: 'Pitch Deck',
  };

  const daysSinceCreated = Math.max(
    1,
    Math.floor((Date.now() - new Date(displayIdea.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  const confirmedCount = [1, 2, 3].filter((p) => getPhaseStepperStatus(p as 1 | 2 | 3) === 'confirmed').length;

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="sticky top-0 z-50">
      {viewedVersion && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-900">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Viewing <strong>v{viewedVersion.versionNumber}</strong> · {viewedVersion.changeSummary} · {new Date(viewedVersion.createdAt).toLocaleString()}
              <span className="ml-2 px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded text-xs font-medium">Read-only</span>
            </span>
          </div>
          <button
            onClick={() => setViewedVersion(null)}
            className="text-xs font-medium text-amber-900 hover:text-amber-700 underline"
          >
            Back to current (v{idea.version})
          </button>
        </div>
      )}
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link
                to="/dashboard"
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Back to dashboard"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/30 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-[15px] font-semibold text-slate-900 truncate leading-tight">{displayIdea.title}</h1>
                  <p className="text-[11px] text-slate-500 font-mono leading-tight">
                    v{displayIdea.version} · {displayIdea.phase}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <VersionHistoryPanel
                ideaId={idea.id}
                currentVersion={displayIdea.version}
                onViewVersion={(v) => setViewedVersion(v?.isActive || v?.versionNumber === idea.version ? null : v)}
              />
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>
      </div>

      {/* Dark hero banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-b border-white/5">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 30% 50%, black 40%, transparent 85%)',
          }}
        />
        <div className="absolute -top-20 -left-10 w-[420px] h-[420px] bg-indigo-500/25 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-[360px] h-[360px] bg-violet-500/20 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* Title & description */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur border border-white/10 text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  {displayIdea.phase} · {phaseLabels[parseInt(displayIdea.phase.replace('Phase ', ''), 10)]}
                </span>
                <span className="text-[11px] font-mono text-slate-400">v{displayIdea.version}</span>
                {displayIdea.archived && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-white/10 text-[11px] font-medium text-slate-300">
                    Archived
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1] mb-3 text-white">
                {displayIdea.title}
              </h1>
              <p className="text-slate-300 text-[15px] leading-relaxed max-w-3xl line-clamp-3">
                {displayIdea.description}
              </p>
            </div>

            {/* Stats card */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1">Progress</div>
                <div className="text-2xl font-semibold text-white">{confirmedCount}/3</div>
                <div className="text-[11px] text-slate-500 mt-0.5">phases confirmed</div>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1">Version</div>
                <div className="text-2xl font-semibold text-white">{displayIdea.version}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">current</div>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1">Age</div>
                <div className="text-2xl font-semibold text-white">{daysSinceCreated}d</div>
                <div className="text-[11px] text-slate-500 mt-0.5">since start</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase Stepper */}
      <div className="bg-white border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-5">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            {[1, 2, 3].map((phase) => {
              const status = getPhaseStepperStatus(phase as 1 | 2 | 3);
              const isActive = displayIdea.phase === `Phase ${phase}`;
              const isCompleted = status === 'confirmed';
              const isGenerated = status === 'generated';
              const isLocked = status === 'locked';
              const isInvalidated = status === 'invalidated';

              return (
                <div key={phase} className="flex items-center">
                  <div className={`flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full border transition-all ${
                    isInvalidated ? 'bg-orange-50 border-orange-200' :
                    isActive && !isCompleted ? 'bg-indigo-50 border-indigo-200' :
                    isCompleted ? 'bg-emerald-50 border-emerald-200' :
                    isGenerated ? 'bg-amber-50 border-amber-200' :
                    'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isInvalidated ? 'bg-orange-500 text-white' :
                      isCompleted ? 'bg-emerald-500 text-white' :
                      isGenerated ? 'bg-amber-500 text-white' :
                      isActive ? 'bg-indigo-500 text-white' :
                      isLocked ? 'bg-slate-300 text-slate-500' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isInvalidated ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : isLocked ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        phase
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold leading-tight ${
                        isInvalidated ? 'text-orange-700' :
                        isActive ? 'text-indigo-700' :
                        isCompleted ? 'text-emerald-700' :
                        isGenerated ? 'text-amber-700' :
                        'text-slate-500'
                      }`}>
                        {phaseLabels[phase]}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 leading-tight">
                        {isInvalidated ? 'Needs update' :
                         isCompleted ? 'Confirmed' :
                         isGenerated ? 'Generated' :
                         isLocked ? 'Locked' :
                         'Pending'}
                      </span>
                    </div>
                  </div>
                  {phase < 3 && (
                    <div className={`w-6 sm:w-10 h-0.5 mx-1 ${
                      getPhaseStepperStatus(phase as 1 | 2 | 3) === 'confirmed' ? 'bg-emerald-300' :
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
      <main className={`w-full px-4 sm:px-6 lg:px-10 py-8 ${viewedVersion ? '[&_button:not([data-readonly-ok])]:opacity-40 [&_button:not([data-readonly-ok])]:pointer-events-none [&_button:not([data-readonly-ok])]:cursor-not-allowed' : ''}`}>
        {/* Idea Description Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-900">Original idea</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{displayIdea.description}</p>
        </div>

        {/* Phase 1 Content */}
        <div className="space-y-6">
          {/* Generate Button (if Phase 1 not generated) */}
          {phase1Status === 'pending' && (
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white border border-white/5 p-10">
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              <div className="absolute -top-16 -right-10 w-72 h-72 bg-indigo-500/30 rounded-full blur-[100px]" />
              <div className="relative text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-[11px] font-semibold uppercase tracking-wider text-indigo-200 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Phase 1 · Discovery
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-white">
                  Ready to validate your idea?
                </h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Run the discovery pipeline to generate market feasibility, competitive analysis, and your critical kill assumption.
                </p>
                <button
                  onClick={handleGeneratePhase1}
                  disabled={generating}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                  {generating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                      Generating analysis…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Phase 1 analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Phase 1 Generated Content */}
          {hasPhase1Data && (
            <>
              {/* Clean Idea Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Clean idea summary</h3>
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
                <p className="text-sm text-slate-600 leading-relaxed">{displayIdea.phase1Data?.cleanSummary}</p>
              </div>

              {/* Market Feasibility */}
              {displayIdea.phase1Data?.marketFeasibility && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">Market feasibility</h3>
                    <span className={`ml-auto px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
                      getTimingColor(displayIdea.phase1Data.marketFeasibility.timing)
                    }`}>
                      Timing · {displayIdea.phase1Data.marketFeasibility.timing}
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

                  <div className="grid md:grid-cols-2 gap-4 mb-5">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Market size</h4>
                      <p className="text-base font-semibold text-slate-900 leading-snug">
                        {displayIdea.phase1Data.marketFeasibility.marketSize}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Growth trajectory</h4>
                      <p className="text-base font-semibold text-slate-900 leading-snug">
                        {displayIdea.phase1Data.marketFeasibility.growthTrajectory}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">Key market trends</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {displayIdea.phase1Data.marketFeasibility.keyTrends.map((trend, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200"
                        >
                          {trend}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Competitive Analysis */}
              {displayIdea.phase1Data?.competitiveAnalysis && displayIdea.phase1Data.competitiveAnalysis.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">Competitive analysis</h3>
                    <span className="ml-2 text-xs text-slate-400 font-mono">{displayIdea.phase1Data.competitiveAnalysis.length} competitors</span>
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

                  <div className="grid md:grid-cols-2 gap-3">
                    {displayIdea.phase1Data.competitiveAnalysis.map((competitor, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-semibold">
                            {competitor.name.charAt(0).toUpperCase()}
                          </div>
                          <h4 className="font-semibold text-slate-900 text-sm">{competitor.name}</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">How they differ</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{competitor.difference}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Your advantage</p>
                            <p className="text-xs text-slate-700 leading-relaxed">{competitor.advantage}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kill Assumption */}
              {displayIdea.phase1Data?.killAssumption && (
                <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white border border-white/5 p-6">
                  <div className="absolute -top-10 -right-10 w-64 h-64 bg-rose-500/30 rounded-full blur-[90px]" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/20 rounded-full blur-[80px]" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold text-white">Kill assumption</h3>
                      <span className="ml-auto px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 rounded-md text-[11px] font-semibold uppercase tracking-wider text-rose-200">
                        Critical to validate
                      </span>
                      {canEditSection() && (
                        <button
                          onClick={() => setEditingSection('killAssumption')}
                          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit this section"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <p className="text-base text-slate-100 leading-relaxed mb-4">{displayIdea.phase1Data.killAssumption}</p>

                    {displayIdea.phase1Data.killAssumptionTestGuidance && (
                      <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 mb-1.5">How to test</p>
                        <p className="text-sm text-slate-200 leading-relaxed">{displayIdea.phase1Data.killAssumptionTestGuidance}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {displayIdea.phase1Data?.generatedAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Generated {new Date(displayIdea.phase1Data.generatedAt).toLocaleDateString()}
                    </span>
                  )}
                  {displayIdea.phase1Data?.confirmedAt && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Confirmed {new Date(displayIdea.phase1Data.confirmedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-900 transition-colors disabled:opacity-60"
                  >
                    {downloading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        Downloading…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download PDF
                      </>
                    )}
                  </button>

                  {phase1Status === 'generated' && (
                    <>
                      <button
                        onClick={() => requestRegen('phase1')}
                        disabled={generating}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-900 transition-colors disabled:opacity-60"
                      >
                        {generating ? 'Regenerating…' : 'Regenerate'}
                      </button>
                      <button
                        onClick={handleConfirmPhase1}
                        disabled={confirming}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
                      >
                        {confirming ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Confirming…
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Confirm Phase 1
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {phase1Status === 'confirmed' && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Phase 1 confirmed
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Phase 2 Section */}
          {(() => {
            const phase2Status = getPhaseStepperStatus(2);
            const hasPhase2Data = !!(displayIdea.phase2Data && displayIdea.phase2Data.businessModel?.customerSegments);

            return (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-sm shadow-violet-500/30">
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <path d="M18.4 8.64L13.7 13.34 10.7 10.34 6 15.04" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900 leading-tight">Phase 2 · Business model</h2>
                    <p className="text-xs text-slate-500">Canvas, go-to-market strategy & risks</p>
                  </div>
                </div>

                {/* Phase 2 Locked State */}
                {phase2Status === 'locked' && (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                    <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-700 mb-1">Phase 2 is locked</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Complete and confirm Phase 1 to unlock business model development.
                    </p>
                  </div>
                )}

                {/* Phase 2 Invalidated State */}
                {phase2Status === 'invalidated' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-100 border border-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-orange-800 mb-1">Phase 2 needs update</h3>
                        <p className="text-sm text-orange-700 mb-4">
                          Phase 1 has been modified. Regenerate Phase 2 to reflect the latest changes.
                        </p>
                        <button
                          onClick={handleGeneratePhase2}
                          disabled={generatingPhase2}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60"
                        >
                          {generatingPhase2 ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Regenerating…
                            </>
                          ) : (
                            'Regenerate Phase 2'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phase 2 Pending - Generate Button */}
                {phase2Status === 'pending' && !hasPhase2Data && (
                  <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white border border-white/5 p-10">
                    <div
                      className="absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                      }}
                    />
                    <div className="absolute -top-16 -right-10 w-72 h-72 bg-violet-500/30 rounded-full blur-[100px]" />
                    <div className="relative text-center max-w-xl mx-auto">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-[11px] font-semibold uppercase tracking-wider text-violet-200 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                        Phase 2 · Business model
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-white">
                        Ready to build your business model?
                      </h3>
                      <p className="text-slate-300 mb-6 leading-relaxed">
                        Generate your business model canvas, go-to-market strategy, and structural & operational risk analysis.
                      </p>
                      <button
                        onClick={handleGeneratePhase2}
                        disabled={generatingPhase2}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
                      >
                        {generatingPhase2 ? (
                          <>
                            <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                            Generating business model…
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Generate Phase 2 analysis
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Phase 2 Generated Content */}
                {hasPhase2Data && (
                  <div className="space-y-6">
                    {/* Business Model Canvas */}
                    {displayIdea.phase2Data?.businessModel && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7" rx="1" />
                              <rect x="14" y="3" width="7" height="7" rx="1" />
                              <rect x="3" y="14" width="7" height="7" rx="1" />
                              <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                          </div>
                          <h3 className="text-base font-semibold text-slate-900">Business model canvas</h3>
                        </div>

                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                          <div className="rounded-xl p-4 bg-blue-50 border border-blue-100">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1 h-1 rounded-full bg-blue-500" />
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Customer segments</h4>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{displayIdea.phase2Data.businessModel.customerSegments}</p>
                          </div>
                          <div className="rounded-xl p-4 bg-violet-50 border border-violet-100">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1 h-1 rounded-full bg-violet-500" />
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-violet-700">Value proposition</h4>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{displayIdea.phase2Data.businessModel.valueProposition}</p>
                          </div>
                          <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1 h-1 rounded-full bg-emerald-500" />
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Revenue streams</h4>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{displayIdea.phase2Data.businessModel.revenueStreams}</p>
                          </div>
                          <div className="rounded-xl p-4 bg-amber-50 border border-amber-100">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1 h-1 rounded-full bg-amber-500" />
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Cost structure</h4>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{displayIdea.phase2Data.businessModel.costStructure}</p>
                          </div>
                          <div className="rounded-xl p-4 bg-cyan-50 border border-cyan-100">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1 h-1 rounded-full bg-cyan-500" />
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-cyan-700">Key partnerships</h4>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{displayIdea.phase2Data.businessModel.keyPartnerships}</p>
                          </div>
                          <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-100">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1 h-1 rounded-full bg-indigo-500" />
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">Key resources</h4>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{displayIdea.phase2Data.businessModel.keyResources}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Strategy */}
                    {displayIdea.phase2Data?.strategy && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                              <polyline points="17 6 23 6 23 12" />
                            </svg>
                          </div>
                          <h3 className="text-base font-semibold text-slate-900">Go-to-market strategy</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3 mb-4">
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Customer acquisition</h4>
                            <p className="text-slate-700 text-sm leading-relaxed">{displayIdea.phase2Data.strategy.customerAcquisition}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Pricing strategy</h4>
                            <p className="text-slate-700 text-sm leading-relaxed">{displayIdea.phase2Data.strategy.pricingStrategy}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Growth strategy</h4>
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{displayIdea.phase2Data.strategy.growthStrategy.replace(/\s*(Phase \d+:)/g, '\n\n$1').trim()}</p>
                          </div>
                        </div>

                        {displayIdea.phase2Data.strategy.keyMilestones && displayIdea.phase2Data.strategy.keyMilestones.length > 0 && (
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                            <div className="flex items-center gap-1.5 mb-3">
                              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 11a9 9 0 019 9" />
                                <path d="M4 4a16 16 0 0116 16" />
                                <circle cx="5" cy="19" r="1" />
                              </svg>
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Key milestones</h4>
                            </div>
                            <div className="space-y-2">
                              {displayIdea.phase2Data.strategy.keyMilestones.map((milestone, idx) => (
                                <div key={idx} className="flex items-start gap-2.5">
                                  <span className="w-5 h-5 flex-shrink-0 mt-0.5 bg-white border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                                    {idx + 1}
                                  </span>
                                  <span className="text-slate-700 text-sm leading-relaxed">{milestone}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Risks grid */}
                    <div className="grid lg:grid-cols-2 gap-4">
                      {/* Structural Risks */}
                      {displayIdea.phase2Data?.structuralRisks && displayIdea.phase2Data.structuralRisks.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                              </svg>
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">Structural risks</h3>
                            <span className="ml-auto text-xs text-slate-400 font-mono">{displayIdea.phase2Data.structuralRisks.length}</span>
                          </div>

                          <div className="space-y-2.5">
                            {displayIdea.phase2Data.structuralRisks.map((risk, idx) => (
                              <div key={idx} className="bg-rose-50/50 rounded-xl p-3.5 border border-rose-100">
                                <h4 className="text-sm font-semibold text-rose-700 mb-1.5">{risk.name}</h4>
                                <p className="text-slate-700 text-xs mb-2 leading-relaxed">{risk.description}</p>
                                <p className="text-rose-600 text-xs italic leading-relaxed">{risk.implications}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Operational Risks */}
                      {displayIdea.phase2Data?.operationalRisks && displayIdea.phase2Data.operationalRisks.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                              </svg>
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">Operational risks</h3>
                            <span className="ml-auto text-xs text-slate-400 font-mono">{displayIdea.phase2Data.operationalRisks.length}</span>
                          </div>

                          <div className="space-y-2.5">
                            {displayIdea.phase2Data.operationalRisks.map((risk, idx) => (
                              <div key={idx} className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-100">
                                <h4 className="text-sm font-semibold text-amber-700 mb-1.5">{risk.name}</h4>
                                <p className="text-slate-700 text-xs mb-2 leading-relaxed">{risk.description}</p>
                                <p className="text-amber-700 text-xs italic leading-relaxed">{risk.implications}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phase 2 Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {displayIdea.phase2Data?.generatedAt && (
                          <span className="inline-flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Generated {new Date(displayIdea.phase2Data.generatedAt).toLocaleDateString()}
                          </span>
                        )}
                        {displayIdea.phase2Data?.confirmedAt && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Confirmed {new Date(displayIdea.phase2Data.confirmedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {phase2Status === 'confirmed' && (
                          <button
                            onClick={handleDownloadPhase2PDF}
                            disabled={downloadingPhase2}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-900 transition-colors disabled:opacity-60"
                          >
                            {downloadingPhase2 ? (
                              <>
                                <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                Generating…
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download PDF
                              </>
                            )}
                          </button>
                        )}

                        {phase2Status === 'generated' && (
                          <>
                            <button
                              onClick={() => requestRegen('phase2')}
                              disabled={generatingPhase2}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-900 transition-colors disabled:opacity-60"
                            >
                              {generatingPhase2 ? 'Regenerating…' : 'Regenerate'}
                            </button>
                            <button
                              onClick={handleConfirmPhase2}
                              disabled={confirmingPhase2}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
                            >
                              {confirmingPhase2 ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Confirming…
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Confirm Phase 2
                                </>
                              )}
                            </button>
                          </>
                        )}

                        {phase2Status === 'confirmed' && (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Phase 2 confirmed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Phase 3 Section */}
          {(() => {
            const phase3Status = getPhaseStepperStatus(3);
            const hasPhase3Data = !!(displayIdea.phase3Data && displayIdea.phase3Data.pitchDeck?.titleSlide?.title);

            return (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-white shadow-sm shadow-fuchsia-500/30">
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900 leading-tight">Phase 3 · Investor pitch deck</h2>
                    <p className="text-xs text-slate-500">10-slide pitch deck ready for investors</p>
                  </div>
                </div>

                {/* Phase 3 Locked State */}
                {phase3Status === 'locked' && (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                    <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-700 mb-1">Phase 3 is locked</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Complete and confirm Phase 2 to unlock the investor pitch deck.
                    </p>
                  </div>
                )}

                {/* Phase 3 Invalidated State */}
                {phase3Status === 'invalidated' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-100 border border-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-orange-800 mb-1">Phase 3 needs update</h3>
                        <p className="text-sm text-orange-700 mb-4">
                          Phase 2 has been modified. Regenerate Phase 3 to reflect the latest changes.
                        </p>
                        <button
                          onClick={handleGeneratePhase3}
                          disabled={generatingPhase3}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60"
                        >
                          {generatingPhase3 ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Regenerating…
                            </>
                          ) : (
                            'Regenerate Phase 3'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phase 3 Pending - Generate Button */}
                {phase3Status === 'pending' && !hasPhase3Data && (
                  <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white border border-white/5 p-10">
                    <div
                      className="absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                      }}
                    />
                    <div className="absolute -top-16 -right-10 w-72 h-72 bg-fuchsia-500/30 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-10 w-56 h-56 bg-pink-500/20 rounded-full blur-[90px]" />
                    <div className="relative text-center max-w-xl mx-auto">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-[11px] font-semibold uppercase tracking-wider text-fuchsia-200 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                        Phase 3 · Pitch deck
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-white">
                        Ready to create your pitch deck?
                      </h3>
                      <p className="text-slate-300 mb-6 leading-relaxed">
                        Generate a 10-slide investor-ready pitch deck built on your validated idea and business model.
                      </p>
                      <button
                        onClick={handleGeneratePhase3}
                        disabled={generatingPhase3}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-fuchsia-500/20"
                      >
                        {generatingPhase3 ? (
                          <>
                            <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                            Generating pitch deck…
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Generate Phase 3 pitch deck
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Phase 3 Generated Content */}
                {hasPhase3Data && (
                  <div className="space-y-6">
                    {/* Pitch Deck Slides */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-fuchsia-50 border border-fuchsia-100 flex items-center justify-center text-fuchsia-600">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="13" y2="17" />
                          </svg>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">Pitch deck</h3>
                        <span className="ml-2 text-xs text-slate-400 font-mono">10 slides</span>
                      </div>

                      <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                        {displayIdea.phase3Data?.pitchDeck && Object.entries(displayIdea.phase3Data.pitchDeck).map(([key, slide]) => {
                          const slideAccents: Record<string, { dot: string; ring: string }> = {
                            titleSlide: { dot: 'bg-indigo-500', ring: 'hover:ring-indigo-200' },
                            problemSlide: { dot: 'bg-rose-500', ring: 'hover:ring-rose-200' },
                            solutionSlide: { dot: 'bg-emerald-500', ring: 'hover:ring-emerald-200' },
                            marketOpportunitySlide: { dot: 'bg-blue-500', ring: 'hover:ring-blue-200' },
                            businessModelSlide: { dot: 'bg-violet-500', ring: 'hover:ring-violet-200' },
                            tractionSlide: { dot: 'bg-teal-500', ring: 'hover:ring-teal-200' },
                            competitionSlide: { dot: 'bg-orange-500', ring: 'hover:ring-orange-200' },
                            teamSlide: { dot: 'bg-cyan-500', ring: 'hover:ring-cyan-200' },
                            financialsSlide: { dot: 'bg-amber-500', ring: 'hover:ring-amber-200' },
                            askSlide: { dot: 'bg-fuchsia-500', ring: 'hover:ring-fuchsia-200' },
                          };
                          const accent = slideAccents[key] || { dot: 'bg-slate-400', ring: 'hover:ring-slate-200' };

                          return (
                            <div
                              key={key}
                              className={`group rounded-xl p-4 border border-slate-200 bg-white hover:shadow-md hover:ring-2 ${accent.ring} transition-all`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-md flex items-center justify-center text-[11px] font-bold font-mono">
                                  {String(slide.slideNumber).padStart(2, '0')}
                                </span>
                                <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                                <h4 className="font-semibold text-slate-900 text-sm truncate flex-1">{slide.title}</h4>
                              </div>
                              <p className="text-slate-600 text-xs leading-relaxed mb-2 line-clamp-3 whitespace-pre-line">{slide.content}</p>
                              {slide.speakerNotes && (
                                <details className="mt-2 pt-2 border-t border-slate-100">
                                  <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-indigo-600 font-medium inline-flex items-center gap-1">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                    </svg>
                                    Speaker notes
                                  </summary>
                                  <p className="text-[11px] text-slate-500 mt-1.5 bg-slate-50 p-2 rounded leading-relaxed">
                                    {slide.speakerNotes}
                                  </p>
                                </details>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Changelog */}
                    {displayIdea.phase3Data?.changelog && displayIdea.phase3Data.changelog.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </div>
                          <h3 className="text-base font-semibold text-slate-900">What changed</h3>
                          <span className="ml-2 text-xs text-slate-400 font-mono">{displayIdea.phase3Data.changelog.length} entries</span>
                        </div>

                        <div className="space-y-1.5">
                          {displayIdea.phase3Data.changelog.map((entry, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                            >
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                                entry.changeType === 'added' ? 'bg-emerald-100 text-emerald-700' :
                                entry.changeType === 'modified' ? 'bg-blue-100 text-blue-700' :
                                'bg-rose-100 text-rose-700'
                              }`}>
                                {entry.changeType}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900">{entry.section}</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{entry.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Phase 3 Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {displayIdea.phase3Data?.generatedAt && (
                          <span className="inline-flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Generated {new Date(displayIdea.phase3Data.generatedAt).toLocaleDateString()}
                          </span>
                        )}
                        {displayIdea.phase3Data?.confirmedAt && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Confirmed {new Date(displayIdea.phase3Data.confirmedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleDownloadPhase3PDF}
                          disabled={downloadingPhase3}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-900 transition-colors disabled:opacity-60"
                        >
                          {downloadingPhase3 ? (
                            <>
                              <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                              Downloading…
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              Download pitch deck
                            </>
                          )}
                        </button>

                        {phase3Status === 'generated' && (
                          <>
                            <button
                              onClick={() => requestRegen('phase3')}
                              disabled={generatingPhase3}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-900 transition-colors disabled:opacity-60"
                            >
                              {generatingPhase3 ? 'Regenerating…' : 'Regenerate'}
                            </button>
                            <button
                              onClick={handleConfirmPhase3}
                              disabled={confirmingPhase3}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
                            >
                              {confirmingPhase3 ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Confirming…
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Confirm Phase 3
                                </>
                              )}
                            </button>
                          </>
                        )}

                        {phase3Status === 'confirmed' && (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 border border-emerald-500 text-white text-sm font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Validation complete
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Completion Banner */}
                    {phase3Status === 'confirmed' && (
                      <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white border border-white/5 p-8">
                        <div
                          className="absolute inset-0 opacity-[0.15]"
                          style={{
                            backgroundImage:
                              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 85%)',
                          }}
                        />
                        <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-500/30 rounded-full blur-[90px]" />
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-teal-500/25 rounded-full blur-[90px]" />
                        <div className="relative text-center">
                          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-semibold tracking-tight mb-2 text-white">Validation complete</h3>
                          <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
                            Your startup idea has been fully validated through all three phases. Download your pitch deck and start pitching.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
          {id && idea && !viewedVersion && (
            <ChatPanel ideaId={id} onIdeaUpdated={loadIdea} />
          )}
        </div>
      </main>

      {/* Regenerate feedback prompt — shown when user clicks any
          per-phase Regenerate button. Empty feedback → full phase run.
          Specific feedback → routed via chat classifier to targeted section
          regen when possible (cheap), falling back to full phase. */}
      {regenPhase && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => !regenBusy && setRegenPhase(null)} />
          <div className="fixed z-50 inset-x-4 bottom-6 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">
                Regenerate {regenPhase === 'phase1' ? 'Phase 1' : regenPhase === 'phase2' ? 'Phase 2' : 'Phase 3'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                What do you want changed? (Leave empty to rerun the whole phase.)
              </p>
            </div>
            <div className="p-5 space-y-3">
              <textarea
                value={regenFeedback}
                onChange={(e) => setRegenFeedback(e.target.value)}
                rows={4}
                placeholder="e.g., Focus market feasibility on the Indian market instead of global"
                disabled={regenBusy}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
              />
              <p className="text-xs text-slate-500">
                Tip: naming a specific section (market feasibility, strategy, team slide…) regenerates only that section, saving tokens.
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setRegenPhase(null)}
                disabled={regenBusy}
                className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmRegen}
                disabled={regenBusy}
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {regenBusy ? 'Working…' : 'Regenerate'}
              </button>
            </div>
          </div>
        </>
      )}

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
