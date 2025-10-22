import { Repository } from 'typeorm';
import { PaymentRefund, RefundStatus } from './entities/payment-refund.entity';
import { CreateRefundDto, ApproveRefundDto, ProcessRefundDto } from './dto/create-refund.dto';
import { PaymentsService } from './payments.service';
export declare class RefundsService {
    private refundRepository;
    private paymentsService;
    constructor(refundRepository: Repository<PaymentRefund>, paymentsService: PaymentsService);
    create(createRefundDto: CreateRefundDto, userId: string): Promise<PaymentRefund>;
    findAll(filters?: {
        paymentId?: string;
        status?: RefundStatus;
    }): Promise<PaymentRefund[]>;
    findOne(id: string): Promise<PaymentRefund>;
    approve(id: string, userId: string, approveDto?: ApproveRefundDto): Promise<PaymentRefund>;
    reject(id: string, userId: string, reason: string): Promise<PaymentRefund>;
    process(id: string, userId: string, processDto: ProcessRefundDto): Promise<PaymentRefund>;
    getPendingRefunds(): Promise<PaymentRefund[]>;
    getApprovedRefunds(): Promise<PaymentRefund[]>;
    getRefundStats(filters?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        totalRefunds: number;
        totalAmount: number;
        pendingRefunds: number;
        pendingAmount: number;
        approvedRefunds: number;
        approvedAmount: number;
        processedRefunds: number;
        processedAmount: number;
        rejectedRefunds: number;
        rejectedAmount: number;
    }>;
}
