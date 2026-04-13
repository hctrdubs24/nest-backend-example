import { Product, ProductDTO } from '../entities/product.entity';

export class ProductMapper {
  static toResponse(product: Product): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
    };
  }

  static toResponseList(products: Product[]) {
    return products.map((product) => this.toResponse(product));
  }
}
