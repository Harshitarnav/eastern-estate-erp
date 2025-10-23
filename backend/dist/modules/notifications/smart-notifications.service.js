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
var SmartNotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const notifications_service_1 = require("./notifications.service");
const lead_entity_1 = require("../leads/entities/lead.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_2 = require("../leads/entities/lead.entity");
let SmartNotificationsService = SmartNotificationsService_1 = class SmartNotificationsService {
    constructor(notificationsService, leadsRepository) {
        this.notificationsService = notificationsService;
        this.leadsRepository = leadsRepository;
        this.logger = new common_1.Logger(SmartNotificationsService_1.name);
    }
    async checkUpcomingFollowUps() {
        this.logger.log('Checking for upcoming follow-ups...');
        const now = new Date();
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
        const upcomingLeads = await this.leadsRepository.find({
            where: {
                nextFollowUpDate: (0, typeorm_2.LessThan)(fifteenMinutesFromNow),
                isActive: true,
            },
            relations: ['assignedUser'],
        });
        for (const lead of upcomingLeads) {
            if (lead.assignedTo) {
                await this.notificationsService.create({
                    userId: lead.assignedTo,
                    title: '⏰ Follow-up Due Soon',
                    message: `Call ${lead.firstName} ${lead.lastName} in 15 minutes`,
                    type: 'reminder',
                    priority: 1,
                    actionUrl: `/leads/${lead.id}`,
                });
            }
        }
        this.logger.log(`Sent ${upcomingLeads.length} upcoming follow-up notifications`);
    }
    async checkColdLeads() {
        this.logger.log('Checking for cold leads...');
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const coldLeads = await this.leadsRepository.find({
            where: {
                lastContactedAt: (0, typeorm_2.LessThan)(sevenDaysAgo),
                isActive: true,
                status: lead_entity_1.LeadStatus.NEW,
            },
            relations: ['assignedUser'],
        });
        for (const lead of coldLeads) {
            if (lead.assignedTo) {
                await this.notificationsService.create({
                    userId: lead.assignedTo,
                    title: '❄️ Lead Going Cold',
                    message: `${lead.firstName} ${lead.lastName} hasn't been contacted in 7 days`,
                    type: 'alert',
                    priority: 2,
                    actionUrl: `/leads/${lead.id}`,
                });
            }
        }
        this.logger.log(`Sent ${coldLeads.length} cold lead notifications`);
    }
    async checkOverdueFollowUps() {
        this.logger.log('Checking for overdue follow-ups...');
        const now = new Date();
        const overdueLeads = await this.leadsRepository.find({
            where: {
                nextFollowUpDate: (0, typeorm_2.LessThan)(now),
                isActive: true,
            },
            relations: ['assignedUser'],
        });
        for (const lead of overdueLeads) {
            if (lead.assignedTo) {
                await this.notificationsService.create({
                    userId: lead.assignedTo,
                    title: '🚨 Overdue Follow-up',
                    message: `Follow-up with ${lead.firstName} ${lead.lastName} is overdue`,
                    type: 'alert',
                    priority: 1,
                    actionUrl: `/leads/${lead.id}`,
                });
            }
        }
        this.logger.log(`Sent ${overdueLeads.length} overdue follow-up notifications`);
    }
    async notifyAchievement(userId, achievement) {
        await this.notificationsService.create({
            userId,
            title: `${achievement.icon} Achievement Unlocked!`,
            message: `${achievement.name}: ${achievement.description} (+${achievement.xp} XP)`,
            type: 'achievement',
            priority: 3,
        });
    }
    async notifyMilestone(userId, milestone) {
        await this.notificationsService.create({
            userId,
            title: '🎯 Milestone Reached!',
            message: milestone,
            type: 'milestone',
            priority: 3,
        });
    }
};
exports.SmartNotificationsService = SmartNotificationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SmartNotificationsService.prototype, "checkUpcomingFollowUps", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SmartNotificationsService.prototype, "checkColdLeads", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SmartNotificationsService.prototype, "checkOverdueFollowUps", null);
exports.SmartNotificationsService = SmartNotificationsService = SmartNotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(lead_entity_2.Lead)),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        typeorm_2.Repository])
], SmartNotificationsService);
//# sourceMappingURL=smart-notifications.service.js.map