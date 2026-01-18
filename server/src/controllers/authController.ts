import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { RegisterSchema, RegisterRequest, LoginSchema, LoginRequest } from '../validators/auth.schema.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * API Response Interface
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * User Registration Controller
 * Handles POST /api/v1/auth/register
 *
 * AC 1: Successful registration with valid data
 * AC 2: Email format validation
 * AC 3: Password length validation
 * AC 4: Duplicate email prevention
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Step 1: Validate input using Zod schema
    let validatedData: RegisterRequest;
    try {
      validatedData = RegisterSchema.parse({
        email,
        password,
        name,
      });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const details: Record<string, string> = {};
        validationError.errors.forEach((error) => {
          const path = error.path.join('.');
          details[path] = error.message;
        });

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details,
          },
        } as ApiResponse);
      }
      return;
    }

    // Step 2: Check for duplicate email
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Email already registered',
        },
      } as ApiResponse);
      return;
    }

    // Step 3: Create new user in database
    const newUser = new User({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name || undefined,
    });

    const savedUser = await newUser.save();

    // Step 4: Return success response (without password)
    const userResponse = {
      _id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt,
    };

    res.status(201).json({
      success: true,
      data: userResponse,
    } as ApiResponse);
  } catch (error) {
    // Handle unexpected errors
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unable to create account. Please try again.',
      },
    } as ApiResponse);
  }
};

/**
 * User Login Controller
 * Handles POST /api/v1/auth/login
 *
 * AC 1: Successful login with valid credentials
 * AC 2: Email and password validation
 * AC 3: Invalid credentials error handling
 * AC 4: User account not found
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Step 1: Validate input using Zod schema
    let validatedData: LoginRequest;
    try {
      validatedData = LoginSchema.parse({
        email,
        password,
      });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const details: Record<string, string> = {};
        validationError.errors.forEach((error) => {
          const path = error.path.join('.');
          details[path] = error.message;
        });

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details,
          },
        } as ApiResponse);
      }
      return;
    }

    // Step 2: Find user by email (case-insensitive) and explicitly select password field
    const user = await User.findOne({ email: validatedData.email }).select('+password');

    // Step 3: Check if user exists and password is correct (generic error message for security)
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        },
      } as ApiResponse);
      return;
    }

    // Step 4: Compare password using bcrypt
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        },
      } as ApiResponse);
      return;
    }

    // Step 5: Generate JWT tokens (access and refresh)
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
    });

    // Step 6: Return success response with tokens
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: {
        ...userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    } as ApiResponse);
  } catch (error) {
    // Handle unexpected errors
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unable to log in. Please try again.',
      },
    } as ApiResponse);
  }
};

/**
 * Get User Profile Controller
 * Handles GET /api/v1/auth/profile
 *
 * AC 1: Display user profile information
 * AC 2: Profile page is protected
 * AC 3: Profile data accuracy
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get user ID from authenticated request
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized access',
        },
      } as ApiResponse);
      return;
    }

    // Fetch user from database
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
      return;
    }

    // Return user profile (without password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: userResponse,
    } as ApiResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unable to fetch profile. Please try again.',
      },
    } as ApiResponse);
  }
};

/**
 * Update User Profile Controller
 * Handles PUT /api/v1/auth/profile
 *
 * AC 1: Edit profile information
 * AC 2: Save changes
 * AC 3: Validation and error handling
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized access',
        },
      } as ApiResponse);
      return;
    }

    const { name } = req.body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length === 0 || name.length > 100) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name must be between 1 and 100 characters',
          },
        } as ApiResponse);
        return;
      }
    }

    // Update user in database
    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      } as ApiResponse);
      return;
    }

    // Return updated user profile
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: userResponse,
    } as ApiResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unable to update profile. Please try again.',
      },
    } as ApiResponse);
  }
};

/**
 * Refresh Token Controller
 * Handles POST /api/v1/auth/refresh
 *
 * AC 1: Token refreshed automatically
 * AC 2: Refresh endpoint works
 * AC 3: Failed refresh logs out user
 */
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
        },
      } as ApiResponse);
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        },
      } as ApiResponse);
      return;
    }

    // Fetch user to get updated info
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        },
      } as ApiResponse);
      return;
    }

    // Generate new access token
    const newTokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired refresh token',
      },
    } as ApiResponse);
  }
};
