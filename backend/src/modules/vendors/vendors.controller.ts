import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  findAll(
    @Query('isActive') isActive?: string,
    @Query('rating') rating?: string,
  ) {
    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (rating) filters.rating = parseFloat(rating);
    
    return this.vendorsService.findAll(filters);
  }

  @Get('top')
  getTopVendors(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.vendorsService.getTopVendors(limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Patch(':id/outstanding')
  updateOutstanding(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('operation') operation: 'add' | 'subtract',
  ) {
    return this.vendorsService.updateOutstanding(id, amount, operation);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(id);
  }
}
