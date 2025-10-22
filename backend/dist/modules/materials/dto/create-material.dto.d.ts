import { MaterialCategory, UnitOfMeasurement } from '../entities/material.entity';
export declare class CreateMaterialDto {
    materialCode: string;
    materialName: string;
    category: MaterialCategory;
    unitOfMeasurement: UnitOfMeasurement;
    currentStock?: number;
    minimumStockLevel?: number;
    maximumStockLevel?: number;
    unitPrice?: number;
    gstPercentage?: number;
    specifications?: string;
    isActive?: boolean;
}
