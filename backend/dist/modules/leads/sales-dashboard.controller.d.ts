import { SalesDashboardService } from './sales-dashboard.service';
export declare class SalesDashboardController {
    private readonly salesDashboardService;
    constructor(salesDashboardService: SalesDashboardService);
    getDashboardMetrics(salesPersonId: string, agentId?: string, propertyId?: string, towerId?: string, flatId?: string, dateFrom?: string, dateTo?: string, req?: any): Promise<import("./sales-dashboard.service").DashboardMetrics>;
}
