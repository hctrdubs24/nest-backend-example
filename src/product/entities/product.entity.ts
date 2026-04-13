import { Product as PrismaProduct } from 'src/generated/prisma/client';

export type ProductDTO = Omit<PrismaProduct, 'createdAt' | 'updatedAt'>;

export type Product = PrismaProduct;
