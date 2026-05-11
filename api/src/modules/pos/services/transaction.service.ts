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

  // 🚀 تطوير دالة الاسترجاع لتدعم الصفحات والفلترة
  async findAll(page: number = 1, limit: number = 10, paymentMethod?: string) {
    const skip = (page - 1) * limit;
    const whereCondition: any = {};

    if (paymentMethod) {
      whereCondition.paymentMethod = paymentMethod;
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip: skip,
      take: limit,
    });

    return {
      transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async getSalesSummary() {
    const transactions = await this.transactionRepository.find();
    
    let totalRevenue = 0;
    let validCount = 0;

    for (const t of transactions) {
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