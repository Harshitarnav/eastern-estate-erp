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
var OverdueScannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverdueScannerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const demand_draft_entity_1 = require("../../demand-drafts/entities/demand-draft.entity");
const flat_payment_plan_entity_1 = require("../../payment-plans/entities/flat-payment-plan.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const settings_service_1 = require("../../settings/settings.service");
const demand_draft_template_service_1 = require("../../payment-plans/services/demand-draft-template.service");
const mail_service_1 = require("../../../common/mail/mail.service");
const sms_service_1 = require("../../../common/sms/sms.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
const LEVEL_TO_TONE = {
    0: demand_draft_entity_1.DemandDraftTone.ON_TIME,
    1: demand_draft_entity_1.DemandDraftTone.REMINDER_1,
    2: demand_draft_entity_1.DemandDraftTone.REMINDER_2,
    3: demand_draft_entity_1.DemandDraftTone.REMINDER_3,
    4: demand_draft_entity_1.DemandDraftTone.REMINDER_4,
    5: demand_draft_entity_1.DemandDraftTone.CANCELLATION_WARNING,
    6: demand_draft_entity_1.DemandDraftTone.POST_WARNING,
};
let OverdueScannerService = OverdueScannerService_1 = class OverdueScannerService {
    constructor(ddRepo, planRepo, bookingRepo, customerRepo, settingsService, templateService, mailService, smsService, notificationsService) {
        this.ddRepo = ddRepo;
        this.planRepo = planRepo;
        this.bookingRepo = bookingRepo;
        this.customerRepo = customerRepo;
        this.settingsService = settingsService;
        this.templateService = templateService;
        this.mailService = mailService;
        this.smsService = smsService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(OverdueScannerService_1.name);
    }
    async dailyScan() {
        try {
            const stats = await this.runScan();
            this.logger.log(`Overdue scan complete: ${JSON.stringify(stats)}`);
        }
        catch (err) {
            this.logger.error(`Overdue scan failed at the top level: ${err?.message}`, err?.stack);
        }
    }
    async runScan(now = new Date()) {
        const settings = await this.settingsService.get();
        const intervalDays = settings.overdueReminderIntervalDays ?? 7;
        const warningThreshold = settings.cancellationWarningThresholdDays ?? 30;
        const legacyMaxAge = settings.legacyAutoRemindMaxAgeDays ?? 180;
        const dailyCap = settings.overdueReminderDailyCap ?? 50;
        const stats = {
            examined: 0,
            remindersSent: 0,
            warningsPrepared: 0,
            postWarningsSent: 0,
            bookingsFlaggedAtRisk: 0,
            skippedPaused: 0,
            skippedLegacyDisabled: 0,
            skippedCapped: 0,
            errors: 0,
        };
        const candidates = await this.ddRepo.find({
            where: { status: demand_draft_entity_1.DemandDraftStatus.SENT },
            order: { dueDate: 'ASC' },
        });
        for (const dd of candidates) {
            stats.examined += 1;
            try {
                const actionsThisRun = stats.remindersSent + stats.postWarningsSent + stats.warningsPrepared;
                if (actionsThisRun >= dailyCap) {
                    stats.skippedCapped += 1;
                    continue;
                }
                const decision = await this.decide({
                    dd,
                    now,
                    intervalDays,
                    warningThreshold,
                    legacyMaxAge,
                });
                if (decision.skip) {
                    if (decision.reason === 'paused')
                        stats.skippedPaused += 1;
                    else if (decision.reason === 'legacy_disabled')
                        stats.skippedLegacyDisabled += 1;
                    continue;
                }
                if (decision.action === 'send_reminder') {
                    await this.sendReminder(dd, decision.nextLevel, decision.daysOverdue);
                    stats.remindersSent += 1;
                }
                else if (decision.action === 'prepare_warning') {
                    await this.prepareCancellationWarning(dd, decision.daysOverdue);
                    stats.warningsPrepared += 1;
                    if (decision.bookingFlagged)
                        stats.bookingsFlaggedAtRisk += 1;
                }
                else if (decision.action === 'send_post_warning') {
                    await this.sendPostWarning(dd, decision.daysOverdue);
                    stats.postWarningsSent += 1;
                }
            }
            catch (err) {
                stats.errors += 1;
                this.logger.error(`Scan action failed for DD ${dd.id}: ${err?.message}`, err?.stack);
            }
        }
        return stats;
    }
    async decide(args) {
        const { dd, now, intervalDays, warningThreshold, legacyMaxAge } = args;
        if (!dd.dueDate) {
            return { skip: true, reason: 'no_due_date' };
        }
        const daysOverdue = Math.floor((now.getTime() - new Date(dd.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysOverdue <= 0) {
            return { skip: true, reason: 'not_yet_due' };
        }
        const plan = dd.flatPaymentPlanId
            ? await this.planRepo.findOne({ where: { id: dd.flatPaymentPlanId } })
            : null;
        const customer = dd.customerId
            ? await this.customerRepo.findOne({ where: { id: dd.customerId } })
            : null;
        if (plan?.pauseRemindersUntil && new Date(plan.pauseRemindersUntil) > now) {
            return { skip: true, reason: 'paused' };
        }
        if (customer?.pauseRemindersUntil &&
            new Date(customer.pauseRemindersUntil) > now) {
            return { skip: true, reason: 'paused' };
        }
        if (plan?.remindersEnabled === false) {
            if (plan?.isLegacyImport && daysOverdue > legacyMaxAge) {
                return { skip: true, reason: 'legacy_disabled' };
            }
            return { skip: true, reason: 'plan_reminders_disabled' };
        }
        const baseline = new Date(dd.lastReminderAt?.getTime() ??
            plan?.importedAt?.getTime() ??
            dd.createdAt.getTime());
        const daysSinceBaseline = Math.floor((now.getTime() - baseline.getTime()) / (1000 * 60 * 60 * 24));
        if (dd.cancellationWarningIssuedAt) {
            if (daysSinceBaseline < intervalDays) {
                return { skip: true, reason: 'cadence_not_met' };
            }
            return {
                action: 'send_post_warning',
                daysOverdue,
            };
        }
        if (daysOverdue >= warningThreshold) {
            return {
                action: 'prepare_warning',
                daysOverdue,
            };
        }
        const nextLevel = dd.reminderCount + 1;
        if (nextLevel > 4) {
            return { skip: true, reason: 'max_reminders_reached' };
        }
        if (daysSinceBaseline < intervalDays) {
            return { skip: true, reason: 'cadence_not_met' };
        }
        return {
            action: 'send_reminder',
            nextLevel,
            daysOverdue,
        };
    }
    async sendReminder(dd, level, daysOverdue) {
        const tone = LEVEL_TO_TONE[level];
        const reminderDD = await this.createChildReminderDD(dd, tone, daysOverdue);
        await this.notifyAll(reminderDD, tone, daysOverdue);
        const now = new Date();
        dd.lastReminderAt = now;
        dd.reminderCount = level;
        dd.escalationLevel = level;
        dd.daysOverdue = daysOverdue;
        dd.nextReminderDueAt = this.computeNextReminder(now);
        await this.ddRepo.save(dd);
    }
    async prepareCancellationWarning(dd, daysOverdue) {
        const tone = demand_draft_entity_1.DemandDraftTone.CANCELLATION_WARNING;
        const warningDD = await this.createChildReminderDD(dd, tone, daysOverdue, { sendNow: false });
        const now = new Date();
        dd.cancellationWarningIssuedAt = now;
        dd.escalationLevel = 5;
        dd.daysOverdue = daysOverdue;
        await this.ddRepo.save(dd);
        let bookingFlagged = false;
        if (dd.bookingId) {
            const booking = await this.bookingRepo.findOne({
                where: { id: dd.bookingId },
            });
            if (booking &&
                booking.status !== booking_entity_1.BookingStatus.AT_RISK &&
                booking.status !== booking_entity_1.BookingStatus.CANCELLED) {
                booking.status = booking_entity_1.BookingStatus.AT_RISK;
                await this.bookingRepo.save(booking);
                bookingFlagged = true;
            }
        }
        await this.notifyInternalTeams({
            dd: warningDD,
            title: 'Cancellation warning prepared - review & send',
            message: `Booking is ${daysOverdue} days overdue. A cancellation-warning letter was prepared in DRAFT and needs your review before sending to the customer.`,
            priority: 9,
            ccManagement: true,
        });
        return { bookingFlagged };
    }
    async sendPostWarning(dd, daysOverdue) {
        const tone = demand_draft_entity_1.DemandDraftTone.POST_WARNING;
        const reminderDD = await this.createChildReminderDD(dd, tone, daysOverdue);
        await this.notifyAll(reminderDD, tone, daysOverdue);
        const now = new Date();
        dd.lastReminderAt = now;
        dd.daysOverdue = daysOverdue;
        dd.nextReminderDueAt = this.computeNextReminder(now);
        await this.ddRepo.save(dd);
    }
    async createChildReminderDD(original, tone, daysOverdue, opts = { sendNow: true }) {
        const template = await this.templateService.findByTone(tone);
        const templateData = {
            ...(original.templateData || {}),
            daysOverdue,
            dateIssued: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }),
            refNumber: `${original.metadata?.templateData?.refNumber ?? 'DD'}-${tone}`,
        };
        let subject = `Payment Reminder (${tone}) - ${original.title ?? ''}`;
        let htmlContent = original.content ?? '';
        if (template) {
            const rendered = this.templateService.renderTemplate(template, templateData);
            subject = rendered.subject;
            htmlContent = rendered.htmlContent;
        }
        const child = this.ddRepo.create({
            flatId: original.flatId,
            customerId: original.customerId,
            bookingId: original.bookingId,
            milestoneId: original.milestoneId,
            title: `[${tone}] ${original.title ?? ''}`.slice(0, 500),
            amount: original.amount,
            status: opts.sendNow ?? true ? demand_draft_entity_1.DemandDraftStatus.SENT : demand_draft_entity_1.DemandDraftStatus.DRAFT,
            content: htmlContent,
            dueDate: original.dueDate,
            paymentScheduleId: original.paymentScheduleId,
            flatPaymentPlanId: original.flatPaymentPlanId,
            constructionCheckpointId: original.constructionCheckpointId,
            autoGenerated: true,
            requiresReview: !(opts.sendNow ?? true),
            templateId: template?.id ?? null,
            templateData,
            metadata: { subject, tone, parentId: original.id },
            tone,
            reminderCount: 0,
            escalationLevel: tone === demand_draft_entity_1.DemandDraftTone.CANCELLATION_WARNING ? 5 : (original.escalationLevel ?? 0) + 1,
            daysOverdue,
            parentDemandDraftId: original.id,
            generatedAt: new Date(),
            sentAt: opts.sendNow ?? true ? new Date() : null,
        });
        return this.ddRepo.save(child);
    }
    async notifyAll(reminderDD, tone, daysOverdue) {
        await Promise.allSettled([
            this.notifyCustomerInApp(reminderDD, tone, daysOverdue),
            this.notifyCustomerEmail(reminderDD),
            this.notifyCustomerSms(reminderDD, tone, daysOverdue),
            this.notifyInternalTeams({
                dd: reminderDD,
                title: `Reminder sent (${tone})`,
                message: `Reminder ${tone} for ${reminderDD.title} - ${daysOverdue} days overdue - INR ${Number(reminderDD.amount).toLocaleString('en-IN')}`,
                priority: this.tonePriority(tone),
                ccManagement: tone === demand_draft_entity_1.DemandDraftTone.REMINDER_3 || tone === demand_draft_entity_1.DemandDraftTone.REMINDER_4,
            }),
        ]);
    }
    async notifyCustomerInApp(dd, tone, daysOverdue) {
        if (!dd.customerId)
            return;
        const customer = await this.customerRepo.findOne({
            where: { id: dd.customerId },
        });
        if (!customer?.email)
            return;
        try {
            await this.notificationsService.create({
                targetRoles: 'customer',
                title: `Payment reminder: INR ${Number(dd.amount).toLocaleString('en-IN')}`,
                message: `Your payment for ${dd.title} is ${daysOverdue} days overdue. Please settle at your earliest convenience.`,
                type: notification_entity_1.NotificationType.WARNING,
                category: notification_entity_1.NotificationCategory.PAYMENT,
                actionUrl: `/customer-portal/payments`,
                actionLabel: 'View & Pay',
                relatedEntityId: dd.id,
                relatedEntityType: 'demand_draft',
                priority: this.tonePriority(tone),
            });
        }
        catch (err) {
            this.logger.warn(`Customer in-app notify failed for DD ${dd.id}: ${err?.message}`);
        }
    }
    async notifyCustomerEmail(dd) {
        if (!dd.customerId)
            return;
        const customer = await this.customerRepo.findOne({
            where: { id: dd.customerId },
        });
        if (!customer?.email)
            return;
        const subject = dd.metadata?.subject ?? `Payment reminder - ${dd.title}`;
        try {
            await this.mailService.sendMail({
                to: customer.email,
                subject,
                html: dd.content ?? '',
            });
        }
        catch (err) {
            this.logger.warn(`Customer email send failed for DD ${dd.id} (${customer.email}): ${err?.message}`);
        }
    }
    async notifyCustomerSms(dd, tone, daysOverdue) {
        if (!dd.customerId)
            return;
        const customer = await this.customerRepo.findOne({
            where: { id: dd.customerId },
        });
        if (!customer?.phoneNumber)
            return;
        const body = this.smsBodyForTone(tone, Number(dd.amount), daysOverdue, customer.fullName);
        await this.smsService.sendSms({
            to: customer.phoneNumber,
            body,
        });
    }
    async notifyInternalTeams(args) {
        const roles = args.ccManagement
            ? 'admin,super_admin,sales_team,finance'
            : 'sales_team,finance';
        try {
            await this.notificationsService.create({
                targetRoles: roles,
                title: args.title,
                message: args.message,
                type: notification_entity_1.NotificationType.WARNING,
                category: notification_entity_1.NotificationCategory.PAYMENT,
                actionUrl: `/demand-drafts/${args.dd.id}`,
                actionLabel: 'Open DD',
                relatedEntityId: args.dd.id,
                relatedEntityType: 'demand_draft',
                priority: args.priority,
            });
        }
        catch (err) {
            this.logger.warn(`Internal team notify failed for DD ${args.dd.id}: ${err?.message}`);
        }
    }
    computeNextReminder(from) {
        const next = new Date(from);
        next.setDate(next.getDate() + 7);
        return next;
    }
    tonePriority(tone) {
        switch (tone) {
            case demand_draft_entity_1.DemandDraftTone.REMINDER_1:
                return 6;
            case demand_draft_entity_1.DemandDraftTone.REMINDER_2:
                return 7;
            case demand_draft_entity_1.DemandDraftTone.REMINDER_3:
                return 8;
            case demand_draft_entity_1.DemandDraftTone.REMINDER_4:
                return 9;
            case demand_draft_entity_1.DemandDraftTone.CANCELLATION_WARNING:
                return 10;
            case demand_draft_entity_1.DemandDraftTone.POST_WARNING:
                return 9;
            default:
                return 5;
        }
    }
    smsBodyForTone(tone, amount, daysOverdue, name) {
        const amt = amount.toLocaleString('en-IN');
        switch (tone) {
            case demand_draft_entity_1.DemandDraftTone.REMINDER_1:
                return `Hi ${name}, gentle reminder: your payment of INR ${amt} is ${daysOverdue} days overdue. Please settle soon. -Eastern Estate`;
            case demand_draft_entity_1.DemandDraftTone.REMINDER_2:
                return `Hi ${name}, your payment of INR ${amt} is ${daysOverdue} days overdue. Kindly clear within 7 days. -Eastern Estate`;
            case demand_draft_entity_1.DemandDraftTone.REMINDER_3:
                return `FINAL NOTICE: ${name}, your payment of INR ${amt} is ${daysOverdue} days overdue. Immediate action required. -Eastern Estate`;
            case demand_draft_entity_1.DemandDraftTone.REMINDER_4:
                return `LAST CHANCE: ${name}, INR ${amt} is ${daysOverdue} days overdue. Cancellation warning next. -Eastern Estate`;
            case demand_draft_entity_1.DemandDraftTone.CANCELLATION_WARNING:
                return `${name}, your booking is AT RISK of cancellation. INR ${amt} is ${daysOverdue} days overdue. Contact us today. -Eastern Estate`;
            case demand_draft_entity_1.DemandDraftTone.POST_WARNING:
                return `${name}, your booking remains AT RISK. INR ${amt} is ${daysOverdue} days overdue. -Eastern Estate`;
            default:
                return `Hi ${name}, payment of INR ${amt} is due. -Eastern Estate`;
        }
    }
};
exports.OverdueScannerService = OverdueScannerService;
__decorate([
    (0, schedule_1.Cron)('0 9 * * *', { timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OverdueScannerService.prototype, "dailyScan", null);
exports.OverdueScannerService = OverdueScannerService = OverdueScannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __param(1, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        settings_service_1.SettingsService,
        demand_draft_template_service_1.DemandDraftTemplateService,
        mail_service_1.MailService,
        sms_service_1.SmsService,
        notifications_service_1.NotificationsService])
], OverdueScannerService);
//# sourceMappingURL=overdue-scanner.service.js.map