import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email(),
});

export type UserDto = z.infer<typeof userSchema>;

/** Accepts a single user or a non-empty array of users, always outputs an array. */
export const addUsersSchema = z
  .union([userSchema, z.array(userSchema).min(1)])
  .transform((input) => (Array.isArray(input) ? input : [input]));

export type AddUsersDto = z.infer<typeof addUsersSchema>;
