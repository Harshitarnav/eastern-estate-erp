import { InventoryItem } from '../entities/inventory-item.entity';
export declare class InventoryItemResponseDto {
    id: string;
    itemCode: string;
    itemName: string;
    description?: string;
    category: string;
    brand?: string;
    model?: string;
    quantity: number;
    unit: string;
    minimumStock: number;
    maximumStock: number;
    reorderPoint: number;
    stockStatus: string;
    unitPrice: number;
    totalValue: number;
    lastPurchasePrice?: number;
    lastPurchaseDate?: string;
    supplierName?: string;
    supplierEmail?: string;
    supplierPhone?: string;
    propertyId?: string;
    warehouseLocation?: string;
    specification?: string;
    batchNumber?: string;
    serialNumber?: string;
    totalIssued: number;
    totalReceived: number;
    lastIssuedDate?: string;
    lastReceivedDate?: string;
    images?: string[];
    notes?: string;
    tags?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    property?: any;
    static fromEntity(item: InventoryItem): InventoryItemResponseDto;
    static fromEntities(items: InventoryItem[]): InventoryItemResponseDto[];
}
export interface PaginatedInventoryItemsResponse {
    data: InventoryItemResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
