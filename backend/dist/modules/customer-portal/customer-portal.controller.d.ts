import { CustomerPortalService } from './customer-portal.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Customer } from '../customers/entities/customer.entity';
export declare class CustomerPortalController {
    private readonly portalService;
    private usersRepo;
    private rolesRepo;
    private customersRepo;
    constructor(portalService: CustomerPortalService, usersRepo: Repository<User>, rolesRepo: Repository<Role>, customersRepo: Repository<Customer>);
    getProfile(req: any): Promise<{
        customer: Customer;
        stats: {
            bookingCount: number;
            totalPaid: number;
            paymentCount: number;
        };
    }>;
    getBookings(req: any): Promise<import("../bookings/entities/booking.entity").Booking[]>;
    getBookingDetail(req: any, id: string): Promise<{
        booking: import("../bookings/entities/booking.entity").Booking;
        paymentPlan: import("../payment-plans/entities/flat-payment-plan.entity").FlatPaymentPlan;
        payments: import("../payments/entities/payment.entity").Payment[];
        demandDrafts: import("../demand-drafts/entities/demand-draft.entity").DemandDraft[];
    }>;
    getPayments(req: any): Promise<{
        payments: import("../payments/entities/payment.entity").Payment[];
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
    getConstructionUpdates(req: any): Promise<{
        bookings: import("../bookings/entities/booking.entity").Booking[];
        updates: import("../construction/entities/construction-progress-log.entity").ConstructionProgressLog[];
        projects: import("../construction/entities/construction-project.entity").ConstructionProject[];
    }>;
    getDemandDrafts(req: any): Promise<import("../demand-drafts/entities/demand-draft.entity").DemandDraft[]>;
    inviteCustomer(customerId: string, body: {
        password: string;
    }, req: any): Promise<{
        message: string;
        userId: string;
        email: string;
    }>;
    checkPortalAccount(customerId: string): Promise<{
        hasAccount: boolean;
        user: User;
    }>;
    listPortalAccounts(req: any): Promise<User[]>;
    toggleAccountStatus(userId: string, body: {
        isActive: boolean;
    }, req: any): Promise<{
        message: string;
        userId: string;
    }>;
    resetPassword(userId: string, body: {
        newPassword: string;
    }, req: any): Promise<{
        message: string;
        userId: string;
    }>;
    revokePortalAccess(userId: string, req: any): Promise<{
        message: string;
        userId: string;
    }>;
    private assertAdmin;
}
