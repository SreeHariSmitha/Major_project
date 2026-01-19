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
/**
 * Refine Section - Story 6.1-6.4
 * POST /api/v1/ideas/:id/sections/:sectionName
 *
 * Regenerates only the specified section based on user feedback
 */
export declare const refineSection: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get Version History - Story 5.2 & 5.3
 * GET /api/v1/ideas/:id/versions
 */
export declare const getVersionHistory: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get Specific Version - Story 5.4
 * GET /api/v1/ideas/:id/versions/:versionNumber
 */
export declare const getVersion: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Compare Two Versions - Story 5.5
 * GET /api/v1/ideas/:id/versions/compare?v1=1&v2=2
 */
export declare const compareVersions: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
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
export declare const generatePhase2: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Confirm Phase 2 - Story 8.6
 * POST /api/v1/ideas/:id/confirm/phase2
 *
 * Locks Phase 2 and enables Phase 3
 */
export declare const confirmPhase2: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
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
export declare const generatePhase3: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * POST /api/v1/ideas/:id/confirm/phase3
 * Confirm and lock Phase 3 (complete idea validation)
 * Story 9.5
 *
 * Requirements:
 * - Phase 3 must be generated
 * - Phase 3 not already confirmed
 */
export declare const confirmPhase3: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ideaController.d.ts.map