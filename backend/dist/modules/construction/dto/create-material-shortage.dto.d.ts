import { MaterialShortageStatus, MaterialShortagePriority } from '../entities/material-shortage.entity';
export declare class CreateMaterialShortageDto {
    constructionProjectId: string;
    materialId: string;
    quantityRequired: number;
    quantityAvailable?: number;
    shortageQuantity: number;
    requiredByDate: string;
    status?: MaterialShortageStatus;
    priority: MaterialShortagePriority;
    impactOnSchedule?: string;
}
