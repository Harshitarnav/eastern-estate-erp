import { InstallmentsService } from './installments.service';
import { CreateInstallmentDto, CreateInstallmentScheduleDto } from './dto/create-installment.dto';
import { InstallmentStatus } from './entities/payment-installment.entity';
export declare class InstallmentsController {
    private readonly installmentsService;
    constructor(installmentsService: InstallmentsService);
    create(createInstallmentDto: CreateInstallmentDto): Promise<import("./entities/payment-installment.entity").PaymentInstallment>;
    createSchedule(scheduleDto: CreateInstallmentScheduleDto): Promise<import("./entities/payment-installment.entity").PaymentInstallment[]>;
    findAll(bookingId?: string, status?: InstallmentStatus, overdue?: string): Promise<import("./entities/payment-installment.entity").PaymentInstallment[]>;
    getOverdue(): Promise<import("./entities/payment-installment.entity").PaymentInstallment[]>;
    getUpcoming(days?: string): Promise<import("./entities/payment-installment.entity").PaymentInstallment[]>;
    findByBooking(bookingId: string): Promise<import("./entities/payment-installment.entity").PaymentInstallment[]>;
    getBookingStats(bookingId: string): Promise<{
        totalInstallments: number;
        paidInstallments: number;
        pendingInstallments: number;
        overdueInstallments: number;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
        overdueAmount: number;
        totalLateFees: number;
    }>;
    findOne(id: string): Promise<import("./entities/payment-installment.entity").PaymentInstallment>;
    update(id: string, updateData: any): Promise<import("./entities/payment-installment.entity").PaymentInstallment>;
    markAsPaid(id: string, body: {
        paymentId: string;
        paidAmount?: number;
    }): Promise<import("./entities/payment-installment.entity").PaymentInstallment>;
    waive(id: string): Promise<import("./entities/payment-installment.entity").PaymentInstallment>;
    updateLateFees(body: {
        lateFeePerDay?: number;
    }): Promise<void>;
    remove(id: string): Promise<void>;
}
