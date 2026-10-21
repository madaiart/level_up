import { z } from 'zod';

export const listTodosQuerySchema = z.object({
  userId: z.uuid().optional(),
});

export type ListTodosQueryDto = z.infer<typeof listTodosQuerySchema>;
