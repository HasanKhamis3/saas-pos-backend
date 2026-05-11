import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const secretKey = 'secret_pos_key_2026';

    if (!apiKey || apiKey !== secretKey) {
      throw new UnauthorizedException('غير مصرح لك بالوصول: الرجاء إرسال مفتاح API صحيح');
    }

    return true;
  }
}