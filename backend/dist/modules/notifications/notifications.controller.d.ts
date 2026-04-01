import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly pushService;
    constructor(notificationsService: NotificationsService, pushService: PushService);
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
    getVapidPublicKey(): {
        publicKey: string;
    };
    pushSubscribe(body: {
        endpoint: string;
        p256dh: string;
        auth: string;
    }, req: any): Promise<{
        message: string;
    }>;
    pushUnsubscribe(body: {
        endpoint: string;
    }, req: any): Promise<{
        message: string;
    }>;
}
