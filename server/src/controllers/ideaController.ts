import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Idea } from '../models/Idea.js';
import Version from '../models/Version.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { z } from 'zod';
import { ZodError } from 'zod';

/**
 * API Response Interface
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Validation Schemas
 */
const CreateIdeaSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim(),
});

const UpdateIdeaSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim()
    .optional(),
});

type CreateIdeaRequest = z.infer<typeof CreateIdeaSchema>;
type UpdateIdeaRequest = z.infer<typeof UpdateIdeaSchema>;

/**
 * Create New Idea - Story 3.1
 * POST /api/v1/ideas
 */
export const createIdea = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description } = req.body;

    // Validate input
    let validatedData: CreateIdeaRequest;
    try {
      validatedData = CreateIdeaSchema.parse({ title, description });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const details: Record<string, string> = {};
        validationError.errors.forEach((error) => {
          const path = error.path.join('.');
          details[path] = error.message;
        });
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details,
          },
        });
      }
      return;
    }

    // Create idea
    const idea = new Idea({
      userId: req.userId,
      title: validatedData.title,
      description: validatedData.description,
      phase: 'Phase 1',
      phaseStatus: {
        phase1: 'pending',
        phase2: 'locked',
        phase3: 'locked',
      },
      version: 1,
      archived: false,
    });

    await idea.save();

    // Create initial version (Story 5.1)
    await Version.createVersion(
      idea._id,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
      },
      'initial',
      'Initial idea creation'
    );

    res.status(201).json({
      success: true,
      data: {
        id: idea._id,
        userId: idea.userId,
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        version: idea.version,
        archived: idea.archived,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create idea',
      },
    });
  }
};

/**
 * List All User Ideas - Story 3.2
 * GET /api/v1/ideas
 */
export const listIdeas = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { archived, phase } = req.query;

    // Build filter
    const filter: any = { userId: req.userId };

    if (archived === 'true') {
      filter.archived = true;
    } else if (archived === 'false') {
      filter.archived = false;
    }

    if (phase) {
      filter.phase = phase;
    }

    // Fetch ideas sorted by creation date (newest first)
    const ideas = await Idea.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: ideas.map((idea: any) => ({
        id: idea._id,
        userId: idea.userId,
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        version: idea.version,
        archived: idea.archived,
        killAssumption: idea.phase1Data?.killAssumption,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      })),
    });
  } catch (error) {
    console.error('List ideas error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch ideas',
      },
    });
  }
};

/**
 * Get Idea Details - Story 3.5
 * GET /api/v1/ideas/:id
 */
export const getIdea = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await Idea.findOne({
      _id: id,
      userId: req.userId,
    }).lean();

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        userId: idea.userId,
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        version: idea.version,
        archived: idea.archived,
        killAssumption: idea.phase1Data?.killAssumption,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get idea error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch idea',
      },
    });
  }
};

/**
 * Update Idea - Future story
 * PUT /api/v1/ideas/:id
 */
export const updateIdea = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Validate input (optional fields)
    let validatedData: UpdateIdeaRequest;
    try {
      validatedData = UpdateIdeaSchema.parse({ title, description });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const details: Record<string, string> = {};
        validationError.errors.forEach((error) => {
          const path = error.path.join('.');
          details[path] = error.message;
        });
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details,
          },
        });
      }
      return;
    }

    // Find idea first
    const idea = await Idea.findOne({ _id: id, userId: req.userId });

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Check what changed for version summary
    const changes: string[] = [];
    if (validatedData.title !== undefined && validatedData.title !== idea.title) {
      changes.push('title');
    }
    if (validatedData.description !== undefined && validatedData.description !== idea.description) {
      changes.push('description');
    }

    // Only create version if something actually changed
    if (changes.length > 0) {
      // Increment version number
      idea.version = (idea.version || 1) + 1;

      // Update fields
      if (validatedData.title !== undefined) idea.title = validatedData.title;
      if (validatedData.description !== undefined) idea.description = validatedData.description;

      await idea.save();

      // Create new version (Story 5.1)
      await Version.createVersion(
        idea._id,
        {
          title: idea.title,
          description: idea.description,
          phase: idea.phase,
          phaseStatus: idea.phaseStatus,
          phase1Data: idea.phase1Data,
        },
        'edit',
        `Updated ${changes.join(' and ')}`
      );
    }

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        userId: idea.userId,
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        version: idea.version,
        archived: idea.archived,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update idea',
      },
    });
  }
};

/**
 * Delete Idea - Story 3.6
 * DELETE /api/v1/ideas/:id
 */
export const deleteIdea = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await Idea.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Idea deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete idea',
      },
    });
  }
};

/**
 * Archive Idea - Story 3.7
 * PATCH /api/v1/ideas/:id/archive
 */
export const archiveIdea = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { archived } = req.body;

    if (typeof archived !== 'boolean') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'archived must be a boolean',
        },
      });
      return;
    }

    const idea = await Idea.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: { archived } },
      { new: true }
    ).lean();

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        userId: idea.userId,
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        archived: idea.archived,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      },
    });
  } catch (error) {
    console.error('Archive idea error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to archive idea',
      },
    });
  }
};

/**
 * Search Ideas - Story 3.12
 * GET /api/v1/ideas/search
 */
export const searchIdeas = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, archived, phase, status } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query (q) is required',
        },
      });
      return;
    }

    // Build filter with search query
    const searchRegex = new RegExp(q, 'i');
    const filter: any = {
      userId: req.userId,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'phase1Data.cleanedSummary': searchRegex },
        { 'phase1Data.killAssumption': searchRegex },
      ],
    };

    // Apply archived filter
    if (archived === 'true') {
      filter.archived = true;
    } else if (archived === 'false') {
      filter.archived = false;
    }
    // If archived not specified, search all (both archived and active)

    // Apply phase filter
    if (phase) {
      filter.phase = phase;
    }

    // Apply status filter (In Progress, Completed)
    if (status === 'in_progress') {
      filter.$and = [
        { archived: false },
        {
          $or: [
            { phase: { $in: ['Phase 1', 'Phase 2'] } },
            { phase: 'Phase 3', 'phase3Data.confirmedAt': { $exists: false } },
          ],
        },
      ];
    } else if (status === 'completed') {
      filter.phase = 'Phase 3';
      filter['phase3Data.confirmedAt'] = { $exists: true };
      filter.archived = false;
    }

    const ideas = await Idea.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: ideas.map((idea: any) => ({
        id: idea._id,
        userId: idea.userId,
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        phase3Data: idea.phase3Data,
        version: idea.version,
        archived: idea.archived,
        killAssumption: idea.phase1Data?.killAssumption,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      })),
      query: q,
    });
  } catch (error) {
    console.error('Search ideas error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search ideas',
      },
    });
  }
};

