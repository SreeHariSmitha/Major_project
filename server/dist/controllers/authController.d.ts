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
//# sourceMappingURL=authController.d.ts.map