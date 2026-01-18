import { z } from 'zod';
/**
 * Auth Validation Schemas using Zod
 */
/**
 * User Registration Schema
 * Validates email, password, and optional name
 */
export const RegisterSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .transform((val) => val.toLowerCase().trim()),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters'),
    name: z
        .string()
        .max(100, 'Name cannot exceed 100 characters')
        .optional(),
});
/**
 * User Login Schema
 * Validates email and password for authentication
 */
export const LoginSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .transform((val) => val.toLowerCase().trim()),
    password: z
        .string()
        .min(1, 'Password is required'),
});
//# sourceMappingURL=auth.schema.js.map