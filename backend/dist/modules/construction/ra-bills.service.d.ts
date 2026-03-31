import { Repository } from 'typeorm';
import { RABill } from './entities/ra-bill.entity';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';
export declare class RABillsService {
    private readonly raBillRepository;
    private readonly accountingIntegration;
    constructor(raBillRepository: Repository<RABill>, accountingIntegration: AccountingIntegrationService);
    private generateBillNumber;
    create(createDto: any, userId?: string): Promise<RABill>;
    findAll(filters?: {
        constructionProjectId?: string;
        vendorId?: string;
        status?: string;
        propertyId?: string;
    }): Promise<RABill[]>;
    findOne(id: string): Promise<RABill>;
    update(id: string, updateDto: any): Promise<RABill>;
    submit(id: string): Promise<RABill>;
    certify(id: string, userId: string): Promise<RABill>;
    approve(id: string, userId: string): Promise<RABill>;
    markPaid(id: string, paymentReference?: string, userId?: string): Promise<RABill>;
    reject(id: string, notes?: string): Promise<RABill>;
    remove(id: string): Promise<void>;
    getSummaryByProject(constructionProjectId: string): Promise<{
        total: number;
        totalGrossAmount: number;
        totalNetPayable: number;
        totalRetention: number;
        pendingApproval: number;
        totalPaid: number;
        bills: RABill[];
    }>;
}
