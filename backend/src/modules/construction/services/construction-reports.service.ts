import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionProject } from '../entities/construction-project.entity';
import { RABill, RABillStatus } from '../entities/ra-bill.entity';
import { QCChecklist, QCResult } from '../entities/qc-checklist.entity';
import { ConstructionProgressLog } from '../entities/construction-progress-log.entity';
import { ConstructionTeam } from '../entities/construction-team.entity';

@Injectable()
export class ConstructionReportsService {
  constructor(
    @InjectRepository(ConstructionProject)
    private readonly projectRepo: Repository<ConstructionProject>,

    @InjectRepository(RABill)
    private readonly raBillRepo: Repository<RABill>,

    @InjectRepository(QCChecklist)
    private readonly qcRepo: Repository<QCChecklist>,

    @InjectRepository(ConstructionProgressLog)
    private readonly progressLogRepo: Repository<ConstructionProgressLog>,

    @InjectRepository(ConstructionTeam)
    private readonly teamRepo: Repository<ConstructionTeam>,
  ) {}

  // ── 1. Budget vs Actual ───────────────────────────────────────────────────

  async getBudgetVsActual(projectId?: string) {
    const where: any = projectId ? { id: projectId } : {};
    const projects = await this.projectRepo.find({
      where,
      relations: ['property', 'projectManager'],
      order: { createdAt: 'DESC' },
    });

    const rows = projects.map((p) => {
      const allocated = Number(p.budgetAllocated) || 0;
      const spent     = Number(p.budgetSpent)     || 0;
      const variance  = allocated - spent;
      const variancePct = allocated > 0 ? (variance / allocated) * 100 : 0;
      const utilizationPct = allocated > 0 ? (spent / allocated) * 100 : 0;

      return {
        id:             p.id,
        projectName:    p.projectName,
        propertyName:   p.property?.name   || '—',
        managerName:    p.projectManager?.fullName || '—',
        status:         p.status,
        overallProgress: Number(p.overallProgress) || 0,
        budgetAllocated: allocated,
        budgetSpent:     spent,
        variance,
        variancePct:     Math.round(variancePct * 10) / 10,
        utilizationPct:  Math.round(utilizationPct * 10) / 10,
        isOverBudget:    spent > allocated,
      };
    });

    const totals = {
      totalAllocated: rows.reduce((s, r) => s + r.budgetAllocated, 0),
      totalSpent:     rows.reduce((s, r) => s + r.budgetSpent,     0),
      totalVariance:  rows.reduce((s, r) => s + r.variance,        0),
      projectCount:   rows.length,
      overBudgetCount: rows.filter((r) => r.isOverBudget).length,
    };

    return { rows, totals };
  }

  // ── 2. Cost-to-Complete ───────────────────────────────────────────────────

  async getCostToComplete(projectId?: string) {
    const where: any = projectId ? { id: projectId } : {};
    const projects = await this.projectRepo.find({
      where,
      relations: ['property', 'projectManager'],
      order: { createdAt: 'DESC' },
    });

    const rows = projects.map((p) => {
      const allocated = Number(p.budgetAllocated) || 0;
      const spent     = Number(p.budgetSpent)     || 0;
      const progress  = Number(p.overallProgress) || 0;

      // Estimated total cost at current burn rate
      const estimatedTotal = progress > 0 ? (spent / (progress / 100)) : spent;
      const costToComplete  = Math.max(0, estimatedTotal - spent);
      const projectedOverrun = estimatedTotal - allocated;
      const remainingBudget  = Math.max(0, allocated - spent);

      const daysLeft = p.expectedCompletionDate
        ? Math.ceil((new Date(p.expectedCompletionDate).getTime() - Date.now()) / 86400000)
        : null;

      return {
        id:              p.id,
        projectName:     p.projectName,
        propertyName:    p.property?.name   || '—',
        status:          p.status,
        overallProgress: progress,
        budgetAllocated: allocated,
        budgetSpent:     spent,
        estimatedTotal:  Math.round(estimatedTotal),
        costToComplete:  Math.round(costToComplete),
        projectedOverrun: Math.round(projectedOverrun),
        remainingBudget,
        daysLeft,
        isAtRisk:  projectedOverrun > 0,
        isOnTrack: projectedOverrun <= 0 && (daysLeft === null || daysLeft >= 0),
      };
    });

    const summary = {
      totalEstimatedCost:   rows.reduce((s, r) => s + r.estimatedTotal, 0),
      totalCostToComplete:  rows.reduce((s, r) => s + r.costToComplete, 0),
      totalProjectedOverrun: rows.reduce((s, r) => s + Math.max(0, r.projectedOverrun), 0),
      atRiskCount: rows.filter((r) => r.isAtRisk).length,
      onTrackCount: rows.filter((r) => r.isOnTrack).length,
    };

    return { rows, summary };
  }

