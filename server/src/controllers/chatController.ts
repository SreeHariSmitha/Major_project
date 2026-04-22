import { Response } from 'express';
import { Idea } from '../models/Idea.js';
import Version from '../models/Version.js';
import Conversation from '../models/Conversation.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { callAgentPath, AgentServiceError } from '../utils/agentClient.js';

/**
 * Section → (phase, required prior-phase dependency) map.
 * Used to pick the right phase data slice + context for regeneration.
 */
const SECTION_PHASE_MAP: Record<string, 'phase1' | 'phase2' | 'phase3'> = {
  cleanSummary: 'phase1',
  marketFeasibility: 'phase1',
  competitiveAnalysis: 'phase1',
  killAssumption: 'phase1',
  businessModel: 'phase2',
  strategy: 'phase2',
  risks: 'phase2',
  storySlides: 'phase3',
  marketModelSlides: 'phase3',
  executionSlides: 'phase3',
};

async function getConversation(ideaId: string, userId: string) {
  let conv = await Conversation.findOne({ ideaId });
  if (!conv) {
    conv = await Conversation.create({ ideaId, userId, messages: [] });
  }
  return conv;
}

/**
 * GET /api/v1/ideas/:id/chat — fetch chat history for the idea.
 */
export const getChatHistory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const idea = await Idea.findOne({ _id: id, userId: req.userId });
    if (!idea) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Idea not found' } });
      return;
    }
    const conv = await getConversation(id, req.userId!);
    res.json({ success: true, data: { messages: conv.messages } });
  } catch (err) {
    console.error('getChatHistory error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to load chat' } });
  }
};

/**
 * POST /api/v1/ideas/:id/chat — send a user message, get assistant reply.
 * Does NOT change idea data. If the assistant wants to regenerate, its reply
 * includes a `proposal` the user must confirm via /chat/apply.
 */
export const sendChatMessage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Message is required' } });
      return;
    }

    const idea = await Idea.findOne({ _id: id, userId: req.userId });
    if (!idea) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Idea not found' } });
      return;
    }

    const conv = await getConversation(id, req.userId!);

    // Push user message
    conv.messages.push({ role: 'user', content: message.trim(), createdAt: new Date() } as any);

    // Call ADK chat endpoint
    let agentResp: any;
    try {
      agentResp = await callAgentPath('/agents/chat', {
        ideaTitle: idea.title,
        ideaDescription: idea.description,
        message: message.trim(),
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        phase3Data: idea.phase3Data,
        history: conv.messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      });
    } catch (err) {
      const msg = err instanceof AgentServiceError ? err.message : 'Agent service error';
      await conv.save();
      res.status(502).json({ success: false, error: { code: 'AGENT_ERROR', message: msg } });
      return;
    }

    const assistantMsg: any = {
      role: 'assistant',
      content: agentResp?.text || '',
      createdAt: new Date(),
    };

    if (agentResp?.type === 'proposal' && agentResp.section && SECTION_PHASE_MAP[agentResp.section]) {
      assistantMsg.proposal = {
        section: agentResp.section,
        feedback: agentResp.feedback || '',
        applied: false,
      };
    }

    conv.messages.push(assistantMsg);
    await conv.save();

    res.json({
      success: true,
      data: {
        assistant: assistantMsg,
        messageIndex: conv.messages.length - 1,
      },
    });
  } catch (err) {
    console.error('sendChatMessage error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Chat failed' } });
  }
};

/**
 * POST /api/v1/ideas/:id/chat/apply — user has confirmed a proposed
 * section change. Runs the section-regeneration agent, patches the phase
 * data, creates a new Version, marks the proposal applied.
 *
 * Body: { messageIndex: number } — index into conv.messages pointing at
 * the assistant message that carries the proposal to apply. Allowing the
 * caller to override `feedback` (edit-then-apply) lets users tweak the
 * distilled feedback before it runs.
 */
