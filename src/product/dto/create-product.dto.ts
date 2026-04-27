import { createZodDto } from 'nestjs-zod';
import { ProductCreateInputSchema } from 'src/generated/zod';

export class CreateProductDto extends createZodDto(ProductCreateInputSchema) {}
