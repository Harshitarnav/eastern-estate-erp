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
const construction_tower_progress_entity_1 = require("../entities/construction-tower-progress.entity");
const construction_project_entity_1 = require("../entities/construction-project.entity");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const flat_payment_plan_entity_1 = require("../../payment-plans/entities/flat-payment-plan.entity");
const demand_draft_entity_1 = require("../../demand-drafts/entities/demand-draft.entity");
const auto_demand_draft_service_1 = require("./auto-demand-draft.service");
let ConstructionWorkflowService = ConstructionWorkflowService_1 = class ConstructionWorkflowService {
    constructor(flatRepository, flatPaymentPlanRepository, demandDraftRepository, progressRepository, projectRepository, autoDemandDraftService) {
        this.flatRepository = flatRepository;
        this.flatPaymentPlanRepository = flatPaymentPlanRepository;
        this.demandDraftRepository = demandDraftRepository;
        this.progressRepository = progressRepository;
        this.projectRepository = projectRepository;
        this.autoDemandDraftService = autoDemandDraftService;
        this.logger = new common_1.Logger(ConstructionWorkflowService_1.name);
    }
    async processConstructionUpdate(flatId, phase, phaseProgress, overallProgress) {
        this.logger.log(`Processing construction update for flat ${flatId}`);
        const emptyResult = {
            milestonesTriggered: 0,
            generatedDemandDrafts: [],
        };
        try {
            await this.updateFlatConstructionStatus(flatId, phase, phaseProgress, overallProgress);
            const paymentPlan = await this.flatPaymentPlanRepository.findOne({
                where: { flatId, status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE },
                relations: ['customer', 'booking', 'flat', 'flat.property', 'flat.tower'],
            });
            if (!paymentPlan) {
                this.logger.log(`No active payment plan found for flat ${flatId} - skipping milestone check`);
                return emptyResult;
            }
            return await this.checkAndUpdateMilestones(paymentPlan, phase, phaseProgress);
        }
        catch (error) {
            this.logger.error(`Error processing construction update for flat ${flatId}:`, error);
            throw error;
        }
    }
    async updateFlatConstructionStatus(flatId, stage, phaseProgress, overallProgress) {
        this.logger.log(`Updating flat ${flatId}: stage=${stage}, phaseProgress=${phaseProgress}%, overallProgress=${overallProgress}%`);
        await this.flatRepository.update(flatId, {
            constructionStage: stage,
            constructionProgress: overallProgress,
            lastConstructionUpdate: new Date(),
        });
        try {
            if (!this.isKnownPhase(stage))
                return;
            const phase = stage;
            let row = await this.progressRepository.findOne({
                where: { flatId, phase },
            });
            if (!row) {
                const flat = await this.flatRepository.findOne({
                    where: { id: flatId },
                });
                if (!flat?.propertyId)
                    return;
                const project = await this.projectRepository.findOne({
                    where: { propertyId: flat.propertyId },
                    select: ['id'],
                });
                if (!project)
                    return;
                row = this.progressRepository.create({
                    constructionProjectId: project.id,
                    flatId,
                    phase,
                    phaseProgress,
                    overallProgress,
                    status: phaseProgress >= 100
                        ? construction_tower_progress_entity_1.PhaseStatus.COMPLETED
                        : phaseProgress > 0
                            ? construction_tower_progress_entity_1.PhaseStatus.IN_PROGRESS
                            : construction_tower_progress_entity_1.PhaseStatus.NOT_STARTED,
                });
            }
            else {
                row.phaseProgress = phaseProgress;
                row.overallProgress = overallProgress;
                if (phaseProgress >= 100) {
                    row.status = construction_tower_progress_entity_1.PhaseStatus.COMPLETED;
                    row.actualEndDate = row.actualEndDate ?? new Date();
                }
                else if (phaseProgress > 0 && row.status === construction_tower_progress_entity_1.PhaseStatus.NOT_STARTED) {
                    row.status = construction_tower_progress_entity_1.PhaseStatus.IN_PROGRESS;
                }
            }
            await this.progressRepository.save(row);
        }
        catch (err) {
            this.logger.warn(`Could not sync construction_flat_progress for flat ${flatId}/${stage}: ${err?.message}`);
        }
    }
    isKnownPhase(v) {
        return Object.values(construction_tower_progress_entity_1.ConstructionPhase).includes(v);
    }
    async checkAndUpdateMilestones(paymentPlan, currentPhase, phaseProgress) {
        this.logger.log(`Checking milestones for payment plan ${paymentPlan.id}`);
        const generatedDemandDrafts = [];
        let milestonesTriggered = 0;
        for (const milestone of paymentPlan.milestones ?? []) {
            if (milestone.status !== 'PENDING')
                continue;
            if (!milestone.constructionPhase)
                continue;
            if (milestone.constructionPhase !== currentPhase ||
                phaseProgress < (milestone.phasePercentage || 100)) {
                continue;
            }
            this.logger.log(`Milestone ${milestone.sequence} reached for flat ${paymentPlan.flatId}: ` +
                `${currentPhase} at ${phaseProgress}% (required: ${milestone.phasePercentage}%)`);
            const summary = await this.delegateDemandDraft(paymentPlan, milestone, currentPhase);
            if (summary) {
                generatedDemandDrafts.push(summary);
                milestonesTriggered += 1;
            }
        }
        return { milestonesTriggered, generatedDemandDrafts };
    }
    async delegateDemandDraft(paymentPlan, milestone, currentPhase) {
        const existing = await this.demandDraftRepository.findOne({
            where: {
                flatId: paymentPlan.flatId,
                milestoneId: String(milestone.sequence),
            },
        });
        if (existing) {
            this.logger.log(`Demand draft already exists for milestone ${milestone.sequence} on flat ${paymentPlan.flatId}`);
            return null;
        }
        const constructionProgress = await this.progressRepository.findOne({
            where: {
                flatId: paymentPlan.flatId,
                phase: currentPhase,
            },
        });
        const saved = await this.autoDemandDraftService.generateDemandDraft({
            flatPaymentPlan: paymentPlan,
            milestoneSequence: milestone.sequence,
            constructionProgress: constructionProgress ?? null,
            milestoneName: milestone.name,
            amount: Number(milestone.amount) || 0,
        });
        const flat = paymentPlan.flat;
        const bookingRef = paymentPlan.booking?.bookingNumber ??
            paymentPlan.bookingId.substring(0, 8).toUpperCase();
        const refNumber = `DD-${bookingRef}-${String(milestone.sequence).padStart(2, '0')}`;
        return {
            id: saved.id,
            title: saved.title,
            amount: Number(saved.amount) || 0,
            refNumber,
            milestoneName: milestone.name,
            flatNumber: flat?.flatNumber || undefined,
            towerName: flat?.tower?.name || undefined,
            propertyName: flat?.property?.name || undefined,
            customerName: paymentPlan.customer?.fullName || undefined,
            dueDate: saved.dueDate,
        };
    }
    async getPendingDemandDrafts() {
        return await this.demandDraftRepository.find({
            where: {
                status: demand_draft_entity_1.DemandDraftStatus.DRAFT,
                requiresReview: true,
            },
            relations: ['customer', 'flat', 'flat.property', 'flat.tower'],
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
    __param(4, (0, typeorm_1.InjectRepository)(construction_project_entity_1.ConstructionProject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        auto_demand_draft_service_1.AutoDemandDraftService])
], ConstructionWorkflowService);
//# sourceMappingURL=construction-workflow.service.js.map