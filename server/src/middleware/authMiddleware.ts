import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

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
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized access',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized access',
        },
      });
      return;
    }

    // Attach decoded token data to request
    req.userId = decoded.userId;
    req.email = decoded.email;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized access',
      },
    });
  }
};
