import { User } from '../../users/entities/user.entity';
import { JournalEntryLine } from './journal-entry-line.entity';
export declare enum JournalEntryStatus {
    DRAFT = "DRAFT",
    POSTED = "POSTED",
    APPROVED = "APPROVED",
    VOID = "VOID"
}
export declare class JournalEntry {
    id: string;
    entryNumber: string;
    entryDate: Date;
    referenceType: string;
    referenceId: string;
    description: string;
    totalDebit: number;
    totalCredit: number;
    status: JournalEntryStatus;
    createdBy: string;
    creator: User;
    approvedBy: string;
    approver: User;
    approvedAt: Date;
    voidedBy: string;
    voider: User;
    voidedAt: Date;
    voidReason: string;
    lines: JournalEntryLine[];
    createdAt: Date;
    updatedAt: Date;
}
