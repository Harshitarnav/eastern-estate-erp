import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryItemDto, UpdateInventoryItemDto, QueryInventoryItemDto, InventoryItemResponseDto, PaginatedInventoryItemsResponse } from './dto';
export declare class InventoryService {
    private inventoryRepository;
    constructor(inventoryRepository: Repository<InventoryItem>);
    create(createDto: CreateInventoryItemDto): Promise<InventoryItemResponseDto>;
    findAll(query: QueryInventoryItemDto): Promise<PaginatedInventoryItemsResponse>;
    findOne(id: string): Promise<InventoryItemResponseDto>;
    update(id: string, updateDto: UpdateInventoryItemDto): Promise<InventoryItemResponseDto>;
    remove(id: string): Promise<void>;
    issueItem(id: string, quantity: number): Promise<InventoryItemResponseDto>;
    receiveItem(id: string, quantity: number): Promise<InventoryItemResponseDto>;
    getStatistics(): Promise<{
        total: number;
        inStock: number;
        lowStock: number;
        outOfStock: number;
        totalValue: number;
        totalIssued: number;
        totalReceived: number;
        byCategory: {
            constructionMaterial: number;
            electrical: number;
            plumbing: number;
            hardware: number;
            paint: number;
            tiles: number;
            other: number;
        };
        stockHealthRate: number;
    }>;
}
