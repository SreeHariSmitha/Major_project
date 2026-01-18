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

export type RegisterRequest = z.infer<typeof RegisterSchema>;

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

export type LoginRequest = z.infer<typeof LoginSchema>;

/**
 * Validation Error Response Type
 */
export interface ValidationErrorDetails {
  field: string;
  message: string;
}
