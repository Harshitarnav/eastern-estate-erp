import { Repository } from 'typeorm';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderItemDto } from './dto/create-purchase-order-item.dto';
import { UpdatePurchaseOrderItemDto } from './dto/update-purchase-order-item.dto';
export declare class PurchaseOrderItemsService {
    private readonly purchaseOrderItemRepository;
    constructor(purchaseOrderItemRepository: Repository<PurchaseOrderItem>);
    create(createDto: CreatePurchaseOrderItemDto): Promise<PurchaseOrderItem>;
    findByPurchaseOrder(purchaseOrderId: string): Promise<PurchaseOrderItem[]>;
    findOne(id: string): Promise<PurchaseOrderItem>;
    update(id: string, updateDto: UpdatePurchaseOrderItemDto): Promise<PurchaseOrderItem>;
    remove(id: string): Promise<void>;
    getTotalByPurchaseOrder(purchaseOrderId: string): Promise<number>;
}
