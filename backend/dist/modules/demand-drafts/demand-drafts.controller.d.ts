import { DemandDraftsService } from './demand-drafts.service';
import { CreateDemandDraftDto } from './dto/create-demand-draft.dto';
import { UpdateDemandDraftDto } from './dto/update-demand-draft.dto';
export declare class DemandDraftsController {
    private readonly demandDraftsService;
    constructor(demandDraftsService: DemandDraftsService);
    create(dto: CreateDemandDraftDto): Promise<import("./dto/demand-draft-response.dto").DemandDraftResponseDto>;
    findAll(flatId?: string, customerId?: string, bookingId?: string, milestoneId?: string): Promise<import("./dto/demand-draft-response.dto").DemandDraftResponseDto[]>;
    findOne(id: string): Promise<import("./dto/demand-draft-response.dto").DemandDraftResponseDto>;
    update(id: string, dto: UpdateDemandDraftDto): Promise<import("./dto/demand-draft-response.dto").DemandDraftResponseDto>;
    markSent(id: string, fileUrl?: string): Promise<import("./dto/demand-draft-response.dto").DemandDraftResponseDto>;
}
