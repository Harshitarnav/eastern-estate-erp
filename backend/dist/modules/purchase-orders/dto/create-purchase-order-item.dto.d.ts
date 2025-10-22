export declare class CreatePurchaseOrderItemDto {
    purchaseOrderId: string;
    materialId: string;
    quantity: number;
    unitPrice: number;
    taxPercentage?: number;
    discountPercentage?: number;
    notes?: string;
}
