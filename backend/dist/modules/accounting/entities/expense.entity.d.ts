import { User } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Property } from '../../properties/entities/property.entity';
import { Account } from './account.entity';
import { JournalEntry } from './journal-entry.entity';
export declare enum ExpenseStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    PAID = "PAID",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare class Expense {
    id: string;
    expenseCode: string;
    expenseCategory: string;
    expenseType: string;
    expenseSubCategory: string;
    amount: number;
    expenseDate: Date;
    vendorId: string;
    employeeId: string;
    employee: Employee;
    propertyId: string;
    property: Property;
    constructionProjectId: string;
    paymentMethod: string;
    paymentReference: string;
    paymentStatus: string;
    description: string;
    receiptUrl: string;
    invoiceNumber: string;
    invoiceDate: Date;
    status: ExpenseStatus;
    approvedBy: string;
    approver: User;
    approvedAt: Date;
    rejectionReason: string;
    accountId: string;
    account: Account;
    journalEntryId: string;
    journalEntry: JournalEntry;
    createdBy: string;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
}
