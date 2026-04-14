import { UserSchema } from 'src/generated/zod';
import { z } from 'zod';

export type User = z.infer<typeof UserSchema>;

export const UserDTOSchema = UserSchema.omit({ password: true, status: true });
export type UserDTO = z.infer<typeof UserDTOSchema>;
