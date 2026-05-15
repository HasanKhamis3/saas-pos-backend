import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PosTransaction } from '../entities/transaction.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PosTransaction)
    private readonly transactionRepo: Repository<PosTransaction>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getBestSellers(vendorId: string): Promise<any> {
    // 1. جلب جميع المعاملات الناجحة لهذا المتجر فقط
    const transactions = await this.transactionRepo.find({
      where: { vendorId, status: 'completed' }
    });

    // 2. تجميع المنتجات وحساب الكميات المباعة
    const productSales: Record<string, number> = {};

    transactions.forEach(tx => {
      tx.items.forEach((item: any) => {
        if (productSales[item.productId]) {
          productSales[item.productId] += item.quantity;
        } else {
          productSales[item.productId] = item.quantity;
        }
      });
    });

    // 3. ترتيب المنتجات من الأعلى للأقل مبيعاً واختيار أول 5 فقط
    const sortedProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // 4. جلب تفاصيل المنتجات (الاسم، السعر) لدمجها مع النتيجة
    const bestSellers = [];
    for (const [productId, quantity] of sortedProducts) {
      const product = await this.productRepo.findOne({ where: { id: productId } });
      if (product) {
        bestSellers.push({
          productId: product.id,
          name: product.name,
          soldQuantity: quantity,
          totalRevenue: quantity * product.price
        });
      }
    }

    return bestSellers;
  }
}