import { JournalEntryStatus } from '../entities/journal-entry.entity';
export declare class JournalEntryLineDto {
    accountId: string;
    debitAmount: number;
    creditAmount: number;
    description?: string;
}
export declare class CreateJournalEntryDto {
    entryNumber?: string;
    entryDate: string;
    referenceType?: string;
    referenceId?: string;
    description: string;
    lines: JournalEntryLineDto[];
    status?: JournalEntryStatus;
}
export declare class UpdateJournalEntryDto {
    entryDate?: string;
    description?: string;
    status?: JournalEntryStatus;
}
export declare class VoidJournalEntryDto {
    voidReason: string;
}
