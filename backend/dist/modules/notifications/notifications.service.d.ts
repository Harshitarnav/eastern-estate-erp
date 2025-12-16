import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EmailService } from './email.service';
import { User } from '../users/entities/user.entity';
export declare class NotificationsService {
    private notificationRepository;
    private userRepository;
    private emailService;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>, emailService: EmailService);
    private isMissingNotificationsTable;
    create(createNotificationDto: CreateNotificationDto, createdBy?: string): Promise<Notification[]>;
    private getUsersByRoles;
    private getUsersByDepartments;
    findAllForUser(userId: string, includeRead?: boolean): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<void>;
    remove(id: string, userId: string): Promise<void>;
    clearRead(userId: string): Promise<void>;
    private sendNotificationEmail;
    cleanupExpiredNotifications(): Promise<number>;
}
