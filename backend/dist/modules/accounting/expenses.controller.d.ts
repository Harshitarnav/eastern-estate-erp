import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, ApproveExpenseDto, RejectExpenseDto } from './dto/create-expense.dto';
import { ExpenseStatus } from './entities/expense.entity';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto, req: any): Promise<import("./entities/expense.entity").Expense>;
    findAll(category?: string, status?: ExpenseStatus, startDate?: string, endDate?: string): Promise<import("./entities/expense.entity").Expense[]>;
    getSummary(startDate?: string, endDate?: string): Promise<{
        totalExpenses: number;
        byCategory: {
            category: string;
            total: number;
        }[];
        byStatus: {
            status: string;
            total: number;
        }[];
    }>;
    findOne(id: string): Promise<import("./entities/expense.entity").Expense>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<import("./entities/expense.entity").Expense>;
    approve(id: string, approveDto: ApproveExpenseDto, req: any): Promise<import("./entities/expense.entity").Expense>;
    reject(id: string, rejectDto: RejectExpenseDto, req: any): Promise<import("./entities/expense.entity").Expense>;
    markAsPaid(id: string): Promise<import("./entities/expense.entity").Expense>;
    remove(id: string): Promise<void>;
}
