import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm'; // ✅ أضفنا Between للبحث التاريخي
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

  // 💰 ميزة ملخص المبيعات اليومية الجديدة
  async getDailySummary(vendorId: string): Promise<any> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // بداية اليوم

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // نهاية اليوم

    const transactions = await this.transactionRepo.find({
      where: {
        vendorId,
        status: 'completed',
        createdAt: Between(todayStart, todayEnd), // فحص الفواتير التي تمت اليوم فقط
      },
    });

    const totalSales = transactions.reduce((sum, tx) => sum + Number(tx.totalAmount), 0);
    const totalTransactions = transactions.length;

    return {
      date: todayStart.toISOString().split('T')[0],
      totalRevenue: totalSales,
      transactionCount: totalTransactions,
      averageTicketSize: totalTransactions > 0 ? totalSales / totalTransactions : 0,
    };
  }

  // الدالة السابقة (Best Sellers)
  async getBestSellers(vendorId: string): Promise<any> {
    const transactions = await this.transactionRepo.find({
      where: { vendorId, status: 'completed' }
    });

    const productSales: Record<string, number> = {};
    transactions.forEach(tx => {
      if (tx.items && Array.isArray(tx.items)) {
        tx.items.forEach((item: any) => {
          productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
        });
      }
    });

    const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 5);
    const bestSellers: any[] = [];
    
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