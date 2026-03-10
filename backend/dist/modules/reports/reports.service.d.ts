import { Repository } from 'typeorm';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';
import { Payment } from '../payments/entities/payment.entity';
export interface OutstandingRow {
    planId: string;
    bookingId: string;
    bookingNumber: string;
    property: string;
    tower: string;
    flatNumber: string;
    flatType: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    totalDemanded: number;
    totalPaid: number;
    outstanding: number;
    overdueMilestones: number;
    oldestOverdueDays: number | null;
    planStatus: string;
}
export interface OutstandingReportResult {
    rows: OutstandingRow[];
    summary: {
        totalUnits: number;
        totalAgreementValue: number;
        totalDemanded: number;
        totalPaid: number;
        totalOutstanding: number;
        unitsWithOverdue: number;
    };
}
export interface CollectionRow {
    paymentId: string;
    paymentCode: string;
    paymentDate: string;
    property: string;
    tower: string;
    flatNumber: string;
    customerName: string;
    customerPhone: string;
    bookingNumber: string;
    amount: number;
    paymentMethod: string;
    paymentType: string;
    status: string;
    receiptNumber: string;
    reference: string;
}
export interface CollectionReportResult {
    rows: CollectionRow[];
    summary: {
        totalPayments: number;
        totalAmount: number;
        byMethod: Record<string, number>;
        byStatus: Record<string, number>;
    };
}
export declare class ReportsService {
    private readonly planRepo;
    private readonly paymentRepo;
    constructor(planRepo: Repository<FlatPaymentPlan>, paymentRepo: Repository<Payment>);
    getOutstandingReport(filters: {
        propertyId?: string;
        towerId?: string;
        status?: string;
    }): Promise<OutstandingReportResult>;
    getCollectionReport(filters: {
        propertyId?: string;
        towerId?: string;
        startDate?: string;
        endDate?: string;
        paymentMethod?: string;
    }): Promise<CollectionReportResult>;
}
