import { BankAccountsService } from './bank-accounts.service';
export declare class BankAccountsController {
    private readonly service;
    constructor(service: BankAccountsService);
    findAll(): Promise<import("./entities/bank-account.entity").BankAccount[]>;
    findOne(id: string): Promise<import("./entities/bank-account.entity").BankAccount>;
    create(body: {
        accountName: string;
        bankName: string;
        accountNumber: string;
        ifscCode?: string;
        branchName?: string;
        accountType?: string;
        openingBalance?: number;
        description?: string;
    }): Promise<import("./entities/bank-account.entity").BankAccount>;
    update(id: string, body: any): Promise<import("./entities/bank-account.entity").BankAccount>;
    deactivate(id: string): Promise<import("./entities/bank-account.entity").BankAccount>;
}
