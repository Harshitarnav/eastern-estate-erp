import { Repository } from 'typeorm';
import { Expense, ExpenseStatus } from './entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto, ApproveExpenseDto, RejectExpenseDto } from './dto/create-expense.dto';
import { AccountingIntegrationService } from './accounting-integration.service';
export declare class ExpensesService {
    private expensesRepository;
    private readonly accountingIntegrationService;
    constructor(expensesRepository: Repository<Expense>, accountingIntegrationService: AccountingIntegrationService);
    private generateExpenseCode;
    create(createExpenseDto: CreateExpenseDto, userId: string): Promise<Expense>;
    findAll(filters?: {
        expenseCategory?: string;
        status?: ExpenseStatus;
        startDate?: Date;
        endDate?: Date;
        vendorId?: string;
        employeeId?: string;
        propertyId?: string;
        accessiblePropertyIds?: string[] | null;
    }): Promise<Expense[]>;
    findOne(id: string): Promise<Expense>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense>;
    approve(id: string, userId: string, approveDto?: ApproveExpenseDto): Promise<Expense>;
    reject(id: string, userId: string, rejectDto: RejectExpenseDto): Promise<Expense>;
    markAsPaid(id: string, userId?: string): Promise<Expense>;
    bulkImport(rows: Array<{
        expenseCategory?: string;
        amount?: number | string;
        expenseDate?: string;
        description?: string;
        expenseType?: string;
        paymentMethod?: string;
        paymentReference?: string;
        invoiceNumber?: string;
        invoiceDate?: string;
        propertyId?: string;
        vendorId?: string;
        employeeId?: string;
        accountId?: string;
    }>, userId: string, defaults?: {
        propertyId?: string | null;
    }): Promise<{
        created: number;
        skipped: number;
        errors: Array<{
            row: number;
            message: string;
        }>;
        createdIds: string[];
    }>;
    remove(id: string): Promise<void>;
    getExpensesSummary(filters?: {
        startDate?: Date;
        endDate?: Date;
        accessiblePropertyIds?: string[] | null;
        propertyId?: string;
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
