import { Property } from '../../properties/entities/property.entity';
import { Tower } from '../../towers/entities/tower.entity';
import { User } from '../../users/entities/user.entity';
import { ConstructionProject } from './construction-project.entity';
export declare enum ProgressType {
    STRUCTURE = "STRUCTURE",
    INTERIOR = "INTERIOR",
    FINISHING = "FINISHING",
    QUALITY_CHECK = "QUALITY_CHECK"
}
export declare enum ShiftType {
    DAY = "DAY",
    NIGHT = "NIGHT"
}
export declare class ConstructionProgressLog {
    id: string;
    propertyId: string | null;
    property: Property;
    towerId: string | null;
    tower: Tower;
    constructionProjectId: string | null;
    constructionProject: ConstructionProject;
    logDate: Date;
    progressType: ProgressType | null;
    description: string | null;
    progressPercentage: number | null;
    photos: any;
    weatherCondition: string | null;
    temperature: number | null;
    loggedBy: string | null;
    logger: User;
    shift: ShiftType | null;
    workersPresent: number | null;
    workersAbsent: number | null;
    materialsUsed: string | null;
    issuesDelays: string | null;
    supervisorName: string | null;
    nextDayPlan: string | null;
    remarks: string | null;
    createdAt: Date;
}
