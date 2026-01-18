import { Request, Response, NextFunction } from 'express';
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
//# sourceMappingURL=authController.d.ts.map