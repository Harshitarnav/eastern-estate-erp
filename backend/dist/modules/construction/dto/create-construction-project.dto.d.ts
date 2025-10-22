import { ConstructionProjectPhase, ConstructionProjectStatus } from '../entities/construction-project.entity';
export declare class CreateConstructionProjectDto {
    propertyId: string;
    towerId?: string;
    projectCode?: string;
    projectName: string;
    projectPhase?: ConstructionProjectPhase;
    startDate?: string;
    expectedCompletionDate?: string;
    overallProgress?: number;
    structureProgress?: number;
    interiorProgress?: number;
    finishingProgress?: number;
    siteEngineerId?: string;
    contractorName?: string;
    contractorContact?: string;
    status?: ConstructionProjectStatus;
    budgetAllocated?: number;
    notes?: string;
}
