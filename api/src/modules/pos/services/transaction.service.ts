import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PosTransaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(PosTransaction)
    private readonly transactionRepository: Repository<PosTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. معالجة وحفظ عملية البيع (POST)
  async processSale(dto: CreateTransactionDto): Promise<PosTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = this.transactionRepository.create({
        vendorId: dto.vendorId,
        totalAmount: dto.totalAmount,
        paymentMethod: dto.paymentMethod,
        systemCommission: 0,
        vendorPayout: dto.totalAmount,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'فشلت عملية الدفع، يرجى المحاولة لاحقاً',
        (error as Error).message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // 2. استرجاع كل الفواتير (GET)
  async findAll(): Promise<PosTransaction[]> {
    return await this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 3. استرجاع فاتورة واحدة محددة بالـ ID
  async findOne(id: string): Promise<PosTransaction> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`الفاتورة برقم ${id} غير موجودة في النظام`);
    }
    return transaction;
  }

  // 4. 🚀 استرجاع الفاتورة مالياً (Refund)
  async refund(id: string): Promise<PosTransaction> {
    // جلب الفاتورة أولاً للتأكد من وجودها
    const transaction = await this.findOne(id);

    // تصفير المبالغ كإجراء استرجاع مالي بسيط وآمن
    transaction.totalAmount = 0;
    transaction.vendorPayout = 0;
    transaction.systemCommission = 0;

    // حفظ التعديل الجديد في قاعدة البيانات
    return await this.transactionRepository.save(transaction);
  }
}