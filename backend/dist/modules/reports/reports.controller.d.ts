import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getOutstanding(propertyId?: string, towerId?: string, status?: string): Promise<import("./reports.service").OutstandingReportResult>;
    getCollection(propertyId?: string, towerId?: string, startDate?: string, endDate?: string, paymentMethod?: string): Promise<import("./reports.service").CollectionReportResult>;
}
