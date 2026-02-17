import { Repository } from 'typeorm';
import { ConstructionFlatProgress } from '../entities/construction-flat-progress.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';
import { DemandDraft } from '../../demand-drafts/entities/demand-draft.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Booking } from '../../bookings/entities/booking.entity';
export declare class ConstructionWorkflowService {
    private flatRepository;
    private flatPaymentPlanRepository;
    private demandDraftRepository;
    private progressRepository;
    private customerRepository;
    private bookingRepository;
    private readonly logger;
    constructor(flatRepository: Repository<Flat>, flatPaymentPlanRepository: Repository<FlatPaymentPlan>, demandDraftRepository: Repository<DemandDraft>, progressRepository: Repository<ConstructionFlatProgress>, customerRepository: Repository<Customer>, bookingRepository: Repository<Booking>);
    processConstructionUpdate(flatId: string, phase: string, phaseProgress: number, overallProgress: number): Promise<void>;
    private updateFlatConstructionStatus;
    private checkAndUpdateMilestones;
    private generateDemandDraft;
    private generateDemandDraftContent;
    getPendingDemandDrafts(): Promise<DemandDraft[]>;
}
