import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // ✅ الدالة التي كان يبحث عنها النظام لجلب المنتجات
  async getProducts(vendorId: string) {
    return this.productRepo.find({ where: { vendorId } });
  }
}