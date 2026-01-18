import express, { Router } from 'express';
import {
  createIdea,
  listIdeas,
  getIdea,
  updateIdea,
  deleteIdea,
  archiveIdea,
  searchIdeas,
} from '../controllers/ideaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

/**
 * Idea Routes
 * Base path: /api/v1/ideas
 */
const router: Router = express.Router();

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

export default router;
