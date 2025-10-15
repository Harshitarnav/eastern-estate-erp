import { OrderStatus, PaymentStatus } from '../entities/purchase-order.entity';
export declare class QueryPurchaseOrderDto {
    search?: string;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    supplierId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