/**
 * Generate Phase 1 Analysis - Story 4.1-4.4
 * POST /api/v1/ideas/:id/generate/phase1
 *
 * Generates:
 * - Clean Idea Summary
 * - Market Feasibility
 * - Competitive Analysis
 * - Kill Assumption
 */
export const generatePhase1 = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await Idea.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Check if Phase 1 is already confirmed (locked)
    if (idea.phaseStatus.phase1 === 'confirmed') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_LOCKED',
          message: 'Phase 1 is already confirmed. Create a new version to regenerate.',
        },
      });
      return;
    }

    // For MVP: Generate template-based analysis from description
    // In future: Replace with AI generation (OpenAI/Claude)
    const phase1Data = generatePhase1Content(idea.title, idea.description);

    // Update idea with Phase 1 data
    idea.phase1Data = phase1Data;
    idea.phaseStatus.phase1 = 'generated';

    // Cascade invalidation (Story 7.1): Regenerating Phase 1 invalidates Phase 2 & 3
    const phase2Status = idea.phaseStatus.phase2;
    const phase3Status = idea.phaseStatus.phase3;

    if (phase2Status === 'generated' || phase2Status === 'confirmed') {
      idea.phaseStatus.phase2 = 'invalidated';
    }
    if (phase3Status === 'generated' || phase3Status === 'confirmed') {
      idea.phaseStatus.phase3 = 'invalidated';
    }

    idea.version = (idea.version || 1) + 1;
    await idea.save();

    // Create version for phase generation (Story 5.1)
    await Version.createVersion(
      idea._id,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
      },
      'phase1_generated',
      'Phase 1 analysis generated'
    );

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        version: idea.version,
        updatedAt: idea.updatedAt,
      },
    });
  } catch (error) {
    console.error('Generate Phase 1 error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate Phase 1 analysis',
      },
    });
  }
};

/**
 * Confirm Phase 1 - Story 4.6
 * POST /api/v1/ideas/:id/confirm/phase1
 *
 * Locks Phase 1 and enables Phase 2
 */
export const confirmPhase1 = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await Idea.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Check if Phase 1 has been generated
    if (idea.phaseStatus.phase1 === 'pending') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_NOT_GENERATED',
          message: 'Phase 1 must be generated before confirming.',
        },
      });
      return;
    }

    // Check if Phase 1 is already confirmed
    if (idea.phaseStatus.phase1 === 'confirmed') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_ALREADY_CONFIRMED',
          message: 'Phase 1 is already confirmed.',
        },
      });
      return;
    }

    // Confirm Phase 1 and unlock Phase 2
    idea.phaseStatus.phase1 = 'confirmed';
    idea.phaseStatus.phase2 = 'pending';
    if (idea.phase1Data) {
      idea.phase1Data.confirmedAt = new Date();
    }
    idea.version = (idea.version || 1) + 1;
    await idea.save();

    // Create version for phase confirmation (Story 5.1)
    await Version.createVersion(
      idea._id,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
      },
      'phase1_confirmed',
      'Phase 1 confirmed'
    );

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        title: idea.title,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        version: idea.version,
        updatedAt: idea.updatedAt,
        message: 'Phase 1 confirmed. Phase 2 is now available.',
      },
    });
  } catch (error) {
    console.error('Confirm Phase 1 error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to confirm Phase 1',
      },
    });
  }
};

/**
 * Refine Section - Story 6.1-6.4
 * POST /api/v1/ideas/:id/sections/:sectionName
 *
 * Regenerates only the specified section based on user feedback
 */
export const refineSection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, sectionName } = req.params;
    const { feedback } = req.body;

    // Validate section name
    const validSections = ['cleanSummary', 'marketFeasibility', 'competitiveAnalysis', 'killAssumption'];
    if (!validSections.includes(sectionName)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SECTION',
          message: `Invalid section name. Valid sections are: ${validSections.join(', ')}`,
        },
      });
      return;
    }

    // Validate feedback
    if (!feedback || typeof feedback !== 'string' || feedback.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Feedback must be at least 10 characters',
        },
      });
      return;
    }

    const idea = await Idea.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Check if Phase 1 has been generated
    if (!idea.phase1Data || idea.phaseStatus.phase1 === 'pending') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_NOT_GENERATED',
          message: 'Phase 1 must be generated before editing sections.',
        },
      });
      return;
    }

    // Generate refined section content based on feedback
    // For MVP: Template-based refinement incorporating feedback keywords
    const refinedContent = generateRefinedSection(
      sectionName,
      idea.title,
      idea.description,
      feedback,
      idea.phase1Data
    );

    // Update only the specified section
    const previousPhase1Data = { ...idea.phase1Data };

    if (sectionName === 'cleanSummary') {
      idea.phase1Data.cleanSummary = refinedContent as string;
    } else if (sectionName === 'marketFeasibility') {
      idea.phase1Data.marketFeasibility = refinedContent as typeof idea.phase1Data.marketFeasibility;
    } else if (sectionName === 'competitiveAnalysis') {
      idea.phase1Data.competitiveAnalysis = refinedContent as typeof idea.phase1Data.competitiveAnalysis;
    } else if (sectionName === 'killAssumption') {
      const { killAssumption, killAssumptionTestGuidance } = refinedContent as { killAssumption: string; killAssumptionTestGuidance: string };
      idea.phase1Data.killAssumption = killAssumption;
      idea.phase1Data.killAssumptionTestGuidance = killAssumptionTestGuidance;
    }

    // Cascade invalidation (Story 7.1): Phase 1 edit invalidates Phase 2 & 3
    // Only invalidate if they were previously generated or confirmed
    const phase2Status = idea.phaseStatus.phase2;
    const phase3Status = idea.phaseStatus.phase3;

    if (phase2Status === 'generated' || phase2Status === 'confirmed') {
      idea.phaseStatus.phase2 = 'invalidated';
    }
    if (phase3Status === 'generated' || phase3Status === 'confirmed') {
      idea.phaseStatus.phase3 = 'invalidated';
    }

    // Increment version
    idea.version = (idea.version || 1) + 1;
    await idea.save();

    // Create version for section edit (Story 5.1 + 6.4)
    await Version.createVersion(
      idea._id,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
      },
      'edit',
      `Refined ${sectionName} section`
    );

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        title: idea.title,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        version: idea.version,
        updatedAt: idea.updatedAt,
        refinedSection: sectionName,
      },
    });
  } catch (error) {
    console.error('Refine section error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to refine section',
      },
    });
  }
};

