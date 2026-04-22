import express from 'express';
import { createIdea, listIdeas, getIdea, updateIdea, deleteIdea, archiveIdea, searchIdeas, generatePhase1, confirmPhase1, generatePhase2, confirmPhase2, generatePhase3, confirmPhase3, getVersionHistory, getVersion, compareVersions, } from '../controllers/ideaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getChatHistory, sendChatMessage, applyChatProposal, regenerateSection, } from '../controllers/chatController.js';
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
/**
 * POST /api/v1/ideas/:id/generate/phase2
 * Generate Phase 2 business model analysis
 * Story 8.1-8.4
 *
 * Generates:
 * - Business Model (customer segments, value proposition, revenue streams, cost structure, partnerships, resources)
 * - Strategy (customer acquisition, pricing, growth, milestones)
 * - Structural Risks (market, business model, scaling, competitive)
 * - Operational Risks (team, resource, execution, regulatory)
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     id: string
 *     title: string
 *     phase: "Phase 2"
 *     phaseStatus: { phase1: "confirmed", phase2: "generated", phase3: "locked" }
 *     phase2Data: {
 *       businessModel: { customerSegments, valueProposition, revenueStreams, costStructure, keyPartnerships, keyResources }
 *       strategy: { customerAcquisition, pricingStrategy, growthStrategy, keyMilestones }
 *       structuralRisks: [{ name, description, implications }]
 *       operationalRisks: [{ name, description, implications }]
 *       generatedAt: Date
 *     }
 *     version: number
 *     updatedAt: Date
 *   }
 * }
 *
 * Error responses:
 * 400 - Phase 1 not confirmed (locked)
 * 400 - Phase 2 already confirmed (locked)
 * 404 - Idea not found
 */
router.post('/:id/generate/phase2', generatePhase2);
/**
 * POST /api/v1/ideas/:id/confirm/phase2
 * Confirm and lock Phase 2, enable Phase 3
 * Story 8.6
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     id: string
 *     title: string
 *     phase: string
 *     phaseStatus: { phase1: "confirmed", phase2: "confirmed", phase3: "pending" }
 *     phase2Data: { ..., confirmedAt: Date }
 *     version: number
 *     updatedAt: Date
 *     message: "Phase 2 confirmed. Phase 3 is now available."
 *   }
 * }
 *
 * Error responses:
 * 400 - Phase 2 not generated yet
 * 400 - Phase 2 already confirmed
 * 404 - Idea not found
 */
router.post('/:id/confirm/phase2', confirmPhase2);
/**
 * POST /api/v1/ideas/:id/generate/phase3
 * Generate Phase 3 investor-ready Pitch Deck
 * Story 9.1-9.2
 *
 * Generates:
 * - 10-slide Pitch Deck (Title, Problem, Solution, Market Opportunity, Business Model, Traction, Competition, Team, Financials, Ask)
 * - Changelog of what changed between versions
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     id: string
 *     title: string
 *     phase: "Phase 3"
 *     phaseStatus: { phase1: "confirmed", phase2: "confirmed", phase3: "generated" }
 *     phase3Data: {
 *       pitchDeck: {
 *         titleSlide, problemSlide, solutionSlide, marketOpportunitySlide,
 *         businessModelSlide, tractionSlide, competitionSlide, teamSlide,
 *         financialsSlide, askSlide
 *       }
 *       changelog: [{ section, changeType, description }]
 *       generatedAt: Date
 *     }
 *     version: number
 *     updatedAt: Date
 *   }
 * }
 *
 * Error responses:
 * 400 - Phase 2 not confirmed (locked)
 * 400 - Phase 3 already confirmed (locked)
 * 404 - Idea not found
 */
router.post('/:id/generate/phase3', generatePhase3);
/**
 * POST /api/v1/ideas/:id/confirm/phase3
 * Confirm and lock Phase 3, completing the validation journey
 * Story 9.5
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     id: string
 *     title: string
 *     phase: string
 *     phaseStatus: { phase1: "confirmed", phase2: "confirmed", phase3: "confirmed" }
 *     phase3Data: { ..., confirmedAt: Date }
 *     version: number
 *     updatedAt: Date
 *     message: "Phase 3 confirmed. Your startup idea validation is complete!"
 *   }
 * }
 *
 * Error responses:
 * 400 - Phase 3 not generated yet
 * 400 - Phase 3 already confirmed
 * 404 - Idea not found
 */
router.post('/:id/confirm/phase3', confirmPhase3);
/**
 * POST /api/v1/ideas/:id/sections/:sectionName
 * Refine a specific section with user feedback
 * Story 6.1-6.5
 *
 * Request body:
 * {
 *   feedback: string (required - user's refinement instructions)
 * }
 *
 * Valid section names:
 * - cleanSummary
 * - marketFeasibility
 * - competitiveAnalysis
 * - killAssumption
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     id: string
 *     phase1Data: { ... updated section ... }
 *     version: number
 *     message: "Section refined successfully"
 *   }
 * }
 *
 * Error responses:
 * 400 - Invalid section name
 * 400 - Phase 1 not generated yet
 * 400 - Phase 1 already confirmed (locked)
 * 404 - Idea not found
 */
// Legacy route kept for backwards compat; now covers ALL phases via sub-agent.
router.post('/:id/sections/:sectionName', regenerateSection);
// Chat — Q&A + proposed section changes + confirm-to-apply
router.get('/:id/chat', getChatHistory);
router.post('/:id/chat', sendChatMessage);
router.post('/:id/chat/apply', applyChatProposal);
/**
 * GET /api/v1/ideas/:id/versions
 * Get version history for an idea
 * Story 5.2 & 5.3
 *
 * Query parameters:
 * - page: number (optional, default 1)
 * - limit: number (optional, default 20)
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     versions: [
 *       {
 *         versionNumber: number
 *         isActive: boolean
 *         changeType: string
 *         changeSummary: string
 *         createdAt: Date
 *       }
 *     ],
 *     pagination: { page, limit, total, pages }
 *   }
 * }
 */
router.get('/:id/versions', getVersionHistory);
/**
 * GET /api/v1/ideas/:id/versions/compare?v1=1&v2=2
 * Compare two versions
 * Story 5.5
 *
 * Query parameters:
 * - v1: number (required - first version number)
 * - v2: number (required - second version number)
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     version1: { versionNumber, createdAt, changeSummary }
 *     version2: { versionNumber, createdAt, changeSummary }
 *     diff: { changes: [...], summary: {...} }
 *   }
 * }
 */
router.get('/:id/versions/compare', compareVersions);
/**
 * GET /api/v1/ideas/:id/versions/:versionNumber
 * Get a specific version (read-only)
 * Story 5.4
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     version: {
 *       versionNumber: number
 *       isActive: boolean
 *       title: string
 *       description: string
 *       phase: string
 *       phaseStatus: object
 *       phase1Data?: object
 *       changeType: string
 *       changeSummary: string
 *       createdAt: Date
 *     }
 *     totalVersions: number
 *     isReadOnly: boolean
 *   }
 * }
 */
router.get('/:id/versions/:versionNumber', getVersion);
export default router;
//# sourceMappingURL=ideas.js.map