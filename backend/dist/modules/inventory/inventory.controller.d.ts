import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto, QueryInventoryItemDto, InventoryItemResponseDto, PaginatedInventoryItemsResponse } from './dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(createDto: CreateInventoryItemDto): Promise<InventoryItemResponseDto>;
    findAll(query: QueryInventoryItemDto): Promise<PaginatedInventoryItemsResponse>;
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
    findOne(id: string): Promise<InventoryItemResponseDto>;
    update(id: string, updateDto: UpdateInventoryItemDto): Promise<InventoryItemResponseDto>;
    remove(id: string): Promise<void>;
    issue(id: string, body: {
        quantity: number;
    }): Promise<InventoryItemResponseDto>;
    receive(id: string, body: {
        quantity: number;
    }): Promise<InventoryItemResponseDto>;
}