/**
 * Helper function to generate refined section content based on feedback
 * For MVP: Template-based with keyword extraction from feedback
 * Future: AI-powered refinement
 */
function generateRefinedSection(
  sectionName: string,
  title: string,
  description: string,
  feedback: string,
  currentData: any
) {
  const feedbackLower = feedback.toLowerCase();

  // Extract key themes from feedback
  const isB2B = feedbackLower.includes('b2b') || feedbackLower.includes('business') || feedbackLower.includes('enterprise');
  const isB2C = feedbackLower.includes('b2c') || feedbackLower.includes('consumer') || feedbackLower.includes('user');
  const focusEurope = feedbackLower.includes('europe') || feedbackLower.includes('eu');
  const focusAsia = feedbackLower.includes('asia') || feedbackLower.includes('apac');
  const emphasizePrice = feedbackLower.includes('price') || feedbackLower.includes('cost') || feedbackLower.includes('afford');
  const emphasizeSpeed = feedbackLower.includes('fast') || feedbackLower.includes('quick') || feedbackLower.includes('speed');
  const emphasizeSecurity = feedbackLower.includes('secure') || feedbackLower.includes('privacy') || feedbackLower.includes('safe');

  switch (sectionName) {
    case 'cleanSummary':
      const audience = isB2B ? 'businesses and enterprises' : isB2C ? 'consumers' : 'users';
      const region = focusEurope ? ' in the European market' : focusAsia ? ' across Asia-Pacific' : '';
      const value = emphasizePrice ? 'cost-effective' : emphasizeSpeed ? 'fast and efficient' : emphasizeSecurity ? 'secure and private' : 'innovative';
      return `${title} is a ${value} solution designed for ${audience}${region}. ${description.substring(0, 100)}... Our focus is on delivering ${feedback.substring(0, 50)}... to help our target market succeed.`;

    case 'marketFeasibility':
      const marketSize = isB2B ? '$800B+ global enterprise software market' :
                        focusEurope ? '$250B+ European digital market' :
                        focusAsia ? '$500B+ Asia-Pacific technology market' :
                        '$350B+ addressable market opportunity';
      const growth = emphasizeSpeed ? '30%+ CAGR driven by rapid digital adoption' :
                    '20-25% annual growth expected in target segments';
      return {
        marketSize,
        growthTrajectory: growth,
        keyTrends: [
          isB2B ? 'Enterprise digital transformation accelerating' : 'Consumer behavior shift to digital-first',
          focusEurope ? 'European regulatory compliance driving demand' : 'Global market consolidation',
          emphasizeSecurity ? 'Privacy and security concerns driving adoption' : 'User experience expectations rising',
          'Platform economy growth continues',
        ],
        timing: 'Now' as const,
      };

    case 'competitiveAnalysis':
      return [
        {
          name: isB2B ? 'Enterprise Incumbents' : 'Market Leaders',
          difference: isB2B ? 'Complex enterprise solutions with long sales cycles' : 'Generic mass-market approach',
          advantage: `${title} provides ${emphasizeSpeed ? 'faster implementation' : emphasizePrice ? 'better value' : 'superior user experience'} based on ${feedback.substring(0, 30)}...`,
        },
        {
          name: 'Traditional Competitors',
          difference: emphasizeSecurity ? 'Legacy security models and compliance gaps' : 'Outdated technology stack',
          advantage: `Modern architecture with ${emphasizeSecurity ? 'built-in security and compliance' : 'seamless integration capabilities'}`,
        },
        {
          name: 'Emerging Players',
          difference: focusEurope || focusAsia ? 'US-centric approach' : 'Limited feature set',
          advantage: `${focusEurope ? 'European market expertise' : focusAsia ? 'Asia-Pacific localization' : 'Comprehensive feature coverage'}`,
        },
      ];

    case 'killAssumption':
      const killAudience = isB2B ? 'enterprise customers' : isB2C ? 'consumers' : 'users';
      const assumption = isB2B
        ? `Assumes enterprise decision-makers will prioritize ${emphasizeSpeed ? 'speed of implementation' : emphasizePrice ? 'cost savings' : 'this solution'} over incumbent relationships and that procurement cycles can be shortened.`
        : `Assumes target ${killAudience} will ${emphasizePrice ? 'pay for a premium solution' : 'switch from existing habits'} and that ${feedback.substring(0, 40)}... is a validated pain point.`;

      const guidance = isB2B
        ? `Validate by: (1) Securing 5+ pilot customers, (2) Measuring ${emphasizeSpeed ? 'implementation time' : 'ROI metrics'}, (3) Getting procurement team buy-in from 3+ prospects.`
        : `Validate by: (1) Running targeted ads to measure intent, (2) Conducting ${isB2C ? '30+' : '20+'} user interviews, (3) Testing willingness to ${emphasizePrice ? 'pay premium pricing' : 'change behavior'}.`;

      return { killAssumption: assumption, killAssumptionTestGuidance: guidance };

    default:
      return currentData[sectionName];
  }
}

/**
 * Helper function to generate Phase 1 content (MVP template-based)
 * In future: Replace with AI generation
 */
