import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return await this.productRepository.save(product);
  }

  async findAll(vendorId: string): Promise<Product[]> {
    return await this.productRepository.find({ where: { vendorId } });
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('المنتج غير موجود');
    
    product.stock += quantity;
    await this.productRepository.save(product);
  }
}