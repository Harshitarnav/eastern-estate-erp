import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentSchedule } from '../entities/payment-schedule.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';
import { FlatPaymentPlanService } from '../../payment-plans/services/flat-payment-plan.service';
import { Flat } from '../../flats/entities/flat.entity';
import { Booking } from '../../bookings/entities/booking.entity';
export declare class PaymentCompletionService {
    private readonly paymentRepository;
    private readonly paymentScheduleRepository;
    private readonly flatPaymentPlanRepository;
    private readonly flatRepository;
    private readonly bookingRepository;
    private readonly flatPaymentPlanService;
    private readonly logger;
    constructor(paymentRepository: Repository<Payment>, paymentScheduleRepository: Repository<PaymentSchedule>, flatPaymentPlanRepository: Repository<FlatPaymentPlan>, flatRepository: Repository<Flat>, bookingRepository: Repository<Booking>, flatPaymentPlanService: FlatPaymentPlanService);
    processPaymentCompletion(paymentId: string): Promise<{
        payment: Payment;
        paymentSchedule: PaymentSchedule;
        flatPaymentPlan: FlatPaymentPlan | null;
        flat: Flat | null;
        booking: Booking | null;
    }>;
    private updatePaymentSchedule;
    private updateFlatPaymentPlanMilestone;
    private updateFlatPaymentStatus;
    private updateBookingPaymentStatus;
    getFlatPaymentSummary(flatId: string): Promise<{
        totalAmount: number;
        paidAmount: number;
        balanceAmount: number;
        completedMilestones: number;
        totalMilestones: number;
        nextMilestone: any;
    }>;
}
