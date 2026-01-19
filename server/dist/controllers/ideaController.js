import { Idea } from '../models/Idea.js';
import Version from '../models/Version.js';
import { z } from 'zod';
import { ZodError } from 'zod';
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
/**
 * Create New Idea - Story 3.1
 * POST /api/v1/ideas
 */
export const createIdea = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        // Validate input
        let validatedData;
        try {
            validatedData = CreateIdeaSchema.parse({ title, description });
        }
        catch (validationError) {
            if (validationError instanceof ZodError) {
                const details = {};
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
        await Version.createVersion(idea._id, {
            title: idea.title,
            description: idea.description,
            phase: idea.phase,
            phaseStatus: idea.phaseStatus,
        }, 'initial', 'Initial idea creation');
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
    }
    catch (error) {
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
export const listIdeas = async (req, res, next) => {
    try {
        const { archived, phase } = req.query;
        // Build filter
        const filter = { userId: req.userId };
        if (archived === 'true') {
            filter.archived = true;
        }
        else if (archived === 'false') {
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
            data: ideas.map((idea) => ({
                id: idea._id,
                userId: idea.userId,
                title: idea.title,
                description: idea.description,
                phase: idea.phase,
                phaseStatus: idea.phaseStatus,
                phase1Data: idea.phase1Data,
                version: idea.version,
                archived: idea.archived,
                killAssumption: idea.phase1Data?.killAssumption,
                createdAt: idea.createdAt,
                updatedAt: idea.updatedAt,
            })),
        });
    }
    catch (error) {
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
export const getIdea = async (req, res, next) => {
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
                version: idea.version,
                archived: idea.archived,
                killAssumption: idea.phase1Data?.killAssumption,
                createdAt: idea.createdAt,
                updatedAt: idea.updatedAt,
            },
        });
    }
    catch (error) {
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
export const updateIdea = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        // Validate input (optional fields)
        let validatedData;
        try {
            validatedData = UpdateIdeaSchema.parse({ title, description });
        }
        catch (validationError) {
            if (validationError instanceof ZodError) {
                const details = {};
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
        const changes = [];
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
            if (validatedData.title !== undefined)
                idea.title = validatedData.title;
            if (validatedData.description !== undefined)
                idea.description = validatedData.description;
            await idea.save();
            // Create new version (Story 5.1)
            await Version.createVersion(idea._id, {
                title: idea.title,
                description: idea.description,
                phase: idea.phase,
                phaseStatus: idea.phaseStatus,
                phase1Data: idea.phase1Data,
            }, 'edit', `Updated ${changes.join(' and ')}`);
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
    }
    catch (error) {
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
export const deleteIdea = async (req, res, next) => {
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
    }
    catch (error) {
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
export const archiveIdea = async (req, res, next) => {
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
        const idea = await Idea.findOneAndUpdate({ _id: id, userId: req.userId }, { $set: { archived } }, { new: true }).lean();
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
    }
    catch (error) {
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
export const searchIdeas = async (req, res, next) => {
    try {
        const { q } = req.query;
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
        // Search in title and description (case-insensitive)
        const searchRegex = new RegExp(q, 'i');
        const ideas = await Idea.find({
            userId: req.userId,
            archived: false,
            $or: [
                { title: searchRegex },
                { description: searchRegex },
            ],
        })
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({
            success: true,
            data: ideas.map((idea) => ({
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
            })),
        });
    }
    catch (error) {
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
export const generatePhase1 = async (req, res, next) => {
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
        idea.version = (idea.version || 1) + 1;
        await idea.save();
        // Create version for phase generation (Story 5.1)
        await Version.createVersion(idea._id, {
            title: idea.title,
            description: idea.description,
            phase: idea.phase,
            phaseStatus: idea.phaseStatus,
            phase1Data: idea.phase1Data,
        }, 'phase1_generated', 'Phase 1 analysis generated');
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
    }
    catch (error) {
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
export const confirmPhase1 = async (req, res, next) => {
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
        await Version.createVersion(idea._id, {
            title: idea.title,
            description: idea.description,
            phase: idea.phase,
            phaseStatus: idea.phaseStatus,
            phase1Data: idea.phase1Data,
        }, 'phase1_confirmed', 'Phase 1 confirmed');
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
    }
    catch (error) {
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
 * Helper function to generate Phase 1 content (MVP template-based)
 * In future: Replace with AI generation
 */
function generatePhase1Content(title, description) {
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
        timing: 'Now',
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
export const getVersionHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
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
    }
    catch (error) {
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
export const getVersion = async (req, res, next) => {
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
    }
    catch (error) {
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
export const compareVersions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const v1 = parseInt(req.query.v1);
        const v2 = parseInt(req.query.v2);
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
    }
    catch (error) {
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
 * Helper function to generate diff between two versions
 */
function generateDiff(v1, v2) {
    const changes = [];
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
        }
        else if (v1.phase1Data?.cleanSummary && !v2.phase1Data?.cleanSummary) {
            changes.push({
                field: 'phase1Data.cleanSummary',
                type: 'removed',
                oldValue: v1.phase1Data.cleanSummary,
            });
        }
        else {
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
        }
        else if (v1.phase1Data?.killAssumption && !v2.phase1Data?.killAssumption) {
            changes.push({
                field: 'phase1Data.killAssumption',
                type: 'removed',
                oldValue: v1.phase1Data.killAssumption,
            });
        }
        else {
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
//# sourceMappingURL=ideaController.js.map