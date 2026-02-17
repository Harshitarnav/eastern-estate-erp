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
var MilestoneDetectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestoneDetectionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_flat_progress_entity_1 = require("../entities/construction-flat-progress.entity");
const flat_payment_plan_entity_1 = require("../../payment-plans/entities/flat-payment-plan.entity");
const flat_entity_1 = require("../../flats/entities/flat.entity");
let MilestoneDetectionService = MilestoneDetectionService_1 = class MilestoneDetectionService {
    constructor(progressRepository, paymentPlanRepository, flatRepository) {
        this.progressRepository = progressRepository;
        this.paymentPlanRepository = paymentPlanRepository;
        this.flatRepository = flatRepository;
        this.logger = new common_1.Logger(MilestoneDetectionService_1.name);
    }
    async detectMilestones() {
        const matches = [];
        const paymentPlans = await this.paymentPlanRepository.find({
            where: { status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE },
            relations: ['flat'],
        });
        for (const plan of paymentPlans) {
            const progressRecords = await this.progressRepository.find({
                where: { flatId: plan.flatId },
                order: { phase: 'ASC' },
            });
            for (const milestone of plan.milestones) {
                if (milestone.status !== 'PENDING') {
                    continue;
                }
                if (!milestone.constructionPhase) {
                    continue;
                }
                const matchingProgress = progressRecords.find(p => p.phase === milestone.constructionPhase);
                if (!matchingProgress) {
                    continue;
                }
                const requiredPercentage = milestone.phasePercentage || 100;
                const actualPercentage = matchingProgress.phaseProgress;
                if (actualPercentage >= requiredPercentage) {
                    matches.push({
                        flatPaymentPlan: plan,
                        milestoneSequence: milestone.sequence,
                        constructionProgress: matchingProgress,
                        milestoneName: milestone.name,
                        amount: milestone.amount,
                    });
                }
            }
        }
        return matches;
    }
    async detectMilestonesForFlat(flatId) {
        const matches = [];
        const paymentPlan = await this.paymentPlanRepository.findOne({
            where: { flatId, status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE },
            relations: ['flat'],
        });
        if (!paymentPlan) {
            return matches;
        }
        const progressRecords = await this.progressRepository.find({
            where: { flatId },
            order: { phase: 'ASC' },
        });
        for (const milestone of paymentPlan.milestones) {
            if (milestone.status !== 'PENDING' || !milestone.constructionPhase) {
                continue;
            }
            const matchingProgress = progressRecords.find(p => p.phase === milestone.constructionPhase);
            if (!matchingProgress) {
                continue;
            }
            const requiredPercentage = milestone.phasePercentage || 100;
            if (matchingProgress.phaseProgress >= requiredPercentage) {
                matches.push({
                    flatPaymentPlan: paymentPlan,
                    milestoneSequence: milestone.sequence,
                    constructionProgress: matchingProgress,
                    milestoneName: milestone.name,
                    amount: milestone.amount,
                });
            }
        }
        return matches;
    }
    async canTriggerMilestone(paymentPlanId, milestoneSequence) {
        const paymentPlan = await this.paymentPlanRepository.findOne({
            where: { id: paymentPlanId },
        });
        if (!paymentPlan) {
            return false;
        }
        const milestone = paymentPlan.milestones.find(m => m.sequence === milestoneSequence);
        if (!milestone || milestone.status !== 'PENDING') {
            return false;
        }
        if (!milestone.constructionPhase) {
            return true;
        }
        const progressRecords = await this.progressRepository.find({
            where: { flatId: paymentPlan.flatId },
        });
        const matchingProgress = progressRecords.find(p => p.phase === milestone.constructionPhase);
        if (!matchingProgress) {
            return false;
        }
        const requiredPercentage = milestone.phasePercentage || 100;
        return matchingProgress.phaseProgress >= requiredPercentage;
    }
    async getConstructionSummary(flatId) {
        const progressRecords = await this.progressRepository.find({
            where: { flatId },
        });
        const phases = {};
        let totalProgress = 0;
        for (const record of progressRecords) {
            phases[record.phase] = {
                progress: record.phaseProgress,
                status: record.status,
            };
            totalProgress += record.phaseProgress;
        }
        const overallProgress = progressRecords.length > 0
            ? totalProgress / progressRecords.length
            : 0;
        return { phases, overallProgress };
    }
};
exports.MilestoneDetectionService = MilestoneDetectionService;
exports.MilestoneDetectionService = MilestoneDetectionService = MilestoneDetectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_flat_progress_entity_1.ConstructionFlatProgress)),
    __param(1, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(2, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MilestoneDetectionService);
//# sourceMappingURL=milestone-detection.service.js.map