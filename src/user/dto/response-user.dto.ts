import { createZodDto } from 'nestjs-zod';
import { UserSchema } from 'src/generated/zod';

export const UserDTOSchema = UserSchema.omit({
  password: true,
  status: true,
  tokenVersion: true,
});

export class UserDTO extends createZodDto(UserDTOSchema) {}
