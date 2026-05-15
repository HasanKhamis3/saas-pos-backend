import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // ✅ حارس الـ JWT الرسمي من NestJS
import { ProductService } from '../services/product.service';

@Controller('api/v1/pos/products')
@UseGuards(AuthGuard('jwt')) // ✅ هنا السحر: أي طلب بدون توكن سيتم طرده فوراً بـ 401 Unauthorized
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() data: any) {
    const product = await this.productService.create(data);
    return { success: true, message: 'تم إضافة المنتج بنجاح', data: product };
  }

  @Get('low-stock')
  async getLowStock(
    @Query('vendorId') vendorId: string,
    @Query('threshold') threshold?: string,
  ) {
    const limit = threshold ? parseInt(threshold, 10) : 5;
    const products = await this.productService.findLowStock(vendorId, limit);
    return { success: true, count: products.length, data: products };
  }

  @Get()
  async findAll(@Query('vendorId') vendorId: string) {
    const products = await this.productService.findAll(vendorId);
    return { success: true, data: products };
  }
}