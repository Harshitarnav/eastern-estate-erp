import { ConstructionProject } from './construction-project.entity';
import { Property } from '../../properties/entities/property.entity';
import { Tower } from '../../towers/entities/tower.entity';
import { User } from '../../users/entities/user.entity';
export declare enum UpdateVisibility {
    ALL = "ALL",
    INTERNAL = "INTERNAL",
    MANAGEMENT_ONLY = "MANAGEMENT_ONLY"
}
export declare enum DevelopmentUpdateScope {
    PROPERTY = "PROPERTY",
    TOWER = "TOWER",
    COMMON_AREA = "COMMON_AREA"
}
export declare enum DevelopmentUpdateCategory {
    BEAUTIFICATION = "BEAUTIFICATION",
    LIFT = "LIFT",
    HALLWAY_LOBBY = "HALLWAY_LOBBY",
    LANDSCAPING = "LANDSCAPING",
    FACADE_PAINT = "FACADE_PAINT",
    AMENITY = "AMENITY",
    SECURITY_GATES = "SECURITY_GATES",
    UTILITIES_EXTERNAL = "UTILITIES_EXTERNAL",
    SIGNAGE = "SIGNAGE",
    CLEANING = "CLEANING",
    SAFETY = "SAFETY",
    OTHER = "OTHER"
}
export declare class ConstructionDevelopmentUpdate {
    id: string;
    constructionProjectId: string | null;
    constructionProject: ConstructionProject;
    propertyId: string | null;
    property?: Property;
    towerId: string | null;
    tower?: Tower;
    scopeType: DevelopmentUpdateScope | null;
    commonAreaLabel: string | null;
    category: DevelopmentUpdateCategory | null;
    updateDate: Date;
    updateTitle: string;
    updateDescription: string;
    feedbackNotes: string | null;
    images: string[];
    attachments: string[];
    createdBy: string;
    creator: User;
    visibility: UpdateVisibility;
    createdAt: Date;
    updatedAt: Date;
    get hasImages(): boolean;
    get hasAttachments(): boolean;
    get imageCount(): number;
    get attachmentCount(): number;
    get isRecent(): boolean;
}
