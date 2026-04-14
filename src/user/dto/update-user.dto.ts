import { UserUpdateInputSchema } from 'src/generated/zod';
import { z } from 'zod';

export const UserUpdateSchema = z.intersection(
  UserUpdateInputSchema,
  z.object({
    email: z.email().toLowerCase(),
  }),
);

export type UpdateUserDto = z.infer<typeof UserUpdateInputSchema>;
