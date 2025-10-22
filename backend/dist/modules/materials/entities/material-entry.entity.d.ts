import { Material } from './material.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { User } from '../../users/entities/user.entity';
export declare enum EntryType {
    PURCHASE = "PURCHASE",
    RETURN = "RETURN",
    ADJUSTMENT = "ADJUSTMENT"
}
export declare class MaterialEntry {
    id: string;
    materialId: string;
    material: Material;
    entryType: EntryType;
    quantity: number;
    unitPrice: number;
    totalValue: number;
    vendorId: string;
    vendor: Vendor;
    purchaseOrderId: string;
    entryDate: Date;
    enteredBy: string;
    enteredByUser: User;
    invoiceNumber: string;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
    get isLinkedToPO(): boolean;
    get formattedEntryType(): string;
}
