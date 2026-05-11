import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ApiKeyGuard } from '../../../shared/guards/api-key.guard';

@Controller('api/v1/pos/products') // ✅ هذا هو المسار الذي سيبحث عنه curl
@UseGuards(ApiKeyGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() data: any) {
    const product = await this.productService.create(data);
    return {
      success: true,
      message: 'تم إضافة المنتج بنجاح',
      data: product
    };
  }

  @Get()
  async findAll(@Query('vendorId') vendorId: string) {
    const products = await this.productService.findAll(vendorId);
    return {
      success: true,
      data: products
    };
  }
}