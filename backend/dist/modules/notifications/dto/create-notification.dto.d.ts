import { NotificationType, NotificationCategory } from '../entities/notification.entity';
export declare class CreateNotificationDto {
    userId?: string;
    targetRoles?: string;
    targetDepartments?: string;
    title: string;
    message: string;
    type?: NotificationType;
    category?: NotificationCategory;
    actionUrl?: string;
    actionLabel?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    shouldSendEmail?: boolean;
    priority?: number;
    expiresAt?: Date;
    metadata?: Record<string, any>;
}
