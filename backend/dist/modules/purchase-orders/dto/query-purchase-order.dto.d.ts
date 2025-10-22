import { PurchaseOrderStatus } from '../entities/purchase-order.entity';
export declare class QueryPurchaseOrderDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: PurchaseOrderStatus;
    vendorId?: string;
    propertyId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
