import { BudgetStatus } from '../entities/budget.entity';
export declare class CreateBudgetDto {
    budgetCode?: string;
    budgetName: string;
    fiscalYear: number;
    startDate: string;
    endDate: string;
    accountId?: string;
    department?: string;
    budgetedAmount: number;
    status?: BudgetStatus;
    notes?: string;
}
export declare class UpdateBudgetDto {
    budgetName?: string;
    startDate?: string;
    endDate?: string;
    budgetedAmount?: number;
    status?: BudgetStatus;
    notes?: string;
}
