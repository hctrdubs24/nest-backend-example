import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const LogoutAllDevicesRequestSchema = z.object({
  user: z.object({ userId: z.number() }),
});

export class LogoutAllDevicesRequestDto extends createZodDto(
  LogoutAllDevicesRequestSchema,
) {}
