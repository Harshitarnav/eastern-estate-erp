import { Response } from 'express';
import { AccountingService } from './accounting.service';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    createAccount(data: any): Promise<import("./entities/account.entity").Account[]>;
    getAllAccounts(): Promise<import("./entities/account.entity").Account[]>;
    getAccountById(id: string): Promise<import("./entities/account.entity").Account>;
    updateAccount(id: string, data: any): Promise<import("./entities/account.entity").Account>;
    createJournalEntry(data: any): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    getJournalEntryById(id: string): Promise<import("./entities/journal-entry.entity").JournalEntry>;
    getJournalEntryLines(id: string): Promise<import("./entities/journal-entry-line.entity").JournalEntryLine[]>;
    getAccountLedger(id: string, startDate: string, endDate: string): Promise<{
        account: import("./entities/account.entity").Account;
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
        entries: import("./entities/journal-entry.entity").JournalEntry[];
    }>;
    getCashBook(startDate: string, endDate: string): Promise<{
        account: import("./entities/account.entity").Account;
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
    getBankBook(bankAccountId: string, startDate: string, endDate: string): Promise<{
        account: import("./entities/account.entity").Account;
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
    importJournalEntriesFromExcel(file: Express.Multer.File): Promise<{
        total: number;
        imported: number;
        failed: number;
        entries: any[];
    }>;
    exportLedgerToExcel(accountId: string, startDate: string, endDate: string, res: Response): Promise<void>;
    exportTrialBalanceToExcel(date: string, res: Response): Promise<void>;
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
    createBankAccount(data: any): Promise<import("./entities/bank-account.entity").BankAccount[]>;
    getAllBankAccounts(): Promise<import("./entities/bank-account.entity").BankAccount[]>;
    getBankAccountById(id: string): Promise<import("./entities/bank-account.entity").BankAccount>;
    uploadBankStatement(data: any, file: Express.Multer.File): Promise<{
        total: number;
        bankAccountId: any;
        fileName: any;
        statements: any[];
    }>;
    getUnreconciledTransactions(bankAccountId: string): Promise<import("./entities/bank-statement.entity").BankStatement[]>;
    reconcileTransaction(statementId: string, journalEntryId: string): Promise<import("./entities/bank-statement.entity").BankStatement>;
}
