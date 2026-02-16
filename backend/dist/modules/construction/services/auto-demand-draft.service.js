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
let AutoDemandDraftService = AutoDemandDraftService_1 = class AutoDemandDraftService {
    constructor(demandDraftRepository, paymentScheduleRepository, progressRepository, flatRepository, customerRepository, bookingRepository, propertyRepository, towerRepository, milestoneDetectionService, flatPaymentPlanService, templateService) {
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
        this.logger = new common_1.Logger(AutoDemandDraftService_1.name);
    }
    async generateDemandDraft(match, systemUserId) {
        const { flatPaymentPlan, milestoneSequence, constructionProgress, amount } = match;
        const template = await this.templateService.findFirstActive();
        if (!template) {
            throw new common_1.NotFoundException('No active demand draft template found');
        }
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
        const templateData = {
            customerName: customer.fullName,
            propertyName: flat.property?.name || 'N/A',
            towerName: flat.tower?.name || 'N/A',
            flatNumber: flat.flatNumber,
            milestoneName: milestone.name,
            milestoneDescription: milestone.description,
            amount: amount.toLocaleString('en-IN'),
            dueDate: dueDate.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }),
            bankName: 'State Bank of India',
            accountName: 'Eastern Estate Pvt Ltd',
            accountNumber: '1234567890',
            ifscCode: 'SBIN0001234',
            branch: 'Kolkata Main Branch',
            customerEmail: customer.email || '',
            customerPhone: customer.phoneNumber || '',
        };
        const { subject, htmlContent } = this.templateService.renderTemplate(template, templateData);
        const demandDraft = this.demandDraftRepository.create({
            flatId: flatPaymentPlan.flatId,
            customerId: flatPaymentPlan.customerId,
            bookingId: flatPaymentPlan.bookingId,
            milestoneId: milestone.name,
            amount,
            status: demand_draft_entity_1.DemandDraftStatus.DRAFT,
            content: htmlContent,
            metadata: {
                subject,
                templateData,
            },
            paymentScheduleId: savedSchedule.id,
            flatPaymentPlanId: flatPaymentPlan.id,
            constructionCheckpointId: constructionProgress.id,
            autoGenerated: true,
            requiresReview: true,
            templateId: template.id,
            templateData,
            generatedAt: new Date(),
            createdBy: systemUserId || null,
        });
        const savedDemandDraft = await this.demandDraftRepository.save(demandDraft);
        await this.flatPaymentPlanService.updateMilestone(flatPaymentPlan.id, milestoneSequence, {
            status: 'TRIGGERED',
            dueDate: dueDate.toISOString(),
            paymentScheduleId: savedSchedule.id,
            demandDraftId: savedDemandDraft.id,
            constructionCheckpointId: constructionProgress.id,
        }, systemUserId || 'SYSTEM');
        constructionProgress.isPaymentMilestone = true;
        constructionProgress.milestoneTriggered = true;
        constructionProgress.milestoneTriggeredAt = new Date();
        constructionProgress.demandDraftId = savedDemandDraft.id;
        constructionProgress.paymentScheduleId = savedSchedule.id;
        await this.progressRepository.save(constructionProgress);
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
            throw new Error(`Milestone is already ${milestone.status}`);
        }
        if (milestone.constructionPhase) {
            const canTrigger = await this.milestoneDetectionService.canTriggerMilestone(flatPaymentPlanId, milestoneSequence);
            if (!canTrigger) {
                throw new Error(`Construction progress has not reached required level for this milestone. ` +
                    `Required: ${milestone.phasePercentage}% of ${milestone.constructionPhase}`);
            }
        }
        let constructionProgress = null;
        if (milestone.constructionPhase) {
            constructionProgress = await this.progressRepository.findOne({
                where: {
                    flatId: paymentPlan.flatId,
                    phase: milestone.constructionPhase
                },
            });
            if (!constructionProgress) {
                throw new common_1.NotFoundException('Construction progress record not found');
            }
        }
        else {
            constructionProgress = await this.progressRepository.findOne({
                where: { flatId: paymentPlan.flatId },
            });
            if (!constructionProgress) {
                throw new common_1.NotFoundException('No construction progress found for this flat');
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
            throw new Error('Demand draft must be in READY status to send');
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
        demand_draft_template_service_1.DemandDraftTemplateService])
], AutoDemandDraftService);
//# sourceMappingURL=auto-demand-draft.service.js.map