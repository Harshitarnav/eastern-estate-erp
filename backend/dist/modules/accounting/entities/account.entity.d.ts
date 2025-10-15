export declare enum AccountType {
    ASSET = "Asset",
    LIABILITY = "Liability",
    EQUITY = "Equity",
    INCOME = "Income",
    EXPENSE = "Expense"
}
export declare class Account {
    id: string;
    accountCode: string;
    accountName: string;
    accountType: AccountType;
    parentAccountId: string;
    parentAccount: Account;
    childAccounts: Account[];
    level: number;
    isActive: boolean;
    openingBalance: number;
    currentBalance: number;
    gstApplicable: boolean;
    hsnCode: string;
    taxCategory: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