function generatePhase1Content(title: string, description: string) {
  // Extract keywords from description for template generation
  const words = description.toLowerCase().split(/\s+/);
  const hasApp = words.some(w => ['app', 'application', 'platform', 'software', 'saas'].includes(w));
  const hasMarketplace = words.some(w => ['marketplace', 'market', 'store', 'shop'].includes(w));
  const hasAI = words.some(w => ['ai', 'artificial', 'intelligence', 'ml', 'machine', 'learning'].includes(w));
  const hasB2B = words.some(w => ['b2b', 'business', 'enterprise', 'corporate'].includes(w));
  const hasB2C = words.some(w => ['b2c', 'consumer', 'user', 'customer', 'people'].includes(w));

  // Generate clean summary
  const cleanSummary = `${title} is a ${hasAI ? 'AI-powered ' : ''}${hasApp ? 'platform ' : 'solution '}that ${description.substring(0, 150)}${description.length > 150 ? '...' : ''}. It aims to serve ${hasB2B ? 'businesses' : hasB2C ? 'consumers' : 'users'} by providing innovative solutions in this space.`;

  // Generate market feasibility
  const marketFeasibility = {
    marketSize: hasAI ? '$150B+ global AI market by 2026' :
                hasMarketplace ? '$7T+ global e-commerce market' :
                hasB2B ? '$500B+ B2B software market' :
                '$200B+ consumer technology market',
    growthTrajectory: hasAI ? '25%+ CAGR through 2027' :
                      hasMarketplace ? '15% CAGR through 2026' :
                      '12-18% annual growth expected',
    keyTrends: [
      hasAI ? 'Rapid AI adoption across industries' : 'Digital transformation acceleration',
      hasB2B ? 'Enterprise automation demand growing' : 'Consumer digital behavior shift',
      'Increased focus on user experience',
      hasMarketplace ? 'Rise of vertical marketplaces' : 'Platform consolidation trend',
    ],
    timing: 'Now' as const,
  };

  // Generate competitive analysis
  const competitiveAnalysis = [
    {
      name: hasAI ? 'OpenAI/ChatGPT' : hasMarketplace ? 'Amazon/eBay' : 'Established Market Leaders',
      difference: 'Broad, generic approach serving mass market',
      advantage: `${title} offers a more focused, specialized solution for the target audience`,
    },
    {
      name: hasB2B ? 'Salesforce/HubSpot' : 'Traditional Competitors',
      difference: 'Legacy systems with complex onboarding',
      advantage: 'Modern, intuitive user experience with faster time-to-value',
    },
    {
      name: 'Emerging Startups',
      difference: 'Limited features or narrow focus',
      advantage: 'Comprehensive solution with unique value proposition',
    },
  ];

  // Generate kill assumption with test guidance
  const killAssumption = hasB2B
    ? `Assumes target businesses will pay $${Math.floor(Math.random() * 500 + 100)}/month for this solution and that decision-makers can be reached through targeted outreach.`
    : `Assumes users will actively adopt ${title} over existing alternatives and that the value proposition is compelling enough to drive organic growth.`;

  const killAssumptionTestGuidance = hasB2B
    ? 'Validate by: (1) Conducting 10+ discovery calls with target decision-makers, (2) Testing willingness to pay with a landing page and pricing table, (3) Measuring sign-up conversion rates.'
    : 'Validate by: (1) Running a landing page test with 500+ visitors, (2) Conducting 20+ user interviews to confirm pain points, (3) Building a waitlist to gauge demand.';

  return {
    cleanSummary,
    marketFeasibility,
    competitiveAnalysis,
    killAssumption,
    killAssumptionTestGuidance,
    generatedAt: new Date(),
  };
}

/**
 * Get Version History - Story 5.2 & 5.3
 * GET /api/v1/ideas/:id/versions
 */
export const getVersionHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Verify user owns this idea
    const idea = await Idea.findOne({ _id: id, userId: req.userId });
    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Get version history
    const { versions, total, pages } = await Version.getHistory(idea._id, page, limit);

    res.status(200).json({
      success: true,
      data: {
        versions: versions.map(v => ({
          versionNumber: v.versionNumber,
          isActive: v.isActive,
          changeType: v.changeType,
          changeSummary: v.changeSummary,
          createdAt: v.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    console.error('Get version history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch version history',
      },
    });
  }
};

/**
 * Get Specific Version - Story 5.4
 * GET /api/v1/ideas/:id/versions/:versionNumber
 */
export const getVersion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, versionNumber } = req.params;

    // Verify user owns this idea
    const idea = await Idea.findOne({ _id: id, userId: req.userId });
    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Get specific version
    const version = await Version.findOne({
      ideaId: id,
      versionNumber: parseInt(versionNumber),
    });

    if (!version) {
      res.status(404).json({
        success: false,
        error: {
          code: 'VERSION_NOT_FOUND',
          message: `Version ${versionNumber} not found`,
        },
      });
      return;
    }

    // Get total version count
    const totalVersions = await Version.countDocuments({ ideaId: id });

    res.status(200).json({
      success: true,
      data: {
        version: {
          versionNumber: version.versionNumber,
          isActive: version.isActive,
          title: version.title,
          description: version.description,
          phase: version.phase,
          phaseStatus: version.phaseStatus,
          phase1Data: version.phase1Data,
          phase2Data: version.phase2Data,
          phase3Data: version.phase3Data,
          changeType: version.changeType,
          changeSummary: version.changeSummary,
          createdAt: version.createdAt,
        },
        totalVersions,
        isReadOnly: !version.isActive,
      },
    });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch version',
      },
    });
  }
};

/**
 * Compare Two Versions - Story 5.5
 * GET /api/v1/ideas/:id/versions/compare?v1=1&v2=2
 */
export const compareVersions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const v1 = parseInt(req.query.v1 as string);
    const v2 = parseInt(req.query.v2 as string);

    if (!v1 || !v2) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Both v1 and v2 query parameters are required',
        },
      });
      return;
    }

    // Verify user owns this idea
    const idea = await Idea.findOne({ _id: id, userId: req.userId });
    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Get both versions
    const [version1, version2] = await Promise.all([
      Version.findOne({ ideaId: id, versionNumber: v1 }),
      Version.findOne({ ideaId: id, versionNumber: v2 }),
    ]);

    if (!version1 || !version2) {
      res.status(404).json({
        success: false,
        error: {
          code: 'VERSION_NOT_FOUND',
          message: 'One or both versions not found',
        },
      });
      return;
    }

    // Generate diff
    const diff = generateDiff(version1, version2);

    res.status(200).json({
      success: true,
      data: {
        version1: {
          versionNumber: version1.versionNumber,
          createdAt: version1.createdAt,
          changeSummary: version1.changeSummary,
        },
        version2: {
          versionNumber: version2.versionNumber,
          createdAt: version2.createdAt,
          changeSummary: version2.changeSummary,
        },
        diff,
      },
    });
  } catch (error) {
    console.error('Compare versions error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to compare versions',
      },
    });
  }
};

/**
 * Generate Phase 2 Analysis - Story 8.1-8.4
 * POST /api/v1/ideas/:id/generate/phase2
 *
 * Generates:
 * - Business Model (customer segments, value proposition, revenue, costs, partnerships, resources)
 * - Strategy (customer acquisition, pricing, growth, milestones)
 * - Structural Risks (market, business model, scaling, dependency risks)
 * - Operational Risks (team, resource, execution, regulatory risks)
 */
