import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentsService {
    private paymentRepository;
    constructor(paymentRepository: Repository<Payment>);
    create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment>;
    findAll(filters?: {
        bookingId?: string;
        customerId?: string;
        paymentType?: string;
        paymentMethod?: string;
        status?: PaymentStatus;
        startDate?: Date;
        endDate?: Date;
        minAmount?: number;
        maxAmount?: number;
    }): Promise<Payment[]>;
    findOne(id: string): Promise<Payment>;
    findByPaymentCode(paymentCode: string): Promise<Payment>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment>;
    verify(id: string, userId: string): Promise<Payment>;
    cancel(id: string): Promise<Payment>;
    remove(id: string): Promise<void>;
    getStatistics(filters?: {
        startDate?: Date;
        endDate?: Date;
        paymentType?: string;
    }): Promise<{
        totalPayments: number;
        totalAmount: number;
        completedPayments: number;
        completedAmount: number;
        pendingPayments: number;
        pendingAmount: number;
        byMethod: Array<{
            method: string;
            count: number;
            amount: number;
        }>;
        byType: Array<{
            type: string;
            count: number;
            amount: number;
        }>;
    }>;
    private generatePaymentCode;
}
