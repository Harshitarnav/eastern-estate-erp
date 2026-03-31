import { RABillsService } from './ra-bills.service';
export declare class RABillsController {
    private readonly raBillsService;
    constructor(raBillsService: RABillsService);
    create(createDto: any, req: any): Promise<import("./entities/ra-bill.entity").RABill>;
    findAll(constructionProjectId?: string, vendorId?: string, status?: string, propertyId?: string): Promise<import("./entities/ra-bill.entity").RABill[]>;
    getSummary(projectId: string): Promise<{
        total: number;
        totalGrossAmount: number;
        totalNetPayable: number;
        totalRetention: number;
        pendingApproval: number;
        totalPaid: number;
        bills: import("./entities/ra-bill.entity").RABill[];
    }>;
    findOne(id: string): Promise<import("./entities/ra-bill.entity").RABill>;
    update(id: string, updateDto: any): Promise<import("./entities/ra-bill.entity").RABill>;
    submit(id: string): Promise<import("./entities/ra-bill.entity").RABill>;
    certify(id: string, req: any): Promise<import("./entities/ra-bill.entity").RABill>;
    approve(id: string, req: any): Promise<import("./entities/ra-bill.entity").RABill>;
    markPaid(id: string, body: {
        paymentReference?: string;
    }, req: any): Promise<import("./entities/ra-bill.entity").RABill>;
    reject(id: string, body: {
        notes?: string;
    }): Promise<import("./entities/ra-bill.entity").RABill>;
    remove(id: string): Promise<void>;
}
