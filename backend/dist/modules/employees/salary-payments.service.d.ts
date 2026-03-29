import { Repository } from 'typeorm';
import { SalaryPayment } from './entities/salary-payment.entity';
import { Employee } from './entities/employee.entity';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';
import { DataSource } from 'typeorm';
export interface CreateSalaryPaymentDto {
    employeeId: string;
    paymentMonth: string;
    workingDays: number;
    presentDays: number;
    absentDays?: number;
    paidLeaveDays?: number;
    unpaidLeaveDays?: number;
    overtimeHours?: number;
    basicSalary: number;
    houseRentAllowance?: number;
    transportAllowance?: number;
    medicalAllowance?: number;
    overtimePayment?: number;
    otherAllowances?: number;
    pfDeduction?: number;
    esiDeduction?: number;
    taxDeduction?: number;
    advanceDeduction?: number;
    loanDeduction?: number;
    otherDeductions?: number;
    notes?: string;
}
export declare class SalaryPaymentsService {
    private salaryPaymentRepo;
    private employeeRepo;
    private readonly accountingIntegrationService;
    private readonly dataSource;
    constructor(salaryPaymentRepo: Repository<SalaryPayment>, employeeRepo: Repository<Employee>, accountingIntegrationService: AccountingIntegrationService, dataSource: DataSource);
    create(dto: CreateSalaryPaymentDto, createdBy: string): Promise<SalaryPayment>;
    findAll(filters?: {
        employeeId?: string;
        month?: string;
        status?: string;
    }): Promise<SalaryPayment[]>;
    findOne(id: string): Promise<SalaryPayment>;
    processPay(id: string, userId: string, opts: {
        paymentMode?: string;
        transactionReference?: string;
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        paymentRemarks?: string;
    }): Promise<SalaryPayment>;
    retryJE(id: string, userId: string): Promise<{
        success: boolean;
        journalEntryNumber?: string;
        message: string;
    }>;
    cancel(id: string): Promise<SalaryPayment>;
    getMonthSummary(month: string): Promise<{
        totalGross: number;
        totalDeductions: number;
        totalNet: number;
        count: number;
        paid: number;
        pending: number;
    }>;
}
