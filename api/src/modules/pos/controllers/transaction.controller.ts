import { Controller, Post, Body } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

@Controller('api/v1/pos/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('checkout')
  async checkout(@Body() dto: CreateTransactionDto) {
    // استدعاء الخدمة المالية لمعالجة العملية
    const receipt = await this.transactionService.processSale(dto);
    
    return {
      success: true,
      message: 'تمت عملية البيع وحساب العمولات بنجاح',
      data: receipt
    };
  }
}