  // ── 3. Vendor Spend Summary ───────────────────────────────────────────────

  async getVendorSpendSummary(startDate?: string, endDate?: string) {
    const qb = this.raBillRepo
      .createQueryBuilder('bill')
      .leftJoinAndSelect('bill.vendor', 'vendor')
      .leftJoinAndSelect('bill.constructionProject', 'project')
      .where('bill.status IN (:...statuses)', {
        statuses: [RABillStatus.PAID, RABillStatus.APPROVED, RABillStatus.CERTIFIED],
      });

    if (startDate) qb.andWhere('bill.billDate >= :startDate', { startDate });
    if (endDate)   qb.andWhere('bill.billDate <= :endDate',   { endDate });

    const bills = await qb.getMany();

    // Group by vendor
    const vendorMap = new Map<string, {
      vendorId: string;
      vendorName: string;
      vendorCode: string;
      totalGross: number;
      totalNetPayable: number;
      totalRetention: number;
      totalPaid: number;
      billCount: number;
      projectNames: Set<string>;
    }>();

    for (const bill of bills) {
      if (!bill.vendor) continue;
      const vid = bill.vendorId;
      if (!vendorMap.has(vid)) {
        vendorMap.set(vid, {
          vendorId:    vid,
          vendorName:  bill.vendor.vendorName,
          vendorCode:  bill.vendor.vendorCode,
          totalGross:       0,
          totalNetPayable:  0,
          totalRetention:   0,
          totalPaid:        0,
          billCount:        0,
          projectNames:     new Set(),
        });
      }
      const entry = vendorMap.get(vid)!;
      entry.totalGross      += Number(bill.grossAmount)    || 0;
      entry.totalNetPayable += Number(bill.netPayable)     || 0;
      entry.totalRetention  += Number(bill.retentionAmount)|| 0;
      if (bill.status === RABillStatus.PAID) entry.totalPaid += Number(bill.netPayable) || 0;
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
      totalGross:      rows.reduce((s, r) => s + r.totalGross, 0),
      totalNetPayable: rows.reduce((s, r) => s + r.totalNetPayable, 0),
      totalRetention:  rows.reduce((s, r) => s + r.totalRetention, 0),
      totalPaid:       rows.reduce((s, r) => s + r.totalPaid, 0),
      vendorCount:     rows.length,
      billCount:       rows.reduce((s, r) => s + r.billCount, 0),
    };

    return { rows, totals };
  }

  // ── 4. Labour Productivity ────────────────────────────────────────────────

  async getLabourProductivity(projectId?: string) {
    const qb = this.progressLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.constructionProject', 'project');

    if (projectId) qb.where('log.constructionProjectId = :projectId', { projectId });
    qb.orderBy('log.createdAt', 'DESC');

    const logs = await qb.getMany();

    // Group by project
    const projectMap = new Map<string, {
      projectId: string;
      projectName: string;
      logCount: number;
      totalWorkers: number;
      totalProgress: number;
      dayShiftCount: number;
      nightShiftCount: number;
      logsWithIssues: number;
    }>();

    for (const log of logs) {
      const pid = log.constructionProjectId ?? 'unknown';
      const pname = log.constructionProject?.projectName ?? 'Unknown Project';

      if (!projectMap.has(pid)) {
        projectMap.set(pid, {
          projectId:      pid,
          projectName:    pname,
          logCount:       0,
          totalWorkers:   0,
          totalProgress:  0,
          dayShiftCount:  0,
          nightShiftCount:0,
          logsWithIssues: 0,
        });
      }

      const entry = projectMap.get(pid)!;
      entry.logCount++;
      entry.totalWorkers  += (Number(log.workersPresent) || 0) + (Number(log.workersAbsent) || 0);
      entry.totalProgress += Number((log as any).progressPercentage) || 0;
      if ((log as any).shift === 'DAY')   entry.dayShiftCount++;
      if ((log as any).shift === 'NIGHT') entry.nightShiftCount++;
      if ((log as any).issuesDelays)      entry.logsWithIssues++;
    }

    const rows = Array.from(projectMap.values()).map((p) => ({
      ...p,
      avgWorkersPerDay:  p.logCount > 0 ? Math.round((p.totalWorkers   / p.logCount) * 10) / 10 : 0,
      avgProgressPerDay: p.logCount > 0 ? Math.round((p.totalProgress  / p.logCount) * 10) / 10 : 0,
      issueRate:         p.logCount > 0 ? Math.round((p.logsWithIssues / p.logCount) * 100) : 0,
    }));

    // Aggregate daily log history (last 30 entries per project for chart)
    const logHistory = logs.slice(0, 60).map((log) => ({
      id:              log.id,
      projectId:       log.constructionProjectId,
      projectName:     log.constructionProject?.projectName,
      logDate:         log.logDate,
      workersPresent:  Number(log.workersPresent)  || 0,
      workersAbsent:   Number(log.workersAbsent)   || 0,
      progressPct:     Number((log as any).progressPercentage) || 0,
      shift:           (log as any).shift,
      hasIssues:       !!(log as any).issuesDelays,
    }));

    return { rows, logHistory };
  }

