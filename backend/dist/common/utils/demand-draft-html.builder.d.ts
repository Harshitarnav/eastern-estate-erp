export interface DemandDraftHtmlData {
    refNumber: string;
    dateIssued: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    propertyName: string;
    towerName?: string;
    flatNumber: string;
    bookingNumber?: string;
    milestoneSeq: number | string;
    milestoneName: string;
    milestoneDescription?: string;
    constructionPhase?: string;
    phasePercentage?: number;
    amount: string;
    dueDate: string;
    totalAmount?: string;
    paidAmount?: string;
    balanceAfterPayment?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branch?: string;
}
export declare function buildDemandDraftHtml(d: DemandDraftHtmlData): string;
