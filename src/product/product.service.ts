import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductMapper } from './mappers/product.mapper';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    try {
      return await this.prisma.product.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Product with name ${data.name} already exists`,
          );
        }
      }

      throw new InternalServerErrorException(
        'An error occurred while creating the product',
      );
    }
  }

  async findAll() {
    const products = await this.prisma.product.findMany();
    return ProductMapper.toResponseList(products);
  }

  async findOne(id: number) {
    const productFound = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productFound)
      throw new NotFoundException(`Product with id ${id} not found`);

    return ProductMapper.toResponse(productFound);
  }

  async update(id: number, data: UpdateProductDto) {
    const productFound = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productFound)
      throw new NotFoundException(`Product with id ${id} not found`);

    return await this.prisma.product.update({ data, where: { id } });
  }

  async remove(id: number) {
    const productFound = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productFound)
      throw new NotFoundException(`Product with id ${id} not found`);

    return this.prisma.product.delete({ where: { id } });
  }
}
