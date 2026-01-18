import express from 'express';
import { register, login } from '../controllers/authController.js';
/**
 * Authentication Routes
 * Base path: /api/v1/auth
 */
const router = express.Router();
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
export default router;
//# sourceMappingURL=auth.js.map