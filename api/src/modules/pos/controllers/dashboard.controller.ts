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
  @Roles(UserRole.MANAGER)
  async getBestSellers(@Request() req: any) {
    const data = await this.dashboardService.getBestSellers(req.user.vendorId);
    return { success: true, data };
  }

  // ✅ المسار المفقود الذي كان يبحث عنه السيرفر
  @Get('daily-summary')
  @Roles(UserRole.MANAGER)
  async getDailySummary(@Request() req: any) {
    const data = await this.dashboardService.getDailySummary(req.user.vendorId);
    return { success: true, message: 'تم جلب ملخص اليوم بنجاح', data };
  }
}