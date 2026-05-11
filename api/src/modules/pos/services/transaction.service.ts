import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PosTransaction } from '../entities/transaction.entity';
import { Product } from '../entities/product.entity'; // ✅ استدعاء كيان المنتجات
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(PosTransaction)
    private readonly transactionRepository: Repository<PosTransaction>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async processSale(dto: CreateTransactionDto): Promise<PosTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let calculatedTotal = Number(dto.totalAmount) || 0;

      // 📦 التحقق من المخزون وخصمه تلقائياً إذا تم تمرير عناصر (items)
      if (dto.items && dto.items.length > 0) {
        calculatedTotal = 0; // تصفير المجموع لحسابه من قاعدة البيانات مباشرة (أمان تام ضد تلاعب الواجهة الأمامية)

        for (const item of dto.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
            // قفل تشاؤمي (Pessimistic Lock) لمنع تضارب الشراء في نفس اللحظة
            lock: { mode: 'pessimistic_write' },
          });

          if (!product) {
            throw new BadRequestException(`المنتج ذو المعرف ${item.productId} غير موجود في النظام`);
          }

          if (product.stock < item.quantity) {
            throw new BadRequestException(`الكمية المتوفرة من "${product.name}" لا تكفي. المتاح حالياً: ${product.stock}`);
          }

          // خصم الكمية من المخزون
          product.stock -= item.quantity;
          await queryRunner.manager.save(product);

          // حساب السعر الإجمالي الفعلي
          calculatedTotal += Number(product.price) * item.quantity;
        }
      }

      const commissionRate = 0.02; // عمولة 2%
      const systemCommission = calculatedTotal * commissionRate;
      const vendorPayout = calculatedTotal - systemCommission;

      const transaction = queryRunner.manager.create(PosTransaction, {
        vendorId: dto.vendorId,
        totalAmount: calculatedTotal,
        systemCommission,
        vendorPayout,
        paymentMethod: dto.paymentMethod || 'cash',
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // تمرير رسالة الخطأ الواضحة للعميل (مثل نفاد الكمية)
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('فشلت عملية إتمام البيع ومعالجة المخزون');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<PosTransaction[]> {
    return await this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PosTransaction> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`المعاملة رقم ${id} غير موجودة`);
    }
    return transaction;
  }

  async getSalesSummary() {
    const transactions = await this.findAll();
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    return {
      totalTransactions: transactions.length,
      totalRevenue,
    };
  }

  async refund(id: string): Promise<PosTransaction> {
    const transaction = await this.findOne(id);
    transaction.totalAmount = 0;
    transaction.systemCommission = 0;
    transaction.vendorPayout = 0;
    return await this.transactionRepository.save(transaction);
  }
}