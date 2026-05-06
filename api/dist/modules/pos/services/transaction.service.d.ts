import { DataSource } from 'typeorm';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { PosTransaction } from '../entities/transaction.entity';
export declare class TransactionService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    processSale(dto: CreateTransactionDto): Promise<PosTransaction>;
}
