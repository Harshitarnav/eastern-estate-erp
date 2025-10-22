import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseStatus } from './entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto, ApproveExpenseDto, RejectExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
  ) {}

  private generateExpenseCode(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `EXP${dateStr}${random}`;
  }

  async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<Expense> {
    const expenseCode = createExpenseDto.expenseCode || this.generateExpenseCode();

    const expense = this.expensesRepository.create({
      ...createExpenseDto,
      expenseCode,
      createdBy: userId,
    });

    return await this.expensesRepository.save(expense);
  }

  async findAll(filters?: {
    expenseCategory?: string;
    status?: ExpenseStatus;
    startDate?: Date;
    endDate?: Date;
    vendorId?: string;
    employeeId?: string;
  }): Promise<Expense[]> {
    const query = this.expensesRepository.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.account', 'account')
      .leftJoinAndSelect('expense.employee', 'employee')
      .leftJoinAndSelect('expense.property', 'property');

    if (filters?.expenseCategory) {
      query.andWhere('expense.expenseCategory = :category', {
        category: filters.expenseCategory,
      });
    }

    if (filters?.status) {
      query.andWhere('expense.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('expense.expenseDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('expense.expenseDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.vendorId) {
      query.andWhere('expense.vendorId = :vendorId', {
        vendorId: filters.vendorId,
      });
    }

    if (filters?.employeeId) {
      query.andWhere('expense.employeeId = :employeeId', {
        employeeId: filters.employeeId,
      });
    }

    query.orderBy('expense.expenseDate', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ['account', 'employee', 'property', 'creator', 'approver'],
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);

    if (expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID) {
      throw new BadRequestException('Cannot update approved or paid expenses');
    }

    Object.assign(expense, updateExpenseDto);

    return await this.expensesRepository.save(expense);
  }

  async approve(id: string, userId: string, approveDto?: ApproveExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BadRequestException('Only pending expenses can be approved');
    }

    expense.status = ExpenseStatus.APPROVED;
    expense.approvedBy = userId;
    expense.approvedAt = new Date();

    // Here you could create a journal entry automatically
    // expense.journalEntryId = await this.createJournalEntry(expense);

    return await this.expensesRepository.save(expense);
  }

  async reject(id: string, userId: string, rejectDto: RejectExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BadRequestException('Only pending expenses can be rejected');
    }

    expense.status = ExpenseStatus.REJECTED;
    expense.approvedBy = userId;
    expense.approvedAt = new Date();
    expense.rejectionReason = rejectDto.rejectionReason;

    return await this.expensesRepository.save(expense);
  }

  async markAsPaid(id: string): Promise<Expense> {
    const expense = await this.findOne(id);

    if (expense.status !== ExpenseStatus.APPROVED) {
      throw new BadRequestException('Only approved expenses can be marked as paid');
    }

    expense.status = ExpenseStatus.PAID;
    expense.paymentStatus = 'PAID';

    return await this.expensesRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);

    if (expense.status === ExpenseStatus.PAID) {
      throw new BadRequestException('Cannot delete paid expenses');
    }

    await this.expensesRepository.remove(expense);
  }

  async getExpensesSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalExpenses: number;
    byCategory: { category: string; total: number }[];
    byStatus: { status: string; total: number }[];
  }> {
    const query = this.expensesRepository.createQueryBuilder('expense');

    if (filters?.startDate) {
      query.andWhere('expense.expenseDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('expense.expenseDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const expenses = await query.getMany();

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const byCategory = Object.values(
      expenses.reduce((acc, exp) => {
        const cat = exp.expenseCategory;
        if (!acc[cat]) {
          acc[cat] = { category: cat, total: 0 };
        }
        acc[cat].total += Number(exp.amount);
        return acc;
      }, {} as Record<string, { category: string; total: number }>),
    );

    const byStatus = Object.values(
      expenses.reduce((acc, exp) => {
        const status = exp.status;
        if (!acc[status]) {
          acc[status] = { status, total: 0 };
        }
        acc[status].total += Number(exp.amount);
        return acc;
      }, {} as Record<string, { status: string; total: number }>),
    );

    return {
      totalExpenses,
      byCategory,
      byStatus,
    };
  }
}
