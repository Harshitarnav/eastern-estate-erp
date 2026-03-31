import { ConstructionReportsService } from '../services/construction-reports.service';
export declare class ConstructionReportsController {
    private readonly reportsService;
    constructor(reportsService: ConstructionReportsService);
    getDashboard(): Promise<{
        budget: {
            totalAllocated: number;
            totalSpent: number;
            totalVariance: number;
            projectCount: number;
            overBudgetCount: number;
        };
        costToComplete: {
            totalEstimatedCost: number;
            totalCostToComplete: number;
            totalProjectedOverrun: number;
            atRiskCount: number;
            onTrackCount: number;
        };
        qc: {
            totalInspections: number;
            totalPass: number;
            totalFail: number;
            totalPartial: number;
            totalPending: number;
            overallPassRate: number;
            totalOpenDefects: number;
        };
    }>;
    getBudgetVsActual(projectId?: string): Promise<{
        rows: {
            id: string;
            projectName: string;
            propertyName: string;
            managerName: string;
            status: string;
            overallProgress: number;
            budgetAllocated: number;
            budgetSpent: number;
            variance: number;
            variancePct: number;
            utilizationPct: number;
            isOverBudget: boolean;
        }[];
        totals: {
            totalAllocated: number;
            totalSpent: number;
            totalVariance: number;
            projectCount: number;
            overBudgetCount: number;
        };
    }>;
    getCostToComplete(projectId?: string): Promise<{
        rows: {
            id: string;
            projectName: string;
            propertyName: string;
            status: string;
            overallProgress: number;
            budgetAllocated: number;
            budgetSpent: number;
            estimatedTotal: number;
            costToComplete: number;
            projectedOverrun: number;
            remainingBudget: number;
            daysLeft: number;
            isAtRisk: boolean;
            isOnTrack: boolean;
        }[];
        summary: {
            totalEstimatedCost: number;
            totalCostToComplete: number;
            totalProjectedOverrun: number;
            atRiskCount: number;
            onTrackCount: number;
        };
    }>;
    getVendorSpend(startDate?: string, endDate?: string): Promise<{
        rows: {
            projectNames: string[];
            retentionPct: number;
            vendorId: string;
            vendorName: string;
            vendorCode: string;
            totalGross: number;
            totalNetPayable: number;
            totalRetention: number;
            totalPaid: number;
            billCount: number;
        }[];
        totals: {
            totalGross: number;
            totalNetPayable: number;
            totalRetention: number;
            totalPaid: number;
            vendorCount: number;
            billCount: number;
        };
    }>;
    getLabourProductivity(projectId?: string): Promise<{
        rows: {
            avgWorkersPerDay: number;
            avgProgressPerDay: number;
            issueRate: number;
            projectId: string;
            projectName: string;
            logCount: number;
            totalWorkers: number;
            totalProgress: number;
            dayShiftCount: number;
            nightShiftCount: number;
            logsWithIssues: number;
        }[];
        logHistory: {
            id: string;
            projectId: string;
            projectName: string;
            logDate: Date;
            workersPresent: number;
            workersAbsent: number;
            progressPct: number;
            shift: any;
            hasIssues: boolean;
        }[];
    }>;
    getQCPassRate(projectId?: string): Promise<{
        phaseRows: {
            passRate: number;
            failRate: number;
            phase: string;
            total: number;
            pass: number;
            fail: number;
            partial: number;
            pending: number;
            openDefects: number;
            resolvedDefects: number;
        }[];
        projectRows: {
            passRate: number;
            projectId: string;
            projectName: string;
            total: number;
            pass: number;
            fail: number;
            openDefects: number;
        }[];
        summary: {
            totalInspections: number;
            totalPass: number;
            totalFail: number;
            totalPartial: number;
            totalPending: number;
            overallPassRate: number;
            totalOpenDefects: number;
        };
        recentInspections: import("../entities/qc-checklist.entity").QCChecklist[];
    }>;
}
