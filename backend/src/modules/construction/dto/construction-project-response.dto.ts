import { ConstructionProject } from '../entities/construction-project.entity';

export class ConstructionProjectResponseDto {
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

  static fromEntity(project: ConstructionProject): ConstructionProjectResponseDto {
    const dto = new ConstructionProjectResponseDto();
    dto.id = project.id;
    dto.projectCode = project.projectCode;
    dto.projectName = project.projectName;
    dto.description = project.description;
    dto.propertyId = project.propertyId;
    dto.towerId = project.towerId;
    dto.projectPhase = project.projectPhase;
    dto.projectStatus = project.projectStatus;
    dto.overallProgress = Number(project.overallProgress);
    dto.plannedStartDate = project.plannedStartDate?.toString();
    dto.plannedEndDate = project.plannedEndDate?.toString();
    dto.actualStartDate = project.actualStartDate?.toString();
    dto.actualEndDate = project.actualEndDate?.toString();
    dto.estimatedCompletionDate = project.estimatedCompletionDate?.toString();
    dto.delayDays = project.delayDays;
    dto.mainContractorName = project.mainContractorName;
    dto.mainContractorPhone = project.mainContractorPhone;
    dto.estimatedBudget = Number(project.estimatedBudget);
    dto.actualCost = Number(project.actualCost);
    dto.materialCost = Number(project.materialCost);
    dto.laborCost = Number(project.laborCost);
    dto.projectManager = project.projectManager;
    dto.siteEngineer = project.siteEngineer;
    dto.workersCount = project.workersCount;
    dto.totalInspections = project.totalInspections;
    dto.passedInspections = project.passedInspections;
    dto.failedInspections = project.failedInspections;
    dto.safetyCompliant = project.safetyCompliant;
    dto.allPermitsObtained = project.allPermitsObtained;
    dto.photos = project.photos;
    dto.notes = project.notes;
    dto.tags = project.tags;
    dto.isActive = project.isActive;
    dto.createdAt = project.createdAt?.toString();
    dto.updatedAt = project.updatedAt?.toString();

    if (project.property) {
      dto.property = project.property;
    }
    if (project.tower) {
      dto.tower = project.tower;
    }
    if (project.milestones) {
      dto.milestones = project.milestones;
    }
    if (project.inspections) {
      dto.inspections = project.inspections;
    }

    return dto;
  }

  static fromEntities(projects: ConstructionProject[]): ConstructionProjectResponseDto[] {
    return projects.map((project) => this.fromEntity(project));
  }
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
