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
var SalesDashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesDashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("./entities/lead.entity");
const followup_entity_1 = require("./entities/followup.entity");
const sales_task_entity_1 = require("./entities/sales-task.entity");
const sales_target_entity_1 = require("../employees/entities/sales-target.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const lead_entity_2 = require("./entities/lead.entity");
const date_fns_1 = require("date-fns");
let SalesDashboardService = SalesDashboardService_1 = class SalesDashboardService {
    constructor(leadRepository, followUpRepository, salesTaskRepository, salesTargetRepository, bookingRepository) {
        this.leadRepository = leadRepository;
        this.followUpRepository = followUpRepository;
        this.salesTaskRepository = salesTaskRepository;
        this.salesTargetRepository = salesTargetRepository;
        this.bookingRepository = bookingRepository;
        this.logger = new common_1.Logger(SalesDashboardService_1.name);
    }
    buildDateRange(filter) {
        const today = new Date();
        const from = filter.dateFrom ? new Date(filter.dateFrom) : (0, date_fns_1.startOfMonth)(today);
        const to = filter.dateTo ? new Date(filter.dateTo) : (0, date_fns_1.endOfMonth)(today);
        const weekStart = (0, date_fns_1.startOfWeek)(from);
        const weekEnd = (0, date_fns_1.endOfWeek)(to);
        return { today, from, to, weekStart, weekEnd };
    }
    buildLeadWhere(filter) {
        const where = {
            assignedTo: filter.salesPersonId,
        };
        if (filter.propertyId)
            where.propertyId = filter.propertyId;
        if (filter.towerId)
            where.towerId = filter.towerId;
        if (filter.flatId)
            where.flatId = filter.flatId;
        return where;
    }
    async getDashboardMetrics(filter) {
        const { salesPersonId } = filter;
        this.logger.log(`Generating dashboard metrics for ${salesPersonId} with filters property=${filter.propertyId} tower=${filter.towerId} flat=${filter.flatId} dateFrom=${filter.dateFrom} dateTo=${filter.dateTo}`);
        const { today, from, to, weekStart, weekEnd } = this.buildDateRange(filter);
        const leadWhere = this.buildLeadWhere(filter);
        const scopedLeads = await this.leadRepository.find({
            where: leadWhere,
            select: ['id', 'createdAt', 'status', 'priority', 'source', 'convertedToCustomerId', 'nextFollowUpDate'],
        });
        const leadIds = scopedLeads.map((l) => l.id);
        const [currentTarget, leads, siteVisits, followups, tasks, bookings,] = await Promise.all([
            this.getCurrentTarget(salesPersonId),
            this.getLeadMetrics(scopedLeads, from, to),
            this.getSiteVisitMetrics(salesPersonId, leadWhere, from, to, weekStart, weekEnd),
            this.getFollowUpMetrics(salesPersonId, leadIds, today, weekStart, weekEnd, from, to),
            this.getTaskMetrics(salesPersonId, leadIds, today, weekStart, weekEnd, filter),
            this.getRevenueMetrics(filter, from, to),
        ]);
        const [recentActivities, upcomingEvents] = await Promise.all([
            this.getRecentActivities(salesPersonId, leadIds),
            this.getUpcomingEvents(salesPersonId, leadIds, filter),
        ]);
        return {
            performance: this.buildPerformanceMetrics(currentTarget),
            leads,
            siteVisits,
            followups,
            tasks,
            revenue: bookings,
            recentActivities,
            upcomingEvents,
        };
    }
    async getCurrentTarget(salesPersonId) {
        const today = new Date();
        const targets = await this.salesTargetRepository.find({
            where: {
                salesPersonId,
                status: sales_target_entity_1.TargetStatus.IN_PROGRESS,
                isActive: true,
            },
            order: { startDate: 'DESC' },
        });
        return targets.find(t => t.startDate <= today && t.endDate >= today) || null;
    }
    buildPerformanceMetrics(target) {
        if (!target) {
            return {
                currentTarget: null,
                achievementPercentage: 0,
                motivationalMessage: '🎯 No active target set. Contact your sales manager!',
                missedBy: 0,
                daysRemaining: 0,
            };
        }
        const today = new Date();
        const daysRemaining = Math.ceil((target.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const motivationalMessage = target.motivationalMessage ||
            (target.missedBy > 0
                ? `You missed your incentive by ${target.missedBy} sale${target.missedBy > 1 ? 's' : ''}. One more push to unlock your Eastern Estate incentive!`
                : 'Fantastic momentum! Keep delighting families with Eastern Estate experiences.');
        return {
            currentTarget: {
                id: target.id,
                period: target.targetPeriod,
                status: target.status,
                targetBookings: target.targetBookings,
                achievedBookings: target.achievedBookings,
                targetLeads: target.targetLeads,
                achievedLeads: target.achievedLeads,
                targetSiteVisits: target.targetSiteVisits,
                achievedSiteVisits: target.achievedSiteVisits,
                targetConversions: target.targetConversions,
                achievedConversions: target.achievedConversions,
                targetRevenue: target.targetRevenue,
                achievedRevenue: target.achievedRevenue,
                baseIncentive: target.baseIncentive,
                earnedIncentive: target.earnedIncentive,
                bonusIncentive: target.bonusIncentive,
                totalIncentive: target.totalIncentive,
                incentivePaid: target.incentivePaid,
                incentivePaidDate: target.incentivePaidDate,
                selfTargetBookings: target.selfTargetBookings,
                selfTargetRevenue: target.selfTargetRevenue,
                selfTargetNotes: target.selfTargetNotes,
                notes: target.notes,
            },
            achievementPercentage: target.overallAchievementPct,
            motivationalMessage,
            missedBy: target.missedBy,
            daysRemaining,
        };
    }
    async getLeadMetrics(allLeads, startDate, endDate) {
        const newLeads = allLeads.filter(l => l.createdAt >= startDate && l.createdAt <= endDate);
        const bySource = {};
        allLeads.forEach(l => {
            bySource[l.source] = (bySource[l.source] || 0) + 1;
        });
        const converted = allLeads.filter(l => l.convertedToCustomerId !== null).length;
        const conversionRate = allLeads.length > 0 ? (converted / allLeads.length) * 100 : 0;
        return {
            total: allLeads.length,
            new: newLeads.length,
            active: allLeads.filter(l => ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION'].includes(l.status)).length,
            hot: allLeads.filter(l => l.priority === 'HIGH' || l.priority === 'URGENT').length,
            warm: allLeads.filter(l => l.priority === 'MEDIUM').length,
            cold: allLeads.filter(l => l.priority === 'LOW').length,
            converted,
            bySource,
            conversionRate: Math.round(conversionRate * 100) / 100,
        };
    }
    async getSiteVisitMetrics(salesPersonId, leadWhere, startOfMonth, endOfMonth, startOfWeek, endOfWeek) {
        const baseWhere = { ...leadWhere };
        const pendingThisWeek = await this.leadRepository.count({
            where: {
                ...baseWhere,
                siteVisitStatus: lead_entity_2.SiteVisitStatus.PENDING,
                nextFollowUpDate: (0, typeorm_2.Between)(startOfWeek, endOfWeek),
            },
        });
        const completedThisMonth = await this.leadRepository.count({
            where: {
                ...baseWhere,
                siteVisitStatus: lead_entity_2.SiteVisitStatus.DONE,
                lastSiteVisitDate: (0, typeorm_2.Between)(startOfMonth, endOfMonth),
            },
        });
        const scheduledUpcoming = await this.leadRepository.count({
            where: {
                ...baseWhere,
                siteVisitStatus: lead_entity_2.SiteVisitStatus.SCHEDULED,
            },
        });
        const siteVisitFollowUps = await this.followUpRepository.find({
            where: {
                performedBy: salesPersonId,
                isSiteVisit: true,
            },
        });
        const avgRating = siteVisitFollowUps.length > 0
            ? siteVisitFollowUps.reduce((sum, f) => sum + (f.siteVisitRating || 0), 0) / siteVisitFollowUps.length
            : 0;
        return {
            pendingThisWeek,
            completedThisMonth,
            scheduledUpcoming,
            avgRating: Math.round(avgRating * 10) / 10,
        };
    }
    async getFollowUpMetrics(salesPersonId, leadIds, today, startOfWeek, endOfWeek, startOfMonth, endOfMonth) {
        if (leadIds.length === 0) {
            return {
                dueToday: 0,
                dueThisWeek: 0,
                overdue: 0,
                completedThisMonth: 0,
                avgResponseTime: 0,
            };
        }
        const leads = await this.leadRepository.find({
            where: { id: (0, typeorm_2.In)(leadIds) },
        });
        const dueToday = leads.filter(l => l.nextFollowUpDate && (0, date_fns_1.startOfDay)(l.nextFollowUpDate).getTime() === (0, date_fns_1.startOfDay)(today).getTime()).length;
        const dueThisWeek = leads.filter(l => l.nextFollowUpDate && l.nextFollowUpDate >= startOfWeek && l.nextFollowUpDate <= endOfWeek).length;
        const overdue = leads.filter(l => l.nextFollowUpDate && l.nextFollowUpDate < (0, date_fns_1.startOfDay)(today)).length;
        const completedThisMonth = await this.followUpRepository.count({
            where: {
                performedBy: salesPersonId,
                leadId: (0, typeorm_2.In)(leadIds),
                followUpDate: (0, typeorm_2.Between)(startOfMonth, endOfMonth),
            },
        });
        return {
            dueToday,
            dueThisWeek,
            overdue,
            completedThisMonth,
            avgResponseTime: 0,
        };
    }
    async getTaskMetrics(salesPersonId, leadIds, today, startOfWeek, endOfWeek, filter) {
        const allTasks = await this.salesTaskRepository.find({
            where: {
                assignedTo: salesPersonId,
                isActive: true,
                ...(filter.propertyId ? { propertyId: filter.propertyId } : {}),
                ...(leadIds.length ? { leadId: (0, typeorm_2.In)(leadIds) } : {}),
            },
        });
        const dueToday = allTasks.filter(t => t.dueDate && (0, date_fns_1.startOfDay)(t.dueDate).getTime() === (0, date_fns_1.startOfDay)(today).getTime() && t.status !== sales_task_entity_1.TaskStatus.COMPLETED).length;
        const dueThisWeek = allTasks.filter(t => t.dueDate >= startOfWeek && t.dueDate <= endOfWeek && t.status !== sales_task_entity_1.TaskStatus.COMPLETED).length;
        const overdue = allTasks.filter(t => t.dueDate < (0, date_fns_1.startOfDay)(today) && t.status !== sales_task_entity_1.TaskStatus.COMPLETED).length;
        const completedToday = allTasks.filter(t => t.completedAt && (0, date_fns_1.startOfDay)(t.completedAt).getTime() === (0, date_fns_1.startOfDay)(today).getTime()).length;
        const completed = allTasks.filter(t => t.status === sales_task_entity_1.TaskStatus.COMPLETED).length;
        const completionRate = allTasks.length > 0 ? (completed / allTasks.length) * 100 : 0;
        return {
            dueToday,
            dueThisWeek,
            overdue,
            completedToday,
            completionRate: Math.round(completionRate * 100) / 100,
        };
    }
    async getRevenueMetrics(filter, startOfMonth, endOfMonth) {
        const bookings = await this.bookingRepository.find({
            where: {
                bookingDate: (0, typeorm_2.Between)(startOfMonth, endOfMonth),
                ...(filter.propertyId ? { propertyId: filter.propertyId } : {}),
            },
        });
        const thisMonth = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
        const avgDealSize = bookings.length > 0 ? thisMonth / bookings.length : 0;
        const today = new Date();
        const daysInMonth = endOfMonth.getDate();
        const daysPassed = today.getDate();
        const projectedMonthEnd = (thisMonth / daysPassed) * daysInMonth;
        return {
            thisMonth,
            thisQuarter: thisMonth,
            avgDealSize: Math.round(avgDealSize),
            projectedMonthEnd: Math.round(projectedMonthEnd),
        };
    }
    async getRecentActivities(salesPersonId, leadIds) {
        const limit = 20;
        const [followups, tasks] = await Promise.all([
            this.followUpRepository.find({
                where: {
                    performedBy: salesPersonId,
                    ...(leadIds.length ? { leadId: (0, typeorm_2.In)(leadIds) } : {}),
                },
                order: { followUpDate: 'DESC' },
                take: limit,
                relations: ['lead'],
            }),
            this.salesTaskRepository.find({
                where: {
                    assignedTo: salesPersonId,
                    status: sales_task_entity_1.TaskStatus.COMPLETED,
                    ...(leadIds.length ? { leadId: (0, typeorm_2.In)(leadIds) } : {}),
                },
                order: { completedAt: 'DESC' },
                take: limit,
                relations: ['lead'],
            }),
        ]);
        const activities = [
            ...followups.map(f => ({
                type: 'followup',
                date: f.followUpDate ? new Date(f.followUpDate) : null,
                title: `${f.followUpType} with ${f.lead?.firstName || 'Lead'}`,
                outcome: f.outcome,
                feedback: f.feedback,
            })),
            ...tasks.map(t => ({
                type: 'task',
                date: t.completedAt ? new Date(t.completedAt) : null,
                title: t.title,
                outcome: t.outcome,
                taskType: t.taskType,
            })),
        ];
        return activities
            .filter(a => a.date !== null && a.date !== undefined && a.date instanceof Date && !isNaN(a.date.getTime()))
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, limit);
    }
    async getUpcomingEvents(salesPersonId, leadIds, filter) {
        const today = new Date();
        const nextWeek = (0, date_fns_1.addDays)(today, 7);
        const [upcomingFollowUps, upcomingTasks, upcomingSiteVisits] = await Promise.all([
            this.followUpRepository.find({
                where: {
                    performedBy: salesPersonId,
                    nextFollowUpDate: (0, typeorm_2.Between)(today, nextWeek),
                    ...(leadIds.length ? { leadId: (0, typeorm_2.In)(leadIds) } : {}),
                },
                order: { nextFollowUpDate: 'ASC' },
                relations: ['lead'],
            }),
            this.salesTaskRepository.find({
                where: {
                    assignedTo: salesPersonId,
                    dueDate: (0, typeorm_2.Between)(today, nextWeek),
                    status: sales_task_entity_1.TaskStatus.PENDING,
                    ...(filter.propertyId ? { propertyId: filter.propertyId } : {}),
                    ...(leadIds.length ? { leadId: (0, typeorm_2.In)(leadIds) } : {}),
                },
                order: { dueDate: 'ASC', dueTime: 'ASC' },
                relations: ['lead'],
            }),
            this.leadRepository.find({
                where: {
                    assignedTo: salesPersonId,
                    siteVisitStatus: lead_entity_2.SiteVisitStatus.SCHEDULED,
                    ...(filter.propertyId ? { propertyId: filter.propertyId } : {}),
                    ...(filter.towerId ? { towerId: filter.towerId } : {}),
                    ...(filter.flatId ? { flatId: filter.flatId } : {}),
                },
                take: 10,
            }),
        ]);
        return {
            followups: upcomingFollowUps.map(f => ({
                date: f.nextFollowUpDate,
                leadName: f.lead?.firstName,
                plan: f.nextFollowUpPlan,
            })),
            tasks: upcomingTasks.map(t => ({
                date: t.dueDate,
                time: t.dueTime,
                title: t.title,
                taskType: t.taskType,
                priority: t.priority,
            })),
            siteVisits: upcomingSiteVisits.map(l => ({
                date: null,
                time: l.siteVisitTime,
                leadName: l.firstName,
                property: '',
            })),
            meetings: upcomingTasks.filter(t => t.taskType === 'MEETING' || t.taskType === 'CLIENT_MEETING'),
        };
    }
};
exports.SalesDashboardService = SalesDashboardService;
exports.SalesDashboardService = SalesDashboardService = SalesDashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(1, (0, typeorm_1.InjectRepository)(followup_entity_1.FollowUp)),
    __param(2, (0, typeorm_1.InjectRepository)(sales_task_entity_1.SalesTask)),
    __param(3, (0, typeorm_1.InjectRepository)(sales_target_entity_1.SalesTarget)),
    __param(4, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SalesDashboardService);
//# sourceMappingURL=sales-dashboard.service.js.map