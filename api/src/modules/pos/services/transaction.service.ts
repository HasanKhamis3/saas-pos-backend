import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PosTransaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(PosTransaction)
    private readonly transactionRepository: Repository<PosTransaction>,
    private dataSource: DataSource,
  ) {}

  async processSale(dto: CreateTransactionDto): Promise<PosTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const commissionRate = 0.02; // 2% عمولة النظام
      const systemCommission = dto.totalAmount * commissionRate;
      const vendorPayout = dto.totalAmount - systemCommission;

      const transaction = this.transactionRepository.create({
        ...dto,
        systemCommission,
        vendorPayout,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('فشلت عملية الدفع، يرجى المحاولة لاحقاً');
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ إضافة دالة findAll المطلوبة
  async findAll(): Promise<PosTransaction[]> {
    return await this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getSalesSummary() {
    const transactions = await this.findAll();
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    
    return {
      totalTransactions,
      totalRevenue,
      validSalesCount: totalTransactions // مبدئياً
    };
  }

  async findOne(id: string): Promise<PosTransaction> {
    return await this.transactionRepository.findOne({ where: { id } });
  }

  async refund(id: string): Promise<PosTransaction> {
    const transaction = await this.findOne(id);
    transaction.totalAmount = 0;
    transaction.systemCommission = 0;
    transaction.vendorPayout = 0;
    return await this.transactionRepository.save(transaction);
  }
}