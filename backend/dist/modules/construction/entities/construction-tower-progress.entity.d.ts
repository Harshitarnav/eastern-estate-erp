import { ConstructionProject } from './construction-project.entity';
import { Tower } from '../../towers/entities/tower.entity';
export declare enum ConstructionPhase {
    FOUNDATION = "FOUNDATION",
    STRUCTURE = "STRUCTURE",
    MEP = "MEP",
    FINISHING = "FINISHING",
    HANDOVER = "HANDOVER"
}
export declare enum PhaseStatus {
    NOT_STARTED = "NOT_STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    ON_HOLD = "ON_HOLD"
}
export declare class ConstructionTowerProgress {
    id: string;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    towerId: string;
    tower: Tower;
    phase: ConstructionPhase;
    phaseProgress: number;
    overallProgress: number;
    startDate: Date | null;
    expectedEndDate: Date | null;
    actualEndDate: Date | null;
    status: PhaseStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    get isDelayed(): boolean;
    get daysRemaining(): number | null;
    get isCompleted(): boolean;
}
