import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ApiKeyGuard } from './api-key.guard';

@Controller('api/v1/pos/products')
@UseGuards(ApiKeyGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() data: any) {
    const product = await this.productService.create(data);
    return { success: true, message: 'تم إضافة المنتج بنجاح', data: product };
  }

  // 🚨 مسار جلب تنبيهات النواقص (مرن يقبل تحديد حد الخطر عبر threshold)
  @Get('low-stock')
  async getLowStock(
    @Query('vendorId') vendorId: string,
    @Query('threshold') threshold?: string,
  ) {
    const limit = threshold ? parseInt(threshold, 10) : 5; // الافتراضي 5 إذا لم يرسل التاجر رقماً
    const products = await this.productService.findLowStock(vendorId, limit);
    return {
      success: true,
      message: `تنبيه: تم جلب المنتجات التي مخزونها يساوي أو أقل من ${limit}`,
      count: products.length,
      data: products,
    };
  }

  @Get()
  async findAll(@Query('vendorId') vendorId: string) {
    const products = await this.productService.findAll(vendorId);
    return { success: true, data: products };
  }
}