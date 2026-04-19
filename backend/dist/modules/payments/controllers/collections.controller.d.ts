import { Request } from 'express';
import { CollectionsService } from '../services/collections.service';
import { OverdueScannerService } from '../services/overdue-scanner.service';
import { DemandDraftsService } from '../../demand-drafts/demand-drafts.service';
import { AutoDemandDraftService } from '../../construction/services/auto-demand-draft.service';
import { PaymentsService } from '../payments.service';
export declare class CollectionsController {
    private readonly collections;
    private readonly scanner;
    private readonly demandDrafts;
    private readonly autoDemandDrafts;
    private readonly payments;
    constructor(collections: CollectionsService, scanner: OverdueScannerService, demandDrafts: DemandDraftsService, autoDemandDrafts: AutoDemandDraftService, payments: PaymentsService);
    list(query: any, req: Request): Promise<{
        rows: import("../services/collections.service").CollectionsRow[];
        total: number;
    }>;
    stats(propertyId?: string): Promise<import("../services/collections.service").CollectionsStats>;
    assignees(propertyId?: string): Promise<import("../services/collections.service").CollectorSummary[]>;
    detail(id: string): Promise<{
        row: import("../services/collections.service").CollectionsRow;
        thread: import("../services/collections.service").CollectionsRow[];
        timeline: Array<{
            at: Date;
            kind: string;
            label: string;
            detail?: string;
            demandDraftId?: string;
        }>;
    }>;
    pause(id: string, body: {
        days?: number;
        scope?: 'plan' | 'customer';
        note?: string;
    }): Promise<{
        pausedUntil: Date;
        scope: string;
    }>;
    recordPayment(id: string, body: {
        amount?: number;
        paymentMethod?: string;
        paymentDate?: string;
        transactionReference?: string;
        chequeNumber?: string;
        bankName?: string;
        notes?: string;
    }, req: Request): Promise<{
        ok: boolean;
        paymentId: string;
        paymentCode: string;
        amount: number;
        status: string;
        demandDraftId: string;
    }>;
    contact(id: string, body: {
        channel: 'phone' | 'email' | 'sms' | 'visit' | 'other';
        note: string;
    }, req: Request): Promise<{
        ok: boolean;
    }>;
    sendWarning(id: string, req: Request): Promise<import("../../demand-drafts/entities/demand-draft.entity").DemandDraft>;
    scanNow(): Promise<import("../services/overdue-scanner.service").ScanStats>;
    bulkPause(body: {
        ids: string[];
        days?: number;
        scope?: 'plan' | 'customer';
        note?: string;
    }): Promise<{
        ok: string[];
        failed: Array<{
            id: string;
            reason: string;
        }>;
    }>;
    pauseCustomer(customerId: string, body: {
        days?: number;
        note?: string;
    }): Promise<{
        pausedUntil: Date;
        affectedDds: number;
    }>;
    bulkAssign(body: {
        ids: string[];
        assigneeId: string | null;
    }, req: Request): Promise<{
        updated: number;
    }>;
    bulkContact(body: {
        ids: string[];
        channel: 'phone' | 'email' | 'sms' | 'visit' | 'other';
        note: string;
    }, req: Request): Promise<{
        ok: string[];
        failed: Array<{
            id: string;
            reason: string;
        }>;
    }>;
    bulkSend(body: {
        ids: string[];
    }, req: Request): Promise<{
        sent: string[];
        skipped: {
            id: string;
            reason: string;
        }[];
        failed: {
            id: string;
            reason: string;
        }[];
    }>;
}
