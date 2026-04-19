import { Repository, DataSource } from 'typeorm';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
interface AutoJEOptions {
    date: Date;
    description: string;
    referenceType: string;
    referenceId: string;
    debitAccountId: string;
    creditAccountId: string;
    amount: number;
    createdBy?: string;
    propertyId?: string | null;
}
export declare class AccountingIntegrationService {
    private readonly accountsRepo;
    private readonly jeRepo;
    private readonly jelRepo;
    private readonly dataSource;
    private readonly logger;
    constructor(accountsRepo: Repository<Account>, jeRepo: Repository<JournalEntry>, jelRepo: Repository<JournalEntryLine>, dataSource: DataSource);
    findCashOrBankAccount(propertyId?: string | null): Promise<Account | null>;
    findSalesRevenueAccount(propertyId?: string | null): Promise<Account | null>;
    findSalaryExpenseAccount(propertyId?: string | null): Promise<Account | null>;
    findExpenseAccount(accountId?: string, propertyId?: string | null): Promise<Account | null>;
    private buildScopeFilters;
    private ensureDefaultAccount;
    private pickFreeAccountCode;
    private generateEntryNumber;
    createAutoJE(opts: AutoJEOptions): Promise<JournalEntry | null>;
    private updateBalanceTx;
    onPaymentCompleted(payment: {
        id: string;
        paymentCode: string;
        amount: number;
        paymentDate: Date;
        paymentMethod?: string;
        createdBy?: string;
        propertyId?: string | null;
    }): Promise<JournalEntry | null>;
    onExpensePaid(expense: {
        id: string;
        expenseCode: string;
        amount: number;
        expenseDate: Date;
        description: string;
        accountId?: string;
        createdBy?: string;
        propertyId?: string | null;
    }): Promise<JournalEntry | null>;
    findConstructionExpenseAccount(propertyId?: string | null): Promise<Account | null>;
    findMaterialPurchaseAccount(propertyId?: string | null): Promise<Account | null>;
    onRABillPaid(bill: {
        id: string;
        raBillNumber: string;
        netPayable: number;
        paidAt: Date;
        vendorName?: string;
        projectName?: string;
        createdBy?: string;
        propertyId?: string | null;
    }): Promise<JournalEntry | null>;
    onVendorPaymentRecorded(payment: {
        id: string;
        amount: number;
        paymentDate: Date;
        vendorName?: string;
        transactionReference?: string;
        createdBy?: string;
        propertyId?: string | null;
    }): Promise<JournalEntry | null>;
    onSalaryPaid(salary: {
        id: string;
        employeeName: string;
        netSalary: number;
        paymentDate: Date;
        paymentMonth: Date;
        createdBy?: string;
        propertyId?: string | null;
    }): Promise<JournalEntry | null>;
}
export {};
