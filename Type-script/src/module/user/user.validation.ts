import z from 'zod';
export const CreateUserSchema = z.object({
    name: z.string('Name is required'),
    password: z.string().min(8, 'Password must be 8 characters'),
    email: z.string().email('Invalid email'),
});

export const loginSchema = z.object({
    email: z.string('Email is required'),
    password: z.string('Password is required'),
});