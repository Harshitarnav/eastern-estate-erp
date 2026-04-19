import { Repository, DataSource } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import type { AccountingReportScope } from './utils/accounting-scope.util';
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
        propertyId?: string;
        projectOnlyCoa?: boolean;
    }, scopePropertyIds?: string[] | null): Promise<Account[]>;
    findOne(id: string, overlayPropertyId?: string): Promise<Account>;
    findByCode(accountCode: string): Promise<Account>;
    update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account>;
    bulkImport(rows: Array<{
        accountCode: string;
        accountName: string;
        accountType: string;
        accountCategory: string;
        description?: string;
        openingBalance?: number;
    }>, scopePropertyId: string | null): Promise<{
        created: number;
        skipped: number;
        errors: Array<{
            row: number;
            code: string;
            message: string;
        }>;
        createdIds: string[];
    }>;
    remove(id: string): Promise<void>;
    getAccountHierarchy(scopePropertyIds?: string[] | null): Promise<Account[]>;
    private findAccountsByTypeAndPropertyScope;
    private indiaFYStartDate;
    private aggregateJournalNetByAccount;
    private aggregateJournalNetForAccountsOwnedByProperty;
    private journalNetMapForSingleProjectView;
    private accountsWithScopedBalances;
    getBalanceSheet(scope: AccountingReportScope): Promise<{
        assets: Account[];
        liabilities: Account[];
        equity: Account[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
    }>;
    getProfitAndLoss(startDate: Date | undefined, endDate: Date | undefined, scope: AccountingReportScope): Promise<{
        income: Account[];
        expenses: Account[];
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
    }>;
    getTrialBalance(scope: AccountingReportScope): Promise<{
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
