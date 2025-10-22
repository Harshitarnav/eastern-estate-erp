import { PurchaseOrder } from './purchase-order.entity';
import { Material } from '../../materials/entities/material.entity';
export declare class PurchaseOrderItem {
    id: string;
    purchaseOrderId: string;
    purchaseOrder: PurchaseOrder;
    materialId: string;
    material: Material;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    taxPercentage: number;
    taxAmount: number;
    discountPercentage: number;
    discountAmount: number;
    totalAmount: number;
    quantityReceived: number;
    quantityPending: number;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
