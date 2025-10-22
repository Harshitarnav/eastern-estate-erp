import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import { PurchaseOrderStatus } from './entities/purchase-order.entity';
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    create(createDto: CreatePurchaseOrderDto): Promise<import("./entities/purchase-order.entity").PurchaseOrder>;
    findAll(query: QueryPurchaseOrderDto): Promise<{
        data: import("./entities/purchase-order.entity").PurchaseOrder[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<any[]>;
    findOne(id: string): Promise<import("./entities/purchase-order.entity").PurchaseOrder>;
    update(id: string, updateDto: UpdatePurchaseOrderDto): Promise<import("./entities/purchase-order.entity").PurchaseOrder>;
    updateStatus(id: string, status: PurchaseOrderStatus): Promise<import("./entities/purchase-order.entity").PurchaseOrder>;
    remove(id: string): Promise<void>;
}
