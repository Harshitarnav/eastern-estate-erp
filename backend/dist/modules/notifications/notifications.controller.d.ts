import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto, req: any): Promise<import("./entities/notification.entity").Notification[]>;
    findAll(req: any, includeRead?: string): Promise<import("./entities/notification.entity").Notification[]>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: any): Promise<import("./entities/notification.entity").Notification>;
    markAllAsRead(req: any): Promise<{
        message: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    clearRead(req: any): Promise<{
        message: string;
    }>;
}
