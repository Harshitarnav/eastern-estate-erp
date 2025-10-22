import { Repository } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
export declare class AccountsService {
    private accountsRepository;
    constructor(accountsRepository: Repository<Account>);
    create(createAccountDto: CreateAccountDto): Promise<Account>;
    findAll(filters?: {
        accountType?: AccountType;
        isActive?: boolean;
        parentAccountId?: string;
    }): Promise<Account[]>;
    findOne(id: string): Promise<Account>;
    findByCode(accountCode: string): Promise<Account>;
    update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account>;
    remove(id: string): Promise<void>;
    getAccountHierarchy(): Promise<Account[]>;
    getBalanceSheet(): Promise<{
        assets: Account[];
        liabilities: Account[];
        equity: Account[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
    }>;
    getProfitAndLoss(startDate?: Date, endDate?: Date): Promise<{
        income: Account[];
        expenses: Account[];
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
    }>;
}