export const generatePhase2 = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await Idea.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Check if Phase 1 is confirmed (required to access Phase 2)
    if (idea.phaseStatus.phase1 !== 'confirmed') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_LOCKED',
          message: 'Phase 1 must be confirmed before generating Phase 2.',
        },
      });
      return;
    }

    // Check if Phase 2 is already confirmed (locked)
    if (idea.phaseStatus.phase2 === 'confirmed') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_LOCKED',
          message: 'Phase 2 is already confirmed. Create a new version to regenerate.',
        },
      });
      return;
    }

    // Generate Phase 2 content using Phase 1 data
    const phase2Data = generatePhase2Content(idea.title, idea.description, idea.phase1Data);

    // Update idea with Phase 2 data
    idea.phase2Data = phase2Data;
    idea.phaseStatus.phase2 = 'generated';
    idea.phase = 'Phase 2';

    // Cascade invalidation: Regenerating Phase 2 invalidates Phase 3
    const phase3Status = idea.phaseStatus.phase3;
    if (phase3Status === 'generated' || phase3Status === 'confirmed') {
      idea.phaseStatus.phase3 = 'invalidated';
    }

    idea.version = (idea.version || 1) + 1;
    await idea.save();

    // Create version for phase generation
    await Version.createVersion(
      idea._id,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
      },
      'phase2_generated',
      'Phase 2 business model analysis generated'
    );

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        version: idea.version,
        updatedAt: idea.updatedAt,
      },
    });
  } catch (error) {
    console.error('Generate Phase 2 error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate Phase 2 analysis',
      },
    });
  }
};

/**
 * Confirm Phase 2 - Story 8.6
 * POST /api/v1/ideas/:id/confirm/phase2
 *
 * Locks Phase 2 and enables Phase 3
 */
export const confirmPhase2 = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await Idea.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Check if Phase 2 has been generated
    if (idea.phaseStatus.phase2 === 'pending' || idea.phaseStatus.phase2 === 'locked') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_NOT_GENERATED',
          message: 'Phase 2 must be generated before confirming.',
        },
      });
      return;
    }

    // Check if Phase 2 is already confirmed
    if (idea.phaseStatus.phase2 === 'confirmed') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_ALREADY_CONFIRMED',
          message: 'Phase 2 is already confirmed.',
        },
      });
      return;
    }

    // Confirm Phase 2 and unlock Phase 3
    idea.phaseStatus.phase2 = 'confirmed';
    idea.phaseStatus.phase3 = 'pending';
    if (idea.phase2Data) {
      idea.phase2Data.confirmedAt = new Date();
    }
    idea.version = (idea.version || 1) + 1;
    await idea.save();

    // Create version for phase confirmation
    await Version.createVersion(
      idea._id,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
      },
      'phase2_confirmed',
      'Phase 2 confirmed'
    );

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        title: idea.title,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase2Data: idea.phase2Data,
        version: idea.version,
        updatedAt: idea.updatedAt,
        message: 'Phase 2 confirmed. Phase 3 is now available.',
      },
    });
  } catch (error) {
    console.error('Confirm Phase 2 error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to confirm Phase 2',
      },
    });
  }
};

/**
 * POST /api/v1/ideas/:id/generate/phase3
 * Generate Phase 3 pitch deck content
 * Story 9.1-9.2
 *
 * Generates:
 * - 10-slide investor pitch deck
 * - Changelog comparing to previous version
 *
 * Requirements:
 * - Phase 2 must be confirmed
 * - Phase 3 not already confirmed (locked)
 */
export const generatePhase3 = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const idea = await Idea.findOne({ _id: id, userId });

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Check Phase 2 is confirmed
    const phase2Status = idea.phaseStatus?.phase2;
    if (phase2Status !== 'confirmed') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_NOT_READY',
          message: 'Phase 2 must be confirmed before generating Phase 3',
        },
      });
      return;
    }

    // Check Phase 3 is not already confirmed
    const phase3Status = idea.phaseStatus?.phase3;
    if (phase3Status === 'confirmed') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_LOCKED',
          message: 'Phase 3 is already confirmed and locked',
        },
      });
      return;
    }

    // Generate Phase 3 content
    const phase3Data = generatePhase3Content(
      idea.title,
      idea.description,
      idea.phase1Data,
      idea.phase2Data
    );

    // Update idea
    idea.phase = 'Phase 3';
    idea.phaseStatus.phase3 = 'generated';
    idea.phase3Data = phase3Data;
    idea.version += 1;

    await idea.save();

    // Create version snapshot
    await Version.createVersion(
      idea._id as mongoose.Types.ObjectId,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        phase3Data: idea.phase3Data,
      },
      'phase3_generated',
      'Generated Phase 3 pitch deck content'
    );

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        phase3Data: idea.phase3Data,
        version: idea.version,
        updatedAt: idea.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error generating Phase 3:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate Phase 3',
      },
    });
  }
};

/**
 * POST /api/v1/ideas/:id/confirm/phase3
 * Confirm and lock Phase 3 (complete idea validation)
 * Story 9.5
 *
 * Requirements:
 * - Phase 3 must be generated
 * - Phase 3 not already confirmed
 */
export const confirmPhase3 = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const idea = await Idea.findOne({ _id: id, userId });

    if (!idea) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Idea not found',
        },
      });
      return;
    }

    // Check Phase 3 is generated
    const phase3Status = idea.phaseStatus?.phase3;
    if (phase3Status !== 'generated') {
      res.status(400).json({
        success: false,
        error: {
          code: 'PHASE_NOT_GENERATED',
          message: phase3Status === 'confirmed'
            ? 'Phase 3 is already confirmed'
            : 'Phase 3 must be generated before confirming',
        },
      });
      return;
    }

    // Confirm Phase 3
    idea.phaseStatus.phase3 = 'confirmed';
    if (idea.phase3Data) {
      idea.phase3Data.confirmedAt = new Date();
    }
    idea.version += 1;

    await idea.save();

    // Create version snapshot
    await Version.createVersion(
      idea._id as mongoose.Types.ObjectId,
      {
        title: idea.title,
        description: idea.description,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase1Data: idea.phase1Data,
        phase2Data: idea.phase2Data,
        phase3Data: idea.phase3Data,
      },
      'phase3_confirmed',
      'Confirmed Phase 3 - Pitch deck complete'
    );

    res.status(200).json({
      success: true,
      data: {
        id: idea._id,
        title: idea.title,
        phase: idea.phase,
        phaseStatus: idea.phaseStatus,
        phase3Data: idea.phase3Data,
        version: idea.version,
        updatedAt: idea.updatedAt,
        message: 'Phase 3 confirmed. Your startup validation is complete!',
      },
    });
  } catch (error) {
    console.error('Error confirming Phase 3:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to confirm Phase 3',
      },
    });
  }
};

/**
 * Helper function to generate Phase 3 pitch deck content
 */
