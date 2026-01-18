import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
/**
 * User Registration Controller
 * Handles POST /api/v1/auth/register
 *
 * AC 1: Successful registration with valid data
 * AC 2: Email format validation
 * AC 3: Password length validation
 * AC 4: Duplicate email prevention
 */
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * User Login Controller
 * Handles POST /api/v1/auth/login
 *
 * AC 1: Successful login with valid credentials
 * AC 2: Email and password validation
 * AC 3: Invalid credentials error handling
 * AC 4: User account not found
 */
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get User Profile Controller
 * Handles GET /api/v1/auth/profile
 *
 * AC 1: Display user profile information
 * AC 2: Profile page is protected
 * AC 3: Profile data accuracy
 */
export declare const getProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update User Profile Controller
 * Handles PUT /api/v1/auth/profile
 *
 * AC 1: Edit profile information
 * AC 2: Save changes
 * AC 3: Validation and error handling
 */
export declare const updateProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Refresh Token Controller
 * Handles POST /api/v1/auth/refresh
 *
 * AC 1: Token refreshed automatically
 * AC 2: Refresh endpoint works
 * AC 3: Failed refresh logs out user
 */
export declare const refreshAccessToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map