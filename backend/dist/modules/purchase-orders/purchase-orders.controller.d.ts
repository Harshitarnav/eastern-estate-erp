import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrderDto, PurchaseOrderResponseDto, PaginatedPurchaseOrdersResponse } from './dto';
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    create(createDto: CreatePurchaseOrderDto): Promise<PurchaseOrderResponseDto>;
    findAll(query: QueryPurchaseOrderDto): Promise<PaginatedPurchaseOrdersResponse>;
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
    findOne(id: string): Promise<PurchaseOrderResponseDto>;
    update(id: string, updateDto: UpdatePurchaseOrderDto): Promise<PurchaseOrderResponseDto>;
    remove(id: string): Promise<void>;
    approve(id: string, body: {
        approvedBy: string;
        approvedByName: string;
    }): Promise<PurchaseOrderResponseDto>;
    reject(id: string, body: {
        rejectedBy: string;
        rejectedByName: string;
        reason: string;
    }): Promise<PurchaseOrderResponseDto>;
    receiveItems(id: string, receivedData: any): Promise<PurchaseOrderResponseDto>;
}