export const applyChatProposal = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { messageIndex, feedbackOverride } = req.body;

    const idea = await Idea.findOne({ _id: id, userId: req.userId });
    if (!idea) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Idea not found' } });
      return;
    }

    const conv = await getConversation(id, req.userId!);
    const msg = conv.messages[messageIndex];
    if (!msg || !msg.proposal) {
      res.status(400).json({ success: false, error: { code: 'NO_PROPOSAL', message: 'No proposal at that index' } });
      return;
    }
    if (msg.proposal.applied) {
      res.status(400).json({ success: false, error: { code: 'ALREADY_APPLIED', message: 'Proposal already applied' } });
      return;
    }

    const section = msg.proposal.section;
    const phase = SECTION_PHASE_MAP[section];
    if (!phase) {
      res.status(400).json({ success: false, error: { code: 'INVALID_SECTION', message: 'Unknown section' } });
      return;
    }

    // Verify the phase has been generated — can't regenerate a section of
    // data that doesn't exist yet.
    const phaseData =
      phase === 'phase1' ? idea.phase1Data : phase === 'phase2' ? idea.phase2Data : idea.phase3Data;
    if (!phaseData) {
      res.status(400).json({
        success: false,
        error: { code: 'PHASE_NOT_GENERATED', message: `${phase} must be generated before editing its sections` },
      });
      return;
    }

    // Extract existing section content for the agent prompt
    const existingSection = extractSection(section, idea);
    const feedback = (feedbackOverride || msg.proposal.feedback || '').trim();

    // Call section regeneration agent
    let regen: any;
    try {
      regen = await callAgentPath('/agents/regenerate-section', {
        section,
        feedback,
        ideaTitle: idea.title,
        ideaDescription: idea.description,
        existingSection,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
      });
    } catch (err) {
      const em = err instanceof AgentServiceError ? err.message : 'Agent service error';
      res.status(502).json({ success: false, error: { code: 'AGENT_ERROR', message: em } });
      return;
    }

    const patch = regen?.patch || {};
    applyPatch(phase, patch, idea);
    cascadeInvalidate(phase, idea);
    idea.version = (idea.version || 1) + 1;
    await idea.save();

    // Persist version
    await Version.createVersion(
      idea._id,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        phase3Data: idea.phase3Data,
      },
      'edit',
      `Chat-applied change to ${section}: ${feedback.slice(0, 80)}`,
    );

    msg.proposal.applied = true;
    // Append a confirmation assistant message so chat transcript reflects
    // the action.
    conv.messages.push({
      role: 'assistant',
      content: `Done. Updated **${section}** and created a new version.`,
      createdAt: new Date(),
    } as any);
    conv.markModified('messages');
    await conv.save();

    res.json({
      success: true,
      data: {
        section,
        phase,
        updatedIdea: {
          id: idea._id,
          version: idea.version,
          phaseStatus: idea.phaseStatus,
          phase1Data: idea.phase1Data,
          phase2Data: idea.phase2Data,
          phase3Data: idea.phase3Data,
        },
      },
    });
  } catch (err) {
    console.error('applyChatProposal error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Apply failed' } });
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractSection(section: string, idea: any): any {
  const p1 = idea.phase1Data || {};
  const p2 = idea.phase2Data || {};
  const p3 = idea.phase3Data?.pitchDeck || {};
  switch (section) {
    case 'cleanSummary': return { cleanSummary: p1.cleanSummary };
    case 'marketFeasibility': return p1.marketFeasibility || {};
    case 'competitiveAnalysis': return { competitiveAnalysis: p1.competitiveAnalysis || [] };
    case 'killAssumption':
      return {
        killAssumption: p1.killAssumption,
        killAssumptionTestGuidance: p1.killAssumptionTestGuidance,
      };
    case 'businessModel': return p2.businessModel || {};
    case 'strategy': return p2.strategy || {};
    case 'risks':
      return {
        structuralRisks: p2.structuralRisks || [],
        operationalRisks: p2.operationalRisks || [],
      };
    case 'storySlides':
      return {
        titleSlide: p3.titleSlide,
        problemSlide: p3.problemSlide,
        solutionSlide: p3.solutionSlide,
      };
    case 'marketModelSlides':
      return {
        marketOpportunitySlide: p3.marketOpportunitySlide,
        businessModelSlide: p3.businessModelSlide,
        competitionSlide: p3.competitionSlide,
      };
    case 'executionSlides':
      return {
        tractionSlide: p3.tractionSlide,
        teamSlide: p3.teamSlide,
        financialsSlide: p3.financialsSlide,
        askSlide: p3.askSlide,
      };
    default: return {};
  }
}

