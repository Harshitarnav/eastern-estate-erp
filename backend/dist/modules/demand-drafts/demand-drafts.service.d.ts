import { Repository } from 'typeorm';
import { DemandDraft } from './entities/demand-draft.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class DemandDraftsService {
    private readonly demandDraftRepository;
    private readonly userRepository;
    private readonly notificationsService;
    private readonly logger;
    constructor(demandDraftRepository: Repository<DemandDraft>, userRepository: Repository<User>, notificationsService: NotificationsService);
    findAll(query: any): Promise<DemandDraft[]>;
    findOne(id: string): Promise<DemandDraft>;
    create(createDto: any, userId: string): Promise<DemandDraft>;
    private notifyCustomerOnDraftCreated;
    update(id: string, updateDto: any, userId: string): Promise<DemandDraft>;
    remove(id: string): Promise<void>;
}
