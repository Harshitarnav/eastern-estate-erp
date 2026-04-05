import { Property } from '../../properties/entities/property.entity';
export declare class BankAccount {
    id: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
    accountType: string;
    openingBalance: number;
    currentBalance: number;
    isActive: boolean;
    description: string;
    propertyId: string | null;
    property: Property;
    createdAt: Date;
    updatedAt: Date;
}
