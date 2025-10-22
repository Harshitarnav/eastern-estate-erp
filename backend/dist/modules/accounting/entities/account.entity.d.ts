export declare enum AccountType {
    ASSET = "ASSET",
    LIABILITY = "LIABILITY",
    EQUITY = "EQUITY",
    INCOME = "INCOME",
    EXPENSE = "EXPENSE"
}
export declare class Account {
    id: string;
    accountCode: string;
    accountName: string;
    accountType: AccountType;
    accountCategory: string;
    parentAccountId: string;
    parentAccount: Account;
    childAccounts: Account[];
    isActive: boolean;
    openingBalance: number;
    currentBalance: number;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
