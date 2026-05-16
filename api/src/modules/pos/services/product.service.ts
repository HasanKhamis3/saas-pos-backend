import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getProducts(vendorId: string) {
    return this.productRepo.find({ where: { vendorId } });
  }

  async createProduct(data: any) {
    const newProduct = this.productRepo.create(data);
    return this.productRepo.save(newProduct);
  }

  // 📦 ميزة تزويد المستودع (أو تعديل أي بيانات للمنتج)
  async updateProduct(id: string, vendorId: string, updateData: any) {
    const product = await this.productRepo.findOne({ where: { id, vendorId } });
    if (!product) {
      throw new NotFoundException('المنتج غير موجود في متجرك');
    }
    // دمج البيانات الجديدة مع القديمة
    Object.assign(product, updateData);
    return await this.productRepo.save(product);
  }
}