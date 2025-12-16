import { DemandDraftStatus } from '../entities/demand-draft.entity';
export declare class CreateDemandDraftDto {
    flatId?: string;
    customerId?: string;
    bookingId?: string;
    milestoneId?: string;
    amount: number;
    status?: DemandDraftStatus;
    content?: string;
    metadata?: Record<string, any>;
}
