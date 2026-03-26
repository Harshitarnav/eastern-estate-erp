import { SalaryPaymentsService, CreateSalaryPaymentDto } from './salary-payments.service';
export declare class SalaryPaymentsController {
    private readonly salaryPaymentsService;
    constructor(salaryPaymentsService: SalaryPaymentsService);
    findAll(employeeId?: string, month?: string, status?: string): Promise<import("./entities/salary-payment.entity").SalaryPayment[]>;
    getSummary(month: string): Promise<{
        totalGross: number;
        totalDeductions: number;
        totalNet: number;
        count: number;
        paid: number;
        pending: number;
    }>;
    create(dto: CreateSalaryPaymentDto, req: any): Promise<import("./entities/salary-payment.entity").SalaryPayment>;
    findOne(id: string): Promise<import("./entities/salary-payment.entity").SalaryPayment>;
    processPay(id: string, body: {
        paymentMode?: string;
        transactionReference?: string;
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        paymentRemarks?: string;
    }, req: any): Promise<import("./entities/salary-payment.entity").SalaryPayment>;
    cancel(id: string): Promise<import("./entities/salary-payment.entity").SalaryPayment>;
}
