import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ProductService } from '../services/product.service';

@Controller('api/v1/pos/products')
@UseGuards(AuthGuard('jwt'), RolesGuard) 
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(@Request() req: any) {
    return { success: true, data: await this.productService.getProducts(req.user.vendorId) };
  }

  @Post()
  @Roles(UserRole.MANAGER)
  async createProduct(@Request() req: any, @Body() body: any) {
    const productData = { ...body, vendorId: req.user.vendorId };
    return { success: true, message: 'تم إضافة المنتج بنجاح', data: await this.productService.createProduct(productData) };
  }

  // 🔄 مسار تحديث المنتج (تغيير السعر، تزويد المخزون، إلخ) - للمدير فقط
  @Patch(':id')
  @Roles(UserRole.MANAGER)
  async updateProduct(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const vendorId = req.user.vendorId;
    const product = await this.productService.updateProduct(id, vendorId, body);
    return { success: true, message: 'تم تحديث بيانات المنتج بنجاح', data: product };
  }
}