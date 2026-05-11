import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionService } from '../services/transaction.service';
import { ApiKeyGuard } from '../api-key.guard'; // ✅ مسار مباشر وبسيط

@Controller('api/v1/pos/transactions')
@UseGuards(ApiKeyGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('checkout')
  async checkout(@Body() dto: CreateTransactionDto) {
    const receipt = await this.transactionService.processSale(dto);
    return { success: true, message: 'تمت عملية البيع بنجاح', data: receipt };
  }

  @Get('reports/summary')
  async getSummary() {
    const summary = await this.transactionService.getSalesSummary();
    return { success: true, data: summary };
  }
}