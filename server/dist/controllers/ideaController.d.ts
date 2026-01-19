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
export declare const generatePhase1: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Confirm Phase 1 - Story 4.6
 * POST /api/v1/ideas/:id/confirm/phase1
 *
 * Locks Phase 1 and enables Phase 2
 */
export declare const confirmPhase1: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ideaController.d.ts.map