import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    const filters: any = {};
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (lowStock !== undefined) filters.lowStock = lowStock === 'true';
    
    return this.materialsService.findAll(filters);
  }

  @Get('low-stock')
  getLowStock() {
    return this.materialsService.getLowStockMaterials();
  }

  @Get('statistics')
  getStatistics() {
    return this.materialsService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Patch(':id/stock')
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Body('operation') operation: 'add' | 'subtract',
  ) {
    return this.materialsService.updateStock(id, quantity, operation);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }
}
