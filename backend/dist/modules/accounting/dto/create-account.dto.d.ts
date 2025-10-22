import { AccountType } from '../entities/account.entity';
export declare class CreateAccountDto {
    accountCode: string;
    accountName: string;
    accountType: AccountType;
    accountCategory: string;
    parentAccountId?: string;
    isActive?: boolean;
    openingBalance?: number;
    description?: string;
}
export declare class UpdateAccountDto {
    accountName?: string;
    accountCategory?: string;
    isActive?: boolean;
    description?: string;
}
