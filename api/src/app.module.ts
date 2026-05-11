import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// موديول المبيعات (المعاملات)
import { TransactionController } from './modules/pos/controllers/transaction.controller';
import { TransactionService } from './modules/pos/services/transaction.service';
import { PosTransaction } from './modules/pos/entities/transaction.entity';

// موديول المنتجات والمخزون
import { ProductController } from './modules/pos/controllers/product.controller';
import { ProductService } from './modules/pos/services/product.service';
import { Product } from './modules/pos/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: 5432,
      username: process.env.DATABASE_USER || 'saas_admin',
      password: process.env.DATABASE_PASSWORD || 'SECURE_PASS_HERE',
      database: process.env.DATABASE_NAME || 'saas_db',
      entities: [PosTransaction, Product], // ✅ إضافة Product هنا
      synchronize: true, // ✅ سيقوم بإنشاء جدول المنتجات تلقائياً
    }),
    TypeOrmModule.forFeature([PosTransaction, Product]), // ✅ إضافة Product هنا أيضاً
  ],
  controllers: [AppController, TransactionController, ProductController], // ✅ تفعيل كنترولر المنتجات
  providers: [AppService, TransactionService, ProductService], // ✅ تفعيل خدمة المنتجات
})
export class AppModule {}