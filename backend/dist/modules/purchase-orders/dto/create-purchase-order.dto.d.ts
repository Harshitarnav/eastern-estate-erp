import { OrderStatus, PaymentTerms } from '../entities/purchase-order.entity';
declare class OrderItemDto {
    itemId: string;
    itemCode: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount?: number;
    taxPercent?: number;
}
export declare class CreatePurchaseOrderDto {
    orderNumber: string;
    orderDate: string;
    orderStatus?: OrderStatus;
    supplierId: string;
    supplierName: string;
    supplierEmail?: string;
    supplierPhone?: string;
    supplierAddress?: string;
    items: OrderItemDto[];
    paymentTerms?: PaymentTerms;
    shippingCost?: number;
    expectedDeliveryDate?: string;
    deliveryAddress?: string;
    notes?: string;
    tags?: string[];
}
export {};
