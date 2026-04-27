import { createZodDto } from 'nestjs-zod';
import { UserSchema } from 'src/generated/zod';

export class User extends createZodDto(UserSchema) {}
