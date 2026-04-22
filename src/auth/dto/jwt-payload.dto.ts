import { createZodDto } from 'nestjs-zod';
import { UserDTOSchema } from 'src/user/dto/response-user.dto';
import z from 'zod';

export const JwtPayloadSchema = z.object({
  sub: z.number(),
  username: z.string(),
  v: z.number().optional(),
});

export class JwtPayloadDto extends createZodDto(JwtPayloadSchema) {}

export const JwtSingRequestSchema = UserDTOSchema;

export class JwtSingRequestDto extends createZodDto(JwtSingRequestSchema) {}
