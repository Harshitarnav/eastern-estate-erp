import { Repository } from 'typeorm';
import { Budget, BudgetStatus } from './entities/budget.entity';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/create-budget.dto';
export declare class BudgetsService {
    private budgetsRepository;
    constructor(budgetsRepository: Repository<Budget>);
    private generateBudgetCode;
    create(createBudgetDto: CreateBudgetDto, userId: string): Promise<Budget>;
    findAll(filters?: {
        fiscalYear?: number;
        status?: BudgetStatus;
        accountId?: string;
    }): Promise<Budget[]>;
    findOne(id: string): Promise<Budget>;
    update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget>;
    remove(id: string): Promise<void>;
    getBudgetVarianceReport(fiscalYear?: number): Promise<{
        budgets: Budget[];
        totalBudgeted: number;
        totalActual: number;
        totalVariance: number;
        overBudgetCount: number;
        underBudgetCount: number;
    }>;
}
