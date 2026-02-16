import { Repository } from 'typeorm';
import { ConstructionFlatProgress } from '../entities/construction-flat-progress.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';
import { Flat } from '../../flats/entities/flat.entity';
export interface MilestoneMatch {
    flatPaymentPlan: FlatPaymentPlan;
    milestoneSequence: number;
    constructionProgress: ConstructionFlatProgress;
    milestoneName: string;
    amount: number;
}
export declare class MilestoneDetectionService {
    private readonly progressRepository;
    private readonly paymentPlanRepository;
    private readonly flatRepository;
    private readonly logger;
    constructor(progressRepository: Repository<ConstructionFlatProgress>, paymentPlanRepository: Repository<FlatPaymentPlan>, flatRepository: Repository<Flat>);
    detectMilestones(): Promise<MilestoneMatch[]>;
    detectMilestonesForFlat(flatId: string): Promise<MilestoneMatch[]>;
    canTriggerMilestone(paymentPlanId: string, milestoneSequence: number): Promise<boolean>;
    getConstructionSummary(flatId: string): Promise<{
        phases: Record<string, {
            progress: number;
            status: string;
        }>;
        overallProgress: number;
    }>;
}
