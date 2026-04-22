import { createZodDto } from 'nestjs-zod';
import { UserCreateInputSchema } from 'src/generated/zod';

export class CreateUserDto extends createZodDto(UserCreateInputSchema) {}
