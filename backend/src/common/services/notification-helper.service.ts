import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { NotificationType, NotificationCategory } from '../../modules/notifications/entities/notification.entity';

/**
 * Notification Helper Service
 * Centralized service for creating notifications across the system
 */
@Injectable()
export class NotificationHelperService {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Notify when a booking is created
   */
  async notifyBookingCreated(booking: any, createdBy: string) {
    // Notify admin
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin',
      title: 'New Booking Created',
      message: `New booking created for ${booking.customer?.fullName || 'customer'} - ${booking.flat?.flatNumber || 'flat'}`,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.BOOKING,
      actionUrl: `/bookings/${booking.id}`,
      actionLabel: 'View Booking',
      relatedEntityId: booking.id,
      relatedEntityType: 'booking',
      priority: 5,
    }, createdBy);

    // Notify sales team
    await this.notificationsService.create({
      targetRoles: 'sales_team',
      title: 'New Booking Alert',
      message: `New booking for ${booking.flat?.flatNumber || 'flat'} at ${booking.flat?.property?.name || 'property'}`,
      type: NotificationType.INFO,
      category: NotificationCategory.BOOKING,
      actionUrl: `/bookings/${booking.id}`,
      actionLabel: 'View Details',
    }, createdBy);
  }

  /**
   * Notify when a payment is received
   */
  async notifyPaymentReceived(payment: any, createdBy: string) {
    // Notify admin
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin',
      title: 'Payment Received',
      message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} received`,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.PAYMENT,
      actionUrl: `/payments/${payment.id}`,
      actionLabel: 'View Payment',
      relatedEntityId: payment.id,
      relatedEntityType: 'payment',
      priority: 7,
    }, createdBy);

    // Notify sales team if they were involved
    if (payment.booking?.assignedTo) {
      await this.notificationsService.create({
        userId: payment.booking.assignedTo,
        title: 'Payment Received',
        message: `Your customer paid ₹${payment.amount.toLocaleString('en-IN')}`,
        type: NotificationType.SUCCESS,
        category: NotificationCategory.PAYMENT,
        actionUrl: `/payments/${payment.id}`,
        actionLabel: 'View Payment',
      }, createdBy);
    }
  }

  /**
   * Notify when construction milestone is completed
   */
  async notifyMilestoneCompleted(milestone: any, flatId: string, createdBy: string) {
    // Notify admin
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin',
      title: 'Construction Milestone Completed',
      message: `${milestone.name} completed for Flat ${flatId}`,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.CONSTRUCTION,
      actionUrl: `/construction-milestones`,
      actionLabel: 'View Milestones',
      priority: 6,
    }, createdBy);

    // Notify sales team (for customer communication)
    await this.notificationsService.create({
      targetRoles: 'sales_team',
      title: 'Milestone Ready for Billing',
      message: `Construction milestone completed - ready to trigger payment demand`,
      type: NotificationType.INFO,
      category: NotificationCategory.CONSTRUCTION,
      actionUrl: `/construction-milestones`,
      actionLabel: 'Review Milestone',
    }, createdBy);
  }

  /**
   * Notify when employee is created
   */
  async notifyEmployeeCreated(employee: any, createdBy: string) {
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin,hr',
      title: 'New Employee Added',
      message: `${employee.fullName} (${employee.email}) added to the system`,
      type: NotificationType.INFO,
      category: NotificationCategory.EMPLOYEE,
      actionUrl: `/employees/${employee.id}`,
      actionLabel: 'View Employee',
    }, createdBy);
  }

  /**
   * Notify when user is created
   */
  async notifyUserCreated(user: any, createdBy: string) {
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin',
      title: 'New User Account Created',
      message: `User account created for ${user.firstName} ${user.lastName} (${user.email})`,
      type: NotificationType.INFO,
      category: NotificationCategory.EMPLOYEE,
      actionUrl: `/users/${user.id}`,
      actionLabel: 'Manage User',
    }, createdBy);
  }

  /**
   * Notify when property access is granted
   */
  async notifyPropertyAccessGranted(userId: string, propertyName: string, role: string, grantedBy: string) {
    await this.notificationsService.create({
      userId,
      title: 'Property Access Granted',
      message: `You have been granted ${role} access to ${propertyName}`,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.SYSTEM,
      actionUrl: '/properties',
      actionLabel: 'View Properties',
    }, grantedBy);
  }

  /**
   * Notify when customer registration is pending approval
   */
  async notifyCustomerRegistration(customer: any, createdBy: string) {
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin,sales_team',
      title: 'New Customer Registered',
      message: `${customer.fullName} registered - ${customer.email}`,
      type: NotificationType.INFO,
      category: NotificationCategory.CUSTOMER,
      actionUrl: `/customers/${customer.id}`,
      actionLabel: 'View Customer',
    }, createdBy);
  }

  /**
   * Notify when payment is overdue
   */
  async notifyPaymentOverdue(payment: any) {
    // Notify admin
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin',
      title: 'Payment Overdue',
      message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} is overdue`,
      type: NotificationType.WARNING,
      category: NotificationCategory.PAYMENT,
      actionUrl: `/payments/${payment.id}`,
      actionLabel: 'Review Payment',
      priority: 8,
    });

    // Notify assigned sales person if exists
    if (payment.booking?.assignedTo) {
      await this.notificationsService.create({
        userId: payment.booking.assignedTo,
        title: 'Payment Overdue - Action Required',
        message: `Customer payment of ₹${payment.amount.toLocaleString('en-IN')} is overdue`,
        type: NotificationType.WARNING,
        category: NotificationCategory.PAYMENT,
        actionUrl: `/payments/${payment.id}`,
        actionLabel: 'Follow Up',
        priority: 8,
      });
    }
  }

  /**
   * Notify when construction progress is updated
   */
  async notifyConstructionProgressUpdated(progress: any, createdBy: string) {
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin',
      title: 'Construction Progress Updated',
      message: `${progress.phase} - ${progress.phaseProgress}% complete`,
      type: NotificationType.INFO,
      category: NotificationCategory.CONSTRUCTION,
      actionUrl: '/construction-progress-simple',
      actionLabel: 'View Progress',
    }, createdBy);
  }

  /**
   * Notify when demand draft needs approval
   */
  async notifyDemandDraftPendingApproval(draft: any, createdBy: string) {
    await this.notificationsService.create({
      targetRoles: 'admin,super_admin',
      title: 'Demand Draft Pending Approval',
      message: `Demand draft for ₹${draft.amount.toLocaleString('en-IN')} requires your approval`,
      type: NotificationType.INFO,
      category: NotificationCategory.PAYMENT,
      actionUrl: `/demand-drafts/${draft.id}`,
      actionLabel: 'Review & Approve',
      priority: 7,
    }, createdBy);
  }
}
