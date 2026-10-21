import type { User } from '@nestjs-template/utils';
import { z } from 'zod';
import { timestamptz } from '../database/columns';

/**
 * A `users` row as postgres.js returns it (camelCased). Parsing a row gives the
 * API's `User`: timestamps become ISO strings and columns not listed here
 * (e.g. updatedAt) are dropped.
 */
export const userRowSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  createdAt: timestamptz,
}) satisfies z.ZodType<User>;

export const userRowsSchema = userRowSchema.array();

export type UserRow = z.input<typeof userRowSchema>;
export type UserRows = z.input<typeof userRowsSchema>;
