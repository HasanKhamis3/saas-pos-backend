import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionService } from '../services/transaction.service';
import { ApiKeyGuard } from '../../../shared/guards/api-key.guard'; // 🔐 تم ضبط المسار للرجوع 3 مستويات

@Controller('api/v1/pos/transactions')
@UseGuards(ApiKeyGuard) // 🛑 تفعيل الحماية بمفتاح الـ API على كل المسارات
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
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    const result = await this.transactionService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      paymentMethod,
    );
    return {
      success: true,
      data: result.transactions,
      meta: result.meta,
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
    const updatedTransaction = await this.transactionService.refund(id);
    return {
      success: true,
      message: 'تم استرجاع الفاتورة وتصفير المبالغ بنجاح',
      data: updatedTransaction
    };
  }
}