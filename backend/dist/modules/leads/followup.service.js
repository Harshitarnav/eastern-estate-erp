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
var FollowUpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowUpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const followup_entity_1 = require("./entities/followup.entity");
const lead_entity_1 = require("./entities/lead.entity");
const date_fns_1 = require("date-fns");
let FollowUpService = FollowUpService_1 = class FollowUpService {
    constructor(followUpRepository, leadRepository) {
        this.followUpRepository = followUpRepository;
        this.leadRepository = leadRepository;
        this.logger = new common_1.Logger(FollowUpService_1.name);
    }
    ensureDate(date) {
        if (!date)
            return undefined;
        return typeof date === 'string' ? new Date(date) : date;
    }
    async create(createFollowUpDto) {
        this.logger.log(`Creating followup for lead ${createFollowUpDto.leadId}`);
        const lead = await this.leadRepository.findOne({
            where: { id: createFollowUpDto.leadId },
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${createFollowUpDto.leadId} not found`);
        }
        const followUp = this.followUpRepository.create(createFollowUpDto);
        const savedFollowUp = await this.followUpRepository.save(followUp);
        await this.updateLeadAfterFollowUp(lead, createFollowUpDto);
        return savedFollowUp;
    }
    async updateLeadAfterFollowUp(lead, followUpDto) {
        const updateData = {
            lastContactedAt: this.ensureDate(followUpDto.followUpDate),
            lastFollowUpFeedback: followUpDto.feedback,
            totalFollowUps: (lead.totalFollowUps || 0) + 1,
            reminderSent: false,
        };
        if (followUpDto.nextFollowUpDate) {
            updateData.nextFollowUpDate = this.ensureDate(followUpDto.nextFollowUpDate);
        }
        if (followUpDto.isSiteVisit) {
            updateData.hasSiteVisit = true;
            updateData.lastSiteVisitDate = this.ensureDate(followUpDto.followUpDate);
            updateData.totalSiteVisits = (lead.totalSiteVisits || 0) + 1;
            updateData.siteVisitFeedback = followUpDto.siteVisitFeedback;
        }
        switch (followUpDto.followUpType) {
            case 'CALL':
                updateData.totalCalls = (lead.totalCalls || 0) + 1;
                break;
            case 'EMAIL':
                updateData.totalEmails = (lead.totalEmails || 0) + 1;
                break;
            case 'MEETING':
            case 'SITE_VISIT':
                updateData.totalMeetings = (lead.totalMeetings || 0) + 1;
                break;
        }
        await this.leadRepository.update(lead.id, updateData);
    }
    async findByLead(leadId) {
        return this.followUpRepository.find({
            where: { leadId, isActive: true },
            order: { followUpDate: 'DESC' },
            relations: ['performedByUser'],
        });
    }
    async findBySalesPerson(salesPersonId, startDate, endDate) {
        const where = {
            performedBy: salesPersonId,
            isActive: true,
        };
        if (startDate && endDate) {
            where.followUpDate = (0, typeorm_2.Between)(startDate, endDate);
        }
        return this.followUpRepository.find({
            where,
            order: { followUpDate: 'DESC' },
            relations: ['lead', 'performedByUser'],
        });
    }
    async getUpcomingFollowUps(salesPersonId) {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const nextWeek = (0, date_fns_1.endOfDay)((0, date_fns_1.addDays)(today, 7));
        return this.followUpRepository.find({
            where: {
                performedBy: salesPersonId,
                nextFollowUpDate: (0, typeorm_2.Between)(today, nextWeek),
                isActive: true,
            },
            order: { nextFollowUpDate: 'ASC' },
            relations: ['lead'],
        });
    }
    async getFollowUpsNeedingReminders() {
        const reminderTime = (0, date_fns_1.addHours)(new Date(), 24);
        return this.followUpRepository.find({
            where: {
                reminderSent: false,
                isActive: true,
            },
            relations: ['lead', 'performedByUser'],
        });
    }
    async markReminderSent(followUpId) {
        await this.followUpRepository.update(followUpId, {
            reminderSent: true,
            reminderSentAt: new Date(),
        });
    }
    async getStatistics(salesPersonId, startDate, endDate) {
        const followUps = await this.findBySalesPerson(salesPersonId, startDate, endDate);
        const stats = {
            totalFollowUps: followUps.length,
            byCalls: followUps.filter(f => f.followUpType === 'CALL').length,
            byEmails: followUps.filter(f => f.followUpType === 'EMAIL').length,
            byMeetings: followUps.filter(f => f.followUpType === 'MEETING').length,
            bySiteVisits: followUps.filter(f => f.isSiteVisit).length,
            outcomes: {
                interested: followUps.filter(f => f.outcome === 'INTERESTED').length,
                notInterested: followUps.filter(f => f.outcome === 'NOT_INTERESTED').length,
                converted: followUps.filter(f => f.outcome === 'CONVERTED').length,
                siteVisitScheduled: followUps.filter(f => f.outcome === 'SITE_VISIT_SCHEDULED').length,
            },
            avgInterestLevel: this.calculateAverage(followUps.map(f => f.interestLevel)),
            avgBudgetFit: this.calculateAverage(followUps.map(f => f.budgetFit)),
            avgTimelineFit: this.calculateAverage(followUps.map(f => f.timelineFit)),
            totalDurationMinutes: followUps.reduce((sum, f) => sum + (f.durationMinutes || 0), 0),
        };
        return stats;
    }
    async getSiteVisitStatistics(salesPersonId, startDate, endDate) {
        const siteVisits = (await this.findBySalesPerson(salesPersonId, startDate, endDate))
            .filter(f => f.isSiteVisit);
        return {
            totalSiteVisits: siteVisits.length,
            avgRating: this.calculateAverage(siteVisits.map(sv => sv.siteVisitRating)),
            byProperty: this.groupByProperty(siteVisits),
            conversionRate: this.calculateConversionRate(siteVisits),
        };
    }
    calculateAverage(numbers) {
        const validNumbers = numbers.filter(n => n > 0);
        if (validNumbers.length === 0)
            return 0;
        return validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length;
    }
    groupByProperty(siteVisits) {
        const grouped = {};
        siteVisits.forEach(sv => {
            if (sv.siteVisitProperty) {
                grouped[sv.siteVisitProperty] = (grouped[sv.siteVisitProperty] || 0) + 1;
            }
        });
        return grouped;
    }
    calculateConversionRate(siteVisits) {
        if (siteVisits.length === 0)
            return 0;
        const converted = siteVisits.filter(sv => sv.outcome === 'CONVERTED').length;
        return (converted / siteVisits.length) * 100;
    }
    async findOne(id) {
        const followUp = await this.followUpRepository.findOne({
            where: { id, isActive: true },
            relations: ['lead', 'performedByUser'],
        });
        if (!followUp) {
            throw new common_1.NotFoundException(`FollowUp with ID ${id} not found`);
        }
        return followUp;
    }
    async update(id, updateData) {
        await this.followUpRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.followUpRepository.update(id, { isActive: false });
    }
};
exports.FollowUpService = FollowUpService;
exports.FollowUpService = FollowUpService = FollowUpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(followup_entity_1.FollowUp)),
    __param(1, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FollowUpService);
//# sourceMappingURL=followup.service.js.map