import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import { PurchaseOrderStatus } from './entities/purchase-order.entity';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(createDto);
  }

  @Get()
  findAll(@Query() query: QueryPurchaseOrderDto) {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.purchaseOrdersService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: PurchaseOrderStatus
  ) {
    return this.purchaseOrdersService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}
