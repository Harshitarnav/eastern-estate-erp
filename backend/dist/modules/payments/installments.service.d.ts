import { Repository } from 'typeorm';
import { PaymentInstallment, InstallmentStatus } from './entities/payment-installment.entity';
import { CreateInstallmentDto, CreateInstallmentScheduleDto } from './dto/create-installment.dto';
export declare class InstallmentsService {
    private installmentRepository;
    constructor(installmentRepository: Repository<PaymentInstallment>);
    create(createInstallmentDto: CreateInstallmentDto): Promise<PaymentInstallment>;
    createSchedule(scheduleDto: CreateInstallmentScheduleDto): Promise<PaymentInstallment[]>;
    findAll(filters?: {
        bookingId?: string;
        status?: InstallmentStatus;
        overdue?: boolean;
    }): Promise<PaymentInstallment[]>;
    findOne(id: string): Promise<PaymentInstallment>;
    findByBooking(bookingId: string): Promise<PaymentInstallment[]>;
    update(id: string, updateData: Partial<PaymentInstallment>): Promise<PaymentInstallment>;
    markAsPaid(id: string, paymentId: string, paidAmount?: number): Promise<PaymentInstallment>;
    waive(id: string): Promise<PaymentInstallment>;
    calculateLateFee(installment: PaymentInstallment, lateFeePerDay?: number): Promise<number>;
    updateLateFees(lateFeePerDay?: number): Promise<void>;
    getOverdue(): Promise<PaymentInstallment[]>;
    getUpcoming(days?: number): Promise<PaymentInstallment[]>;
    remove(id: string): Promise<void>;
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
}
