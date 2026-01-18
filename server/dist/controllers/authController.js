import { User } from '../models/User.js';
import { RegisterSchema, LoginSchema } from '../validators/auth.schema.js';
import { generateTokens } from '../utils/jwt.js';
import { ZodError } from 'zod';
/**
 * User Registration Controller
 * Handles POST /api/v1/auth/register
 *
 * AC 1: Successful registration with valid data
 * AC 2: Email format validation
 * AC 3: Password length validation
 * AC 4: Duplicate email prevention
 */
export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        // Step 1: Validate input using Zod schema
        let validatedData;
        try {
            validatedData = RegisterSchema.parse({
                email,
                password,
                name,
            });
        }
        catch (validationError) {
            if (validationError instanceof ZodError) {
                const details = {};
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
                });
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
            });
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
        });
    }
    catch (error) {
        // Handle unexpected errors
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Unable to create account. Please try again.',
            },
        });
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
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Step 1: Validate input using Zod schema
        let validatedData;
        try {
            validatedData = LoginSchema.parse({
                email,
                password,
            });
        }
        catch (validationError) {
            if (validationError instanceof ZodError) {
                const details = {};
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
                });
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
            });
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
            });
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
        });
    }
    catch (error) {
        // Handle unexpected errors
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Unable to log in. Please try again.',
            },
        });
    }
};
//# sourceMappingURL=authController.js.map