function generatePhase3Content(title: string, description: string, phase1Data: any, phase2Data: any) {
  const descLower = description.toLowerCase();
  const isB2B = descLower.includes('b2b') || descLower.includes('business') || descLower.includes('enterprise');
  const isSaaS = descLower.includes('saas') || descLower.includes('subscription') || descLower.includes('platform');
  const hasAI = descLower.includes('ai') || descLower.includes('artificial intelligence') || descLower.includes('machine learning');

  // Generate 10-slide pitch deck
  const pitchDeck = {
    titleSlide: {
      slideNumber: 1,
      title: title,
      content: `${phase1Data?.cleanSummary || description}\n\nTransforming ${isB2B ? 'enterprise' : 'consumer'} experiences through ${hasAI ? 'AI-powered' : 'innovative'} solutions.`,
      speakerNotes: `Introduce the company and capture attention with a compelling one-liner. Emphasize the transformative potential of the solution.`,
    },
    problemSlide: {
      slideNumber: 2,
      title: 'The Problem',
      content: `Today's ${isB2B ? 'businesses' : 'consumers'} face critical challenges:\n\n• Inefficient processes wasting time and resources\n• Legacy solutions failing to meet modern expectations\n• Growing demand for ${hasAI ? 'intelligent automation' : 'seamless experiences'}\n• ${phase1Data?.killAssumption ? `Key assumption: ${phase1Data.killAssumption.substring(0, 150)}...` : 'Increasing complexity without adequate tools'}`,
      speakerNotes: `Paint a vivid picture of the pain points. Use specific examples and data points. Make the audience feel the problem.`,
    },
    solutionSlide: {
      slideNumber: 3,
      title: 'Our Solution',
      content: `${title} provides:\n\n• ${phase2Data?.businessModel?.valueProposition?.split('.')[0] || `A comprehensive ${hasAI ? 'AI-powered' : 'modern'} platform`}\n• ${hasAI ? 'Intelligent automation that learns and adapts' : 'Streamlined workflows that save time'}\n• ${isSaaS ? 'Cloud-native architecture for instant deployment' : 'Enterprise-grade reliability and security'}\n• ${isB2B ? 'Seamless integration with existing tools' : 'Intuitive user experience for everyone'}`,
      speakerNotes: `Demonstrate how your solution directly addresses each problem. Use visuals or demos if possible. Keep it simple and memorable.`,
    },
    marketOpportunitySlide: {
      slideNumber: 4,
      title: 'Market Opportunity',
      content: `${phase1Data?.marketFeasibility?.marketSize || '$500B+ addressable market'}\n\n• Growth: ${phase1Data?.marketFeasibility?.growthTrajectory || '15-20% annual growth'}\n• Timing: ${phase1Data?.marketFeasibility?.timing || 'Now'} - Market conditions are ideal\n• Key Trends:\n  - ${phase1Data?.marketFeasibility?.keyTrends?.[0] || 'Digital transformation acceleration'}\n  - ${phase1Data?.marketFeasibility?.keyTrends?.[1] || 'Remote work driving demand'}\n  - ${phase1Data?.marketFeasibility?.keyTrends?.[2] || 'AI adoption reaching mainstream'}`,
      speakerNotes: `Validate the market size with credible sources. Explain why NOW is the right time. Show the trend lines moving in your favor.`,
    },
    businessModelSlide: {
      slideNumber: 5,
      title: 'Business Model',
      content: `Revenue Streams:\n${phase2Data?.businessModel?.revenueStreams || 'SaaS subscriptions, Enterprise contracts, Professional services'}\n\nUnit Economics:\n• Customer Segments: ${phase2Data?.businessModel?.customerSegments?.substring(0, 100) || 'Enterprise and mid-market companies'}...\n• LTV/CAC Target: ${isB2B ? '5:1' : '3:1'}\n• Gross Margin: ${isSaaS ? '70-80%' : '50-60%'}`,
      speakerNotes: `Show you understand how to make money. Present clear unit economics. Demonstrate path to profitability.`,
    },
    tractionSlide: {
      slideNumber: 6,
      title: 'Traction & Milestones',
      content: `Key Milestones:\n\n${phase2Data?.strategy?.keyMilestones?.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n') || '1. Product launch\n2. First paying customers\n3. $100K ARR\n4. Series A ready'}\n\nGrowth Strategy:\n${phase2Data?.strategy?.growthStrategy?.substring(0, 200) || 'Focused customer acquisition through inbound and outbound channels'}...`,
      speakerNotes: `Show momentum and proof points. Highlight key wins and customer logos. Present a clear roadmap to next milestones.`,
    },
    competitionSlide: {
      slideNumber: 7,
      title: 'Competitive Landscape',
      content: `Our Differentiation:\n\n${phase1Data?.competitiveAnalysis?.slice(0, 3).map((c: any) => `vs ${c.name}:\n• Their approach: ${c.difference}\n• Our advantage: ${c.advantage}`).join('\n\n') || '• vs Established Players: More agile and focused\n• vs Startups: Better technology and team\n• vs Status Quo: 10x improvement in efficiency'}`,
      speakerNotes: `Don't bash competitors. Show you understand the landscape. Emphasize your unique positioning and sustainable advantages.`,
    },
    teamSlide: {
      slideNumber: 8,
      title: 'The Team',
      content: `Founding Team:\n\n• CEO - Vision & Strategy\n  ${isB2B ? 'Enterprise sales background, domain expertise' : 'Consumer product experience, growth hacking'}\n\n• CTO - Technology & Product\n  ${hasAI ? 'AI/ML expertise, scaled systems at prior companies' : 'Full-stack engineering, shipped products at scale'}\n\n• [Key Hire] - ${isB2B ? 'Sales/Customer Success' : 'Growth/Marketing'}\n  Building pipeline and relationships\n\nAdvisors: Industry experts and successful founders`,
      speakerNotes: `Highlight relevant experience and why THIS team can win. Show complementary skills. Mention notable advisors or investors.`,
    },
    financialsSlide: {
      slideNumber: 9,
      title: 'Financials & Projections',
      content: `3-Year Projection:\n\n• Year 1: ${isB2B ? '$500K ARR' : '50K users'} - Product-market fit\n• Year 2: ${isB2B ? '$2M ARR' : '200K users'} - Scale go-to-market\n• Year 3: ${isB2B ? '$8M ARR' : '1M users'} - Market expansion\n\nKey Assumptions:\n• ${phase2Data?.strategy?.customerAcquisition?.substring(0, 100) || 'Efficient customer acquisition through multiple channels'}...\n• ${isSaaS ? 'Net revenue retention > 120%' : 'Strong organic growth and referrals'}`,
      speakerNotes: `Be realistic but ambitious. Show you understand the drivers of growth. Prepare to defend assumptions.`,
    },
    askSlide: {
      slideNumber: 10,
      title: 'The Ask',
      content: `Raising: $${isB2B ? '2-3M Seed' : '1-1.5M Pre-seed'}\n\nUse of Funds:\n• 50% - Product & Engineering\n• 30% - ${isB2B ? 'Sales & Customer Success' : 'Marketing & Growth'}\n• 20% - Operations & G&A\n\n18-Month Runway to:\n• ${phase2Data?.strategy?.keyMilestones?.[2] || 'Significant revenue milestone'}\n• Clear Series A metrics\n\nLet's build the future of ${hasAI ? 'AI-powered' : 'innovative'} ${isB2B ? 'enterprise' : 'consumer'} solutions together.`,
      speakerNotes: `Be specific about the ask. Show clear use of funds. End with a compelling call to action.`,
    },
  };

  // Generate changelog (what's new since last version)
  const changelog = [
    {
      section: 'Pitch Deck',
      changeType: 'added' as const,
      description: 'Generated investor-ready 10-slide pitch deck',
    },
    {
      section: 'Problem Statement',
      changeType: 'added' as const,
      description: 'Crystallized market problem based on Phase 1 analysis',
    },
    {
      section: 'Financial Projections',
      changeType: 'added' as const,
      description: 'Created 3-year revenue projections based on business model',
    },
    {
      section: 'Investment Ask',
      changeType: 'added' as const,
      description: 'Defined funding requirements and use of funds',
    },
  ];

  return {
    pitchDeck,
    changelog,
    generatedAt: new Date(),
  };
}

