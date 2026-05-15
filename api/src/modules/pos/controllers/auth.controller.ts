import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Controller('api/v1/pos/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    const user = await this.authService.register(body);
    return { success: true, message: 'تم تسجيل الموظف بنجاح', data: user };
  }

  // ✅ مسار تسجيل الدخول الجديد
  @Post('login')
  async login(@Body() body: any) {
    const result = await this.authService.login(body);
    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: result,
    };
  }
}