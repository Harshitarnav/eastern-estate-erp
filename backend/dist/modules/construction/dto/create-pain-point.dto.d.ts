import { PainPointType, PainPointSeverity, PainPointStatus } from '../entities/pain-point.entity';
export declare class CreatePainPointDto {
    constructionProjectId: string;
    reportedBy: string;
    painPointType: PainPointType;
    title: string;
    description: string;
    severity: PainPointSeverity;
    status?: PainPointStatus;
    reportedDate?: string;
    resolutionNotes?: string;
}
