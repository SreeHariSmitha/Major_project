import express, { Router } from 'express';
import { register, login, getProfile, updateProfile, refreshAccessToken } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

/**
 * Authentication Routes
 * Base path: /api/v1/auth
 */
const router: Router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register a new user account
 *
 * Request body:
 * {
 *   email: string (required, valid email format)
 *   password: string (required, min 8 chars)
 *   name: string (optional, max 100 chars)
 * }
 *
 * Success response (201):
 * {
 *   success: true,
 *   data: {
 *     _id: string
 *     email: string
 *     name?: string
 *     createdAt: Date
 *   }
 * }
 *
 * Error responses:
 * 400 - Validation error (invalid email, short password, etc.)
 * 409 - Duplicate email (email already registered)
 * 500 - Server error
 */
router.post('/register', register);

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT tokens
 *
 * Request body:
 * {
 *   email: string (required, valid email format)
 *   password: string (required, min 1 char)
 * }
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     _id: string
 *     email: string
 *     name?: string
 *     createdAt: Date
 *     accessToken: string (JWT, 15min expiry)
 *     refreshToken: string (JWT, 7d expiry)
 *   }
 * }
 *
 * Error responses:
 * 400 - Validation error (invalid email, password required)
 * 401 - Unauthorized (invalid email or password)
 * 500 - Server error
 */
router.post('/login', login);

/**
 * GET /api/v1/auth/profile
 * Get authenticated user's profile information
 *
 * Request headers:
 * {
 *   Authorization: "Bearer <access_token>"
 * }
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     _id: string
 *     email: string
 *     name?: string
 *     createdAt: Date
 *   }
 * }
 *
 * Error responses:
 * 401 - Unauthorized (missing or invalid token)
 * 404 - User not found
 * 500 - Server error
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * PUT /api/v1/auth/profile
 * Update authenticated user's profile information
 *
 * Request headers:
 * {
 *   Authorization: "Bearer <access_token>"
 * }
 *
 * Request body:
 * {
 *   name: string (optional, max 100 chars)
 * }
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     _id: string
 *     email: string
 *     name?: string
 *     createdAt: Date
 *   }
 * }
 *
 * Error responses:
 * 400 - Validation error
 * 401 - Unauthorized
 * 404 - User not found
 * 500 - Server error
 */
router.put('/profile', authMiddleware, updateProfile);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 *
 * Request body:
 * {
 *   refreshToken: string (JWT)
 * }
 *
 * Success response (200):
 * {
 *   success: true,
 *   data: {
 *     accessToken: string (JWT, 15min expiry)
 *     refreshToken: string (JWT, 7d expiry)
 *   }
 * }
 *
 * Error responses:
 * 400 - Missing refresh token
 * 401 - Invalid or expired refresh token
 * 500 - Server error
 */
router.post('/refresh', refreshAccessToken);

export default router;
