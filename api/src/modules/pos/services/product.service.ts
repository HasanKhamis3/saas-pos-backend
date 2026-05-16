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

  // جلب منتجات متجر محدد
  async getProducts(vendorId: string) {
    return this.productRepo.find({ where: { vendorId } });
  }

  // حفظ منتج جديد
  async createProduct(data: any) {
    const newProduct = this.productRepo.create(data);
    return this.productRepo.save(newProduct);
  }
}