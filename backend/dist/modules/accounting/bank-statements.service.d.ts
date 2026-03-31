import { Repository } from 'typeorm';
import { BankStatement } from './entities/bank-statement.entity';
import { BankAccount } from './entities/bank-account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
export declare class BankStatementsService {
    private readonly statementsRepo;
    private readonly bankAccountsRepo;
    private readonly journalEntriesRepo;
    constructor(statementsRepo: Repository<BankStatement>, bankAccountsRepo: Repository<BankAccount>, journalEntriesRepo: Repository<JournalEntry>);
    findAll(bankAccountId: string): Promise<BankStatement[]>;
    findUnreconciled(bankAccountId: string): Promise<BankStatement[]>;
    uploadStatement(bankAccountId: string, fileBuffer: Buffer, originalName: string): Promise<{
        inserted: number;
        skipped: number;
    }>;
    reconcile(statementId: string, journalEntryId: string): Promise<BankStatement>;
    unreconcile(statementId: string): Promise<BankStatement>;
}
