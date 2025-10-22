import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrderItemsService } from './purchase-order-items.service';
import { PurchaseOrderItemsController } from './purchase-order-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem])],
  controllers: [PurchaseOrdersController, PurchaseOrderItemsController],
  providers: [PurchaseOrdersService, PurchaseOrderItemsService],
  exports: [PurchaseOrdersService, PurchaseOrderItemsService],
})
export class PurchaseOrdersModule {}
