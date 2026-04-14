import { UserCreateInputSchema } from 'src/generated/zod';
import { z } from 'zod';

export const UserCreateSchema = z.intersection(
  UserCreateInputSchema,
  z.object({
    email: z.email().toLowerCase(),
  }),
);

export type CreateUserDto = z.infer<typeof UserCreateSchema>;
