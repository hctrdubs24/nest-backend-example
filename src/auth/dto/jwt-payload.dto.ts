import { createZodDto } from 'nestjs-zod';
import { JwtUserDTOSchema } from 'src/user/dto/response-user-jwt.dto';
import z from 'zod';

export const JwtPayloadSchema = z.object({
  sub: z.number(),
  username: z.string(),
  v: z.number().optional(),
  role: z.string().optional(),
});

export class JwtPayloadDto extends createZodDto(JwtPayloadSchema) {}

export const JwtSingRequestSchema = JwtUserDTOSchema;

export class JwtSingRequestDto extends createZodDto(JwtSingRequestSchema) {}
