import { ConstructionPhase, PhaseStatus } from '../entities/construction-tower-progress.entity';
export declare class CreateFlatProgressDto {
    constructionProjectId: string;
    flatId: string;
    phase: ConstructionPhase;
    phaseProgress?: number;
    overallProgress?: number;
    startDate?: string;
    expectedEndDate?: string;
    actualEndDate?: string;
    status?: PhaseStatus;
    notes?: string;
}
