import { MilestoneDetectionService } from '../services/milestone-detection.service';
import { AutoDemandDraftService } from '../services/auto-demand-draft.service';
export declare class MilestonesController {
    private readonly milestoneDetectionService;
    private readonly autoDemandDraftService;
    constructor(milestoneDetectionService: MilestoneDetectionService, autoDemandDraftService: AutoDemandDraftService);
    getDetectedMilestones(): Promise<import("../services/milestone-detection.service").MilestoneMatch[]>;
    getDetectedMilestonesForFlat(flatId: string): Promise<import("../services/milestone-detection.service").MilestoneMatch[]>;
    getConstructionSummary(flatId: string): Promise<{
        phases: Record<string, {
            progress: number;
            status: string;
        }>;
        overallProgress: number;
    }>;
    triggerDemandDraft(body: {
        flatPaymentPlanId: string;
        milestoneSequence: number;
    }, req: any): Promise<import("../../demand-drafts/entities/demand-draft.entity").DemandDraft>;
}
