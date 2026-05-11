import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionService } from '../services/transaction.service';

@Controller('api/v1/pos/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('checkout')
  async checkout(@Body() dto: CreateTransactionDto) {
    const receipt = await this.transactionService.processSale(dto);

    return {
      success: true,
      message: 'تمت عملية البيع وحساب العمولة بنجاح',
      data: receipt
    };
  }

  @Get()
  async findAll() {
    return await this.transactionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const transaction = await this.transactionService.findOne(id);
    return {
      success: true,
      data: transaction
    };
  }

  // 🚀 مسار POST الجديد لإجراء عملية الاسترجاع
  @Post(':id/refund')
  async refund(@Param('id') id: string) {
    const updatedTransaction = await this.transactionService.refund(id);
    return {
      success: true,
      message: 'تم استرجاع الفاتورة وتصفير المبالغ بنجاح',
      data: updatedTransaction
    };
  }
}