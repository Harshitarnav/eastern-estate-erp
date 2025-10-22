import { RefundsService } from './refunds.service';
import { CreateRefundDto, ApproveRefundDto, ProcessRefundDto } from './dto/create-refund.dto';
import { RefundStatus } from './entities/payment-refund.entity';
export declare class RefundsController {
    private readonly refundsService;
    constructor(refundsService: RefundsService);
    create(createRefundDto: CreateRefundDto, req: any): Promise<import("./entities/payment-refund.entity").PaymentRefund>;
    findAll(paymentId?: string, status?: RefundStatus): Promise<import("./entities/payment-refund.entity").PaymentRefund[]>;
    getPending(): Promise<import("./entities/payment-refund.entity").PaymentRefund[]>;
    getApproved(): Promise<import("./entities/payment-refund.entity").PaymentRefund[]>;
    getStatistics(startDate?: string, endDate?: string): Promise<{
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
    findOne(id: string): Promise<import("./entities/payment-refund.entity").PaymentRefund>;
    approve(id: string, approveDto: ApproveRefundDto, req: any): Promise<import("./entities/payment-refund.entity").PaymentRefund>;
    reject(id: string, body: {
        reason: string;
    }, req: any): Promise<import("./entities/payment-refund.entity").PaymentRefund>;
    process(id: string, processDto: ProcessRefundDto, req: any): Promise<import("./entities/payment-refund.entity").PaymentRefund>;
}
