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
var AutoDemandDraftService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoDemandDraftService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const flat_payment_plan_service_1 = require("../../payment-plans/services/flat-payment-plan.service");
const demand_draft_template_service_1 = require("../../payment-plans/services/demand-draft-template.service");
const demand_draft_entity_1 = require("../../demand-drafts/entities/demand-draft.entity");
const payment_schedule_entity_1 = require("../../payments/entities/payment-schedule.entity");
const construction_flat_progress_entity_1 = require("../entities/construction-flat-progress.entity");
const milestone_detection_service_1 = require("./milestone-detection.service");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const property_entity_1 = require("../../properties/entities/property.entity");
const tower_entity_1 = require("../../towers/entities/tower.entity");
const demand_draft_html_builder_1 = require("../../../common/utils/demand-draft-html.builder");
const settings_service_1 = require("../../settings/settings.service");
const mail_service_1 = require("../../../common/mail/mail.service");
let AutoDemandDraftService = AutoDemandDraftService_1 = class AutoDemandDraftService {
    constructor(demandDraftRepository, paymentScheduleRepository, progressRepository, flatRepository, customerRepository, bookingRepository, propertyRepository, towerRepository, milestoneDetectionService, flatPaymentPlanService, templateService, settingsService, mailService) {
        this.demandDraftRepository = demandDraftRepository;
        this.paymentScheduleRepository = paymentScheduleRepository;
        this.progressRepository = progressRepository;
        this.flatRepository = flatRepository;
        this.customerRepository = customerRepository;
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
        this.towerRepository = towerRepository;
        this.milestoneDetectionService = milestoneDetectionService;
        this.flatPaymentPlanService = flatPaymentPlanService;
        this.templateService = templateService;
        this.settingsService = settingsService;
        this.mailService = mailService;
        this.logger = new common_1.Logger(AutoDemandDraftService_1.name);
    }
    async generateDemandDraft(match, systemUserId) {
        const { flatPaymentPlan, milestoneSequence, constructionProgress, amount } = match;
        const flat = await this.flatRepository.findOne({
            where: { id: flatPaymentPlan.flatId },
            relations: ['property', 'tower'],
        });
        if (!flat) {
            throw new common_1.NotFoundException('Flat not found');
        }
        const customer = await this.customerRepository.findOne({
            where: { id: flatPaymentPlan.customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const booking = await this.bookingRepository.findOne({
            where: { id: flatPaymentPlan.bookingId },
        });
        const milestone = flatPaymentPlan.milestones.find(m => m.sequence === milestoneSequence);
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found');
        }
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const dueDateStr = dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const amountFmt = Number(amount).toLocaleString('en-IN');
        const bookingRef = booking?.bookingNumber ?? flatPaymentPlan.bookingId.substring(0, 8).toUpperCase();
        const refNumber = `DD-${bookingRef}-${String(milestoneSequence).padStart(2, '0')}`;
        const templateData = {
            customerName: customer.fullName,
            propertyName: flat.property?.name || 'N/A',
            towerName: flat.tower?.name || '',
            flatNumber: flat.flatNumber,
            milestoneName: milestone.name,
            milestoneDescription: milestone.description || '',
            milestoneSeq: milestoneSequence,
            amount: amountFmt,
            totalAmount: Number(flatPaymentPlan.totalAmount).toLocaleString('en-IN'),
            paidAmount: Number(flatPaymentPlan.paidAmount).toLocaleString('en-IN'),
            balanceAfterPayment: Number(Math.max(0, flatPaymentPlan.balanceAmount - amount)).toLocaleString('en-IN'),
            dueDate: dueDateStr,
            dateIssued: todayStr,
            refNumber,
            bookingNumber: booking?.bookingNumber || '',
            constructionPhase: milestone.constructionPhase || '',
            phasePercentage: milestone.phasePercentage,
            bankName: '[Bank Name — to be filled]',
            accountName: 'Eastern Estate',
            accountNumber: '[Account Number — to be filled]',
            ifscCode: '[IFSC Code — to be filled]',
            customerEmail: customer.email || '',
            customerPhone: customer.phoneNumber || '',
        };
        let companySettings = null;
        try {
            companySettings = await this.settingsService.get();
        }
        catch {
            this.logger.warn('Could not load company settings — bank details will show placeholder');
        }
        let htmlContent = (0, demand_draft_html_builder_1.buildDemandDraftHtml)({
            refNumber,
            dateIssued: todayStr,
            customerName: customer.fullName,
            customerEmail: customer.email || undefined,
            customerPhone: customer.phoneNumber || undefined,
            propertyName: flat.property?.name || '',
            towerName: flat.tower?.name || undefined,
            flatNumber: flat.flatNumber,
            bookingNumber: booking?.bookingNumber || undefined,
            milestoneSeq: milestoneSequence,
            milestoneName: milestone.name,
            milestoneDescription: milestone.description || undefined,
            constructionPhase: milestone.constructionPhase || undefined,
            phasePercentage: milestone.phasePercentage ?? undefined,
            amount: amountFmt,
            dueDate: dueDateStr,
            totalAmount: String(flatPaymentPlan.totalAmount),
            paidAmount: String(flatPaymentPlan.paidAmount),
            balanceAfterPayment: String(Math.max(0, flatPaymentPlan.balanceAmount - amount)),
            bankName: flat.property?.bankName || companySettings?.bankName || undefined,
            accountName: flat.property?.accountName || companySettings?.accountName || undefined,
            accountNumber: flat.property?.accountNumber || companySettings?.accountNumber || undefined,
            ifscCode: flat.property?.ifscCode || companySettings?.ifscCode || undefined,
            branch: flat.property?.branch || companySettings?.branch || undefined,
        });
        const subject = `Payment Demand – ${flat.flatNumber}${flat.tower?.name ? ` / ${flat.tower.name}` : ''} – ${milestone.name}`;
        let usedTemplateId = null;
        try {
            const template = await this.templateService.findFirstActive();
            if (template) {
                const rendered = this.templateService.renderTemplate(template, templateData);
                htmlContent = rendered.htmlContent;
                usedTemplateId = template.id;
            }
        }
        catch {
        }
        let savedScheduleId = null;
        try {
            const paymentSchedule = this.paymentScheduleRepository.create({
                bookingId: flatPaymentPlan.bookingId,
                scheduleNumber: `${flatPaymentPlan.bookingId.substring(0, 8)}-${milestoneSequence}`,
                installmentNumber: milestoneSequence,
                totalInstallments: flatPaymentPlan.milestones.length,
                milestone: milestone.name,
                description: milestone.description,
                dueDate,
                amount,
                status: payment_schedule_entity_1.ScheduleStatus.PENDING,
                paidAmount: 0,
            });
            const savedSchedule = await this.paymentScheduleRepository.save(paymentSchedule);
            savedScheduleId = savedSchedule.id;
        }
        catch (err) {
            this.logger.warn('Could not create payment schedule entry (non-fatal):', err?.message);
        }
        const towerLabel = flat.tower?.name ? `${flat.tower.name} / ` : '';
        const draftTitle = `${flat.flatNumber} / ${towerLabel}${milestone.name}`;
        const demandDraft = this.demandDraftRepository.create({
            flatId: flatPaymentPlan.flatId,
            customerId: flatPaymentPlan.customerId,
            bookingId: flatPaymentPlan.bookingId,
            milestoneId: milestone.name,
            title: draftTitle,
            amount,
            status: demand_draft_entity_1.DemandDraftStatus.DRAFT,
            content: htmlContent,
            dueDate,
            metadata: {
                subject,
                templateData,
            },
            paymentScheduleId: savedScheduleId,
            flatPaymentPlanId: flatPaymentPlan.id,
            constructionCheckpointId: constructionProgress?.id ?? null,
            autoGenerated: true,
            requiresReview: true,
            templateId: usedTemplateId,
            templateData,
            generatedAt: new Date(),
            createdBy: systemUserId || null,
        });
        const savedDemandDraft = await this.demandDraftRepository.save(demandDraft);
        await this.flatPaymentPlanService.updateMilestone(flatPaymentPlan.id, milestoneSequence, {
            status: 'TRIGGERED',
            dueDate: dueDate.toISOString(),
            paymentScheduleId: savedScheduleId,
            demandDraftId: savedDemandDraft.id,
            constructionCheckpointId: constructionProgress?.id ?? null,
        }, systemUserId || 'SYSTEM');
        if (constructionProgress) {
            constructionProgress.isPaymentMilestone = true;
            constructionProgress.milestoneTriggered = true;
            constructionProgress.milestoneTriggeredAt = new Date();
            constructionProgress.demandDraftId = savedDemandDraft.id;
            if (savedScheduleId) {
                constructionProgress.paymentScheduleId = savedScheduleId;
            }
            await this.progressRepository.save(constructionProgress);
        }
        this.logger.log(`Generated demand draft ${savedDemandDraft.id} for flat ${flat.flatNumber}, milestone: ${milestone.name}`);
        return savedDemandDraft;
    }
    async manualGenerateDemandDraft(flatPaymentPlanId, milestoneSequence, userId) {
        const paymentPlan = await this.flatPaymentPlanService.findOne(flatPaymentPlanId);
        const milestone = paymentPlan.milestones.find(m => m.sequence === milestoneSequence);
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found');
        }
        if (milestone.status !== 'PENDING') {
            throw new common_1.BadRequestException(`This milestone has already been ${milestone.status.toLowerCase()}. ` +
                `A demand draft may have already been generated for it. Check the Demand Drafts page.`);
        }
        if (milestone.constructionPhase) {
            const canTrigger = await this.milestoneDetectionService.canTriggerMilestone(flatPaymentPlanId, milestoneSequence);
            if (!canTrigger) {
                throw new common_1.BadRequestException(`Construction has not reached the required level for this milestone yet. ` +
                    `Required: ${milestone.phasePercentage ?? 100}% of ${milestone.constructionPhase}. ` +
                    `Please log the construction progress first and then generate the demand draft.`);
            }
        }
        let constructionProgress = null;
        if (milestone.constructionPhase) {
            constructionProgress = await this.progressRepository.findOne({
                where: {
                    flatId: paymentPlan.flatId,
                    phase: milestone.constructionPhase,
                },
            });
            if (!constructionProgress) {
                this.logger.warn(`No construction progress record found for flat ${paymentPlan.flatId}, phase ${milestone.constructionPhase}. Draft will be created without checkpoint link.`);
            }
        }
        const match = {
            flatPaymentPlan: paymentPlan,
            milestoneSequence,
            constructionProgress,
            milestoneName: milestone.name,
            amount: milestone.amount,
        };
        return await this.generateDemandDraft(match, userId);
    }
    async approveDemandDraft(demandDraftId, userId) {
        const demandDraft = await this.demandDraftRepository.findOne({
            where: { id: demandDraftId },
        });
        if (!demandDraft) {
            throw new common_1.NotFoundException('Demand draft not found');
        }
        demandDraft.status = demand_draft_entity_1.DemandDraftStatus.READY;
        demandDraft.requiresReview = false;
        demandDraft.reviewedBy = userId;
        demandDraft.reviewedAt = new Date();
        demandDraft.updatedBy = userId;
        return await this.demandDraftRepository.save(demandDraft);
    }
    async sendDemandDraft(demandDraftId, userId) {
        const demandDraft = await this.demandDraftRepository.findOne({
            where: { id: demandDraftId },
        });
        if (!demandDraft) {
            throw new common_1.NotFoundException('Demand draft not found');
        }
        if (demandDraft.status !== demand_draft_entity_1.DemandDraftStatus.READY) {
            throw new common_1.BadRequestException(`Demand draft is currently in "${demandDraft.status}" status. ` +
                `Please approve it first (set to READY) before sending.`);
        }
        let customerEmail = null;
        if (demandDraft.customerId) {
            const customer = await this.customerRepository.findOne({ where: { id: demandDraft.customerId } });
            customerEmail = customer?.email ?? null;
        }
        const emailSubject = demandDraft.metadata?.subject ||
            demandDraft.title ||
            `Payment Demand Notice — ₹${demandDraft.amount?.toLocaleString('en-IN')}`;
        if (customerEmail) {
            try {
                const result = await this.mailService.sendMail({
                    to: customerEmail,
                    subject: emailSubject,
                    html: demandDraft.content || '<p>Please contact us for your payment demand details.</p>',
                });
                if (result.skipped) {
                    this.logger.warn(`Email skipped (SMTP not configured) for draft ${demandDraftId}`);
                }
                else {
                    this.logger.log(`Email sent to ${customerEmail} for draft ${demandDraftId}`);
                }
            }
            catch (mailErr) {
                this.logger.error(`Email delivery failed for draft ${demandDraftId}: ${mailErr?.message}`);
            }
        }
        else {
            this.logger.warn(`Draft ${demandDraftId} has no customer email — skipping email send`);
        }
        demandDraft.status = demand_draft_entity_1.DemandDraftStatus.SENT;
        demandDraft.sentAt = new Date();
        demandDraft.updatedBy = userId;
        this.logger.log(`Demand draft ${demandDraftId} marked as sent`);
        return await this.demandDraftRepository.save(demandDraft);
    }
};
exports.AutoDemandDraftService = AutoDemandDraftService;
exports.AutoDemandDraftService = AutoDemandDraftService = AutoDemandDraftService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_schedule_entity_1.PaymentSchedule)),
    __param(2, (0, typeorm_1.InjectRepository)(construction_flat_progress_entity_1.ConstructionFlatProgress)),
    __param(3, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(4, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(5, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(6, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __param(7, (0, typeorm_1.InjectRepository)(tower_entity_1.Tower)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        milestone_detection_service_1.MilestoneDetectionService,
        flat_payment_plan_service_1.FlatPaymentPlanService,
        demand_draft_template_service_1.DemandDraftTemplateService,
        settings_service_1.SettingsService,
        mail_service_1.MailService])
], AutoDemandDraftService);
//# sourceMappingURL=auto-demand-draft.service.js.map