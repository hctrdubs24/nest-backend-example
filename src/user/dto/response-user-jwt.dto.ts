import { createZodDto } from 'nestjs-zod';
import { UserSchema } from 'src/generated/zod';
import z from 'zod';

export const JwtUserDTOSchema = UserSchema.omit({
  password: true,
  status: true,
  roleId: true,
}).extend({ roleName: z.string().optional() });

export class JwtUserDTO extends createZodDto(JwtUserDTOSchema) {}
