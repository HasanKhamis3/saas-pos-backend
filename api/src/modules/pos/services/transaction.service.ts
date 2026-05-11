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

  // 2. 🚀 استرجاع كل الفواتير (GET)
  async findAll(): Promise<PosTransaction[]> {
    return await this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}