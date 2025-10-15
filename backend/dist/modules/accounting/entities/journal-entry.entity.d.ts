import { Property } from '../../properties/entities/property.entity';
export declare enum JournalEntryType {
    MANUAL = "Manual",
    AUTOMATIC = "Automatic",
    ADJUSTMENT = "Adjustment",
    CLOSING = "Closing"
}
export declare enum JournalEntryStatus {
    DRAFT = "Draft",
    POSTED = "Posted",
    REVERSED = "Reversed"
}
export declare class JournalEntry {
    id: string;
    entryNumber: string;
    entryDate: Date;
    entryType: JournalEntryType;
    referenceType: string;
    referenceId: string;
    narration: string;
    totalDebit: number;
    totalCredit: number;
    status: JournalEntryStatus;
    createdBy: string;
    approvedBy: string;
    approvedAt: Date;
    propertyId: string;
    property: Property;
    financialYear: string;
    period: string;
    attachments: any;
    createdAt: Date;
    updatedAt: Date;
}
