import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, QueryPaymentDto, PaymentResponseDto, PaginatedPaymentsResponse } from './dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto>;
    findAll(query: QueryPaymentDto): Promise<PaginatedPaymentsResponse>;
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
    findOne(id: string): Promise<PaymentResponseDto>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentResponseDto>;
    remove(id: string): Promise<void>;
    verify(id: string, body: {
        verifiedBy: string;
    }): Promise<PaymentResponseDto>;
}
