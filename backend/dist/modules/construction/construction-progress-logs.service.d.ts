import { Repository } from 'typeorm';
import { ConstructionProgressLog } from './entities/construction-progress-log.entity';
import { ConstructionProject } from './entities/construction-project.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ConstructionProgressLogsService {
    private readonly constructionProgressLogRepository;
    private readonly constructionProjectRepository;
    private readonly bookingRepository;
    private readonly userRepository;
    private readonly notificationsService;
    private readonly logger;
    constructor(constructionProgressLogRepository: Repository<ConstructionProgressLog>, constructionProjectRepository: Repository<ConstructionProject>, bookingRepository: Repository<Booking>, userRepository: Repository<User>, notificationsService: NotificationsService);
    create(createDto: any): Promise<ConstructionProgressLog>;
    private notifyCustomersOnProgressLog;
    findAll(filters?: {
        constructionProjectId?: string;
        propertyId?: string;
    }): Promise<ConstructionProgressLog[]>;
    findByProject(constructionProjectId: string): Promise<ConstructionProgressLog[]>;
    findOne(id: string): Promise<ConstructionProgressLog>;
    update(id: string, updateDto: any): Promise<ConstructionProgressLog>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getLatestByProject(constructionProjectId: string): Promise<ConstructionProgressLog>;
    addPhotos(id: string, urls: string[]): Promise<ConstructionProgressLog>;
    removePhoto(id: string, photoUrl: string): Promise<ConstructionProgressLog>;
}
