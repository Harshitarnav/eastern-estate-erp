import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { VendorPaymentsService } from './vendor-payments.service';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { UpdateVendorPaymentDto } from './dto/update-vendor-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('vendor-payments')
@UseGuards(JwtAuthGuard)
export class VendorPaymentsController {
  constructor(private readonly paymentsService: VendorPaymentsService) {}

  @Post()
  create(@Body() createDto: CreateVendorPaymentDto) {
    return this.paymentsService.create(createDto);
  }

  @Get()
  findAll(
    @Query('vendorId') vendorId?: string,
    @Query('poId') poId?: string,
  ) {
    const filters: any = {};
    if (vendorId) filters.vendorId = vendorId;
    if (poId) filters.poId = poId;
    
    return this.paymentsService.findAll(filters);
  }

  @Get('vendor/:vendorId/total')
  getTotalPaid(@Param('vendorId') vendorId: string) {
    return this.paymentsService.getTotalPaidToVendor(vendorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateVendorPaymentDto) {
    return this.paymentsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
