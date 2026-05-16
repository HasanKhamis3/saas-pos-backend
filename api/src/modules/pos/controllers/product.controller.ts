import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductService } from '../services/product.service';

@Controller('api/v1/pos/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getProducts(@Query('vendorId') vendorId: string) {
    const products = await this.productService.getProducts(vendorId);
    return { success: true, data: products };
  }
}