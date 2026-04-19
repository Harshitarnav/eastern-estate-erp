import type { Request } from 'express';
import { Response } from 'express';
import { AccountingService } from './accounting.service';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
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
    getCashBook(startDate: string, endDate: string, propertyId?: string): Promise<{
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
        errors: {
            row: number;
            error: string;
        }[];
        entries: any[];
    }>;
    exportLedgerToExcel(accountId: string, startDate: string, endDate: string, res: Response): Promise<void>;
    exportTrialBalanceToExcel(date: string, res: Response): Promise<void>;
    getPropertyWisePL(startDate: string, endDate: string, req: Request): Promise<{
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
    getProjectFundFlow(req: Request, startDate: string, endDate: string, propertyId?: string): Promise<{
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
    getARAgingReport(asOf?: string, propertyId?: string): Promise<any>;
    getAPAgingReport(asOf?: string): Promise<any>;
    getCashFlowStatement(startDate: string, endDate: string, propertyId?: string): Promise<any>;
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
}
