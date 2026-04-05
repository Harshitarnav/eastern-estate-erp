import type { Request } from 'express';
import { BankAccountsService } from './bank-accounts.service';
export declare class BankAccountsController {
    private readonly service;
    constructor(service: BankAccountsService);
    findAll(propertyId: string | undefined, req: Request): Promise<(import("./entities/bank-account.entity").BankAccount & {
        coaAccount?: {
            id: string;
            accountCode: string;
        } | null;
    })[]>;
    findOne(id: string, req: Request): Promise<import("./entities/bank-account.entity").BankAccount>;
    create(body: {
        accountName: string;
        bankName: string;
        accountNumber: string;
        ifscCode?: string;
        branchName?: string;
        accountType?: string;
        openingBalance?: number;
        description?: string;
        propertyId?: string;
    }): Promise<import("./entities/bank-account.entity").BankAccount>;
    update(id: string, body: any, req: Request): Promise<import("./entities/bank-account.entity").BankAccount>;
    deactivate(id: string, req: Request): Promise<import("./entities/bank-account.entity").BankAccount>;
    activate(id: string, req: Request): Promise<import("./entities/bank-account.entity").BankAccount>;
    delete(id: string, req: Request): Promise<{
        message: string;
    }>;
}
