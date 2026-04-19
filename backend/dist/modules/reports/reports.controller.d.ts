import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(propertyId: string | undefined, req: any): Promise<import("./reports.service").DashboardSummary>;
    getOutstanding(propertyId: string | undefined, towerId: string | undefined, status: string | undefined, req: any): Promise<import("./reports.service").OutstandingReportResult>;
    getCollection(propertyId: string | undefined, towerId: string | undefined, startDate: string | undefined, endDate: string | undefined, paymentMethod: string | undefined, req: any): Promise<import("./reports.service").CollectionReportResult>;
    getInventory(propertyId: string | undefined, towerId: string | undefined, status: string | undefined, flatType: string | undefined, req: any): Promise<import("./reports.service").InventoryReportResult>;
}
