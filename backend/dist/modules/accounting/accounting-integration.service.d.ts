import { Repository } from 'typeorm';
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
}
export declare class AccountingIntegrationService {
    private readonly accountsRepo;
    private readonly jeRepo;
    private readonly jelRepo;
    private readonly logger;
    constructor(accountsRepo: Repository<Account>, jeRepo: Repository<JournalEntry>, jelRepo: Repository<JournalEntryLine>);
    findCashOrBankAccount(): Promise<Account | null>;
    findSalesRevenueAccount(): Promise<Account | null>;
    findSalaryExpenseAccount(): Promise<Account | null>;
    findExpenseAccount(accountId?: string): Promise<Account | null>;
    private generateEntryNumber;
    createAutoJE(opts: AutoJEOptions): Promise<JournalEntry | null>;
    private updateBalance;
    onPaymentCompleted(payment: {
        id: string;
        paymentCode: string;
        amount: number;
        paymentDate: Date;
        paymentMethod?: string;
        createdBy?: string;
    }): Promise<JournalEntry | null>;
    onExpensePaid(expense: {
        id: string;
        expenseCode: string;
        amount: number;
        expenseDate: Date;
        description: string;
        accountId?: string;
        createdBy?: string;
    }): Promise<JournalEntry | null>;
    findConstructionExpenseAccount(): Promise<Account | null>;
    findMaterialPurchaseAccount(): Promise<Account | null>;
    onRABillPaid(bill: {
        id: string;
        raBillNumber: string;
        netPayable: number;
        paidAt: Date;
        vendorName?: string;
        projectName?: string;
        createdBy?: string;
    }): Promise<JournalEntry | null>;
    onVendorPaymentRecorded(payment: {
        id: string;
        amount: number;
        paymentDate: Date;
        vendorName?: string;
        transactionReference?: string;
        createdBy?: string;
    }): Promise<JournalEntry | null>;
    onSalaryPaid(salary: {
        id: string;
        employeeName: string;
        netSalary: number;
        paymentDate: Date;
        paymentMonth: Date;
        createdBy?: string;
    }): Promise<JournalEntry | null>;
}
export {};
