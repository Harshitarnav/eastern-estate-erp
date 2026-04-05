import { Repository, DataSource } from 'typeorm';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankStatement } from './entities/bank-statement.entity';
export declare class AccountingService {
    private accountRepository;
    private journalEntryRepository;
    private journalEntryLineRepository;
    private bankAccountRepository;
    private bankStatementRepository;
    private dataSource;
    private readonly logger;
    constructor(accountRepository: Repository<Account>, journalEntryRepository: Repository<JournalEntry>, journalEntryLineRepository: Repository<JournalEntryLine>, bankAccountRepository: Repository<BankAccount>, bankStatementRepository: Repository<BankStatement>, dataSource: DataSource);
    createAccount(data: any): Promise<Account[]>;
    seedCoaForProject(propertyId: string): Promise<{
        created: number;
        skipped: number;
    }>;
    getAllAccounts(propertyId?: string): Promise<Account[]>;
    getAccountById(id: string): Promise<Account>;
    updateAccount(id: string, data: any): Promise<Account>;
    private generateEntryNumber;
    createJournalEntry(data: any): Promise<JournalEntry>;
    getJournalEntryById(id: string): Promise<JournalEntry>;
    getJournalEntryLines(entryId: string): Promise<JournalEntryLine[]>;
    private updateAccountBalances;
    getAccountLedger(accountId: string, startDate: Date, endDate: Date, propertyId?: string): Promise<{
        account: Account;
        openingBalance: number;
        closingBalance: number;
        entries: {
            date: any;
            entryNumber: any;
            narration: any;
            debit: number;
            credit: number;
            balance: number;
        }[];
    }>;
    getWeeklyLedger(week: number, year: number): Promise<{
        week: number;
        year: number;
        startDate: Date;
        endDate: Date;
        totalEntries: number;
        totalDebit: number;
        totalCredit: number;
        entries: JournalEntry[];
    }>;
    getCashBook(startDate: Date, endDate: Date, propertyId?: string): Promise<{
        account: Account;
        openingBalance: number;
        closingBalance: number;
        entries: {
            date: any;
            entryNumber: any;
            narration: any;
            debit: number;
            credit: number;
            balance: number;
        }[];
    }>;
    getBankBook(bankAccountId: string, startDate: Date, endDate: Date): Promise<{
        account: Account;
        openingBalance: number;
        closingBalance: number;
        entries: {
            date: any;
            entryNumber: any;
            narration: any;
            debit: number;
            credit: number;
            balance: number;
        }[];
    }>;
    importJournalEntriesFromExcel(buffer: Buffer): Promise<{
        total: number;
        imported: number;
        failed: number;
        errors: {
            row: number;
            error: string;
        }[];
        entries: any[];
    }>;
    exportLedgerToExcel(accountId: string, startDate: Date, endDate: Date): Promise<any>;
    exportTrialBalanceToExcel(date: Date): Promise<any>;
    getPropertyWisePL(startDate: Date, endDate: Date, allowedPropertyIds?: string[] | null): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        properties: {
            propertyId: string;
            propertyName: string;
            revenue: number;
            expenses: number;
            netProfit: number;
            margin: number;
        }[];
        totals: {
            margin: number;
            revenue: number;
            expenses: number;
            netProfit: number;
        };
    }>;
    getProjectFundFlow(startDate: Date, endDate: Date, focusPropertyId?: string | null, allowedPropertyIds?: string[] | null): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        explanation: string;
        focusProperty: {
            id: string;
            name: string;
        };
        focusSummary: any;
        projectsWithOutflows: number;
        matrix: any;
        unallocatedOutflows: {
            expenses: number;
            vendorPayments: number;
            salaries: number;
            total: number;
        };
        inflows: any[];
        outflows: {
            expenses: any[];
            vendorPayments: any[];
            salaries: any[];
        };
        inflowTotal: number;
        outflowTotal: number;
    }>;
    exportForITR(financialYear: string): Promise<{
        financial_year: string;
        total_income: number;
        total_expenses: number;
        net_profit: number;
        income_heads: {
            head: string;
            amount: number;
        }[];
        expense_heads: {
            head: string;
            amount: number;
        }[];
    }>;
    uploadBankStatement(data: any, file: any): Promise<{
        total: number;
        bankAccountId: any;
        fileName: any;
        statements: any[];
    }>;
    getUnreconciledTransactions(bankAccountId: string): Promise<BankStatement[]>;
    reconcileTransaction(statementId: string, journalEntryId: string): Promise<BankStatement>;
    private getDateOfWeek;
    getARAgingReport(asOf?: Date): Promise<any>;
    getAPAgingReport(asOf?: Date): Promise<any>;
    getCashFlowStatement(startDate: Date, endDate: Date): Promise<any>;
    createBankAccount(data: any): Promise<BankAccount[]>;
    getAllBankAccounts(): Promise<BankAccount[]>;
    getBankAccountById(id: string): Promise<BankAccount>;
}
