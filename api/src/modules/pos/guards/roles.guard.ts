import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. قراءة الصلاحيات المطلوبة لهذه الدالة من الملصق
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // إذا لم يكن هناك ملصق، فهذا يعني أن الدالة متاحة للجميع
    if (!requiredRoles) {
      return true; 
    }

    // 2. جلب بيانات الموظف من التوكن (التي وضعها JwtStrategy سابقاً)
    const { user } = context.switchToHttp().getRequest();

    // 3. التحقق: هل الموظف موجود؟ وهل يمتلك الصلاحية المطلوبة؟
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('عذراً، ليس لديك الصلاحية للقيام بهذه العملية ⛔');
    }

    return true; // تفضل بالدخول ✅
  }
}