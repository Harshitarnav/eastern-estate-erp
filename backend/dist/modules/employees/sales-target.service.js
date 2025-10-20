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
var SalesTargetService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesTargetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_target_entity_1 = require("./entities/sales-target.entity");
const lead_entity_1 = require("../leads/entities/lead.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
let SalesTargetService = SalesTargetService_1 = class SalesTargetService {
    constructor(salesTargetRepository, leadRepository, bookingRepository, dataSource) {
        this.salesTargetRepository = salesTargetRepository;
        this.leadRepository = leadRepository;
        this.bookingRepository = bookingRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(SalesTargetService_1.name);
    }
    async create(createTargetDto) {
        this.logger.log(`Creating sales target for ${createTargetDto.salesPersonId}`);
        if (createTargetDto.startDate >= createTargetDto.endDate) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        const existing = await this.salesTargetRepository.findOne({
            where: {
                salesPersonId: createTargetDto.salesPersonId,
                targetPeriod: createTargetDto.targetPeriod,
                status: sales_target_entity_1.TargetStatus.ACTIVE,
                isActive: true,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Active ${createTargetDto.targetPeriod} target already exists for this sales person`);
        }
        const target = this.salesTargetRepository.create(createTargetDto);
        return this.salesTargetRepository.save(target);
    }
    async findOne(id) {
        const target = await this.salesTargetRepository.findOne({
            where: { id, isActive: true },
            relations: ['salesPerson'],
        });
        if (!target) {
            throw new common_1.NotFoundException(`Sales target with ID ${id} not found`);
        }
        return target;
    }
    async findBySalesPerson(salesPersonId) {
        return this.salesTargetRepository.find({
            where: { salesPersonId, isActive: true },
            order: { startDate: 'DESC' },
        });
    }
    async getActiveTarget(salesPersonId, period) {
        const where = {
            salesPersonId,
            status: sales_target_entity_1.TargetStatus.IN_PROGRESS,
            isActive: true,
        };
        if (period) {
            where.targetPeriod = period;
        }
        const today = new Date();
        const targets = await this.salesTargetRepository.find({
            where,
            order: { startDate: 'DESC' },
        });
        return targets.find(t => t.startDate <= today && t.endDate >= today) || null;
    }
    async updateAchievement(targetId) {
        const target = await this.findOne(targetId);
        this.logger.log(`Updating achievement for target ${targetId}`);
        const performance = await this.fetchPerformanceData(target.salesPersonId, target.startDate, target.endDate);
        target.achievedLeads = performance.totalLeads;
        target.achievedSiteVisits = performance.totalSiteVisits;
        target.achievedConversions = performance.totalConversions;
        target.achievedBookings = performance.totalBookings;
        target.achievedRevenue = performance.totalRevenue;
        target.leadsAchievementPct = this.calculatePercentage(target.achievedLeads, target.targetLeads);
        target.siteVisitsAchievementPct = this.calculatePercentage(target.achievedSiteVisits, target.targetSiteVisits);
        target.conversionsAchievementPct = this.calculatePercentage(target.achievedConversions, target.targetConversions);
        target.bookingsAchievementPct = this.calculatePercentage(target.achievedBookings, target.targetBookings);
        target.revenueAchievementPct = this.calculatePercentage(target.achievedRevenue, target.targetRevenue);
        target.overallAchievementPct = this.calculateOverallAchievement(target);
        target.status = this.determineStatus(target);
        this.calculateIncentives(target);
        target.motivationalMessage = this.generateMotivationalMessage(target);
        target.missedBy = Math.max(0, target.targetBookings - target.achievedBookings);
        await this.salesTargetRepository.save(target);
        return target;
    }
    async fetchPerformanceData(salesPersonId, startDate, endDate) {
        const leads = await this.leadRepository.count({
            where: {
                assignedTo: salesPersonId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const siteVisits = await this.leadRepository.count({
            where: {
                assignedTo: salesPersonId,
                hasSiteVisit: true,
                lastSiteVisitDate: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const conversions = await this.leadRepository
            .createQueryBuilder('lead')
            .where('lead.assignedTo = :salesPersonId', { salesPersonId })
            .andWhere('lead.convertedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('lead.convertedToCustomerId IS NOT NULL')
            .getCount();
        const bookings = await this.bookingRepository.find({
            where: {
                bookingDate: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
        return {
            totalLeads: leads,
            totalSiteVisits: siteVisits,
            totalConversions: conversions,
            totalBookings: bookings.length,
            totalRevenue,
        };
    }
    calculatePercentage(achieved, target) {
        if (target === 0)
            return 0;
        return Math.round((achieved / target) * 100 * 100) / 100;
    }
    calculateOverallAchievement(target) {
        const weights = {
            leads: 0.1,
            siteVisits: 0.15,
            conversions: 0.2,
            bookings: 0.3,
            revenue: 0.25,
        };
        return Math.round((target.leadsAchievementPct * weights.leads +
            target.siteVisitsAchievementPct * weights.siteVisits +
            target.conversionsAchievementPct * weights.conversions +
            target.bookingsAchievementPct * weights.bookings +
            target.revenueAchievementPct * weights.revenue) *
            100) / 100;
    }
    determineStatus(target) {
        const today = new Date();
        if (today > target.endDate) {
            return target.overallAchievementPct >= 100 ? sales_target_entity_1.TargetStatus.ACHIEVED : sales_target_entity_1.TargetStatus.MISSED;
        }
        return sales_target_entity_1.TargetStatus.IN_PROGRESS;
    }
    calculateIncentives(target) {
        const achievementPct = target.overallAchievementPct;
        target.earnedIncentive = (target.baseIncentive * achievementPct) / 100;
        if (achievementPct > 100) {
            const excessPct = achievementPct - 100;
            target.bonusIncentive = (target.baseIncentive * excessPct) / 100;
        }
        else {
            target.bonusIncentive = 0;
        }
        target.totalIncentive = target.earnedIncentive + target.bonusIncentive;
    }
    generateMotivationalMessage(target) {
        const achievementPct = target.overallAchievementPct;
        const missedBookings = target.targetBookings - target.achievedBookings;
        if (achievementPct >= 100) {
            return `🎉 Congratulations! You've achieved ${achievementPct.toFixed(1)}% of your target! Keep up the excellent work!`;
        }
        else if (achievementPct >= 90) {
            return `💪 You're so close! Just ${missedBookings} more booking${missedBookings !== 1 ? 's' : ''} to hit your target. You've got this!`;
        }
        else if (achievementPct >= 70) {
            return `📈 Good progress at ${achievementPct.toFixed(1)}%! You need ${missedBookings} more booking${missedBookings !== 1 ? 's' : ''} to reach your target. Let's push harder!`;
        }
        else if (achievementPct >= 50) {
            return `⚡ You're halfway there! ${missedBookings} more booking${missedBookings !== 1 ? 's' : ''} needed. Your potential incentive of ₹${target.baseIncentive.toFixed(0)} is waiting!`;
        }
        else {
            return `🎯 Time to accelerate! You missed your incentive by ${missedBookings} sale${missedBookings !== 1 ? 's' : ''}. Focus on your high-potential leads!`;
        }
    }
    async updateSelfTarget(targetId, selfTargetBookings, selfTargetRevenue, notes) {
        await this.salesTargetRepository.update(targetId, {
            selfTargetBookings,
            selfTargetRevenue,
            selfTargetNotes: notes,
        });
        return this.findOne(targetId);
    }
    async markIncentivePaid(targetId) {
        await this.salesTargetRepository.update(targetId, {
            incentivePaid: true,
            incentivePaidDate: new Date(),
        });
        return this.findOne(targetId);
    }
    async getTeamTargets(teamMemberIds, period) {
        const where = {
            salesPersonId: (0, typeorm_2.Between)(teamMemberIds[0], teamMemberIds[teamMemberIds.length - 1]),
            isActive: true,
        };
        if (period) {
            where.targetPeriod = period;
        }
        return this.salesTargetRepository.find({
            where,
            relations: ['salesPerson'],
            order: { startDate: 'DESC' },
        });
    }
    async getTeamPerformanceSummary(teamMemberIds) {
        const targets = await this.salesTargetRepository.find({
            where: {
                status: sales_target_entity_1.TargetStatus.IN_PROGRESS,
                isActive: true,
            },
            relations: ['salesPerson'],
        });
        const teamTargets = targets.filter(t => teamMemberIds.includes(t.salesPersonId));
        return {
            totalMembers: teamMemberIds.length,
            activeTargets: teamTargets.length,
            avgAchievement: teamTargets.reduce((sum, t) => sum + t.overallAchievementPct, 0) / teamTargets.length || 0,
            totalBookings: teamTargets.reduce((sum, t) => sum + t.achievedBookings, 0),
            totalRevenue: teamTargets.reduce((sum, t) => sum + Number(t.achievedRevenue), 0),
            topPerformers: this.getTopPerformers(teamTargets, 3),
            needsAttention: this.getNeedsAttention(teamTargets),
        };
    }
    getTopPerformers(targets, count) {
        return targets.sort((a, b) => b.overallAchievementPct - a.overallAchievementPct).slice(0, count);
    }
    getNeedsAttention(targets) {
        return targets.filter(t => t.overallAchievementPct < 50).slice(0, 5);
    }
    async update(id, updateData) {
        await this.salesTargetRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.salesTargetRepository.update(id, { isActive: false });
    }
};
exports.SalesTargetService = SalesTargetService;
exports.SalesTargetService = SalesTargetService = SalesTargetService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_target_entity_1.SalesTarget)),
    __param(1, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], SalesTargetService);
//# sourceMappingURL=sales-target.service.js.map