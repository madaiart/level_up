import { z } from 'zod';

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  completed: z.boolean().optional(),
});

export type UpdateTodoDto = z.infer<typeof updateTodoSchema>;
