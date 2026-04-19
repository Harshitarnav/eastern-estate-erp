import { DataSource, Repository } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';
import { Payment } from '../entities/payment.entity';
import { DemandDraft } from '../../demand-drafts/entities/demand-draft.entity';
import { SettingsService } from '../../settings/settings.service';
import { AccountingIntegrationService } from '../../accounting/accounting-integration.service';
export interface LegacyCustomerInput {
    rowId: string;
    existingCustomerId?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    panNumber?: string;
    aadharNumber?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    notes?: string;
}
export interface LegacyBookingInput {
    rowId: string;
    customerRowId?: string;
    existingCustomerId?: string;
    flatId: string;
    bookingNumber?: string;
    bookingDate: string;
    totalAmount: number;
    tokenAmount?: number;
    isLegacyImport?: boolean;
    initialEscalationLevel?: 0 | 1 | 2 | 3;
    remindersEnabled?: boolean;
}
export interface LegacyMilestoneInput {
    bookingRowId: string;
    sequence: number;
    name: string;
    description?: string;
    amount: number;
    paymentPercentage?: number;
    dueDate?: string;
    constructionPhase?: string;
    phasePercentage?: number;
    status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'TRIGGERED';
}
export interface LegacyPaymentInput {
    bookingRowId: string;
    milestoneSequence?: number;
    amount: number;
    paymentDate: string;
    paymentMode: string;
    referenceNumber?: string;
    notes?: string;
}
export interface LegacyImportPayload {
    importBatchId?: string;
    customers: LegacyCustomerInput[];
    bookings: LegacyBookingInput[];
    milestones: LegacyMilestoneInput[];
    payments?: LegacyPaymentInput[];
}
export interface LegacyImportPreview {
    importBatchId: string;
    summary: {
        customers: number;
        existingCustomersReferenced: number;
        bookings: number;
        milestones: number;
        payments: number;
        estimatedOverdueMilestones: number;
    };
    errors: string[];
    warnings: string[];
}
export interface LegacyImportResult {
    importBatchId: string;
    created: {
        customers: number;
        bookings: number;
        plans: number;
        milestones: number;
        payments: number;
        demandDrafts: number;
    };
    errors: string[];
}
export declare class LegacyImportService {
    private readonly customerRepo;
    private readonly bookingRepo;
    private readonly flatRepo;
    private readonly planRepo;
    private readonly paymentRepo;
    private readonly ddRepo;
    private readonly settingsService;
    private readonly accountingIntegration;
    private readonly dataSource;
    private readonly logger;
    constructor(customerRepo: Repository<Customer>, bookingRepo: Repository<Booking>, flatRepo: Repository<Flat>, planRepo: Repository<FlatPaymentPlan>, paymentRepo: Repository<Payment>, ddRepo: Repository<DemandDraft>, settingsService: SettingsService, accountingIntegration: AccountingIntegrationService, dataSource: DataSource);
    preview(payload: LegacyImportPayload): Promise<LegacyImportPreview>;
    commit(payload: LegacyImportPayload, actorUserId: string | null): Promise<LegacyImportResult>;
    private daysBetween;
    private nextCustomerCode;
}
