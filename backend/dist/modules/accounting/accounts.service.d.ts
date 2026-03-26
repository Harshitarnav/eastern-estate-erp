import { Repository, DataSource } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
export declare class AccountsService {
    private accountsRepository;
    private journalEntryLinesRepository;
    private dataSource;
    constructor(accountsRepository: Repository<Account>, journalEntryLinesRepository: Repository<JournalEntryLine>, dataSource: DataSource);
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
    getTrialBalance(): Promise<{
        accounts: Array<{
            accountCode: string;
            accountName: string;
            accountType: string;
            debitBalance: number;
            creditBalance: number;
        }>;
        totalDebit: number;
        totalCredit: number;
        isBalanced: boolean;
    }>;
    getPropertyWisePL(propertyId: string): Promise<{
        propertyId: string;
        income: Array<{
            accountName: string;
            accountCode: string;
            amount: number;
        }>;
        expenses: Array<{
            accountName: string;
            accountCode: string;
            amount: number;
        }>;
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
    }>;
}
