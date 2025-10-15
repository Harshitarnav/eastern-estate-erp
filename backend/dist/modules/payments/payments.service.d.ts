import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto, QueryPaymentDto, PaymentResponseDto, PaginatedPaymentsResponse } from './dto';
export declare class PaymentsService {
    private paymentsRepository;
    constructor(paymentsRepository: Repository<Payment>);
    create(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto>;
    findAll(query: QueryPaymentDto): Promise<PaginatedPaymentsResponse>;
    findOne(id: string): Promise<PaymentResponseDto>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentResponseDto>;
    remove(id: string): Promise<void>;
    verifyPayment(id: string, verifiedBy: string): Promise<PaymentResponseDto>;
    getStatistics(): Promise<{
        total: number;
        pending: number;
        received: number;
        cleared: number;
        bounced: number;
        totalAmount: number;
        totalNetAmount: number;
        totalTDS: number;
        totalGST: number;
        byPaymentMode: {
            cash: number;
            cheque: number;
            bankTransfer: number;
            upi: number;
            online: number;
        };
        verified: number;
        verificationRate: number;
    }>;
}
