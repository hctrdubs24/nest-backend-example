import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
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

  private readonly logger = new Logger(ProductService.name);

  async create(data: CreateProductDto) {
    try {
      const createdProduct = await this.prisma.product.create({ data });

      this.logger.log(
        {
          productId: createdProduct.id,
          name: createdProduct.name,
          action: 'product_created',
        },
        'Nuevo producto creado',
      );

      return createdProduct;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Product with name ${data.name} already exists`,
          );
        }
      }

      this.logger.error(
        { error: error instanceof Error ? error.message : error, data },
        'Error al crear producto',
      );

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

    const updatedProduct = await this.prisma.product.update({
      data,
      where: { id },
    });

    this.logger.log(
      {
        productId: id,
        fieldsUpdated: Object.keys(data),
        action: 'product_updated',
      },
      'Producto actualizado',
    );

    return updatedProduct;
  }

  async remove(id: number) {
    const productFound = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productFound)
      throw new NotFoundException(`Product with id ${id} not found`);

    const deletedProduct = await this.prisma.product.delete({ where: { id } });

    this.logger.warn(
      { productId: id, name: deletedProduct.name, action: 'product_deleted' },
      'Producto eliminado permanentemente',
    );

    return deletedProduct;
  }
}
