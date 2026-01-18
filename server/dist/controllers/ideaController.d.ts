import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
/**
 * Create New Idea - Story 3.1
 * POST /api/v1/ideas
 */
export declare const createIdea: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * List All User Ideas - Story 3.2
 * GET /api/v1/ideas
 */
export declare const listIdeas: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get Idea Details - Story 3.5
 * GET /api/v1/ideas/:id
 */
export declare const getIdea: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update Idea - Future story
 * PUT /api/v1/ideas/:id
 */
export declare const updateIdea: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete Idea - Story 3.6
 * DELETE /api/v1/ideas/:id
 */
export declare const deleteIdea: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Archive Idea - Story 3.7
 * PATCH /api/v1/ideas/:id/archive
 */
export declare const archiveIdea: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Search Ideas - Story 3.12
 * GET /api/v1/ideas/search
 */
export declare const searchIdeas: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ideaController.d.ts.map