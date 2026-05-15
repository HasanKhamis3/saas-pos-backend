import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PosTransaction } from './modules/pos/entities/transaction.entity';
import { Product } from './modules/pos/entities/product.entity';
import { User } from './modules/pos/entities/user.entity';

import { TransactionController } from './modules/pos/controllers/transaction.controller';
import { TransactionService } from './modules/pos/services/transaction.service';
import { ProductController } from './modules/pos/controllers/product.controller';
import { ProductService } from './modules/pos/services/product.service';

// استدعاء المصادقة الجديدة
import { AuthController } from './modules/pos/controllers/auth.controller';
import { AuthService } from './modules/pos/services/auth.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: 5432,
      username: process.env.DATABASE_USER || 'saas_admin',
      password: process.env.DATABASE_PASSWORD || 'SECURE_PASS_HERE',
      database: process.env.DATABASE_NAME || 'saas_db',
      entities: [PosTransaction, Product, User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([PosTransaction, Product, User]),
  ],
  // ✅ إضافة الكنترولر الجديد
  controllers: [AppController, TransactionController, ProductController, AuthController],
  // ✅ إضافة الخدمة الجديدة
  providers: [AppService, TransactionService, ProductService, AuthService],
})
export class AppModule {}