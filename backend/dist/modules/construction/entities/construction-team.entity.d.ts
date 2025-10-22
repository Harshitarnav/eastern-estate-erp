import { Property } from '../../properties/entities/property.entity';
export declare enum TeamType {
    CONTRACTOR = "CONTRACTOR",
    IN_HOUSE = "IN_HOUSE",
    LABOR = "LABOR"
}
export declare class ConstructionTeam {
    id: string;
    teamName: string;
    teamCode: string | null;
    teamType: TeamType;
    propertyId: string | null;
    property: Property;
    constructionProjectId: string | null;
    leaderName: string;
    contactNumber: string;
    email: string | null;
    totalMembers: number;
    activeMembers: number;
    specialization: string | null;
    skills: string[] | null;
    contractStartDate: Date | null;
    contractEndDate: Date | null;
    dailyRate: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
