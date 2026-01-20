import z from 'zod';

export const createTaskSchema = z.object({
    name: z.string('Name is required'),
    description: z.string().optional(),
    isCompleted: z.boolean().default(false),
});