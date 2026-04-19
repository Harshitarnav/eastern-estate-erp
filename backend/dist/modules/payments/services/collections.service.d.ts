import { Repository } from 'typeorm';
import { DemandDraft, DemandDraftStatus, DemandDraftTone } from '../../demand-drafts/entities/demand-draft.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';
export type CollectionTier = 'ON_TRACK' | 'OVERDUE' | 'REMINDER_1' | 'REMINDER_2' | 'REMINDER_3' | 'REMINDER_4' | 'WARNING' | 'POST_WARNING' | 'AT_RISK';
export interface CollectionsListFilter {
    tier?: CollectionTier;
    customerId?: string;
    bookingId?: string;
    propertyId?: string;
    flatId?: string;
    status?: DemandDraftStatus;
    tone?: DemandDraftTone;
    includeLegacyOnly?: boolean;
    includePaid?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    assigneeId?: string;
    unassignedOnly?: boolean;
    mineUserId?: string;
}
export interface CollectionsRow {
    id: string;
    title: string | null;
    amount: number;
    status: DemandDraftStatus;
    tone: DemandDraftTone;
    escalationLevel: number;
    reminderCount: number;
    dueDate: Date | null;
    daysOverdue: number;
    lastReminderAt: Date | null;
    nextReminderDueAt: Date | null;
    cancellationWarningIssuedAt: Date | null;
    parentDemandDraftId: string | null;
    isLegacyImport: boolean;
    createdAt: Date;
    customerId: string | null;
    customerName: string | null;
    customerPhone: string | null;
    customerEmail: string | null;
    bookingId: string | null;
    bookingCode: string | null;
    bookingStatus: string | null;
    flatId: string | null;
    flatCode: string | null;
    propertyId: string | null;
    propertyName: string | null;
    pauseRemindersUntil: Date | null;
    collectorUserId: string | null;
    collectorName: string | null;
    assignedAt: Date | null;
    tier: CollectionTier;
}
export interface CollectorSummary {
    userId: string;
    name: string;
    email: string | null;
    assignedCount: number;
    overdueCount: number;
}
export interface CollectionsStats {
    totalOverdueAmount: number;
    totalPendingAmount: number;
    ddCount: number;
    overdueCount: number;
    atRiskBookingCount: number;
    byTier: Record<CollectionTier, {
        count: number;
        amount: number;
    }>;
    agingBuckets: {
        d_0_7: {
            count: number;
            amount: number;
        };
        d_8_30: {
            count: number;
            amount: number;
        };
        d_31_90: {
            count: number;
            amount: number;
        };
        d_91_180: {
            count: number;
            amount: number;
        };
        d_181_365: {
            count: number;
            amount: number;
        };
        d_365_plus: {
            count: number;
            amount: number;
        };
    };
    draftWarningsPending: number;
    pausedCount: number;
    legacyOverdueAmount: number;
}
export declare class CollectionsService {
    private readonly ddRepo;
    private readonly bookingRepo;
    private readonly customerRepo;
    private readonly flatRepo;
    private readonly planRepo;
    private readonly logger;
    constructor(ddRepo: Repository<DemandDraft>, bookingRepo: Repository<Booking>, customerRepo: Repository<Customer>, flatRepo: Repository<Flat>, planRepo: Repository<FlatPaymentPlan>);
    list(filter: CollectionsListFilter): Promise<{
        rows: CollectionsRow[];
        total: number;
    }>;
    stats(filter?: Pick<CollectionsListFilter, 'propertyId'>): Promise<CollectionsStats>;
    detail(id: string): Promise<{
        row: CollectionsRow;
        thread: CollectionsRow[];
        timeline: Array<{
            at: Date;
            kind: string;
            label: string;
            detail?: string;
            demandDraftId?: string;
        }>;
    }>;
    pauseReminders(id: string, days: number, scope?: 'plan' | 'customer', note?: string): Promise<{
        pausedUntil: Date;
        scope: string;
    }>;
    recordContact(id: string, input: {
        channel: 'phone' | 'email' | 'sms' | 'visit' | 'other';
        note: string;
        by?: string | null;
    }): Promise<void>;
    bulkPause(ids: string[], days: number, scope: 'plan' | 'customer', note?: string): Promise<{
        ok: string[];
        failed: Array<{
            id: string;
            reason: string;
        }>;
    }>;
    pauseCustomer(customerId: string, days: number, note?: string): Promise<{
        pausedUntil: Date;
        affectedDds: number;
    }>;
    bulkRecordContact(ids: string[], input: {
        channel: 'phone' | 'email' | 'sms' | 'visit' | 'other';
        note: string;
        by?: string | null;
    }): Promise<{
        ok: string[];
        failed: Array<{
            id: string;
            reason: string;
        }>;
    }>;
    assignRows(ids: string[], assigneeId: string | null, assignedBy: string | null): Promise<{
        updated: number;
    }>;
    listAssignees(filter?: Pick<CollectionsListFilter, 'propertyId'>): Promise<CollectorSummary[]>;
    private listByIds;
    private hydrateRow;
    private classifyTier;
}
