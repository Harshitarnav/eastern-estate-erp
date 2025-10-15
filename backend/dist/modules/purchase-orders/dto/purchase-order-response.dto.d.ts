import { PurchaseOrder } from '../entities/purchase-order.entity';
export declare class PurchaseOrderResponseDto {
    id: string;
    orderNumber: string;
    orderDate: string;
    orderStatus: string;
    supplierId: string;
    supplierName: string;
    supplierEmail?: string;
    supplierPhone?: string;
    items: any[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingCost: number;
    totalAmount: number;
    paymentStatus: string;
    paymentTerms: string;
    paidAmount: number;
    balanceAmount: number;
    paymentDueDate?: string;
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    totalItemsOrdered: number;
    totalItemsReceived: number;
    invoiceNumber?: string;
    notes?: string;
    tags?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    static fromEntity(order: PurchaseOrder): PurchaseOrderResponseDto;
    static fromEntities(orders: PurchaseOrder[]): PurchaseOrderResponseDto[];
}
export interface PaginatedPurchaseOrdersResponse {
    data: PurchaseOrderResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
