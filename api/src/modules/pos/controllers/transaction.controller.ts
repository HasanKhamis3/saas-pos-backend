import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
// تأكد من مسار استدعاء الخدمة حسب ما هو موجود عندك في أعلى الملف الأصلي
import { TransactionService } from '../services/transaction.service'; 

@Controller('api/v1/pos/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('checkout')
  async checkout(@Body() dto: CreateTransactionDto) {
    // استدعاء الخدمة المالية لمعالجة العملية
    const receipt = await this.transactionService.processSale(dto);

    return {
      success: true,
      message: 'تمت عملية البيع وحساب العمولة بنجاح',
      data: receipt
    };
  }

  // 🚀 إضافة مسار GET الجديد لاسترجاع كل الفواتير
  @Get()
  async findAll() {
    return await this.transactionService.findAll();
  }
}