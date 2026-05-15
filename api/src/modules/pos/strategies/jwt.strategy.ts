import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // يخبر الحارس أن يبحث عن التوكن في رأس الطلب (Authorization: Bearer <token>)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // يجب أن يكون مطابقاً تماماً للمفتاح السري الموجود في AppModule
      secretOrKey: 'super_secret_jwt_key_2026', 
    });
  }

  // هذه الدالة تعمل تلقائياً إذا كان التوكن صحيحاً، وتمرر بيانات الموظف للكنترولر
  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      role: payload.role, 
      vendorId: payload.vendorId 
    };
  }
}