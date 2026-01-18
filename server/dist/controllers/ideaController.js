import { Idea } from '../models/Idea.js';
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
                phase1Confirmed: false,
                phase2Confirmed: false,
                phase3Confirmed: false,
            },
            version: 1,
            archived: false,
        });
        await idea.save();
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
                version: idea.version,
                archived: idea.archived,
                killAssumption: idea.killAssumption,
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
                version: idea.version,
                archived: idea.archived,
                killAssumption: idea.killAssumption,
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
        // Update idea
        const updateData = {};
        if (validatedData.title !== undefined)
            updateData.title = validatedData.title;
        if (validatedData.description !== undefined)
            updateData.description = validatedData.description;
        const idea = await Idea.findOneAndUpdate({ _id: id, userId: req.userId }, { $set: updateData }, { new: true }).lean();
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
//# sourceMappingURL=ideaController.js.map