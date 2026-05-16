import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// الكيانات (Entities)
import { PosTransaction } from './modules/pos/entities/transaction.entity';
import { Product } from './modules/pos/entities/product.entity';
import { User } from './modules/pos/entities/user.entity';

// المتحكمات والخدمات (Controllers & Services)
import { TransactionController } from './modules/pos/controllers/transaction.controller';
import { TransactionService } from './modules/pos/services/transaction.service';
import { ProductController } from './modules/pos/controllers/product.controller';
import { ProductService } from './modules/pos/services/product.service';
import { AuthController } from './modules/pos/controllers/auth.controller';
import { AuthService } from './modules/pos/services/auth.service';

// ✅ لوحة القيادة التي نسيها النظام
import { DashboardController } from './modules/pos/controllers/dashboard.controller';
import { DashboardService } from './modules/pos/services/dashboard.service';

// الاستراتيجيات
import { JwtStrategy } from './modules/pos/strategies/jwt.strategy';

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
    JwtModule.register({
      secret: 'super_secret_jwt_key_2026', 
      signOptions: { expiresIn: '1d' }, 
    }),
  ],
  // ✅ أضفنا DashboardController هنا
  controllers: [AppController, TransactionController, ProductController, AuthController, DashboardController],
  // ✅ أضفنا DashboardService هنا
  providers: [AppService, TransactionService, ProductService, AuthService, JwtStrategy, DashboardService],
})
export class AppModule {}