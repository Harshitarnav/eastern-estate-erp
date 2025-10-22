import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
export declare class PurchaseOrdersService {
    private readonly purchaseOrderRepository;
    constructor(purchaseOrderRepository: Repository<PurchaseOrder>);
    create(createDto: CreatePurchaseOrderDto): Promise<PurchaseOrder>;
    findAll(query: QueryPurchaseOrderDto): Promise<{
        data: PurchaseOrder[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<PurchaseOrder>;
    update(id: string, updateDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder>;
    updateStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder>;
    remove(id: string): Promise<void>;
    getStats(): Promise<any[]>;
}
