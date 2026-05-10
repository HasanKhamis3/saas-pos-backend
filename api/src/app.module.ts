import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// استدعاء الملفات الفعلية الموجودة لديك في مجلد pos
import { TransactionController } from './modules/pos/controllers/transaction.controller';
import { TransactionService } from './modules/pos/services/transaction.service';
import { Transaction } from './modules/pos/entities/transaction.entity';

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

    // ربط جدول العمليات بالوحدة الحالية
    TypeOrmModule.forFeature([Transaction]),
  ],
  // تفعيل مسار العمليات برمجياً
  controllers: [AppController, TransactionController],
  providers: [AppService, TransactionService],
})
export class AppModule {}