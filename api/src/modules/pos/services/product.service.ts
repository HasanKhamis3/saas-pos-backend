import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
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
    return await this.productRepository.find({ 
      where: { vendorId },
      order: { createdAt: 'DESC' }
    });
  }

  // 🚨 دالة جلب المنتجات التي أوشكت على النفاد (تنبيهات المخزون)
  async findLowStock(vendorId: string, threshold: number = 5): Promise<Product[]> {
    return await this.productRepository.find({
      where: {
        vendorId,
        stock: LessThanOrEqual(threshold), // يجلب المخزون الأقل من أو يساوي الحد
      },
      order: { stock: 'ASC' }, // ترتيب من الأقل للأكثر لتركيز الانتباه على الأهم
    });
  }
}