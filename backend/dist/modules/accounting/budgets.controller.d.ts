import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/create-budget.dto';
import { BudgetStatus } from './entities/budget.entity';
export declare class BudgetsController {
    private readonly budgetsService;
    constructor(budgetsService: BudgetsService);
    create(createBudgetDto: CreateBudgetDto, req: any): Promise<import("./entities/budget.entity").Budget>;
    findAll(fiscalYear?: string, status?: BudgetStatus): Promise<import("./entities/budget.entity").Budget[]>;
    getVarianceReport(fiscalYear?: string): Promise<{
        budgets: import("./entities/budget.entity").Budget[];
        totalBudgeted: number;
        totalActual: number;
        totalVariance: number;
        overBudgetCount: number;
        underBudgetCount: number;
    }>;
    findOne(id: string): Promise<import("./entities/budget.entity").Budget>;
    update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<import("./entities/budget.entity").Budget>;
    remove(id: string): Promise<void>;
}
