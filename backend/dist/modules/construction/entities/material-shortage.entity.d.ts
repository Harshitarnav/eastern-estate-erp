import { ConstructionProject } from './construction-project.entity';
import { Material } from '../../materials/entities/material.entity';
export declare enum MaterialShortageStatus {
    PENDING = "PENDING",
    PO_RAISED = "PO_RAISED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    RESOLVED = "RESOLVED"
}
export declare enum MaterialShortagePriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class MaterialShortage {
    id: string;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    materialId: string;
    material: Material;
    quantityRequired: number;
    quantityAvailable: number;
    shortageQuantity: number;
    requiredByDate: Date;
    status: MaterialShortageStatus;
    priority: MaterialShortagePriority;
    impactOnSchedule: string;
    createdAt: Date;
    updatedAt: Date;
    get isResolved(): boolean;
    get isOverdue(): boolean;
    get isUrgent(): boolean;
    get shortagePercentage(): number;
    get daysUntilRequired(): number;
    get hasPOBeenRaised(): boolean;
}
