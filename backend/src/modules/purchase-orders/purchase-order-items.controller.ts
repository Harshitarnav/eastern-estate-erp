import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { PurchaseOrderItemsService } from './purchase-order-items.service';
import { CreatePurchaseOrderItemDto } from './dto/create-purchase-order-item.dto';
import { UpdatePurchaseOrderItemDto } from './dto/update-purchase-order-item.dto';

@Controller('purchase-order-items')
export class PurchaseOrderItemsController {
  constructor(private readonly purchaseOrderItemsService: PurchaseOrderItemsService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseOrderItemDto) {
    return this.purchaseOrderItemsService.create(createDto);
  }

  @Get('purchase-order/:purchaseOrderId')
  findByPurchaseOrder(@Param('purchaseOrderId') purchaseOrderId: string) {
    return this.purchaseOrderItemsService.findByPurchaseOrder(purchaseOrderId);
  }

  @Get('purchase-order/:purchaseOrderId/total')
  getTotalByPurchaseOrder(@Param('purchaseOrderId') purchaseOrderId: string) {
    return this.purchaseOrderItemsService.getTotalByPurchaseOrder(purchaseOrderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrderItemsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderItemDto) {
    return this.purchaseOrderItemsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseOrderItemsService.remove(id);
  }
}
