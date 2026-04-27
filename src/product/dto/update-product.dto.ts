import { createZodDto } from 'nestjs-zod';
import { ProductCreateInputSchema } from 'src/generated/zod';

export class UpdateProductDto extends createZodDto(ProductCreateInputSchema) {}
