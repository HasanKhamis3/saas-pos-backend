import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { DashboardService } from '../services/dashboard.service';

@Controller('api/v1/pos/dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('best-sellers')
  @Roles(UserRole.MANAGER) // ⛔ حماية صارمة للمدير فقط
  async getBestSellers(@Request() req: any) {
    // 🔐 استخراج الـ vendorId من التوكن نفسه لمنع التلاعب
    const vendorId = req.user.vendorId;
    
    const data = await this.dashboardService.getBestSellers(vendorId);
    return {
      success: true,
      message: 'تم جلب المنتجات الأكثر مبيعاً بنجاح',
      data
    };
  }
}