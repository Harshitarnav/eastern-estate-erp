import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from './entities/payment.entity';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto, req: any): Promise<import("./entities/payment.entity").Payment>;
    findAll(bookingId?: string, customerId?: string, paymentType?: string, paymentMethod?: string, status?: PaymentStatus, startDate?: string, endDate?: string, minAmount?: string, maxAmount?: string, page?: string, limit?: string): Promise<{
        data: import("./entities/payment.entity").Payment[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStatistics(startDate?: string, endDate?: string, paymentType?: string): Promise<{
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
    findByBooking(bookingId: string): Promise<import("./entities/payment.entity").Payment[]>;
    findByCustomer(customerId: string): Promise<import("./entities/payment.entity").Payment[]>;
    findByCode(paymentCode: string): Promise<import("./entities/payment.entity").Payment>;
    findOne(id: string): Promise<import("./entities/payment.entity").Payment>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<import("./entities/payment.entity").Payment>;
    verify(id: string, req: any): Promise<import("./entities/payment.entity").Payment>;
    cancel(id: string): Promise<import("./entities/payment.entity").Payment>;
    remove(id: string): Promise<void>;
}
