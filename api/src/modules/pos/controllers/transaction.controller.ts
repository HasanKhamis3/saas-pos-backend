import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionService } from '../services/transaction.service';
import { ApiKeyGuard } from '../../../shared/guards/api-key.guard';

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
    const transactions = await this.transactionService.findAll();
    return {
      success: true,
      data: transactions
    };
  }

  @Get('reports/summary')
  async getSummary() {
    const summary = await this.transactionService.getSalesSummary();
    return {
      success: true,
      data: summary
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const transaction = await this.transactionService.findOne(id);
    return {
      success: true,
      data: transaction
    };
  }

  @Post(':id/refund')
  async refund(@Param('id') id: string) {
    const updated = await this.transactionService.refund(id);
    return {
      success: true,
      message: 'تم استرجاع العملية بنجاح',
      data: updated
    };
  }
}