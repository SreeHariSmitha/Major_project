import express from 'express';
import { createIdea, listIdeas, getIdea, updateIdea, deleteIdea, archiveIdea, searchIdeas, generatePhase1, confirmPhase1, } from '../controllers/ideaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
/**
 * Idea Routes
 * Base path: /api/v1/ideas
 */
const router = express.Router();
// All routes require authentication
router.use(authMiddleware);
/**
 * POST /api/v1/ideas
 * Create a new startup idea
 * Story 3.1
 *
 * Request body:
 * {
 *   title: string (required, max 200 chars)
 *   description: string (required, max 5000 chars)
 * }
 *
 * Success response (201):
 * {
 *   success: true,
 *   data: {
 *     id: string
 *     userId: string
 *     title: string
 *     description: string
 *     phase: "Phase 1"
 *     phaseStatus: { phase1Confirmed: false, ... }
 *     version: 1
 *     archived: false
 *     createdAt: Date
 *     updatedAt: Date
 *   }
 * }
 */
router.post('/', createIdea);
/**
 * GET /api/v1/ideas
 * List all user ideas
 * Story 3.2
 *
 * Query parameters:
 * - archived: "true" | "false" (optional - filter by archived status)
 * - phase: "Phase 1" | "Phase 2" | "Phase 3" (optional - filter by phase)
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: string
 *       userId: string
 *       title: string
 *       description: string
 *       phase: string
 *       phaseStatus: object
 *       version: number
 *       archived: boolean
 *       killAssumption?: string
 *       createdAt: Date
 *       updatedAt: Date
 *     }
 *   ]
 * }
 */
router.get('/', listIdeas);
/**
 * GET /api/v1/ideas/search
 * Search ideas by title and description
 * Story 3.12
 *
 * Query parameters:
 * - q: string (required - search query)
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: [...]
 * }
 */
router.get('/search', searchIdeas);
/**
 * GET /api/v1/ideas/:id
 * Get idea details
 * Story 3.5
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     id: string
 *     userId: string
 *     title: string
 *     description: string
 *     phase: string
 *     phaseStatus: object
 *     version: number
 *     archived: boolean
 *     killAssumption?: string
 *     createdAt: Date
 *     updatedAt: Date
 *   }
 * }
 *
 * Error responses:
 * 404 - Idea not found
 */
router.get('/:id', getIdea);
/**
 * PUT /api/v1/ideas/:id
 * Update idea
 *
 * Request body:
 * {
 *   title?: string (max 200 chars)
 *   description?: string (max 5000 chars)
 * }
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {...}
 * }
 */
router.put('/:id', updateIdea);
/**
 * DELETE /api/v1/ideas/:id
 * Delete idea permanently
 * Story 3.6
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     message: "Idea deleted successfully"
 *   }
 * }
 *
 * Error responses:
 * 404 - Idea not found
 */
router.delete('/:id', deleteIdea);
/**
 * PATCH /api/v1/ideas/:id/archive
 * Archive or restore an idea
 * Story 3.7
 *
 * Request body:
 * {
 *   archived: boolean (required)
 * }
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {...}
 * }
 *
 * Error responses:
 * 404 - Idea not found
 */
router.patch('/:id/archive', archiveIdea);
/**
 * POST /api/v1/ideas/:id/generate/phase1
 * Generate Phase 1 validation analysis
 * Story 4.1-4.4
 *
 * Generates:
 * - Clean Idea Summary
 * - Market Feasibility
 * - Competitive Analysis
 * - Kill Assumption
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     id: string
 *     title: string
 *     description: string
 *     phase: string
 *     phaseStatus: { phase1: "generated", phase2: "locked", phase3: "locked" }
 *     phase1Data: {
 *       cleanSummary: string
 *       marketFeasibility: { marketSize, growthTrajectory, keyTrends, timing }
 *       competitiveAnalysis: [{ name, difference, advantage }]
 *       killAssumption: string
 *       killAssumptionTestGuidance: string
 *       generatedAt: Date
 *     }
 *     version: number
 *     updatedAt: Date
 *   }
 * }
 *
 * Error responses:
 * 400 - Phase already confirmed (locked)
 * 404 - Idea not found
 */
router.post('/:id/generate/phase1', generatePhase1);
/**
 * POST /api/v1/ideas/:id/confirm/phase1
 * Confirm and lock Phase 1, enable Phase 2
 * Story 4.6
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     id: string
 *     title: string
 *     phase: string
 *     phaseStatus: { phase1: "confirmed", phase2: "pending", phase3: "locked" }
 *     phase1Data: { ..., confirmedAt: Date }
 *     version: number
 *     updatedAt: Date
 *     message: "Phase 1 confirmed. Phase 2 is now available."
 *   }
 * }
 *
 * Error responses:
 * 400 - Phase not generated yet
 * 400 - Phase already confirmed
 * 404 - Idea not found
 */
router.post('/:id/confirm/phase1', confirmPhase1);
export default router;
//# sourceMappingURL=ideas.js.map