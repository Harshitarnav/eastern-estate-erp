import { ProjectPhase, ProjectStatus } from '../entities/construction-project.entity';
export declare class QueryConstructionProjectDto {
    search?: string;
    projectPhase?: ProjectPhase;
    projectStatus?: ProjectStatus;
    propertyId?: string;
    towerId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
