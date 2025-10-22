import { ConstructionPhase, PhaseStatus } from '../entities/construction-tower-progress.entity';
export declare class CreateTowerProgressDto {
    constructionProjectId: string;
    towerId: string;
    phase: ConstructionPhase;
    phaseProgress?: number;
    overallProgress?: number;
    startDate?: string;
    expectedEndDate?: string;
    actualEndDate?: string;
    status?: PhaseStatus;
    notes?: string;
}
