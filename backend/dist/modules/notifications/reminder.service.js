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
var ReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("../leads/entities/lead.entity");
const sales_task_entity_1 = require("../leads/entities/sales-task.entity");
const email_service_1 = require("./email.service");
const date_fns_1 = require("date-fns");
let ReminderService = ReminderService_1 = class ReminderService {
    constructor(leadRepository, salesTaskRepository, emailService) {
        this.leadRepository = leadRepository;
        this.salesTaskRepository = salesTaskRepository;
        this.emailService = emailService;
        this.logger = new common_1.Logger(ReminderService_1.name);
    }
    async sendFollowUpReminders() {
        this.logger.log('Running followup reminder check...');
        try {
            const tomorrow = (0, date_fns_1.addDays)((0, date_fns_1.startOfDay)(new Date()), 1);
            const endOfTomorrow = (0, date_fns_1.endOfDay)(tomorrow);
            const leadsNeedingReminders = await this.leadRepository.find({
                where: {
                    nextFollowUpDate: (0, typeorm_2.Between)(tomorrow, endOfTomorrow),
                    sendFollowUpReminder: true,
                    reminderSent: false,
                },
                relations: ['assignedUser'],
            });
            this.logger.log(`Found ${leadsNeedingReminders.length} leads needing followup reminders`);
            for (const lead of leadsNeedingReminders) {
                try {
                    await this.sendFollowUpReminderEmail(lead);
                    await this.leadRepository.update(lead.id, {
                        reminderSent: true,
                        reminderSentAt: new Date(),
                    });
                    this.logger.log(`Sent followup reminder for lead ${lead.id}`);
                }
                catch (error) {
                    this.logger.error(`Failed to send reminder for lead ${lead.id}:`, error);
                }
            }
        }
        catch (error) {
            this.logger.error('Error in sendFollowUpReminders:', error);
        }
    }
    async sendTaskReminders() {
        this.logger.log('Running task reminder check...');
        try {
            const now = new Date();
            const next24Hours = (0, date_fns_1.addHours)(now, 24);
            const tasksNeedingReminders = await this.salesTaskRepository.find({
                where: {
                    sendReminder: true,
                    reminderSent: false,
                    status: sales_task_entity_1.TaskStatus.PENDING,
                    dueDate: (0, typeorm_2.Between)(now, next24Hours),
                },
                relations: ['assignedToUser', 'lead'],
            });
            this.logger.log(`Found ${tasksNeedingReminders.length} tasks needing reminders`);
            for (const task of tasksNeedingReminders) {
                try {
                    await this.sendTaskReminderEmail(task);
                    await this.salesTaskRepository.update(task.id, {
                        reminderSent: true,
                        reminderSentAt: new Date(),
                    });
                    this.logger.log(`Sent task reminder for task ${task.id}`);
                }
                catch (error) {
                    this.logger.error(`Failed to send reminder for task ${task.id}:`, error);
                }
            }
        }
        catch (error) {
            this.logger.error('Error in sendTaskReminders:', error);
        }
    }
    async sendSiteVisitReminders() {
        this.logger.log('Running site visit reminder check...');
        try {
            this.logger.log('Site visit reminders are temporarily disabled - waiting for DB schema update');
        }
        catch (error) {
            this.logger.error('Error in sendSiteVisitReminders:', error);
        }
    }
    async resetReminderFlags() {
        this.logger.log('Resetting reminder flags for leads with new followup dates...');
        try {
            const today = (0, date_fns_1.startOfDay)(new Date());
            await this.leadRepository
                .createQueryBuilder()
                .update(lead_entity_1.Lead)
                .set({ reminderSent: false })
                .where('nextFollowUpDate > :today', { today })
                .andWhere('reminderSent = :sent', { sent: true })
                .execute();
            this.logger.log('Reminder flags reset successfully');
        }
        catch (error) {
            this.logger.error('Error in resetReminderFlags:', error);
        }
    }
    async sendFollowUpReminderEmail(lead) {
        const subject = `Reminder: Follow-up with ${lead.firstName} ${lead.lastName} tomorrow`;
        const html = `
      <h2>Follow-up Reminder</h2>
      <p>Hi ${lead.assignedUser?.firstName || 'there'},</p>
      <p>This is a reminder that you have a follow-up scheduled with the following lead tomorrow:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
        <h3>Lead Details:</h3>
        <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
        <p><strong>Phone:</strong> ${lead.phone}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Status:</strong> ${lead.status}</p>
        <p><strong>Priority:</strong> ${lead.priority}</p>
        <p><strong>Follow-up Date:</strong> ${(0, date_fns_1.format)(lead.nextFollowUpDate, 'PPP')}</p>
        ${lead.followUpNotes ? `<p><strong>Notes:</strong> ${lead.followUpNotes}</p>` : ''}
      </div>

      <p>Please ensure you're prepared for this follow-up. Review the lead history and have all necessary information ready.</p>
      
      <p>Best regards,<br/>Eastern Estate ERP System</p>
    `;
        this.logger.log(`Follow-up reminder email prepared for ${lead.assignedUser?.email}`);
    }
    async sendTaskReminderEmail(task) {
        const hoursUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));
        const subject = `Task Reminder: ${task.title} due in ${hoursUntilDue} hours`;
        const html = `
      <h2>Task Reminder</h2>
      <p>Hi ${task.assignedToUser?.firstName || 'there'},</p>
      <p>This is a reminder about your upcoming task:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
        <h3>Task Details:</h3>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Type:</strong> ${task.taskType}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Due Date:</strong> ${(0, date_fns_1.format)(task.dueDate, 'PPP')}${task.dueTime ? ` at ${task.dueTime}` : ''}</p>
        ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
        ${task.location ? `<p><strong>Location:</strong> ${task.location}</p>` : ''}
        ${task.lead ? `<p><strong>Related Lead:</strong> ${task.lead.firstName} ${task.lead.lastName}</p>` : ''}
      </div>

      <p><strong>Time until due:</strong> ${hoursUntilDue} hours</p>
      
      <p>Best regards,<br/>Eastern Estate ERP System</p>
    `;
        this.logger.log(`Task reminder email prepared for ${task.assignedToUser?.email}`);
    }
    async sendSiteVisitConfirmationEmail(lead) {
        const subject = `Site Visit Confirmation Tomorrow`;
        const customerHtml = `
      <h2>Site Visit Confirmation</h2>
      <p>Dear ${lead.firstName} ${lead.lastName},</p>
      <p>This is a reminder about your scheduled site visit tomorrow:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
        <h3>Visit Details:</h3>
        <!-- Date will be shown once site_visit_date column is added -->
        ${lead.siteVisitTime ? `<p><strong>Time:</strong> ${lead.siteVisitTime}</p>` : ''}
        <!-- Properties to View: Column doesn't exist in DB -->
      </div>

      <p>We look forward to showing you our properties. Please feel free to contact us if you have any questions or need to reschedule.</p>
      
      <p>For any queries, please contact:</p>
      <p><strong>Sales Representative:</strong> ${lead.assignedUser?.firstName || 'Our team'}</p>
      <p><strong>Phone:</strong> ${lead.assignedUser?.phone || 'Contact number'}</p>
      
      <p>Best regards,<br/>Eastern Estate Team</p>
    `;
        const salesPersonSubject = `Site Visit Tomorrow: ${lead.firstName} ${lead.lastName}`;
        const salesPersonHtml = `
      <h2>Site Visit Reminder</h2>
      <p>Hi ${lead.assignedUser?.firstName || 'there'},</p>
      <p>You have a site visit scheduled tomorrow with:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
        <p><strong>Customer:</strong> ${lead.firstName} ${lead.lastName}</p>
        <p><strong>Phone:</strong> ${lead.phone}</p>
        <!-- Date will be shown once site_visit_date column is added -->
        ${lead.siteVisitTime ? `<p><strong>Time:</strong> ${lead.siteVisitTime}</p>` : ''}
        <!-- Interested In: Column doesn't exist in DB -->
      </div>

      <p>Please ensure you're prepared with property details, brochures, and pricing information.</p>
      
      <p>Best regards,<br/>Eastern Estate ERP System</p>
    `;
        this.logger.log(`Site visit confirmation emails prepared for ${lead.email} and ${lead.assignedUser?.email}`);
    }
    async sendManualReminder(leadId, type) {
        const lead = await this.leadRepository.findOne({
            where: { id: leadId },
            relations: ['assignedUser'],
        });
        if (!lead) {
            throw new Error(`Lead ${leadId} not found`);
        }
        if (type === 'followup') {
            await this.sendFollowUpReminderEmail(lead);
        }
        else if (type === 'sitevisit') {
            await this.sendSiteVisitConfirmationEmail(lead);
        }
        this.logger.log(`Manual ${type} reminder sent for lead ${leadId}`);
    }
};
exports.ReminderService = ReminderService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReminderService.prototype, "sendFollowUpReminders", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReminderService.prototype, "sendTaskReminders", null);
__decorate([
    (0, schedule_1.Cron)('0 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReminderService.prototype, "sendSiteVisitReminders", null);
__decorate([
    (0, schedule_1.Cron)('0 22 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReminderService.prototype, "resetReminderFlags", null);
exports.ReminderService = ReminderService = ReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(1, (0, typeorm_1.InjectRepository)(sales_task_entity_1.SalesTask)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], ReminderService);
//# sourceMappingURL=reminder.service.js.map