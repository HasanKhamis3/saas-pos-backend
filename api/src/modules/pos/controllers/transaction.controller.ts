import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { TransactionService } from '../services/transaction.service';

@Controller('api/v1/pos/transactions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // 🔥 الإضافة الجديدة: المسار الذي كانت تبحث عنه الواجهة (Dashboard)
  @Get()
  @Roles(UserRole.MANAGER, UserRole.CASHIER)
  async getTransactions(@Request() req: any) {
    const vendorId = req.user.vendorId;
    const data = await this.transactionService.getTransactions(vendorId);
    return { success: true, data };
  }

  @Post('checkout')
  @Roles(UserRole.CASHIER, UserRole.MANAGER)
  async checkout(@Request() req: any, @Body() body: any) {
    // من التوكن سراً ونلغي أي محاولة للتلاعب vendorId نفرض الـ
    const securePayload = {
      ...body,
      vendorId: req.user.vendorId,
    };
    const result = await this.transactionService.checkout(securePayload);
    return { success: true, message: 'تمت عملية البيع بنجاح بأمان تام', data: result };
  }

  @Post(':id/refund')
  @Roles(UserRole.MANAGER) // الاسترجاع للمدير فقط
  async refund(@Request() req: any, @Param('id') transactionId: string) {
    const vendorId = req.user.vendorId;
    const result = await this.transactionService.processRefund(transactionId, vendorId);
    return { success: true, message: 'تم استرجاع الفاتورة بنجاح', data: result };
  }
}