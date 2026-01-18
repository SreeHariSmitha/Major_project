import { z } from 'zod';
/**
 * Auth Validation Schemas using Zod
 */
/**
 * User Registration Schema
 * Validates email, password, and optional name
 */
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
}>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
/**
 * User Login Schema
 * Validates email and password for authentication
 */
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginRequest = z.infer<typeof LoginSchema>;
/**
 * Validation Error Response Type
 */
export interface ValidationErrorDetails {
    field: string;
    message: string;
}
//# sourceMappingURL=auth.schema.d.ts.map