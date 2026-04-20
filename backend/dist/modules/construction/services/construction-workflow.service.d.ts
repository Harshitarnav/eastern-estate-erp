import { Repository } from 'typeorm';
import { ConstructionFlatProgress } from '../entities/construction-flat-progress.entity';
import { ConstructionProject } from '../entities/construction-project.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';
import { DemandDraft } from '../../demand-drafts/entities/demand-draft.entity';
import { AutoDemandDraftService } from './auto-demand-draft.service';
export interface GeneratedDemandDraftSummary {
    id: string;
    title: string;
    amount: number;
    refNumber?: string;
    milestoneName?: string;
    flatNumber?: string;
    towerName?: string;
    propertyName?: string;
    customerName?: string;
    dueDate?: Date;
}
export interface ConstructionWorkflowResult {
    milestonesTriggered: number;
    generatedDemandDrafts: GeneratedDemandDraftSummary[];
}
export declare class ConstructionWorkflowService {
    private readonly flatRepository;
    private readonly flatPaymentPlanRepository;
    private readonly demandDraftRepository;
    private readonly progressRepository;
    private readonly projectRepository;
    private readonly autoDemandDraftService;
    private readonly logger;
    constructor(flatRepository: Repository<Flat>, flatPaymentPlanRepository: Repository<FlatPaymentPlan>, demandDraftRepository: Repository<DemandDraft>, progressRepository: Repository<ConstructionFlatProgress>, projectRepository: Repository<ConstructionProject>, autoDemandDraftService: AutoDemandDraftService);
    processConstructionUpdate(flatId: string, phase: string, phaseProgress: number, overallProgress: number): Promise<ConstructionWorkflowResult>;
    private updateFlatConstructionStatus;
    private isKnownPhase;
    private checkAndUpdateMilestones;
    private delegateDemandDraft;
    private healMilestoneStatus;
    getPendingDemandDrafts(): Promise<DemandDraft[]>;
}
