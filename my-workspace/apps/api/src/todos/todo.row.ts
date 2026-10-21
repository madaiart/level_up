import type { Todo } from '@nestjs-template/utils';
import { z } from 'zod';
import { timestamptz } from '../database/columns';

/**
 * A `todos` row as postgres.js returns it (camelCased). Parsing a row gives the
 * API's `Todo`: timestamps become ISO strings and columns not listed here
 * (e.g. updatedAt) are dropped.
 */
export const todoRowSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  completed: z.boolean(),
  userId: z.uuid(),
  createdAt: timestamptz,
}) satisfies z.ZodType<Todo>;

export const todoRowsSchema = todoRowSchema.array();

export type TodoRow = z.input<typeof todoRowSchema>;
export type TodoRows = z.input<typeof todoRowsSchema>;
