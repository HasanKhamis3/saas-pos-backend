import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // ✅ استدعاء خدمة التوكن

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService, // ✅ حقن خدمة التوكن
  ) {}

  async register(data: any): Promise<any> {
    const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
    if (existingUser) throw new BadRequestException('البريد الإلكتروني مسجل مسبقاً');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || UserRole.CASHIER,
      vendorId: data.vendorId,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  // 🔑 دالة تسجيل الدخول الجديدة
  async login(data: any): Promise<any> {
    // 1. البحث عن المستخدم بالبريد الإلكتروني
    const user = await this.userRepository.findOne({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // 2. مطابقة كلمة المرور المدخلة مع المشفرة في قاعدة البيانات
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // 3. توليد التوكن (JWT) ويحتوي على بيانات المستخدم الأساسية
    const payload = { sub: user.id, role: user.role, vendorId: user.vendorId };
    const accessToken = this.jwtService.sign(payload);

    const { password, ...userData } = user;

    // 4. إرجاع بيانات المستخدم + التوكن
    return {
      user: userData,
      accessToken,
    };
  }
}