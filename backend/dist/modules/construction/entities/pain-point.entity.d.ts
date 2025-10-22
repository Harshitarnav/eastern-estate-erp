import { ConstructionProject } from './construction-project.entity';
import { Employee } from '../../employees/entities/employee.entity';
export declare enum PainPointType {
    MATERIAL_SHORTAGE = "MATERIAL_SHORTAGE",
    LABOR_SHORTAGE = "LABOR_SHORTAGE",
    EQUIPMENT_ISSUE = "EQUIPMENT_ISSUE",
    DESIGN_ISSUE = "DESIGN_ISSUE",
    WEATHER = "WEATHER",
    OTHER = "OTHER"
}
export declare enum PainPointSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum PainPointStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED"
}
export declare class PainPoint {
    id: string;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    reportedBy: string;
    reporter: Employee;
    painPointType: PainPointType;
    title: string;
    description: string;
    severity: PainPointSeverity;
    status: PainPointStatus;
    reportedDate: Date;
    resolvedDate: Date;
    resolutionNotes: string;
    createdAt: Date;
    updatedAt: Date;
    get isResolved(): boolean;
    get isCritical(): boolean;
    get isOpenTooLong(): boolean;
    get resolutionTimeInDays(): number | null;
    get daysSinceReported(): number;
    get formattedType(): string;
}
