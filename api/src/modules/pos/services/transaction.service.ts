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

  async findAll(): Promise<PosTransaction[]> {
    return await this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PosTransaction> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`الفاتورة برقم ${id} غير موجودة في النظام`);
    }
    return transaction;
  }

  async refund(id: string): Promise<PosTransaction> {
    const transaction = await this.findOne(id);
    transaction.totalAmount = 0;
    transaction.vendorPayout = 0;
    transaction.systemCommission = 0;
    return await this.transactionRepository.save(transaction);
  }

  // 🚀 دالة جديدة لحساب إجمالي المبيعات وعدد العمليات الفعالة
  async getSalesSummary() {
    const transactions = await this.transactionRepository.find();
    
    let totalRevenue = 0;
    let validCount = 0;

    for (const t of transactions) {
      // نحسب فقط الفواتير التي لم يتم استرجاعها (مبلغها أكبر من الصفر)
      if (Number(t.totalAmount) > 0) {
        totalRevenue += Number(t.totalAmount);
        validCount++;
      }
    }

    return {
      totalTransactions: transactions.length,
      validSalesCount: validCount,
      totalRevenue: totalRevenue,
    };
  }
}