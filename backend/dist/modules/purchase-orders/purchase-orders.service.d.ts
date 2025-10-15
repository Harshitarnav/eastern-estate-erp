import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto, PurchaseOrderResponseDto, PaginatedPurchaseOrdersResponse } from './dto';
export declare class PurchaseOrdersService {
    private purchaseOrderRepository;
    constructor(purchaseOrderRepository: Repository<PurchaseOrder>);
    create(createDto: CreatePurchaseOrderDto): Promise<PurchaseOrderResponseDto>;
    private calculateOrderTotals;
    findAll(query: QueryPurchaseOrderDto): Promise<PaginatedPurchaseOrdersResponse>;
    findOne(id: string): Promise<PurchaseOrderResponseDto>;
    update(id: string, updateDto: UpdatePurchaseOrderDto): Promise<PurchaseOrderResponseDto>;
    remove(id: string): Promise<void>;
    approve(id: string, approvedBy: string, approvedByName: string): Promise<PurchaseOrderResponseDto>;
    reject(id: string, rejectedBy: string, rejectedByName: string, reason: string): Promise<PurchaseOrderResponseDto>;
    receiveItems(id: string, receivedData: any): Promise<PurchaseOrderResponseDto>;
    getStatistics(): Promise<{
        total: number;
        draft: number;
        pending: number;
        approved: number;
        received: number;
        totalAmount: number;
        paidAmount: number;
        balanceAmount: number;
    }>;
}
