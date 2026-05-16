import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PosTransaction } from '../entities/transaction.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(PosTransaction)
    private readonly transactionRepo: Repository<PosTransaction>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // 🛒 دالة إتمام البيع (Checkout)
  async checkout(payload: any) {
    const { vendorId, items, paymentMethod } = payload;
    let totalAmount = 0;

    // 1. حساب الإجمالي الحقيقي بناءً على سعر المنتجات في قاعدة البيانات (حماية من تلاعب الكاشير بالسعر)
    for (const item of items) {
      const product = await this.productRepo.findOne({ where: { id: item.productId, vendorId } });
      if (!product) {
        throw new NotFoundException(`المنتج غير موجود في متجرك`);
      }
      totalAmount += product.price * item.quantity;
    }

    // 2. حساب عمولة النظام (مثلاً 2%) وصافي ربح التاجر
    const systemCommission = totalAmount * 0.02;
    const vendorPayout = totalAmount - systemCommission;

    // 3. حفظ الفاتورة الجديدة
    const newTransaction = this.transactionRepo.create({
      vendorId,
      totalAmount,
      systemCommission,
      vendorPayout,
      paymentMethod,
      items,
      status: 'completed'
    });

    return await this.transactionRepo.save(newTransaction);
  }

  // 🔄 دالة استرجاع الفاتورة (Refund)
  async processRefund(transactionId: string, vendorId: string) {
    const transaction = await this.transactionRepo.findOne({ where: { id: transactionId, vendorId } });
    
    if (!transaction) {
      throw new NotFoundException('الفاتورة غير موجودة أو لا تتبع لمتجرك');
    }

    if (transaction.status === 'refunded') {
      throw new BadRequestException('تم استرجاع هذه الفاتورة مسبقاً ⛔');
    }

    transaction.status = 'refunded';
    return await this.transactionRepo.save(transaction);
  }
}