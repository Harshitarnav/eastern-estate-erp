import { JournalEntry } from './journal-entry.entity';
import { Account } from './account.entity';
export declare class JournalEntryLine {
    id: string;
    journalEntryId: string;
    journalEntry: JournalEntry;
    accountId: string;
    account: Account;
    debitAmount: number;
    creditAmount: number;
    description: string;
    createdAt: Date;
}
