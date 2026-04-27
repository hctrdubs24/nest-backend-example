import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { JwtSingRequestSchema } from './jwt-payload.dto';

export const LoginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(6),
});

export class LoginDTO extends createZodDto(LoginSchema) {}

export const LoginRequestSchema = z.object({
  user: JwtSingRequestSchema,
});

export class LoginRequestDto extends createZodDto(LoginRequestSchema) {}
