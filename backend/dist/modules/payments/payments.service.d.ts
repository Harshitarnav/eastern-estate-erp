import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ModuleRef } from '@nestjs/core';
export declare class PaymentsService {
    private paymentRepository;
    private bookingRepository;
    private userRepository;
    private readonly accountingIntegrationService;
    private readonly notificationsService;
    private readonly moduleRef;
    private readonly logger;
    constructor(paymentRepository: Repository<Payment>, bookingRepository: Repository<Booking>, userRepository: Repository<User>, accountingIntegrationService: AccountingIntegrationService, notificationsService: NotificationsService, moduleRef: ModuleRef);
    private getCompletionService;
    create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment>;
    private buildFilteredQuery;
    findAll(filters?: {
        bookingId?: string;
        customerId?: string;
        paymentType?: string;
        paymentMethod?: string;
        status?: PaymentStatus;
        isVerified?: boolean;
        startDate?: Date;
        endDate?: Date;
        minAmount?: number;
        maxAmount?: number;
        propertyId?: string;
        accessiblePropertyIds?: string[] | null;
    }): Promise<Payment[]>;
    findAllPaginated(filters: Parameters<PaymentsService['findAll']>[0], page: number, limit: number): Promise<{
        data: Payment[];
        total: number;
    }>;
    private applyPaymentFilters;
    findOne(id: string): Promise<Payment>;
    findByPaymentCode(paymentCode: string): Promise<Payment>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment>;
    markRefunded(id: string, userId?: string | null): Promise<Payment>;
    verify(id: string, userId: string): Promise<Payment>;
    verifyWithReport(id: string, userId: string): Promise<{
        payment: Payment;
        journalEntryId: string | null;
        journalEntrySkipReason: string | null;
    }>;
    runPostCompletionHooks(paymentId: string, userId?: string | null): Promise<{
        journalEntryId: string | null;
        journalEntrySkipReason: string | null;
    }>;
    private notifyCustomerOnPaymentVerified;
    cancel(id: string): Promise<Payment>;
    remove(id: string): Promise<void>;
    getStatistics(filters?: {
        startDate?: Date;
        endDate?: Date;
        paymentType?: string;
        propertyId?: string;
        accessiblePropertyIds?: string[] | null;
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
