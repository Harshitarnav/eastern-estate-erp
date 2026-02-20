"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHelperService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../../modules/notifications/notifications.service");
const notification_entity_1 = require("../../modules/notifications/entities/notification.entity");
let NotificationHelperService = class NotificationHelperService {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async notifyBookingCreated(booking, createdBy) {
        await this.notificationsService.create({
            targetRoles: 'admin,super_admin',
            title: 'New Booking Created',
            message: `New booking created for ${booking.customer?.fullName || 'customer'} - ${booking.flat?.flatNumber || 'flat'}`,
            type: notification_entity_1.NotificationType.SUCCESS,
            category: notification_entity_1.NotificationCategory.BOOKING,
            actionUrl: `/bookings/${booking.id}`,
            actionLabel: 'View Booking',
            relatedEntityId: booking.id,
            relatedEntityType: 'booking',
            priority: 5,
        }, createdBy);
        await this.notificationsService.create({
            targetRoles: 'sales_team',
            title: 'New Booking Alert',
            message: `New booking for ${booking.flat?.flatNumber || 'flat'} at ${booking.flat?.property?.name || 'property'}`,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.BOOKING,
            actionUrl: `/bookings/${booking.id}`,
            actionLabel: 'View Details',
        }, createdBy);
    }
    async notifyPaymentReceived(payment, createdBy) {
        await this.notificationsService.create({
            targetRoles: 'admin,super_admin',
            title: 'Payment Received',
            message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} received`,
            type: notification_entity_1.NotificationType.SUCCESS,
            category: notification_entity_1.NotificationCategory.PAYMENT,
            actionUrl: `/payments/${payment.id}`,
            actionLabel: 'View Payment',
            relatedEntityId: payment.id,
            relatedEntityType: 'payment',
            priority: 7,
        }, createdBy);
        if (payment.booking?.assignedTo) {
            await this.notificationsService.create({
                userId: payment.booking.assignedTo,
                title: 'Payment Received',
                message: `Your customer paid ₹${payment.amount.toLocaleString('en-IN')}`,
                type: notification_entity_1.NotificationType.SUCCESS,
                category: notification_entity_1.NotificationCategory.PAYMENT,
                actionUrl: `/payments/${payment.id}`,
                actionLabel: 'View Payment',
            }, createdBy);
        }
    }
    async notifyMilestoneCompleted(milestone, flatId, createdBy) {
        await this.notificationsService.create({
            targetRoles: 'admin,super_admin',
            title: 'Construction Milestone Completed',
            message: `${milestone.name} completed for Flat ${flatId}`,
            type: notification_entity_1.NotificationType.SUCCESS,
            category: notification_entity_1.NotificationCategory.CONSTRUCTION,
            actionUrl: `/construction-milestones`,
            actionLabel: 'View Milestones',
            priority: 6,
        }, createdBy);
        await this.notificationsService.create({
            targetRoles: 'sales_team',
            title: 'Milestone Ready for Billing',
            message: `Construction milestone completed - ready to trigger payment demand`,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.CONSTRUCTION,
            actionUrl: `/construction-milestones`,
            actionLabel: 'Review Milestone',
        }, createdBy);
    }
    async notifyEmployeeCreated(employee, createdBy) {
        await this.notificationsService.create({
            targetRoles: 'admin,super_admin,hr',
            title: 'New Employee Added',
            message: `${employee.fullName} (${employee.email}) added to the system`,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.EMPLOYEE,
            actionUrl: `/employees/${employee.id}`,
            actionLabel: 'View Employee',
        }, createdBy);
    }
    async notifyUserCreated(user, createdBy) {
        await this.notificationsService.create({
            targetRoles: 'admin,super_admin',
            title: 'New User Account Created',
            message: `User account created for ${user.firstName} ${user.lastName} (${user.email})`,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.EMPLOYEE,
            actionUrl: `/users/${user.id}`,
            actionLabel: 'Manage User',
        }, createdBy);
    }
    async notifyPropertyAccessGranted(userId, propertyName, role, grantedBy) {
        await this.notificationsService.create({
            userId,
            title: 'Property Access Granted',
            message: `You have been granted ${role} access to ${propertyName}`,
            type: notification_entity_1.NotificationType.SUCCESS,
            category: notification_entity_1.NotificationCategory.SYSTEM,
            actionUrl: '/properties',
            actionLabel: 'View Properties',
        }, grantedBy);
    }
    async notifyCustomerRegistration(customer, createdBy) {
        await this.notificationsService.create({
            targetRoles: 'admin,super_admin,sales_team',
            title: 'New Customer Registered',
            message: `${customer.fullName} registered - ${customer.email}`,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.CUSTOMER,
            actionUrl: `/customers/${customer.id}`,
            actionLabel: 'View Customer',
        }, createdBy);
    }
    async notifyPaymentOverdue(payment) {
        await this.notificationsService.create({
            targetRoles: 'admin,super_admin',
            title: 'Payment Overdue',
            message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} is overdue`,
            type: notification_entity_1.NotificationType.WARNING,
            category: notification_entity_1.NotificationCategory.PAYMENT,
            actionUrl: `/payments/${payment.id}`,
            actionLabel: 'Review Payment',
            priority: 8,
        });
        if (payment.booking?.assignedTo) {
            await this.notificationsService.create({
                userId: payment.booking.assignedTo,
                title: 'Payment Overdue - Action Required',
                message: `Customer payment of ₹${payment.amount.toLocaleString('en-IN')} is overdue`,
                type: notification_entity_1.NotificationType.WARNING,
                category: notification_entity_1.NotificationCategory.PAYMENT,
                actionUrl: `/payments/${payment.id}`,
                actionLabel: 'Follow Up',
                priority: 8,
            });
        }
    }
    async notifyConstructionProgressUpdated(progress, createdBy) {
        await this.notificationsService.create({
            targetRoles: 'admin,super_admin',
            title: 'Construction Progress Updated',
            message: `${progress.phase} - ${progress.phaseProgress}% complete`,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.CONSTRUCTION,
            actionUrl: '/construction-progress-simple',
            actionLabel: 'View Progress',
        }, createdBy);
    }
    async notifyDemandDraftPendingApproval(draft, createdBy) {
        await this.notificationsService.create({
            targetRoles: 'admin,super_admin',
            title: 'Demand Draft Pending Approval',
            message: `Demand draft for ₹${draft.amount.toLocaleString('en-IN')} requires your approval`,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.PAYMENT,
            actionUrl: `/demand-drafts/${draft.id}`,
            actionLabel: 'Review & Approve',
            priority: 7,
        }, createdBy);
    }
};
exports.NotificationHelperService = NotificationHelperService;
exports.NotificationHelperService = NotificationHelperService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationHelperService);
//# sourceMappingURL=notification-helper.service.js.map