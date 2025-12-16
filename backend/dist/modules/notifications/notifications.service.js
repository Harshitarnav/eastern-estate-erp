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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const email_service_1 = require("./email.service");
const user_entity_1 = require("../users/entities/user.entity");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(notificationRepository, userRepository, emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    isMissingNotificationsTable(error) {
        return (error instanceof typeorm_2.QueryFailedError &&
            error?.driverError?.code === '42P01');
    }
    async create(createNotificationDto, createdBy) {
        try {
            const notifications = [];
            if (createNotificationDto.userId) {
                const notification = this.notificationRepository.create({
                    ...createNotificationDto,
                    createdBy,
                });
                const saved = await this.notificationRepository.save(notification);
                notifications.push(saved);
                if (createNotificationDto.shouldSendEmail) {
                    await this.sendNotificationEmail(saved);
                }
            }
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
                    if (createNotificationDto.shouldSendEmail) {
                        await this.sendNotificationEmail(saved);
                    }
                }
            }
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
                    if (createNotificationDto.shouldSendEmail) {
                        await this.sendNotificationEmail(saved);
                    }
                }
            }
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
        }
        catch (error) {
            this.logger.error('Error creating notification:', error);
            throw error;
        }
    }
    async getUsersByRoles(roleNames) {
        const users = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .where('role.name IN (:...roleNames)', { roleNames })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .getMany();
        return users;
    }
    async getUsersByDepartments(departments) {
        const roleMapping = {
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
    async findAllForUser(userId, includeRead = true) {
        try {
            const query = this.notificationRepository
                .createQueryBuilder('notification')
                .where('notification.userId = :userId', { userId })
                .orderBy('notification.createdAt', 'DESC');
            if (!includeRead) {
                query.andWhere('notification.isRead = :isRead', { isRead: false });
            }
            return query.getMany();
        }
        catch (error) {
            if (this.isMissingNotificationsTable(error)) {
                this.logger.warn('Notifications table missing; returning empty list.');
                return [];
            }
            throw error;
        }
    }
    async getUnreadCount(userId) {
        try {
            return this.notificationRepository.count({
                where: {
                    userId,
                    isRead: false,
                },
            });
        }
        catch (error) {
            if (this.isMissingNotificationsTable(error)) {
                this.logger.warn('Notifications table missing; returning unread count 0.');
                return 0;
            }
            throw error;
        }
    }
    async markAsRead(id, userId) {
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
        }
        catch (error) {
            if (this.isMissingNotificationsTable(error)) {
                this.logger.warn('Notifications table missing; skipping markAsRead.');
                return null;
            }
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            await this.notificationRepository
                .createQueryBuilder()
                .update(notification_entity_1.Notification)
                .set({ isRead: true, readAt: new Date() })
                .where('userId = :userId', { userId })
                .andWhere('isRead = :isRead', { isRead: false })
                .execute();
        }
        catch (error) {
            if (this.isMissingNotificationsTable(error)) {
                this.logger.warn('Notifications table missing; skipping markAllAsRead.');
                return;
            }
            throw error;
        }
    }
    async remove(id, userId) {
        try {
            const result = await this.notificationRepository.delete({
                id,
                userId,
            });
            if (result.affected === 0) {
                throw new Error('Notification not found');
            }
        }
        catch (error) {
            if (this.isMissingNotificationsTable(error)) {
                this.logger.warn('Notifications table missing; skipping remove.');
                return;
            }
            throw error;
        }
    }
    async clearRead(userId) {
        try {
            await this.notificationRepository.delete({
                userId,
                isRead: true,
            });
        }
        catch (error) {
            if (this.isMissingNotificationsTable(error)) {
                this.logger.warn('Notifications table missing; skipping clearRead.');
                return;
            }
            throw error;
        }
    }
    async sendNotificationEmail(notification) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: notification.userId },
            });
            if (!user || !user.email) {
                this.logger.warn(`No email found for user ${notification.userId}`);
                return;
            }
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
            this.logger.log(`Would send email to ${user.email}: ${notification.title}`);
            notification.emailSent = true;
            notification.emailSentAt = new Date();
            await this.notificationRepository.save(notification);
        }
        catch (error) {
            this.logger.error('Error sending notification email:', error);
        }
    }
    async cleanupExpiredNotifications() {
        const result = await this.notificationRepository
            .createQueryBuilder()
            .delete()
            .from(notification_entity_1.Notification)
            .where('expiresAt IS NOT NULL')
            .andWhere('expiresAt < :now', { now: new Date() })
            .execute();
        this.logger.log(`Cleaned up ${result.affected} expired notifications`);
        return result.affected || 0;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map