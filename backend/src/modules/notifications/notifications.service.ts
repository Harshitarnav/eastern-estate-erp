import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, QueryFailedError } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EmailService } from './email.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  private isMissingNotificationsTable(error: any): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as any)?.driverError?.code === '42P01' // undefined table
    );
  }

  /**
   * Create a notification
   * If userId is provided, notification goes to specific user
   * If targetRoles or targetDepartments is provided, notification goes to users with those roles/departments
   */
  async create(createNotificationDto: CreateNotificationDto, createdBy?: string): Promise<Notification[]> {
    try {
      const notifications: Notification[] = [];

      // If specific user is targeted
      if (createNotificationDto.userId) {
        const notification = this.notificationRepository.create({
          ...createNotificationDto,
          createdBy,
        });
        const saved = await this.notificationRepository.save(notification);
        notifications.push(saved);

        // Send email if requested
        if (createNotificationDto.shouldSendEmail) {
          await this.sendNotificationEmail(saved);
        }
      }
      // If roles are targeted
      else if (createNotificationDto.targetRoles) {
        const roleNames = createNotificationDto.targetRoles.split(',').map(r => r.trim());
        const users = await this.getUsersByRoles(roleNames);

        for (const user of users) {
          const notification = this.notificationRepository.create({
            ...createNotificationDto,
            userId: user.id,
            createdBy,
          });
          const saved = await this.notificationRepository.save(notification);
          notifications.push(saved);

          // Send email if requested
          if (createNotificationDto.shouldSendEmail) {
            await this.sendNotificationEmail(saved);
          }
        }
      }
      // If departments are targeted
      else if (createNotificationDto.targetDepartments) {
        const departments = createNotificationDto.targetDepartments.split(',').map(d => d.trim());
        const users = await this.getUsersByDepartments(departments);

        for (const user of users) {
          const notification = this.notificationRepository.create({
            ...createNotificationDto,
            userId: user.id,
            createdBy,
          });
          const saved = await this.notificationRepository.save(notification);
          notifications.push(saved);

          // Send email if requested
          if (createNotificationDto.shouldSendEmail) {
            await this.sendNotificationEmail(saved);
          }
        }
      }
      // Create a single notification without specific target
      else {
        const notification = this.notificationRepository.create({
          ...createNotificationDto,
          createdBy,
        });
        const saved = await this.notificationRepository.save(notification);
        notifications.push(saved);
      }

      this.logger.log(`Created ${notifications.length} notification(s)`);
      return notifications;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get users by role names
   */
  private async getUsersByRoles(roleNames: string[]): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.name IN (:...roleNames)', { roleNames })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getMany();

    return users;
  }

  /**
   * Get users by departments (from employee entity)
   */
  private async getUsersByDepartments(departments: string[]): Promise<User[]> {
    // This would require joining with employee table
    // For now, return users with specific roles that map to departments
    const roleMapping: { [key: string]: string[] } = {
      'SALES': ['Sales Manager', 'Sales Executive', 'Sales Team Lead'],
      'MARKETING': ['Marketing Manager', 'Marketing Executive'],
      'OPERATIONS': ['Operations Manager', 'Operations Executive'],
      'FINANCE': ['Finance Manager', 'Accountant', 'Finance Executive'],
      'HR': ['HR Manager', 'HR Executive'],
      'IT': ['IT Manager', 'IT Executive', 'Developer'],
      'CONSTRUCTION': ['Construction Manager', 'Construction Supervisor', 'Construction Executive'],
      'CUSTOMER_SERVICE': ['Customer Service Manager', 'Customer Service Executive'],
      'MANAGEMENT': ['CEO', 'Director', 'General Manager'],
    };

    const roleNames = departments.flatMap(dept => roleMapping[dept] || []);
    
    if (roleNames.length === 0) {
      return [];
    }

    return this.getUsersByRoles(roleNames);
  }

  /**
   * Get all notifications for a user
   */
  async findAllForUser(userId: string, includeRead: boolean = true): Promise<Notification[]> {
    try {
      const query = this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.userId = :userId', { userId })
        .orderBy('notification.createdAt', 'DESC');

      if (!includeRead) {
        query.andWhere('notification.isRead = :isRead', { isRead: false });
      }

      return query.getMany();
    } catch (error) {
      if (this.isMissingNotificationsTable(error)) {
        this.logger.warn('Notifications table missing; returning empty list.');
        return [];
      }
      throw error;
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return this.notificationRepository.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch (error) {
      if (this.isMissingNotificationsTable(error)) {
        this.logger.warn('Notifications table missing; returning unread count 0.');
        return 0;
      }
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id, userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.isRead = true;
      notification.readAt = new Date();

      return this.notificationRepository.save(notification);
    } catch (error) {
      if (this.isMissingNotificationsTable(error)) {
        this.logger.warn('Notifications table missing; skipping markAsRead.');
        return null;
      }
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({ isRead: true, readAt: new Date() })
        .where('userId = :userId', { userId })
        .andWhere('isRead = :isRead', { isRead: false })
        .execute();
    } catch (error) {
      if (this.isMissingNotificationsTable(error)) {
        this.logger.warn('Notifications table missing; skipping markAllAsRead.');
        return;
      }
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async remove(id: string, userId: string): Promise<void> {
    try {
      const result = await this.notificationRepository.delete({
        id,
        userId,
      });

      if (result.affected === 0) {
        throw new Error('Notification not found');
      }
    } catch (error) {
      if (this.isMissingNotificationsTable(error)) {
        this.logger.warn('Notifications table missing; skipping remove.');
        return;
      }
      throw error;
    }
  }

  /**
   * Delete all read notifications for a user
   */
  async clearRead(userId: string): Promise<void> {
    try {
      await this.notificationRepository.delete({
        userId,
        isRead: true,
      });
    } catch (error) {
      if (this.isMissingNotificationsTable(error)) {
        this.logger.warn('Notifications table missing; skipping clearRead.');
        return;
      }
      throw error;
    }
  }

  /**
   * Send notification email
   */
  private async sendNotificationEmail(notification: Notification): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: notification.userId },
      });

      if (!user || !user.email) {
        this.logger.warn(`No email found for user ${notification.userId}`);
        return;
      }

      // For now, send a simple notification email
      // You can enhance this later with proper templates
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${notification.title}</h2>
          <p style="color: #666; line-height: 1.6;">${notification.message}</p>
          ${notification.actionUrl ? `
            <div style="margin-top: 20px;">
              <a href="${notification.actionUrl}" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                ${notification.actionLabel || 'View Details'}
              </a>
            </div>
          ` : ''}
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated notification from Eastern Estate ERP.
          </p>
        </div>
      `;

      // Use the email service's sendEmail method (we'll need to expose it)
      // For now, we'll just log it
      this.logger.log(`Would send email to ${user.email}: ${notification.title}`);

      // Update notification as email sent
      notification.emailSent = true;
      notification.emailSentAt = new Date();
      await this.notificationRepository.save(notification);
    } catch (error) {
      this.logger.error('Error sending notification email:', error);
      // Don't throw - graceful degradation
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('expiresAt IS NOT NULL')
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} expired notifications`);
    return result.affected || 0;
  }
}