  // ── 5. QC Pass Rate ───────────────────────────────────────────────────────

  async getQCPassRate(projectId?: string) {
    const qb = this.qcRepo
      .createQueryBuilder('qc')
      .leftJoinAndSelect('qc.constructionProject', 'project');

    if (projectId) qb.where('qc.constructionProjectId = :projectId', { projectId });
    qb.orderBy('qc.inspectionDate', 'DESC');

    const checklists = await qb.getMany();

    // Phase-wise aggregation
    const phaseMap = new Map<string, {
      phase: string;
      total: number;
      pass: number;
      fail: number;
      partial: number;
      pending: number;
      openDefects: number;
      resolvedDefects: number;
    }>();

    const PHASES = ['FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER'];
    for (const phase of PHASES) {
      phaseMap.set(phase, { phase, total: 0, pass: 0, fail: 0, partial: 0, pending: 0, openDefects: 0, resolvedDefects: 0 });
    }

    for (const qc of checklists) {
      const entry = phaseMap.get(qc.phase) ?? phaseMap.get('FOUNDATION')!;
      entry.total++;
      if (qc.overallResult === QCResult.PASS)    entry.pass++;
      if (qc.overallResult === QCResult.FAIL)    entry.fail++;
      if (qc.overallResult === QCResult.PARTIAL) entry.partial++;
      if (qc.overallResult === QCResult.PENDING) entry.pending++;

      const defects = qc.defects ?? [];
      entry.openDefects     += defects.filter((d: any) => d.status === 'OPEN').length;
      entry.resolvedDefects += defects.filter((d: any) => d.status === 'RESOLVED').length;
    }

    const phaseRows = Array.from(phaseMap.values()).map((p) => ({
      ...p,
      passRate: p.total > 0 ? Math.round((p.pass / p.total) * 100) : 0,
      failRate: p.total > 0 ? Math.round(((p.fail + p.partial) / p.total) * 100) : 0,
    }));

    // Project-wise aggregation
    const projectMap = new Map<string, {
      projectId: string;
      projectName: string;
      total: number;
      pass: number;
      fail: number;
      openDefects: number;
    }>();

    for (const qc of checklists) {
      const pid = qc.constructionProjectId;
      const pname = (qc.constructionProject as any)?.projectName ?? 'Unknown';
      if (!projectMap.has(pid)) {
        projectMap.set(pid, { projectId: pid, projectName: pname, total: 0, pass: 0, fail: 0, openDefects: 0 });
      }
      const entry = projectMap.get(pid)!;
      entry.total++;
      if (qc.overallResult === QCResult.PASS) entry.pass++;
      if (qc.overallResult === QCResult.FAIL) entry.fail++;
      entry.openDefects += (qc.defects ?? []).filter((d: any) => d.status === 'OPEN').length;
    }

    const projectRows = Array.from(projectMap.values()).map((p) => ({
      ...p,
      passRate: p.total > 0 ? Math.round((p.pass / p.total) * 100) : 0,
    }));

    const summary = {
      totalInspections: checklists.length,
      totalPass:        checklists.filter((q) => q.overallResult === QCResult.PASS).length,
      totalFail:        checklists.filter((q) => q.overallResult === QCResult.FAIL).length,
      totalPartial:     checklists.filter((q) => q.overallResult === QCResult.PARTIAL).length,
      totalPending:     checklists.filter((q) => q.overallResult === QCResult.PENDING).length,
      overallPassRate:  checklists.length > 0
        ? Math.round((checklists.filter((q) => q.overallResult === QCResult.PASS).length / checklists.length) * 100)
        : 0,
      totalOpenDefects: checklists.reduce((s, q) => s + (q.defects ?? []).filter((d: any) => d.status === 'OPEN').length, 0),
    };

    return { phaseRows, projectRows, summary, recentInspections: checklists.slice(0, 10) };
  }

  // ── 6. Dashboard Overview ─────────────────────────────────────────────────

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
}
