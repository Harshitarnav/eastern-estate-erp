import { EntryType } from '../entities/material-entry.entity';
export declare class CreateMaterialEntryDto {
    materialId: string;
    entryType: EntryType;
    quantity: number;
    unitPrice: number;
    totalValue: number;
    vendorId?: string;
    purchaseOrderId?: string;
    entryDate?: string;
    invoiceNumber?: string;
    remarks?: string;
}
