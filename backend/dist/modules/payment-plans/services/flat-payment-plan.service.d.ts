import { Repository } from 'typeorm';
import { FlatPaymentPlan, FlatPaymentMilestone, FlatPaymentPlanStatus } from '../entities/flat-payment-plan.entity';
import { CreateFlatPaymentPlanDto } from '../dto/create-flat-payment-plan.dto';
import { PaymentPlanTemplateService } from './payment-plan-template.service';
import { Flat } from '../../flats/entities/flat.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Payment } from '../../payments/entities/payment.entity';
export interface LedgerRow {
    date: string | null;
    description: string;
    type: 'DEMAND' | 'PAYMENT';
    debit: number;
    credit: number;
    balance: number;
    milestoneSequence?: number;
    demandDraftId?: string | null;
    paymentId?: string | null;
    reference?: string;
    status?: string;
}
export interface LedgerResponse {
    plan: {
        id: string;
        totalAmount: number;
        paidAmount: number;
        balanceAmount: number;
        status: string;
    };
    customer: {
        id: string;
        fullName: string;
        phone?: string;
        email?: string;
    } | null;
    flat: {
        id: string;
        flatNumber: string;
        property?: string;
        tower?: string;
    } | null;
    booking: {
        id: string;
        bookingNumber: string;
        bookingDate?: Date;
    } | null;
    rows: LedgerRow[];
    summary: {
        totalDemanded: number;
        totalPaid: number;
        balance: number;
        overdueCount: number;
        pendingMilestones: number;
    };
}
export declare class FlatPaymentPlanService {
    private readonly flatPaymentPlanRepository;
    private readonly flatRepository;
    private readonly bookingRepository;
    private readonly customerRepository;
    private readonly paymentRepository;
    private readonly templateService;
    constructor(flatPaymentPlanRepository: Repository<FlatPaymentPlan>, flatRepository: Repository<Flat>, bookingRepository: Repository<Booking>, customerRepository: Repository<Customer>, paymentRepository: Repository<Payment>, templateService: PaymentPlanTemplateService);
    create(createDto: CreateFlatPaymentPlanDto, userId: string): Promise<FlatPaymentPlan>;
    findAll(): Promise<FlatPaymentPlan[]>;
    findOne(id: string): Promise<FlatPaymentPlan>;
    findByFlatId(flatId: string): Promise<FlatPaymentPlan | null>;
    findByBookingId(bookingId: string): Promise<FlatPaymentPlan | null>;
    updateMilestone(planId: string, milestoneSequence: number, updates: Partial<FlatPaymentMilestone>, userId: string): Promise<FlatPaymentPlan>;
    updateMilestones(planId: string, milestones: FlatPaymentMilestone[], userId: string): Promise<FlatPaymentPlan>;
    updatePlan(planId: string, updates: {
        totalAmount?: number;
        status?: FlatPaymentPlanStatus;
    }, userId: string): Promise<FlatPaymentPlan>;
    cancel(id: string, userId: string): Promise<FlatPaymentPlan>;
    getLedger(bookingId: string): Promise<LedgerResponse>;
}
