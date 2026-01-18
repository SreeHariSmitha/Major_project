import { User } from '../models/User.js';
import { RegisterSchema } from '../validators/auth.schema.js';
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
//# sourceMappingURL=authController.js.map