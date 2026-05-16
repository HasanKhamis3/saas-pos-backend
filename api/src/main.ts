import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. تفعيل الـ ValidationPipe العالمي للتحقق من صحة البيانات المدخلة
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // تجاهل أي حقول زائدة لم يتم تعريفها في الـ DTO
      transform: true, // تحويل أنواع البيانات تلقائياً (مثل السلاسل النصية إلى أرقام)
    }),
  );

  // 2. 🔥 السحر هنا: تفعيل ميزة CORS لفتح الأبواب الآمنة للواجهة الأمامية (Frontend)
  app.enableCors({
    origin: '*', // يسمح لجميع النطاقات بالوصول، وهو ممتاز لبيئة التطوير والـ Codespaces
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // السماح بنقل ملفات تعريف الارتباط أو التوكنز في الهيدر إذا لزم الأمر
  });

  // 3. تحديد مسار برمجى موحد لجميع الـ APIs
  app.setGlobalPrefix('api/v1');

  // 4. تشغيل السيرفر على المنفذ 3000
  await app.listen(3000);
  console.log(`🚀 application is running on: ${await app.getUrl()}`);
}
bootstrap();