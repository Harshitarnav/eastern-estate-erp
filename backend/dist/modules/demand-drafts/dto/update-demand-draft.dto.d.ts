import { CreateDemandDraftDto } from './create-demand-draft.dto';
import { DemandDraftStatus } from '../entities/demand-draft.entity';
declare const UpdateDemandDraftDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateDemandDraftDto>>;
export declare class UpdateDemandDraftDto extends UpdateDemandDraftDto_base {
    status?: DemandDraftStatus;
    content?: string;
    amount?: number;
    flatId?: string;
    customerId?: string;
    bookingId?: string;
    milestoneId?: string;
    metadata?: Record<string, any>;
}
export {};
