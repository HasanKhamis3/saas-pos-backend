import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // إعداد الاتصال بقاعدة البيانات مع تفعيل المزامنة
    TypeOrmModule.forRoot({
      type: 'postgres',
      // يسحب البيانات تلقائياً من ملف docker-compose الموجود في السيرفر
      host: process.env.DATABASE_HOST || 'postgres',
      port: 5432,
      username: process.env.DATABASE_USER || 'saas_admin',
      password: process.env.DATABASE_PASSWORD || 'SECURE_PASS_HERE',
      database: process.env.DATABASE_NAME || 'saas_db',
      
      // 1. هذا السطر يجبر التطبيق على البحث عن كل ملفات الجداول (.entity.ts) في كامل المشروع
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      
      // 2. هذا هو السطر السحري الذي يقوم بإنشاء الجداول فوراً بمجرد تشغيل التطبيق
      synchronize: true, 
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}