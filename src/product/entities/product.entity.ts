import { createZodDto } from 'nestjs-zod';
import { ProductSchema } from 'src/generated/zod';

export const ProductDTOSchema = ProductSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export class Product extends createZodDto(ProductSchema) {}

export class ProductDTO extends createZodDto(ProductDTOSchema) {}
