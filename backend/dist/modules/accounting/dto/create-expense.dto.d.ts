import { ExpenseStatus } from '../entities/expense.entity';
export declare class CreateExpenseDto {
    expenseCode?: string;
    expenseCategory: string;
    expenseType: string;
    expenseSubCategory?: string;
    amount: number;
    expenseDate: string;
    vendorId?: string;
    employeeId?: string;
    propertyId?: string;
    constructionProjectId?: string;
    paymentMethod?: string;
    paymentReference?: string;
    paymentStatus?: string;
    description: string;
    receiptUrl?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    accountId?: string;
    status?: ExpenseStatus;
}
export declare class UpdateExpenseDto {
    expenseType?: string;
    amount?: number;
    description?: string;
    receiptUrl?: string;
    status?: string;
}
export declare class ApproveExpenseDto {
    notes?: string;
}
export declare class RejectExpenseDto {
    rejectionReason: string;
}
