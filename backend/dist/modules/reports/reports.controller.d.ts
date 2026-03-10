import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(): Promise<import("./reports.service").DashboardSummary>;
    getOutstanding(propertyId?: string, towerId?: string, status?: string): Promise<import("./reports.service").OutstandingReportResult>;
    getCollection(propertyId?: string, towerId?: string, startDate?: string, endDate?: string, paymentMethod?: string): Promise<import("./reports.service").CollectionReportResult>;
    getInventory(propertyId?: string, towerId?: string, status?: string, flatType?: string): Promise<import("./reports.service").InventoryReportResult>;
}
