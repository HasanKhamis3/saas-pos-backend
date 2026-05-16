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

  async checkout(payload: any) {
    const { vendorId, items, paymentMethod } = payload;
    let totalAmount = 0;

    for (const item of items) {
      const product = await this.productRepo.findOne({ where: { id: item.productId, vendorId } });
      if (!product) {
        throw new NotFoundException(`المنتج غير موجود في متجرك`);
      }

      // 🔥 الذكاء الاصطناعي للمخزون: التحقق قبل البيع
      if (product.stock < item.quantity) {
        throw new BadRequestException(`عذراً، المخزون لا يكفي لمنتج (${product.name}). المتاح فقط: ${product.stock}`);
      }

      // 📉 خصم الكمية من المستودع فوراً
      product.stock -= item.quantity;
      await this.productRepo.save(product);

      totalAmount += product.price * item.quantity;
    }

    const systemCommission = totalAmount * 0.02;
    const vendorPayout = totalAmount - systemCommission;

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

  async processRefund(transactionId: string, vendorId: string) {
    const transaction = await this.transactionRepo.findOne({ where: { id: transactionId, vendorId } });
    
    if (!transaction) {
      throw new NotFoundException('الفاتورة غير موجودة أو لا تتبع لمتجرك');
    }

    if (transaction.status === 'refunded') {
      throw new BadRequestException('تم استرجاع هذه الفاتورة مسبقاً ⛔');
    }

    // 🔄 ذكاء الاسترجاع: إعادة الكميات للمستودع
    for (const item of transaction.items) {
      const product = await this.productRepo.findOne({ where: { id: item.productId, vendorId } });
      if (product) {
        product.stock += item.quantity;
        await this.productRepo.save(product);
      }
    }

    transaction.status = 'refunded';
    return await this.transactionRepo.save(transaction);
  }
}