import { BankStatementsService } from './bank-statements.service';
export declare class BankStatementsController {
    private readonly service;
    constructor(service: BankStatementsService);
    findAll(bankAccountId: string): Promise<import("./entities/bank-statement.entity").BankStatement[]>;
    findUnreconciled(bankAccountId: string): Promise<import("./entities/bank-statement.entity").BankStatement[]>;
    upload(file: Express.Multer.File, bankAccountId: string): Promise<{
        inserted: number;
        skipped: number;
    }>;
    reconcile(id: string, journalEntryId: string): Promise<import("./entities/bank-statement.entity").BankStatement>;
    unreconcile(id: string): Promise<import("./entities/bank-statement.entity").BankStatement>;
}
