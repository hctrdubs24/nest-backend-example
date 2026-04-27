import { createZodDto } from 'nestjs-zod';
import { UserUpdateInputSchema } from 'src/generated/zod';

export class UpdateUserDto extends createZodDto(UserUpdateInputSchema) {}
