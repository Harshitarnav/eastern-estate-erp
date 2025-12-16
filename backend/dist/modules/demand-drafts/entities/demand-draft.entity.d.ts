export declare enum DemandDraftStatus {
    DRAFT = "DRAFT",
    READY = "READY",
    SENT = "SENT",
    FAILED = "FAILED"
}
export declare class DemandDraft {
    id: string;
    flatId: string | null;
    customerId: string | null;
    bookingId: string | null;
    milestoneId: string | null;
    amount: number;
    status: DemandDraftStatus;
    fileUrl: string | null;
    content: string | null;
    metadata: any;
    generatedAt: Date | null;
    sentAt: Date | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
