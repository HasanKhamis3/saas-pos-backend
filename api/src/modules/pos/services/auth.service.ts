import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(data: any): Promise<any> {
    // 1. التحقق مما إذا كان البريد الإلكتروني مسجلاً مسبقاً
    const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('البريد الإلكتروني مسجل مسبقاً في النظام');
    }

    // 2. تشفير كلمة المرور (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 3. إنشاء المستخدم الجديد
    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || UserRole.CASHIER, // افتراضياً كاشير إذا لم يُحدد
      vendorId: data.vendorId,
    });

    const savedUser = await this.userRepository.save(user);

    // 4. إزالة كلمة المرور المشفرة من الاستجابة لأسباب أمنية
    const { password, ...result } = savedUser;
    return result;
  }
}