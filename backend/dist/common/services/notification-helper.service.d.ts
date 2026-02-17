import { NotificationsService } from '../../modules/notifications/notifications.service';
export declare class NotificationHelperService {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    notifyBookingCreated(booking: any, createdBy: string): Promise<void>;
    notifyPaymentReceived(payment: any, createdBy: string): Promise<void>;
    notifyMilestoneCompleted(milestone: any, flatId: string, createdBy: string): Promise<void>;
    notifyEmployeeCreated(employee: any, createdBy: string): Promise<void>;
    notifyUserCreated(user: any, createdBy: string): Promise<void>;
    notifyPropertyAccessGranted(userId: string, propertyName: string, role: string, grantedBy: string): Promise<void>;
    notifyCustomerRegistration(customer: any, createdBy: string): Promise<void>;
    notifyPaymentOverdue(payment: any): Promise<void>;
    notifyConstructionProgressUpdated(progress: any, createdBy: string): Promise<void>;
    notifyDemandDraftPendingApproval(draft: any, createdBy: string): Promise<void>;
}
