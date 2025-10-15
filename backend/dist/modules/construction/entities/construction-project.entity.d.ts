import { Property } from '../../properties/entities/property.entity';
import { Tower } from '../../towers/entities/tower.entity';
export declare enum ProjectPhase {
    PLANNING = "PLANNING",
    SITE_PREPARATION = "SITE_PREPARATION",
    FOUNDATION = "FOUNDATION",
    STRUCTURE = "STRUCTURE",
    MASONRY = "MASONRY",
    ROOFING = "ROOFING",
    PLUMBING = "PLUMBING",
    ELECTRICAL = "ELECTRICAL",
    PLASTERING = "PLASTERING",
    FLOORING = "FLOORING",
    PAINTING = "PAINTING",
    FINISHING = "FINISHING",
    LANDSCAPING = "LANDSCAPING",
    HANDOVER = "HANDOVER",
    COMPLETED = "COMPLETED"
}
export declare enum ProjectStatus {
    NOT_STARTED = "NOT_STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    ON_HOLD = "ON_HOLD",
    DELAYED = "DELAYED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum InspectionStatus {
    PENDING = "PENDING",
    PASSED = "PASSED",
    FAILED = "FAILED",
    CONDITIONAL = "CONDITIONAL"
}
export declare class ConstructionProject {
    id: string;
    projectCode: string;
    projectName: string;
    description: string;
    propertyId: string;
    property: Property;
    towerId: string;
    tower: Tower;
    projectPhase: ProjectPhase;
    projectStatus: ProjectStatus;
    overallProgress: number;
    planningProgress: number;
    sitePrepProgress: number;
    foundationProgress: number;
    structureProgress: number;
    masonryProgress: number;
    roofingProgress: number;
    plumbingProgress: number;
    electricalProgress: number;
    plasteringProgress: number;
    flooringProgress: number;
    paintingProgress: number;
    finishingProgress: number;
    landscapingProgress: number;
    plannedStartDate: Date;
    plannedEndDate: Date;
    actualStartDate: Date;
    actualEndDate: Date;
    estimatedCompletionDate: Date;
    delayDays: number;
    mainContractorName: string;
    mainContractorEmail: string;
    mainContractorPhone: string;
    mainContractorAddress: string;
    subContractors: {
        name: string;
        type: string;
        phone: string;
        email?: string;
    }[];
    estimatedBudget: number;
    actualCost: number;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    milestones: {
        id: string;
        name: string;
        phase: string;
        targetDate: string;
        completedDate?: string;
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
        progress: number;
    }[];
    inspections: {
        id: string;
        inspectionType: string;
        inspectionDate: string;
        inspector: string;
        status: InspectionStatus;
        remarks?: string;
        photos?: string[];
    }[];
    totalInspections: number;
    passedInspections: number;
    failedInspections: number;
    materialUsage: {
        itemId: string;
        itemName: string;
        quantityUsed: number;
        unit: string;
        usedDate: string;
    }[];
    workersCount: number;
    engineersCount: number;
    supervisorsCount: number;
    projectManager: string;
    siteEngineer: string;
    safetyIncidents: number;
    lastSafetyInspection: Date;
    safetyCompliant: boolean;
    permits: string[];
    allPermitsObtained: boolean;
    photos: string[];
    documents: string[];
    blueprints: string[];
    weatherDelayDays: number;
    weatherRemarks: string;
    notes: string;
    tags: string[];
    risksIdentified: string;
    mitigationStrategies: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
