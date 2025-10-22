import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    create(createMaterialDto: CreateMaterialDto): Promise<import("./entities/material.entity").Material>;
    findAll(category?: string, isActive?: string, lowStock?: string): Promise<import("./entities/material.entity").Material[]>;
    getLowStock(): Promise<import("./entities/material.entity").Material[]>;
    getStatistics(): Promise<{
        totalMaterials: number;
        lowStockCount: number;
        totalValue: number;
        byCategory: Record<string, {
            count: number;
            value: number;
        }>;
    }>;
    findOne(id: string): Promise<import("./entities/material.entity").Material>;
    update(id: string, updateMaterialDto: UpdateMaterialDto): Promise<import("./entities/material.entity").Material>;
    updateStock(id: string, quantity: number, operation: 'add' | 'subtract'): Promise<import("./entities/material.entity").Material>;
    remove(id: string): Promise<void>;
}
