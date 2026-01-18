import express, { Router } from 'express';
import { register } from '../controllers/authController.js';

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

export default router;
