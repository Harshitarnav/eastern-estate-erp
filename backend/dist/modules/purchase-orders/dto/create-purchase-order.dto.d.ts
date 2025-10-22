import { PurchaseOrderStatus } from '../entities/purchase-order.entity';
export declare class CreatePurchaseOrderDto {
    poNumber?: string;
    poDate?: string;
    vendorId: string;
    propertyId?: string;
    constructionProjectId?: string;
    status?: PurchaseOrderStatus;
    expectedDeliveryDate?: string;
    subtotal?: number;
    taxAmount?: number;
    discountAmount?: number;
    totalAmount: number;
    paymentTerms?: string;
    advancePaid?: number;
    deliveryAddress?: string;
    deliveryContact?: string;
    deliveryPhone?: string;
    notes?: string;
    termsAndConditions?: string;
}
