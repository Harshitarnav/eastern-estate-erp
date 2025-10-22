import { Property } from '../../properties/entities/property.entity';
import { Tower } from '../../towers/entities/tower.entity';
import { User } from '../../users/entities/user.entity';
export declare enum ProgressType {
    STRUCTURE = "STRUCTURE",
    INTERIOR = "INTERIOR",
    FINISHING = "FINISHING",
    QUALITY_CHECK = "QUALITY_CHECK"
}
export declare class ConstructionProgressLog {
    id: string;
    propertyId: string;
    property: Property;
    towerId: string | null;
    tower: Tower;
    constructionProjectId: string | null;
    logDate: Date;
    progressType: ProgressType;
    description: string;
    progressPercentage: number | null;
    photos: any;
    weatherCondition: string | null;
    temperature: number | null;
    loggedBy: string;
    logger: User;
    createdAt: Date;
}
