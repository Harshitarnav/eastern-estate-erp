import { ConstructionProject } from './construction-project.entity';
import { User } from '../../users/entities/user.entity';
export declare enum QCPhase {
    FOUNDATION = "FOUNDATION",
    STRUCTURE = "STRUCTURE",
    MEP = "MEP",
    FINISHING = "FINISHING",
    HANDOVER = "HANDOVER"
}
export declare enum QCResult {
    PASS = "PASS",
    FAIL = "FAIL",
    PARTIAL = "PARTIAL",
    PENDING = "PENDING"
}
export interface QCCheckItem {
    id: string;
    description: string;
    status: 'PASS' | 'FAIL' | 'NA' | 'PENDING';
    remarks?: string;
}
export interface QCDefect {
    id: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    resolvedAt?: string;
    resolvedBy?: string;
}
export declare class QCChecklist {
    id: string;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    phase: QCPhase;
    inspectionDate: Date;
    inspectorName: string;
    locationDescription: string | null;
    items: QCCheckItem[];
    defects: QCDefect[];
    overallResult: QCResult;
    notes: string | null;
    nextInspectionDate: Date | null;
    createdBy: string | null;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
    get passCount(): number;
    get failCount(): number;
    get openDefects(): number;
}
