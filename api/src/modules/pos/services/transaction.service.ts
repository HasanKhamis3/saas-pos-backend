import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PosTransaction } from '../entities/transaction.entity';
import { Product } from '../entities/product.entity';
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
      const savedItems = [];

      if (dto.items && dto.items.length > 0) {
        calculatedTotal = 0;

        for (const item of dto.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!product) throw new BadRequestException(`المنتج ${item.productId} غير موجود`);
          if (product.stock < item.quantity) {
            throw new BadRequestException(`الكمية لا تكفي من "${product.name}"`);
          }

          product.stock -= item.quantity;
          await queryRunner.manager.save(product);

          calculatedTotal += Number(product.price) * item.quantity;
          savedItems.push({ productId: item.productId, quantity: item.quantity });
        }
      }

      const commissionRate = 0.02;
      const systemCommission = calculatedTotal * commissionRate;
      const vendorPayout = calculatedTotal - systemCommission;

      const transaction = queryRunner.manager.create(PosTransaction, {
        vendorId: dto.vendorId,
        totalAmount: calculatedTotal,
        systemCommission,
        vendorPayout,
        paymentMethod: dto.paymentMethod || 'cash',
        items: savedItems, // حفظ المنتجات داخل الفاتورة
        status: 'completed',
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('فشلت عملية إتمام البيع');
    } finally {
      await queryRunner.release();
    }
  }

  // 🔄 الإرجاع الذكي: تصفير الفاتورة وإعادة البضاعة للمخزن
  async refund(id: string): Promise<PosTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // جلب الفاتورة مع قفل حماية
      const transaction = await queryRunner.manager.findOne(PosTransaction, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!transaction) throw new NotFoundException('الفاتورة غير موجودة');
      if (transaction.status === 'refunded') {
        throw new BadRequestException('تم استرجاع هذه الفاتورة مسبقاً');
      }

      // 📦 إعادة المنتجات المسترجعة إلى الرفوف
      if (transaction.items && transaction.items.length > 0) {
        for (const item of transaction.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
            lock: { mode: 'pessimistic_write' },
          });

          if (product) {
            product.stock += item.quantity; // إرجاع الكمية
            await queryRunner.manager.save(product);
          }
        }
      }

      // 💸 تصفير القيم المالية وتحديث الحالة
      transaction.totalAmount = 0;
      transaction.systemCommission = 0;
      transaction.vendorPayout = 0;
      transaction.status = 'refunded';

      const updatedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
      return updatedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('فشلت عملية الاسترجاع المالي');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<PosTransaction[]> {
    return await this.transactionRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PosTransaction> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('المعاملة غير موجودة');
    return transaction;
  }

  async getSalesSummary() {
    // جلب المبيعات المكتملة فقط لاستبعاد المسترجعة من الأرباح
    const transactions = await this.transactionRepository.find({
      where: { status: 'completed' },
    });
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    return { totalTransactions: transactions.length, totalRevenue };
  }
}