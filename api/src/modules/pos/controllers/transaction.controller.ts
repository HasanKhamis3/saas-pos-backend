import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionService } from '../services/transaction.service';

@Controller('api/v1/pos/transactions')
// ✅ تطبيق حارس التوكن وحارس الصلاحيات على كل مسارات هذا الملف
@UseGuards(AuthGuard('jwt'), RolesGuard) 
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // 🛒 البيع مسموح للجميع (المدير والكاشير) لذلك لا نضع ملصق
  @Post('checkout')
  async checkout(@Body() dto: CreateTransactionDto) {
    const receipt = await this.transactionService.processSale(dto);
    return { success: true, message: 'تمت عملية البيع بنجاح', data: receipt };
  }

  // ⛔ حماية صارمة: الاسترجاع للمدير فقط
  @Post(':id/refund')
  @Roles(UserRole.MANAGER)
  async refund(@Param('id') id: string) {
    const refundedTransaction = await this.transactionService.refund(id);
    return {
      success: true,
      message: 'تم استرجاع الفاتورة وإعادة المنتجات للمخزون بنجاح',
      data: refundedTransaction
    };
  }

  // ⛔ حماية صارمة: التقارير للمدير فقط
  @Get('reports/summary')
  @Roles(UserRole.MANAGER)
  async getSummary() {
    const summary = await this.transactionService.getSalesSummary();
    return { success: true, data: summary };
  }
}