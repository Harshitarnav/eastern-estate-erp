import { Repository } from 'typeorm';
import { Expense, ExpenseStatus } from './entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto, ApproveExpenseDto, RejectExpenseDto } from './dto/create-expense.dto';
export declare class ExpensesService {
    private expensesRepository;
    constructor(expensesRepository: Repository<Expense>);
    private generateExpenseCode;
    create(createExpenseDto: CreateExpenseDto, userId: string): Promise<Expense>;
    findAll(filters?: {
        expenseCategory?: string;
        status?: ExpenseStatus;
        startDate?: Date;
        endDate?: Date;
        vendorId?: string;
        employeeId?: string;
    }): Promise<Expense[]>;
    findOne(id: string): Promise<Expense>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense>;
    approve(id: string, userId: string, approveDto?: ApproveExpenseDto): Promise<Expense>;
    reject(id: string, userId: string, rejectDto: RejectExpenseDto): Promise<Expense>;
    markAsPaid(id: string): Promise<Expense>;
    remove(id: string): Promise<void>;
    getExpensesSummary(filters?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
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
}
