import { BankAccount } from './bank-account.entity';
export declare class BankStatement {
    id: string;
    bankAccountId: string;
    bankAccount: BankAccount;
    statementDate: Date;
    transactionDate: Date;
    transactionId: string;
    description: string;
    referenceNumber: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
    transactionType: string;
    isReconciled: boolean;
    reconciledWithEntryId: string;
    reconciledDate: Date;
    uploadedFile: string;
    createdAt: Date;
}
