import { JournalEntry } from './journal-entry.entity';
import { Account } from './account.entity';
export declare class JournalEntryLine {
    id: string;
    journalEntryId: string;
    journalEntry: JournalEntry;
    lineNumber: number;
    accountId: string;
    account: Account;
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    description: string;
    costCenter: string;
    projectId: string;
    gstAmount: number;
    tdsAmount: number;
    createdAt: Date;
}
