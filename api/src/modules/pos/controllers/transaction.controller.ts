import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionService } from '../services/transaction.service';
import { ApiKeyGuard } from '../../../shared/guards/api-key.guard'; // ✅ مسار صحيح ومباشر

@Controller('api/v1/pos/transactions')
@UseGuards(ApiKeyGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('checkout')
  async checkout(@Body() dto: CreateTransactionDto) {
    const receipt = await this.transactionService.processSale(dto);
    return {
      success: true,
      message: 'تمت عملية البيع بنجاح',
      data: receipt
    };
  }

  @Get()
  async findAll() {
    return await this.transactionService.findAll();
  }

  @Get('reports/summary')
  async getSummary() {
    return await this.transactionService.getSalesSummary();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.transactionService.findOne(id);
  }

  @Post(':id/refund')
  async refund(@Param('id') id: string) {
    return await this.transactionService.refund(id);
  }
}