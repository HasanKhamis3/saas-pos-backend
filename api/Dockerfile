# استخدام نسخة Node مستقرة وخفيفة
FROM node:20-alpine

# تحديد مجلد العمل داخل الحاوية
WORKDIR /usr/src/app

# نسخ ملفات التعريف وتثبيت المكتبات
COPY package*.json ./
RUN npm install

# نسخ بقية الكود
COPY . .

# بناء المشروع (تحويل Typescript إلى Javascript)
RUN npm run build

# تحديد المنفذ
EXPOSE 3000

# أمر التشغيل النهائي
CMD ["npm", "run", "start:prod"]