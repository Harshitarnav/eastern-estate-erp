import { Repository } from 'typeorm';
import { DemandDraft } from './entities/demand-draft.entity';
export declare class DemandDraftsService {
    private readonly demandDraftRepository;
    constructor(demandDraftRepository: Repository<DemandDraft>);
    findAll(query: any): Promise<DemandDraft[]>;
    findOne(id: string): Promise<DemandDraft>;
    create(createDto: any, userId: string): Promise<DemandDraft>;
    update(id: string, updateDto: any, userId: string): Promise<DemandDraft>;
    remove(id: string): Promise<void>;
}
