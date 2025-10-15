import { Repository } from 'typeorm';
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
    constructor(accountRepository: Repository<Account>, journalEntryRepository: Repository<JournalEntry>, journalEntryLineRepository: Repository<JournalEntryLine>, bankAccountRepository: Repository<BankAccount>, bankStatementRepository: Repository<BankStatement>);
    createAccount(data: any): Promise<Account[]>;
    getAllAccounts(): Promise<Account[]>;
    getAccountById(id: string): Promise<Account>;
    updateAccount(id: string, data: any): Promise<Account>;
    createJournalEntry(data: any): Promise<JournalEntry>;
    getJournalEntryById(id: string): Promise<JournalEntry>;
    getJournalEntryLines(entryId: string): Promise<JournalEntryLine[]>;
    private updateAccountBalances;
    getAccountLedger(accountId: string, startDate: Date, endDate: Date): Promise<{
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
    getCashBook(startDate: Date, endDate: Date): Promise<{
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
        entries: any[];
    }>;
    exportLedgerToExcel(accountId: string, startDate: Date, endDate: Date): Promise<any>;
    exportTrialBalanceToExcel(date: Date): Promise<any>;
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
    createBankAccount(data: any): Promise<BankAccount[]>;
    getAllBankAccounts(): Promise<BankAccount[]>;
    getBankAccountById(id: string): Promise<BankAccount>;
}
