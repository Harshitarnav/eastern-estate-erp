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
var ConstructionWorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_flat_progress_entity_1 = require("../entities/construction-flat-progress.entity");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const flat_payment_plan_entity_1 = require("../../payment-plans/entities/flat-payment-plan.entity");
const demand_draft_entity_1 = require("../../demand-drafts/entities/demand-draft.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const demand_draft_html_builder_1 = require("../../../common/utils/demand-draft-html.builder");
const settings_service_1 = require("../../settings/settings.service");
let ConstructionWorkflowService = ConstructionWorkflowService_1 = class ConstructionWorkflowService {
    constructor(flatRepository, flatPaymentPlanRepository, demandDraftRepository, progressRepository, customerRepository, bookingRepository, settingsService) {
        this.flatRepository = flatRepository;
        this.flatPaymentPlanRepository = flatPaymentPlanRepository;
        this.demandDraftRepository = demandDraftRepository;
        this.progressRepository = progressRepository;
        this.customerRepository = customerRepository;
        this.bookingRepository = bookingRepository;
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(ConstructionWorkflowService_1.name);
    }
    async processConstructionUpdate(flatId, phase, phaseProgress, overallProgress) {
        this.logger.log(`Processing construction update for flat ${flatId}`);
        try {
            await this.updateFlatConstructionStatus(flatId, phase, overallProgress);
            const paymentPlan = await this.flatPaymentPlanRepository.findOne({
                where: { flatId, status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE },
                relations: ['customer', 'booking', 'flat', 'flat.property', 'flat.tower'],
            });
            if (!paymentPlan) {
                this.logger.log(`No active payment plan found for flat ${flatId} - skipping milestone check`);
                return;
            }
            this.logger.log(`Active payment plan found for flat ${flatId} - checking milestones`);
            await this.checkAndUpdateMilestones(paymentPlan, phase, phaseProgress);
        }
        catch (error) {
            this.logger.error(`Error processing construction update for flat ${flatId}:`, error);
            throw error;
        }
    }
    async updateFlatConstructionStatus(flatId, stage, progress) {
        this.logger.log(`Updating flat ${flatId}: stage=${stage}, progress=${progress}%`);
        await this.flatRepository.update(flatId, {
            constructionStage: stage,
            constructionProgress: progress,
            lastConstructionUpdate: new Date(),
        });
        this.logger.log(`Flat ${flatId} updated successfully`);
    }
    async checkAndUpdateMilestones(paymentPlan, currentPhase, phaseProgress) {
        this.logger.log(`Checking milestones for payment plan ${paymentPlan.id}`);
        let planUpdated = false;
        for (const milestone of paymentPlan.milestones) {
            if (milestone.status !== 'PENDING') {
                continue;
            }
            if (!milestone.constructionPhase) {
                continue;
            }
            if (milestone.constructionPhase === currentPhase &&
                phaseProgress >= (milestone.phasePercentage || 100)) {
                this.logger.log(`Milestone ${milestone.sequence} reached for flat ${paymentPlan.flatId}: ` +
                    `${currentPhase} at ${phaseProgress}% (required: ${milestone.phasePercentage}%)`);
                milestone.status = 'TRIGGERED';
                planUpdated = true;
                await this.generateDemandDraft(paymentPlan, milestone);
            }
        }
        if (planUpdated) {
            await this.flatPaymentPlanRepository.save(paymentPlan);
            this.logger.log(`Payment plan ${paymentPlan.id} updated with triggered milestones`);
        }
        else {
            this.logger.log(`No milestones reached for payment plan ${paymentPlan.id}`);
        }
    }
    async generateDemandDraft(paymentPlan, milestone) {
        this.logger.log(`Generating demand draft for milestone ${milestone.sequence} of payment plan ${paymentPlan.id}`);
        const existingDraft = await this.demandDraftRepository.findOne({
            where: {
                flatId: paymentPlan.flatId,
                milestoneId: `${milestone.sequence}`,
            },
        });
        if (existingDraft) {
            this.logger.log(`Demand draft already exists for milestone ${milestone.sequence}`);
            return;
        }
        const customer = paymentPlan.customer;
        const booking = paymentPlan.booking;
        const flat = paymentPlan.flat;
        if (!customer || !flat) {
            this.logger.warn(`Missing customer or flat data for payment plan ${paymentPlan.id}`);
            return;
        }
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const dueDateStr = dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const bookingRef = booking?.bookingNumber ?? paymentPlan.bookingId.substring(0, 8).toUpperCase();
        const refNumber = `DD-${bookingRef}-${String(milestone.sequence).padStart(2, '0')}`;
        let companySettings = null;
        try {
            companySettings = await this.settingsService.get();
        }
        catch { }
        const content = (0, demand_draft_html_builder_1.buildDemandDraftHtml)({
            refNumber,
            dateIssued: todayStr,
            customerName: customer.fullName,
            customerEmail: customer.email || undefined,
            customerPhone: customer.phoneNumber || undefined,
            propertyName: flat.property?.name || '',
            towerName: flat.tower?.name || undefined,
            flatNumber: flat.flatNumber || 'N/A',
            bookingNumber: booking?.bookingNumber || undefined,
            milestoneSeq: milestone.sequence,
            milestoneName: milestone.name,
            milestoneDescription: milestone.description || undefined,
            constructionPhase: milestone.constructionPhase || undefined,
            amount: Number(milestone.amount).toLocaleString('en-IN'),
            dueDate: dueDateStr,
            totalAmount: String(paymentPlan.totalAmount),
            paidAmount: String(paymentPlan.paidAmount),
            balanceAfterPayment: String(Math.max(0, paymentPlan.balanceAmount - milestone.amount)),
            bankName: flat.property?.bankName || companySettings?.bankName || undefined,
            accountName: flat.property?.accountName || companySettings?.accountName || undefined,
            accountNumber: flat.property?.accountNumber || companySettings?.accountNumber || undefined,
            ifscCode: flat.property?.ifscCode || companySettings?.ifscCode || undefined,
            branch: flat.property?.branch || companySettings?.branch || undefined,
        });
        const towerLabel = flat.tower?.name ? `${flat.tower.name} / ` : '';
        const draftTitle = `${flat.flatNumber || 'N/A'} / ${towerLabel}${milestone.name}`;
        const demandDraft = this.demandDraftRepository.create({
            flatId: paymentPlan.flatId,
            customerId: paymentPlan.customerId,
            bookingId: paymentPlan.bookingId,
            milestoneId: `${milestone.sequence}`,
            title: draftTitle,
            content,
            amount: milestone.amount,
            dueDate,
            status: demand_draft_entity_1.DemandDraftStatus.DRAFT,
            requiresReview: true,
            generatedAt: new Date(),
            autoGenerated: true,
            flatPaymentPlanId: paymentPlan.id,
            metadata: {
                subject: `Payment Demand – ${flat.flatNumber} – ${milestone.name}`,
                dueDate: dueDate.toISOString(),
                milestoneSequence: milestone.sequence,
                milestoneName: milestone.name,
                constructionPhase: milestone.constructionPhase,
                autoGenerated: true,
            },
        });
        await this.demandDraftRepository.save(demandDraft);
        this.logger.log(`Demand draft ${demandDraft.id} generated for milestone ${milestone.sequence}`);
    }
    async getPendingDemandDrafts() {
        return await this.demandDraftRepository.find({
            where: {
                status: demand_draft_entity_1.DemandDraftStatus.DRAFT,
                requiresReview: true,
            },
            relations: ['customer', 'flat', 'flat.property', 'flat.tower', 'booking'],
            order: { generatedAt: 'DESC' },
        });
    }
};
exports.ConstructionWorkflowService = ConstructionWorkflowService;
exports.ConstructionWorkflowService = ConstructionWorkflowService = ConstructionWorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(1, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(2, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __param(3, (0, typeorm_1.InjectRepository)(construction_flat_progress_entity_1.ConstructionFlatProgress)),
    __param(4, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(5, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        settings_service_1.SettingsService])
], ConstructionWorkflowService);
//# sourceMappingURL=construction-workflow.service.js.map