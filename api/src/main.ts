import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. تفعيل الـ ValidationPipe العالمي للتحقق من صحة البيانات المدخلة
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // تجاهل أي حقول زائدة لم يتم تعريفها في الـ DTO
      transform: true, // تحويل أنواع البيانات تلقائياً
    }),
  );

  // 2. 🔥 تفعيل ميزة CORS بذكاء لتجاوز فخ المتصفحات (استخدام true بدلاً من النجمة)
  app.enableCors({
    origin: true, // هذه الكلمة السحرية ستعكس رابط الواجهة تلقائياً وتسمح له بالدخول
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. تحديد مسار برمجي موحد لجميع الـ APIs
  app.setGlobalPrefix('api/v1');

  // 4. تشغيل السيرفر على المنفذ 3000
  await app.listen(3000);
  console.log(`🚀 application is running on: ${await app.getUrl()}`);
}
bootstrap();