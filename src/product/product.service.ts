import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

      throw error;
    }
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: number) {
    const productFound = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productFound)
      throw new NotFoundException(`Product with id ${id} not found`);

    return productFound;
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
