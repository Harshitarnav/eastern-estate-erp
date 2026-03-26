import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
export declare class BankAccountsService {
    private readonly bankAccountsRepo;
    constructor(bankAccountsRepo: Repository<BankAccount>);
    findAll(): Promise<BankAccount[]>;
    findOne(id: string): Promise<BankAccount>;
    create(dto: {
        accountName: string;
        bankName: string;
        accountNumber: string;
        ifscCode?: string;
        branchName?: string;
        accountType?: string;
        openingBalance?: number;
        description?: string;
    }): Promise<BankAccount>;
    update(id: string, dto: Partial<BankAccount>): Promise<BankAccount>;
    deactivate(id: string): Promise<BankAccount>;
}
