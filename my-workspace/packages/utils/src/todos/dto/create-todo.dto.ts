import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  // Owner of the todo. Todos are never shared and can't change owner.
  userId: z.uuid(),
});

export type CreateTodoDto = z.infer<typeof createTodoSchema>;
