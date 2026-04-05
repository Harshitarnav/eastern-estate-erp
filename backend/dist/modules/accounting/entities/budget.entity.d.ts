import { User } from '../../users/entities/user.entity';
import { Account } from './account.entity';
import { Property } from '../../properties/entities/property.entity';
export declare enum BudgetStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
    REVISED = "REVISED"
}
export declare class Budget {
    id: string;
    budgetName: string;
    budgetCode: string;
    fiscalYear: number;
    startDate: Date;
    endDate: Date;
    accountId: string;
    account: Account;
    department: string;
    budgetedAmount: number;
    actualAmount: number;
    status: BudgetStatus;
    notes: string;
    propertyId: string | null;
    property: Property;
    createdBy: string;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
}
