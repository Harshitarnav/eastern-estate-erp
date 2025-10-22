import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialsService {
    private materialsRepository;
    constructor(materialsRepository: Repository<Material>);
    create(createMaterialDto: CreateMaterialDto): Promise<Material>;
    findAll(filters?: {
        category?: string;
        isActive?: boolean;
        lowStock?: boolean;
    }): Promise<Material[]>;
    findOne(id: string): Promise<Material>;
    findByCode(materialCode: string): Promise<Material>;
    update(id: string, updateMaterialDto: UpdateMaterialDto): Promise<Material>;
    remove(id: string): Promise<void>;
    getLowStockMaterials(): Promise<Material[]>;
    updateStock(id: string, quantity: number, operation: 'add' | 'subtract'): Promise<Material>;
    getStatistics(): Promise<{
        totalMaterials: number;
        lowStockCount: number;
        totalValue: number;
        byCategory: Record<string, {
            count: number;
            value: number;
        }>;
    }>;
}
