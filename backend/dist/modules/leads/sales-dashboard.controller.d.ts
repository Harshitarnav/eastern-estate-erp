import { SalesDashboardService } from './sales-dashboard.service';
export declare class SalesDashboardController {
    private readonly salesDashboardService;
    constructor(salesDashboardService: SalesDashboardService);
    getDashboardMetrics(salesPersonId: string): Promise<import("./sales-dashboard.service").DashboardMetrics>;
}
