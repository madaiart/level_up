import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export type CreateTodoDto = z.infer<typeof createTodoSchema>;
