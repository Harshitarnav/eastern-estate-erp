import { Property } from '../../properties/entities/property.entity';
import { Tower } from '../../towers/entities/tower.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';
export declare enum ConstructionProjectPhase {
    PLANNING = "PLANNING",
    EXCAVATION = "EXCAVATION",
    FOUNDATION = "FOUNDATION",
    STRUCTURE = "STRUCTURE",
    FINISHING = "FINISHING",
    COMPLETE = "COMPLETE"
}
export declare enum ConstructionProjectStatus {
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    DELAYED = "DELAYED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class ConstructionProject {
    id: string;
    propertyId: string;
    property: Property;
    towerId: string | null;
    tower: Tower;
    projectCode: string;
    projectName: string;
    projectPhase: ConstructionProjectPhase;
    startDate: Date | null;
    expectedCompletionDate: Date | null;
    actualCompletionDate: Date | null;
    overallProgress: number;
    structureProgress: number;
    interiorProgress: number;
    finishingProgress: number;
    siteEngineerId: string | null;
    siteEngineer: Employee;
    contractorName: string | null;
    contractorContact: string | null;
    status: ConstructionProjectStatus;
    budgetAllocated: number;
    budgetSpent: number;
    notes: string | null;
    issues: string[] | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    creator: User;
    updatedBy: string | null;
    updater: User;
}
