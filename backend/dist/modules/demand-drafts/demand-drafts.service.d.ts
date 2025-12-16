import { Repository } from 'typeorm';
import { DemandDraft } from './entities/demand-draft.entity';
import { CreateDemandDraftDto } from './dto/create-demand-draft.dto';
import { UpdateDemandDraftDto } from './dto/update-demand-draft.dto';
import { DemandDraftResponseDto } from './dto/demand-draft-response.dto';
export declare class DemandDraftsService {
    private readonly draftsRepo;
    constructor(draftsRepo: Repository<DemandDraft>);
    create(dto: CreateDemandDraftDto): Promise<DemandDraftResponseDto>;
    findAll(filters: {
        flatId?: string;
        customerId?: string;
        bookingId?: string;
        milestoneId?: string;
    }): Promise<DemandDraftResponseDto[]>;
    findOne(id: string): Promise<DemandDraftResponseDto>;
    findOneRaw(id: string): Promise<DemandDraft>;
    buildHtmlTemplate(draft: DemandDraft): string;
    update(id: string, dto: UpdateDemandDraftDto): Promise<DemandDraftResponseDto>;
    markSent(id: string, fileUrl?: string): Promise<DemandDraftResponseDto>;
    buildDefaultContent(dto: Partial<CreateDemandDraftDto>): string;
}
