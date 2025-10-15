import { ProjectPhase, ProjectStatus } from '../entities/construction-project.entity';
export declare class CreateConstructionProjectDto {
    projectCode: string;
    projectName: string;
    description?: string;
    propertyId: string;
    towerId?: string;
    projectPhase?: ProjectPhase;
    projectStatus?: ProjectStatus;
    overallProgress?: number;
    plannedStartDate: string;
    plannedEndDate: string;
    actualStartDate?: string;
    mainContractorName?: string;
    mainContractorEmail?: string;
    mainContractorPhone?: string;
    estimatedBudget?: number;
    actualCost?: number;
    projectManager?: string;
    siteEngineer?: string;
    workersCount?: number;
    photos?: string[];
    documents?: string[];
    notes?: string;
    tags?: string[];
    isActive?: boolean;
}
