import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ProductService } from '../services/product.service';

@Controller('api/v1/pos/products')
// تطبيق الحماية على كل مسارات المنتجات
@UseGuards(AuthGuard('jwt'), RolesGuard) 
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 🛒 الكاشير والمدير يمكنهم رؤية المنتجات (نأخذ المعرف من التوكن سراً)
  @Get()
  async getProducts(@Request() req: any) {
    const vendorId = req.user.vendorId; // 🔐 أمان تام: مستحيل التلاعب به
    const products = await this.productService.getProducts(vendorId);
    return { success: true, data: products };
  }

  // ⛔ المدير فقط يمكنه إضافة منتجات جديدة لمتجره
  @Post()
  @Roles(UserRole.MANAGER)
  async createProduct(@Request() req: any, @Body() body: any) {
    const vendorId = req.user.vendorId;
    // ندمج بيانات المنتج مع معرف متجر المدير إجبارياً
    const productData = { ...body, vendorId };
    const product = await this.productService.createProduct(productData);
    return { success: true, message: 'تم إضافة المنتج بنجاح', data: product };
  }
}