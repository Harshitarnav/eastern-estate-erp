import { ConstructionProject } from './construction-project.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { ConstructionPhase, PhaseStatus } from './construction-tower-progress.entity';
export declare class ConstructionFlatProgress {
    id: string;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    flatId: string;
    flat: Flat;
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
    get isReadyForHandover(): boolean;
}
