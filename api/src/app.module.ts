import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// استدعاء الملفات مع استخدام الاسم الصحيح للكلاس: PosTransaction
import { TransactionController } from './modules/pos/controllers/transaction.controller';
import { TransactionService } from './modules/pos/services/transaction.service';
import { PosTransaction } from './modules/pos/entities/transaction.entity';

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

    // ربط الجدول بالاسم الصحيح
    TypeOrmModule.forFeature([PosTransaction]),
  ],
  controllers: [AppController, TransactionController],
  providers: [AppService, TransactionService],
})
export class AppModule {}