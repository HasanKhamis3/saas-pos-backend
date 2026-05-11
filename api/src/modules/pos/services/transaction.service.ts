import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { getTenantId } from '../../../core/tenancy/tenant.context';
import { Vendor } from '../../tenants/entities/vendor.entity';
import { PosTransaction } from '../entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(private readonly dataSource: DataSource) {}

  async processSale(dto: CreateTransactionDto): Promise<PosTransaction> {
    const tenantId = getTenantId();
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    // نبدأ معاملة قاعدة البيانات لضمان سلامة البيانات المالية
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      // 1. التحقق من وجود المورد وأنه نشط وتابع لنفس الحساب (Tenant)
      const vendor = await queryRunner.manager.findOne(Vendor, {
        where: { id: dto.vendorId, tenantId, isActive: true }
      });

      if (!vendor) {
        throw new BadRequestException('المورد غير موجود أو غير نشط حالياً');
      }

      // 2. الحسابات المالية
      const totalAmount = dto.totalAmount;
      const systemCommission = (totalAmount * vendor.commissionRate) / 100;
      const vendorPayout = totalAmount - systemCommission;

      // 3. إنشاء سجل العملية
      const transaction = queryRunner.manager.create(PosTransaction, {
        tenantId,
        vendorId: vendor.id,
        totalAmount,
        systemCommission: Number(systemCommission.toFixed(3)),
        vendorPayout: Number(vendorPayout.toFixed(3)),
        paymentMethod: dto.paymentMethod,
      });

      // 4. الحفظ النهائي
      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      // في حال حدوث أي خطأ، يتم التراجع عن كل التغييرات في قاعدة البيانات
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('فشلت عملية الدفع، يرجى المحاولة لاحقاً', (error as Error).message);
    } finally {
      // إغلاق الاتصال بعد الانتهاء
      await queryRunner.release();
    }
  }
}// إضافة دالة الاسترجاع
  async findAll() {
    // ملاحظة: تأكد أن اسم المتغير transactionRepository يطابق الموجود عندك في الـ constructor
    return await this.transactionRepository.find({
      order: { createdAt: 'DESC' }, // لترتيب الفواتير من الأحدث للأقدم (اختياري)
    });
  }