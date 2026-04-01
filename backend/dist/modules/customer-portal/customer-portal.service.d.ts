import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';
import { DemandDraft } from '../demand-drafts/entities/demand-draft.entity';
import { ConstructionProgressLog } from '../construction/entities/construction-progress-log.entity';
import { ConstructionProject } from '../construction/entities/construction-project.entity';
export declare class CustomerPortalService {
    private customersRepo;
    private bookingsRepo;
    private paymentsRepo;
    private paymentPlansRepo;
    private demandDraftsRepo;
    private progressLogsRepo;
    private constructionProjectsRepo;
    constructor(customersRepo: Repository<Customer>, bookingsRepo: Repository<Booking>, paymentsRepo: Repository<Payment>, paymentPlansRepo: Repository<FlatPaymentPlan>, demandDraftsRepo: Repository<DemandDraft>, progressLogsRepo: Repository<ConstructionProgressLog>, constructionProjectsRepo: Repository<ConstructionProject>);
    getProfile(customerId: string): Promise<{
        customer: Customer;
        stats: {
            bookingCount: number;
            totalPaid: number;
            paymentCount: number;
        };
    }>;
    getBookings(customerId: string): Promise<Booking[]>;
    getBookingDetail(customerId: string, bookingId: string): Promise<{
        booking: Booking;
        paymentPlan: FlatPaymentPlan;
        payments: Payment[];
        demandDrafts: DemandDraft[];
    }>;
    getPayments(customerId: string): Promise<{
        payments: Payment[];
        upcomingMilestones: {
            flatNumber: string;
            bookingId: string;
            planId: string;
            sequence: number;
            name: string;
            constructionPhase: "FOUNDATION" | "STRUCTURE" | "MEP" | "FINISHING" | "HANDOVER" | null;
            phasePercentage: number | null;
            amount: number;
            dueDate: string | null;
            status: "PENDING" | "TRIGGERED" | "PAID" | "OVERDUE";
            paymentScheduleId: string | null;
            constructionCheckpointId: string | null;
            demandDraftId: string | null;
            paymentId: string | null;
            completedAt: string | null;
            description: string;
        }[];
    }>;
    getConstructionUpdates(customerId: string): Promise<{
        bookings: Booking[];
        updates: ConstructionProgressLog[];
        projects: ConstructionProject[];
    }>;
    getDemandDrafts(customerId: string): Promise<DemandDraft[]>;
}
