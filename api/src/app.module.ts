import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// استدعاء العمليات (موجودة سابقاً)
import { TransactionController } from './modules/pos/controllers/transaction.controller';
import { TransactionService } from './modules/pos/services/transaction.service';
import { PosTransaction } from './modules/pos/entities/transaction.entity';

// استدعاء الموردين (إضافة جديدة لفتح المسار)
import { VendorController } from './modules/pos/controllers/vendor.controller';
import { VendorService } from './modules/pos/services/vendor.service';
import { Vendor } from './modules/pos/entities/vendor.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: 5432,
      username: process.env.DATABASE_USER || 'saas_admin',
      password: process.env.DATABASE_PASSWORD || 'SECURE_PASS_HERE',
      database: process.env.DATABASE_NAME || 'saas_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, 
    }),
    // ربط الجدولين معاً
    TypeOrmModule.forFeature([PosTransaction, Vendor]),
  ],
  // تفعيل الـ Controllers لفتح الروابط
  controllers: [AppController, TransactionController, VendorController],
  providers: [AppService, TransactionService, VendorService],
})
export class AppModule {}