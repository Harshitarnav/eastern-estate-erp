import { User } from '../../users/entities/user.entity';
export declare enum NotificationType {
    INFO = "INFO",
    SUCCESS = "SUCCESS",
    WARNING = "WARNING",
    ERROR = "ERROR",
    ALERT = "ALERT"
}
export declare enum NotificationCategory {
    BOOKING = "BOOKING",
    PAYMENT = "PAYMENT",
    LEAD = "LEAD",
    CONSTRUCTION = "CONSTRUCTION",
    EMPLOYEE = "EMPLOYEE",
    CUSTOMER = "CUSTOMER",
    ACCOUNTING = "ACCOUNTING",
    SYSTEM = "SYSTEM",
    TASK = "TASK",
    REMINDER = "REMINDER"
}
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    targetRoles: string;
    targetDepartments: string;
    title: string;
    message: string;
    type: NotificationType;
    category: NotificationCategory;
    actionUrl: string;
    actionLabel: string;
    relatedEntityId: string;
    relatedEntityType: string;
    isRead: boolean;
    readAt: Date;
    shouldSendEmail: boolean;
    emailSent: boolean;
    emailSentAt: Date;
    priority: number;
    expiresAt: Date;
    metadata: Record<string, any>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
