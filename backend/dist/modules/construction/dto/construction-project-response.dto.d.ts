import { ConstructionProject } from '../entities/construction-project.entity';
export declare class ConstructionProjectResponseDto {
    id: string;
    projectCode: string;
    projectName: string;
    description?: string;
    propertyId: string;
    towerId?: string;
    projectPhase: string;
    projectStatus: string;
    overallProgress: number;
    plannedStartDate: string;
    plannedEndDate: string;
    actualStartDate?: string;
    actualEndDate?: string;
    estimatedCompletionDate?: string;
    delayDays: number;
    mainContractorName?: string;
    mainContractorPhone?: string;
    estimatedBudget: number;
    actualCost: number;
    materialCost: number;
    laborCost: number;
    projectManager?: string;
    siteEngineer?: string;
    workersCount: number;
    totalInspections: number;
    passedInspections: number;
    failedInspections: number;
    safetyCompliant: boolean;
    allPermitsObtained: boolean;
    photos?: string[];
    notes?: string;
    tags?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    property?: any;
    tower?: any;
    milestones?: any[];
    inspections?: any[];
    static fromEntity(project: ConstructionProject): ConstructionProjectResponseDto;
    static fromEntities(projects: ConstructionProject[]): ConstructionProjectResponseDto[];
}
export interface PaginatedConstructionProjectsResponse {
    data: ConstructionProjectResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
