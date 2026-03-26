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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_project_entity_1 = require("../entities/construction-project.entity");
const ra_bill_entity_1 = require("../entities/ra-bill.entity");
const qc_checklist_entity_1 = require("../entities/qc-checklist.entity");
const construction_progress_log_entity_1 = require("../entities/construction-progress-log.entity");
const construction_team_entity_1 = require("../entities/construction-team.entity");
let ConstructionReportsService = class ConstructionReportsService {
    constructor(projectRepo, raBillRepo, qcRepo, progressLogRepo, teamRepo) {
        this.projectRepo = projectRepo;
        this.raBillRepo = raBillRepo;
        this.qcRepo = qcRepo;
        this.progressLogRepo = progressLogRepo;
        this.teamRepo = teamRepo;
    }
    async getBudgetVsActual(projectId) {
        const where = projectId ? { id: projectId } : {};
        const projects = await this.projectRepo.find({
            where,
            relations: ['property', 'projectManager'],
            order: { createdAt: 'DESC' },
        });
        const rows = projects.map((p) => {
            const allocated = Number(p.budgetAllocated) || 0;
            const spent = Number(p.budgetSpent) || 0;
            const variance = allocated - spent;
            const variancePct = allocated > 0 ? (variance / allocated) * 100 : 0;
            const utilizationPct = allocated > 0 ? (spent / allocated) * 100 : 0;
            return {
                id: p.id,
                projectName: p.projectName,
                propertyName: p.property?.name || '—',
                managerName: p.projectManager?.fullName || '—',
                status: p.status,
                overallProgress: Number(p.overallProgress) || 0,
                budgetAllocated: allocated,
                budgetSpent: spent,
                variance,
                variancePct: Math.round(variancePct * 10) / 10,
                utilizationPct: Math.round(utilizationPct * 10) / 10,
                isOverBudget: spent > allocated,
            };
        });
        const totals = {
            totalAllocated: rows.reduce((s, r) => s + r.budgetAllocated, 0),
            totalSpent: rows.reduce((s, r) => s + r.budgetSpent, 0),
            totalVariance: rows.reduce((s, r) => s + r.variance, 0),
            projectCount: rows.length,
            overBudgetCount: rows.filter((r) => r.isOverBudget).length,
        };
        return { rows, totals };
    }
    async getCostToComplete(projectId) {
        const where = projectId ? { id: projectId } : {};
        const projects = await this.projectRepo.find({
            where,
            relations: ['property', 'projectManager'],
            order: { createdAt: 'DESC' },
        });
        const rows = projects.map((p) => {
            const allocated = Number(p.budgetAllocated) || 0;
            const spent = Number(p.budgetSpent) || 0;
            const progress = Number(p.overallProgress) || 0;
            const estimatedTotal = progress > 0 ? (spent / (progress / 100)) : spent;
            const costToComplete = Math.max(0, estimatedTotal - spent);
            const projectedOverrun = estimatedTotal - allocated;
            const remainingBudget = Math.max(0, allocated - spent);
            const daysLeft = p.expectedCompletionDate
                ? Math.ceil((new Date(p.expectedCompletionDate).getTime() - Date.now()) / 86400000)
                : null;
            return {
                id: p.id,
                projectName: p.projectName,
                propertyName: p.property?.name || '—',
                status: p.status,
                overallProgress: progress,
                budgetAllocated: allocated,
                budgetSpent: spent,
                estimatedTotal: Math.round(estimatedTotal),
                costToComplete: Math.round(costToComplete),
                projectedOverrun: Math.round(projectedOverrun),
                remainingBudget,
                daysLeft,
                isAtRisk: projectedOverrun > 0,
                isOnTrack: projectedOverrun <= 0 && (daysLeft === null || daysLeft >= 0),
            };
        });
        const summary = {
            totalEstimatedCost: rows.reduce((s, r) => s + r.estimatedTotal, 0),
            totalCostToComplete: rows.reduce((s, r) => s + r.costToComplete, 0),
            totalProjectedOverrun: rows.reduce((s, r) => s + Math.max(0, r.projectedOverrun), 0),
            atRiskCount: rows.filter((r) => r.isAtRisk).length,
            onTrackCount: rows.filter((r) => r.isOnTrack).length,
        };
        return { rows, summary };
    }
    async getVendorSpendSummary(startDate, endDate) {
        const qb = this.raBillRepo
            .createQueryBuilder('bill')
            .leftJoinAndSelect('bill.vendor', 'vendor')
            .leftJoinAndSelect('bill.constructionProject', 'project')
            .where('bill.status IN (:...statuses)', {
            statuses: [ra_bill_entity_1.RABillStatus.PAID, ra_bill_entity_1.RABillStatus.APPROVED, ra_bill_entity_1.RABillStatus.CERTIFIED],
        });
        if (startDate)
            qb.andWhere('bill.billDate >= :startDate', { startDate });
        if (endDate)
            qb.andWhere('bill.billDate <= :endDate', { endDate });
        const bills = await qb.getMany();
        const vendorMap = new Map();
        for (const bill of bills) {
            if (!bill.vendor)
                continue;
            const vid = bill.vendorId;
            if (!vendorMap.has(vid)) {
                vendorMap.set(vid, {
                    vendorId: vid,
                    vendorName: bill.vendor.vendorName,
                    vendorCode: bill.vendor.vendorCode,
                    totalGross: 0,
                    totalNetPayable: 0,
                    totalRetention: 0,
                    totalPaid: 0,
                    billCount: 0,
                    projectNames: new Set(),
                });
            }
            const entry = vendorMap.get(vid);
            entry.totalGross += Number(bill.grossAmount) || 0;
            entry.totalNetPayable += Number(bill.netPayable) || 0;
            entry.totalRetention += Number(bill.retentionAmount) || 0;
            if (bill.status === ra_bill_entity_1.RABillStatus.PAID)
                entry.totalPaid += Number(bill.netPayable) || 0;
            entry.billCount++;
            if (bill.constructionProject?.projectName) {
                entry.projectNames.add(bill.constructionProject.projectName);
            }
        }
        const rows = Array.from(vendorMap.values())
            .map((v) => ({
            ...v,
            projectNames: Array.from(v.projectNames),
            retentionPct: v.totalGross > 0
                ? Math.round((v.totalRetention / v.totalGross) * 100 * 10) / 10
                : 0,
        }))
            .sort((a, b) => b.totalNetPayable - a.totalNetPayable);
        const totals = {
            totalGross: rows.reduce((s, r) => s + r.totalGross, 0),
            totalNetPayable: rows.reduce((s, r) => s + r.totalNetPayable, 0),
            totalRetention: rows.reduce((s, r) => s + r.totalRetention, 0),
            totalPaid: rows.reduce((s, r) => s + r.totalPaid, 0),
            vendorCount: rows.length,
            billCount: rows.reduce((s, r) => s + r.billCount, 0),
        };
        return { rows, totals };
    }
    async getLabourProductivity(projectId) {
        const qb = this.progressLogRepo
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.constructionProject', 'project');
        if (projectId)
            qb.where('log.constructionProjectId = :projectId', { projectId });
        qb.orderBy('log.createdAt', 'DESC');
        const logs = await qb.getMany();
        const projectMap = new Map();
        for (const log of logs) {
            const pid = log.constructionProjectId ?? 'unknown';
            const pname = log.constructionProject?.projectName ?? 'Unknown Project';
            if (!projectMap.has(pid)) {
                projectMap.set(pid, {
                    projectId: pid,
                    projectName: pname,
                    logCount: 0,
                    totalWorkers: 0,
                    totalProgress: 0,
                    dayShiftCount: 0,
                    nightShiftCount: 0,
                    logsWithIssues: 0,
                });
            }
            const entry = projectMap.get(pid);
            entry.logCount++;
            entry.totalWorkers += (Number(log.workersPresent) || 0) + (Number(log.workersAbsent) || 0);
            entry.totalProgress += Number(log.progressPercentage) || 0;
            if (log.shift === 'DAY')
                entry.dayShiftCount++;
            if (log.shift === 'NIGHT')
                entry.nightShiftCount++;
            if (log.issuesDelays)
                entry.logsWithIssues++;
        }
        const rows = Array.from(projectMap.values()).map((p) => ({
            ...p,
            avgWorkersPerDay: p.logCount > 0 ? Math.round((p.totalWorkers / p.logCount) * 10) / 10 : 0,
            avgProgressPerDay: p.logCount > 0 ? Math.round((p.totalProgress / p.logCount) * 10) / 10 : 0,
            issueRate: p.logCount > 0 ? Math.round((p.logsWithIssues / p.logCount) * 100) : 0,
        }));
        const logHistory = logs.slice(0, 60).map((log) => ({
            id: log.id,
            projectId: log.constructionProjectId,
            projectName: log.constructionProject?.projectName,
            logDate: log.logDate,
            workersPresent: Number(log.workersPresent) || 0,
            workersAbsent: Number(log.workersAbsent) || 0,
            progressPct: Number(log.progressPercentage) || 0,
            shift: log.shift,
            hasIssues: !!log.issuesDelays,
        }));
        return { rows, logHistory };
    }
    async getQCPassRate(projectId) {
        const qb = this.qcRepo
            .createQueryBuilder('qc')
            .leftJoinAndSelect('qc.constructionProject', 'project');
        if (projectId)
            qb.where('qc.constructionProjectId = :projectId', { projectId });
        qb.orderBy('qc.inspectionDate', 'DESC');
        const checklists = await qb.getMany();
        const phaseMap = new Map();
        const PHASES = ['FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER'];
        for (const phase of PHASES) {
            phaseMap.set(phase, { phase, total: 0, pass: 0, fail: 0, partial: 0, pending: 0, openDefects: 0, resolvedDefects: 0 });
        }
        for (const qc of checklists) {
            const entry = phaseMap.get(qc.phase) ?? phaseMap.get('FOUNDATION');
            entry.total++;
            if (qc.overallResult === qc_checklist_entity_1.QCResult.PASS)
                entry.pass++;
            if (qc.overallResult === qc_checklist_entity_1.QCResult.FAIL)
                entry.fail++;
            if (qc.overallResult === qc_checklist_entity_1.QCResult.PARTIAL)
                entry.partial++;
            if (qc.overallResult === qc_checklist_entity_1.QCResult.PENDING)
                entry.pending++;
            const defects = qc.defects ?? [];
            entry.openDefects += defects.filter((d) => d.status === 'OPEN').length;
            entry.resolvedDefects += defects.filter((d) => d.status === 'RESOLVED').length;
        }
        const phaseRows = Array.from(phaseMap.values()).map((p) => ({
            ...p,
            passRate: p.total > 0 ? Math.round((p.pass / p.total) * 100) : 0,
            failRate: p.total > 0 ? Math.round(((p.fail + p.partial) / p.total) * 100) : 0,
        }));
        const projectMap = new Map();
        for (const qc of checklists) {
            const pid = qc.constructionProjectId;
            const pname = qc.constructionProject?.projectName ?? 'Unknown';
            if (!projectMap.has(pid)) {
                projectMap.set(pid, { projectId: pid, projectName: pname, total: 0, pass: 0, fail: 0, openDefects: 0 });
            }
            const entry = projectMap.get(pid);
            entry.total++;
            if (qc.overallResult === qc_checklist_entity_1.QCResult.PASS)
                entry.pass++;
            if (qc.overallResult === qc_checklist_entity_1.QCResult.FAIL)
                entry.fail++;
            entry.openDefects += (qc.defects ?? []).filter((d) => d.status === 'OPEN').length;
        }
        const projectRows = Array.from(projectMap.values()).map((p) => ({
            ...p,
            passRate: p.total > 0 ? Math.round((p.pass / p.total) * 100) : 0,
        }));
        const summary = {
            totalInspections: checklists.length,
            totalPass: checklists.filter((q) => q.overallResult === qc_checklist_entity_1.QCResult.PASS).length,
            totalFail: checklists.filter((q) => q.overallResult === qc_checklist_entity_1.QCResult.FAIL).length,
            totalPartial: checklists.filter((q) => q.overallResult === qc_checklist_entity_1.QCResult.PARTIAL).length,
            totalPending: checklists.filter((q) => q.overallResult === qc_checklist_entity_1.QCResult.PENDING).length,
            overallPassRate: checklists.length > 0
                ? Math.round((checklists.filter((q) => q.overallResult === qc_checklist_entity_1.QCResult.PASS).length / checklists.length) * 100)
                : 0,
            totalOpenDefects: checklists.reduce((s, q) => s + (q.defects ?? []).filter((d) => d.status === 'OPEN').length, 0),
        };
        return { phaseRows, projectRows, summary, recentInspections: checklists.slice(0, 10) };
    }
    async getDashboardSummary() {
        const [budgetData, ctcData, qcData] = await Promise.all([
            this.getBudgetVsActual(),
            this.getCostToComplete(),
            this.getQCPassRate(),
        ]);
        return {
            budget: budgetData.totals,
            costToComplete: ctcData.summary,
            qc: qcData.summary,
        };
    }
};
exports.ConstructionReportsService = ConstructionReportsService;
exports.ConstructionReportsService = ConstructionReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_project_entity_1.ConstructionProject)),
    __param(1, (0, typeorm_1.InjectRepository)(ra_bill_entity_1.RABill)),
    __param(2, (0, typeorm_1.InjectRepository)(qc_checklist_entity_1.QCChecklist)),
    __param(3, (0, typeorm_1.InjectRepository)(construction_progress_log_entity_1.ConstructionProgressLog)),
    __param(4, (0, typeorm_1.InjectRepository)(construction_team_entity_1.ConstructionTeam)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConstructionReportsService);
//# sourceMappingURL=construction-reports.service.js.map