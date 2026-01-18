import { Request, Response, NextFunction } from 'express';
/**
 * Extended Request type with decoded JWT token data
 */
export interface AuthenticatedRequest extends Request {
    userId?: string;
    email?: string;
}
/**
 * Authentication Middleware
 * Verifies JWT access token and extracts user ID for authenticated routes
 *
 * Usage: app.get('/api/v1/protected', authMiddleware, controllerFunction)
 */
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map