/**
 * Helper function to generate Phase 2 content (MVP template-based)
 * Uses Phase 1 data to generate business model, strategy, and risks
 */
function generatePhase2Content(title: string, description: string, phase1Data: any) {
  const descLower = description.toLowerCase();
  const isB2B = descLower.includes('b2b') || descLower.includes('business') || descLower.includes('enterprise');
  const isB2C = descLower.includes('b2c') || descLower.includes('consumer');
  const isSaaS = descLower.includes('saas') || descLower.includes('subscription') || descLower.includes('platform');
  const isMarketplace = descLower.includes('marketplace') || descLower.includes('platform');
  const hasAI = descLower.includes('ai') || descLower.includes('artificial intelligence') || descLower.includes('machine learning');

  // Generate Business Model
  const businessModel = {
    customerSegments: isB2B
      ? `Primary: Mid-to-large enterprises (500+ employees) in target industries seeking ${hasAI ? 'AI-powered' : 'digital'} solutions. Secondary: Fast-growing startups requiring scalable ${title.toLowerCase()} capabilities.`
      : `Primary: Tech-savvy consumers aged 25-45 seeking ${hasAI ? 'intelligent' : 'modern'} solutions. Secondary: Early adopters and power users who value innovation and efficiency.`,
    valueProposition: `${title} delivers ${hasAI ? 'AI-enhanced' : 'streamlined'} ${phase1Data?.cleanSummary?.substring(0, 100) || description.substring(0, 100)}... Key differentiators: (1) ${isSaaS ? 'Cloud-native architecture' : 'Modern user experience'}, (2) ${hasAI ? 'Intelligent automation' : 'Seamless integration'}, (3) ${isB2B ? 'Enterprise-grade security' : 'Consumer-friendly design'}.`,
    revenueStreams: isSaaS
      ? `Primary: SaaS subscriptions (${isB2B ? '$99-999/month per seat' : '$9.99-29.99/month'}). Secondary: ${isB2B ? 'Enterprise contracts ($10K-100K/year)' : 'Premium features and add-ons'}. Tertiary: ${isMarketplace ? 'Transaction fees (2-5%)' : 'Professional services and implementation'}.`
      : isMarketplace
        ? `Primary: Transaction fees (5-15% per transaction). Secondary: Featured listings and promotions. Tertiary: Premium seller tools and analytics.`
        : `Primary: ${isB2B ? 'License fees and annual contracts' : 'Freemium with premium upgrades'}. Secondary: ${isB2B ? 'Implementation and support services' : 'In-app purchases and premium content'}.`,
    costStructure: `Major costs: (1) Engineering and product development (40-50% of budget), (2) ${isB2B ? 'Sales and account management' : 'Marketing and user acquisition'} (20-30%), (3) Infrastructure and cloud services (15-20%), (4) Customer support and success (10-15%). Initial focus on product-market fit before scaling operations.`,
    keyPartnerships: isB2B
      ? `Technology partners (cloud providers, integration platforms), Channel partners (system integrators, consultants), Industry associations, ${hasAI ? 'AI/ML research institutions' : 'Technology vendors'}.`
      : `Platform partners (app stores, distribution), Marketing partners (influencers, affiliates), Technology partners (payment processors, analytics), ${hasAI ? 'AI infrastructure providers' : 'Content and data providers'}.`,
    keyResources: `(1) Engineering talent (${hasAI ? 'ML engineers, data scientists' : 'full-stack developers'}), (2) ${isB2B ? 'Sales and customer success team' : 'Growth and marketing team'}, (3) ${hasAI ? 'Proprietary AI models and training data' : 'Product and design capabilities'}, (4) Cloud infrastructure and scalable architecture.`,
  };

  // Generate Strategy
  const strategy = {
    customerAcquisition: isB2B
      ? `Inbound: Content marketing, SEO, thought leadership. Outbound: Targeted sales outreach to ${phase1Data?.marketFeasibility?.marketSize || 'target market'}. Events: Industry conferences and webinars. Partnerships: Channel partners and resellers. Target CAC: $${isB2B ? '1,000-5,000' : '50-200'} per customer.`
      : `Digital: Paid social (Meta, TikTok), search (Google), and app store optimization. Organic: Referral programs, viral features, content marketing. Partnerships: Influencer collaborations and cross-promotions. Target CAC: $${isB2C ? '10-50' : '25-100'} per user.`,
    pricingStrategy: isSaaS
      ? `Tiered pricing model: Starter (free/low-cost for adoption), Professional (${isB2B ? '$99-299/month' : '$9.99/month'}), Enterprise (${isB2B ? 'custom pricing' : '$29.99/month'}). Focus on value-based pricing tied to customer outcomes. Annual billing discount: 20%.`
      : `${isMarketplace ? 'Transaction-based pricing (5-15% fee) with optional premium subscriptions' : 'Freemium model with premium upgrades ($4.99-19.99/month)'}. Competitive positioning: ${phase1Data?.competitiveAnalysis?.[0]?.advantage || 'Better value than alternatives'}.`,
    growthStrategy: `Phase 1 (0-6 months): Product-market fit with ${isB2B ? '10-20 pilot customers' : '1,000-5,000 early adopters'}. Phase 2 (6-18 months): Scale ${isB2B ? 'sales team and expand verticals' : 'user acquisition and optimize conversion'}. Phase 3 (18+ months): ${isMarketplace ? 'Geographic expansion and category growth' : 'Platform expansion and ecosystem development'}. Target: ${phase1Data?.marketFeasibility?.growthTrajectory || '20%+ monthly growth'}.`,
    keyMilestones: [
      `Month 3: ${isB2B ? '5 paying customers' : '1,000 active users'}`,
      `Month 6: ${isB2B ? '$50K ARR' : '10,000 active users'}`,
      `Month 12: ${isB2B ? '$250K ARR, 25 customers' : '50,000 active users, profitability path clear'}`,
      `Month 18: ${isB2B ? '$1M ARR, Series A ready' : '200,000 users, expansion markets identified'}`,
    ],
  };

  // Generate Structural Risks
  const structuralRisks = [
    {
      name: 'Market Risk',
      description: `The ${phase1Data?.marketFeasibility?.marketSize || 'target market'} may evolve differently than expected, with changing customer needs or competitive dynamics.`,
      implications: `Could require significant pivot. Mitigation: Continuous customer discovery, modular product architecture, diversified customer segments.`,
    },
    {
      name: 'Business Model Risk',
      description: isSaaS
        ? 'Unit economics may not support sustainable growth at current pricing levels.'
        : isMarketplace
          ? 'Chicken-and-egg problem: need both supply and demand simultaneously.'
          : 'Revenue model assumptions may not align with customer willingness to pay.',
      implications: `${isSaaS ? 'May need to adjust pricing or reduce CAC significantly' : isMarketplace ? 'High customer acquisition costs until critical mass' : 'May need to explore alternative monetization strategies'}. Mitigation: Early validation of pricing, focus on unit economics from day one.`,
    },
    {
      name: 'Scaling Risk',
      description: `Current architecture and team may not support 10x growth without significant investment.`,
      implications: `Growth could plateau or require major re-architecture. Mitigation: Build scalable infrastructure from start, plan hiring roadmap, document processes early.`,
    },
    {
      name: 'Competitive Risk',
      description: `Larger players (${phase1Data?.competitiveAnalysis?.[0]?.name || 'established competitors'}) could enter space or acquire competitors.`,
      implications: `Market share pressure, price competition. Mitigation: Build strong brand, focus on niche, create switching costs, move fast.`,
    },
  ];

  // Generate Operational Risks
  const operationalRisks = [
    {
      name: 'Team Risk',
      description: `Key person dependencies and potential skill gaps in ${hasAI ? 'AI/ML expertise' : 'technical leadership'}.`,
      implications: `Single points of failure could delay product development. Mitigation: Document knowledge, cross-train team, plan key hires, consider advisors.`,
    },
    {
      name: 'Resource Risk',
      description: `${isB2B ? 'Longer sales cycles may require more runway than planned' : 'User acquisition costs may exceed projections'}.`,
      implications: `May need to raise additional capital or reduce burn. Mitigation: Maintain 18-month runway, multiple funding options, clear path to profitability.`,
    },
    {
      name: 'Execution Risk',
      description: `${hasAI ? 'AI model performance and reliability challenges' : 'Product complexity may lead to longer development cycles'}.`,
      implications: `Delayed launch or underwhelming initial product. Mitigation: MVP mindset, rapid iteration, customer feedback loops, realistic timelines.`,
    },
    {
      name: 'Regulatory Risk',
      description: `${hasAI ? 'AI regulations and data privacy laws (GDPR, CCPA, AI Act)' : isB2B ? 'Industry-specific compliance requirements (SOC2, HIPAA if healthcare)' : 'Data privacy and consumer protection regulations'}.`,
      implications: `Could require additional investment in compliance or limit market access. Mitigation: Build compliance into product design, consult legal early, monitor regulatory developments.`,
    },
  ];

  return {
    businessModel,
    strategy,
    structuralRisks,
    operationalRisks,
    generatedAt: new Date(),
  };
}