function applyPatch(phase: 'phase1' | 'phase2' | 'phase3', patch: Record<string, any>, idea: any): void {
  if (phase === 'phase1') {
    idea.phase1Data = idea.phase1Data || {};
    Object.assign(idea.phase1Data, patch);
    idea.markModified('phase1Data');
  } else if (phase === 'phase2') {
    idea.phase2Data = idea.phase2Data || {};
    Object.assign(idea.phase2Data, patch);
    idea.markModified('phase2Data');
  } else {
    idea.phase3Data = idea.phase3Data || {};
    idea.phase3Data.pitchDeck = idea.phase3Data.pitchDeck || {};
    Object.assign(idea.phase3Data.pitchDeck, patch);
    idea.markModified('phase3Data');
  }
}

function cascadeInvalidate(phase: 'phase1' | 'phase2' | 'phase3', idea: any): void {
  if (phase === 'phase1') {
    if (idea.phaseStatus.phase2 === 'generated' || idea.phaseStatus.phase2 === 'confirmed') {
      idea.phaseStatus.phase2 = 'invalidated';
    }
    if (idea.phaseStatus.phase3 === 'generated' || idea.phaseStatus.phase3 === 'confirmed') {
      idea.phaseStatus.phase3 = 'invalidated';
    }
  } else if (phase === 'phase2') {
    if (idea.phaseStatus.phase3 === 'generated' || idea.phaseStatus.phase3 === 'confirmed') {
      idea.phaseStatus.phase3 = 'invalidated';
    }
  }
}

/**
 * POST /api/v1/ideas/:id/sections/:sectionName — direct section regeneration
 * (no chat). Kept backwards compatible with the old refineSection route but
 * now supports ALL sections and calls the real sub-agent. Requires feedback
 * in body.
 */
export const regenerateSection = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id, sectionName } = req.params;
    const { feedback } = req.body;

    const phase = SECTION_PHASE_MAP[sectionName];
    if (!phase) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SECTION',
          message: `Unknown section. Valid: ${Object.keys(SECTION_PHASE_MAP).join(', ')}`,
        },
      });
      return;
    }
    if (!feedback || typeof feedback !== 'string' || feedback.trim().length < 3) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Feedback is required (min 3 chars)' },
      });
      return;
    }

    const idea = await Idea.findOne({ _id: id, userId: req.userId });
    if (!idea) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Idea not found' } });
      return;
    }

    const phaseData =
      phase === 'phase1' ? idea.phase1Data : phase === 'phase2' ? idea.phase2Data : idea.phase3Data;
    if (!phaseData) {
      res.status(400).json({
        success: false,
        error: { code: 'PHASE_NOT_GENERATED', message: `${phase} must be generated first` },
      });
      return;
    }

    const existingSection = extractSection(sectionName, idea);

    let regen: any;
    try {
      regen = await callAgentPath('/agents/regenerate-section', {
        section: sectionName,
        feedback: feedback.trim(),
        ideaTitle: idea.title,
        ideaDescription: idea.description,
        existingSection,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
      });
    } catch (err) {
      const em = err instanceof AgentServiceError ? err.message : 'Agent service error';
      res.status(502).json({ success: false, error: { code: 'AGENT_ERROR', message: em } });
      return;
    }

    applyPatch(phase, regen?.patch || {}, idea);
    cascadeInvalidate(phase, idea);
    idea.version = (idea.version || 1) + 1;
    await idea.save();

    await Version.createVersion(
      idea._id,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        phase3Data: idea.phase3Data,
      },
      'edit',
      `Regenerated ${sectionName}: ${feedback.trim().slice(0, 80)}`,
    );

    res.json({
      success: true,
      data: {
        id: idea._id,
        version: idea.version,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        phase3Data: idea.phase3Data,
        refinedSection: sectionName,
      },
    });
  } catch (err) {
    console.error('regenerateSection error:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Regeneration failed' } });
  }
};
