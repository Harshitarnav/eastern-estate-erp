import { ItemCategory, StockStatus } from '../entities/inventory-item.entity';
export declare class QueryInventoryItemDto {
    search?: string;
    category?: ItemCategory;
    stockStatus?: StockStatus;
    propertyId?: string;
    supplierName?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
