import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { Account } from './entities/account.entity';
export declare class BankAccountsService {
    private readonly bankAccountsRepo;
    private readonly accountsRepo;
    private readonly logger;
    constructor(bankAccountsRepo: Repository<BankAccount>, accountsRepo: Repository<Account>);
    findAll(propertyId?: string): Promise<(BankAccount & {
        coaAccount?: {
            id: string;
            accountCode: string;
        } | null;
    })[]>;
    findOne(id: string): Promise<BankAccount>;
    private nextBankAccountCode;
    private ensureCOAAccount;
    create(dto: {
        accountName: string;
        bankName: string;
        accountNumber: string;
        ifscCode?: string;
        branchName?: string;
        accountType?: string;
        openingBalance?: number;
        description?: string;
        propertyId?: string | null;
    }): Promise<BankAccount>;
    update(id: string, dto: Partial<BankAccount>): Promise<BankAccount>;
    deactivate(id: string): Promise<BankAccount>;
    activate(id: string): Promise<BankAccount>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
