import { TransactionService } from '../services/transaction.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    checkout(dto: CreateTransactionDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/transaction.entity").PosTransaction;
    }>;
}