/**
 * Helper function to generate diff between two versions
 */
function generateDiff(v1: any, v2: any) {
  const changes: Array<{
    field: string;
    type: 'added' | 'removed' | 'changed' | 'unchanged';
    oldValue?: string;
    newValue?: string;
  }> = [];

  // Compare title
  if (v1.title !== v2.title) {
    changes.push({
      field: 'title',
      type: 'changed',
      oldValue: v1.title,
      newValue: v2.title,
    });
  }

  // Compare description
  if (v1.description !== v2.description) {
    changes.push({
      field: 'description',
      type: 'changed',
      oldValue: v1.description,
      newValue: v2.description,
    });
  }

  // Compare phase
  if (v1.phase !== v2.phase) {
    changes.push({
      field: 'phase',
      type: 'changed',
      oldValue: v1.phase,
      newValue: v2.phase,
    });
  }

  // Compare phase1Data
  if (v1.phase1Data?.cleanSummary !== v2.phase1Data?.cleanSummary) {
    if (!v1.phase1Data?.cleanSummary && v2.phase1Data?.cleanSummary) {
      changes.push({
        field: 'phase1Data.cleanSummary',
        type: 'added',
        newValue: v2.phase1Data.cleanSummary,
      });
    } else if (v1.phase1Data?.cleanSummary && !v2.phase1Data?.cleanSummary) {
      changes.push({
        field: 'phase1Data.cleanSummary',
        type: 'removed',
        oldValue: v1.phase1Data.cleanSummary,
      });
    } else {
      changes.push({
        field: 'phase1Data.cleanSummary',
        type: 'changed',
        oldValue: v1.phase1Data?.cleanSummary,
        newValue: v2.phase1Data?.cleanSummary,
      });
    }
  }

  // Compare killAssumption
  if (v1.phase1Data?.killAssumption !== v2.phase1Data?.killAssumption) {
    if (!v1.phase1Data?.killAssumption && v2.phase1Data?.killAssumption) {
      changes.push({
        field: 'phase1Data.killAssumption',
        type: 'added',
        newValue: v2.phase1Data.killAssumption,
      });
    } else if (v1.phase1Data?.killAssumption && !v2.phase1Data?.killAssumption) {
      changes.push({
        field: 'phase1Data.killAssumption',
        type: 'removed',
        oldValue: v1.phase1Data.killAssumption,
      });
    } else {
      changes.push({
        field: 'phase1Data.killAssumption',
        type: 'changed',
        oldValue: v1.phase1Data?.killAssumption,
        newValue: v2.phase1Data?.killAssumption,
      });
    }
  }

  // Summary
  const summary = {
    totalChanges: changes.length,
    added: changes.filter(c => c.type === 'added').length,
    removed: changes.filter(c => c.type === 'removed').length,
    modified: changes.filter(c => c.type === 'changed').length,
  };

  return { changes, summary };
}
