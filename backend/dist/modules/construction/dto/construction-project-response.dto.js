"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionProjectResponseDto = void 0;
class ConstructionProjectResponseDto {
    static fromEntity(project) {
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
    static fromEntities(projects) {
        return projects.map((project) => this.fromEntity(project));
    }
}
exports.ConstructionProjectResponseDto = ConstructionProjectResponseDto;
//# sourceMappingURL=construction-project-response.dto.js.map