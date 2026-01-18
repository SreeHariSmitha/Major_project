import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { RegisterSchema, RegisterRequest } from '../validators/auth.schema.js';
import { ZodError } from 'zod';

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
