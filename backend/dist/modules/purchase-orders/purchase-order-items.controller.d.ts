import { PurchaseOrderItemsService } from './purchase-order-items.service';
import { CreatePurchaseOrderItemDto } from './dto/create-purchase-order-item.dto';
import { UpdatePurchaseOrderItemDto } from './dto/update-purchase-order-item.dto';
export declare class PurchaseOrderItemsController {
    private readonly purchaseOrderItemsService;
    constructor(purchaseOrderItemsService: PurchaseOrderItemsService);
    create(createDto: CreatePurchaseOrderItemDto): Promise<import("./entities/purchase-order-item.entity").PurchaseOrderItem>;
    findByPurchaseOrder(purchaseOrderId: string): Promise<import("./entities/purchase-order-item.entity").PurchaseOrderItem[]>;
    getTotalByPurchaseOrder(purchaseOrderId: string): Promise<number>;
    findOne(id: string): Promise<import("./entities/purchase-order-item.entity").PurchaseOrderItem>;
    update(id: string, updateDto: UpdatePurchaseOrderItemDto): Promise<import("./entities/purchase-order-item.entity").PurchaseOrderItem>;
    remove(id: string): Promise<void>;
}
