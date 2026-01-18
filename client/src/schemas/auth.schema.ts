import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required'),
});

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
    .optional()
    .or(z.literal('')),
});
