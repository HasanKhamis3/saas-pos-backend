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

  // 🚀 مسار GET الجديد لجلب فاتورة محددة
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const transaction = await this.transactionService.findOne(id);
    return {
      success: true,
      data: transaction
    };
  }
}