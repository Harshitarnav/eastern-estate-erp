import { Employee } from './employee.entity';
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    PAID = "PAID",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMode {
    BANK_TRANSFER = "BANK_TRANSFER",
    CASH = "CASH",
    CHEQUE = "CHEQUE",
    UPI = "UPI"
}
export declare class SalaryPayment {
    id: string;
    employeeId: string;
    employee: Employee;
    paymentMonth: Date;
    workingDays: number;
    presentDays: number;
    absentDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    overtimeHours: number;
    basicSalary: number;
    houseRentAllowance: number;
    transportAllowance: number;
    medicalAllowance: number;
    overtimePayment: number;
    otherAllowances: number;
    grossSalary: number;
    pfDeduction: number;
    esiDeduction: number;
    taxDeduction: number;
    advanceDeduction: number;
    loanDeduction: number;
    otherDeductions: number;
    totalDeductions: number;
    netSalary: number;
    paymentStatus: PaymentStatus;
    paymentMode: PaymentMode;
    paymentDate: Date;
    transactionReference: string;
    paymentRemarks: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    notes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    approvedBy: string;
    approvedAt: Date;
}
