import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseStatus } from './entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto, ApproveExpenseDto, RejectExpenseDto } from './dto/create-expense.dto';
import { AccountingIntegrationService } from './accounting-integration.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    private readonly accountingIntegrationService: AccountingIntegrationService,
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
    propertyId?: string;
    /** When set (non-global user), only expenses for these projects or untagged */
    accessiblePropertyIds?: string[] | null;
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

    if (filters?.propertyId) {
      query.andWhere('expense.propertyId = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    if (filters?.accessiblePropertyIds?.length) {
      query.andWhere(
        '(expense.propertyId IS NULL OR expense.propertyId IN (:...expAccIds))',
        { expAccIds: filters.accessiblePropertyIds },
      );
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

    if (expense.journalEntryId) {
      throw new BadRequestException(
        'This expense is posted to the books (journal entry linked). It cannot be edited. Contact an admin if a correction is required.',
      );
    }

    // Strip empty-string UUID fields - DB requires valid UUID or NULL
    const uuidFields = ['accountId', 'vendorId', 'employeeId', 'propertyId', 'constructionProjectId'] as const;
    const sanitized = { ...updateExpenseDto } as any;
    for (const field of uuidFields) {
      if (sanitized[field] === '') sanitized[field] = null;
    }

    Object.assign(expense, sanitized);

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

  async markAsPaid(id: string, userId?: string): Promise<Expense> {
    const expense = await this.findOne(id);

    if (expense.status !== ExpenseStatus.APPROVED) {
      throw new BadRequestException('Only approved expenses can be marked as paid');
    }

    expense.status = ExpenseStatus.PAID;
    expense.paymentStatus = 'PAID';

    const saved = await this.expensesRepository.save(expense);

    // Auto-create Journal Entry (best-effort)
    const je = await this.accountingIntegrationService.onExpensePaid({
      id: saved.id,
      expenseCode: saved.expenseCode,
      amount: Number(saved.amount),
      expenseDate: saved.expenseDate,
      description: saved.description,
      accountId: saved.accountId,
      createdBy: userId,
      propertyId: saved.propertyId ?? null,
    });

    // Link JE to the expense if created
    if (je) {
      await this.expensesRepository.update(saved.id, { journalEntryId: je.id });
      saved.journalEntryId = je.id;
    }

    return saved;
  }

  /**
   * Bulk import expenses parsed from an Excel file.
   *
   * Each row is minimally { expenseCategory, amount, expenseDate }.
   * All rows are created in PENDING status so the usual approval flow still applies.
   * Any row with missing required fields is returned in `errors` so the UI can show what to fix.
   */
  async bulkImport(
    rows: Array<{
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
    }>,
    userId: string,
    defaults?: { propertyId?: string | null },
  ): Promise<{
    created: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
    createdIds: string[];
  }> {
    if (!Array.isArray(rows) || !rows.length) {
      throw new BadRequestException('Provide at least one expense row to import.');
    }
    const errors: Array<{ row: number; message: string }> = [];
    const toCreate: Expense[] = [];

    rows.forEach((row, idx) => {
      const humanRow = idx + 2; // header row + 1-based
      const category = (row.expenseCategory || '').toString().trim();
      const amt = Number(row.amount);
      const dateStr = (row.expenseDate || '').toString().trim();
      if (!category) {
        errors.push({ row: humanRow, message: 'Missing expenseCategory' });
        return;
      }
      if (!amt || amt <= 0 || Number.isNaN(amt)) {
        errors.push({ row: humanRow, message: 'Invalid amount (must be > 0)' });
        return;
      }
      if (!dateStr) {
        errors.push({ row: humanRow, message: 'Missing expenseDate' });
        return;
      }
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) {
        errors.push({ row: humanRow, message: `Invalid expenseDate "${dateStr}"` });
        return;
      }

      toCreate.push(
        this.expensesRepository.create({
          expenseCode: this.generateExpenseCode(),
          expenseCategory: category,
          amount: amt,
          expenseDate: date,
          description: row.description?.toString().trim() || undefined,
          expenseType: row.expenseType?.toString().trim() || undefined,
          paymentMethod: row.paymentMethod?.toString().trim() || undefined,
          paymentReference: row.paymentReference?.toString().trim() || undefined,
          invoiceNumber: row.invoiceNumber?.toString().trim() || undefined,
          invoiceDate: row.invoiceDate ? new Date(row.invoiceDate) : undefined,
          propertyId: row.propertyId || defaults?.propertyId || undefined,
          vendorId: row.vendorId || undefined,
          employeeId: row.employeeId || undefined,
          accountId: row.accountId || undefined,
          status: ExpenseStatus.PENDING,
          createdBy: userId,
        } as Partial<Expense>),
      );
    });

    if (!toCreate.length) {
      return { created: 0, skipped: rows.length, errors, createdIds: [] };
    }
    const saved = await this.expensesRepository.save(toCreate);
    return {
      created: saved.length,
      skipped: rows.length - saved.length,
      errors,
      createdIds: saved.map((s) => s.id),
    };
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
    accessiblePropertyIds?: string[] | null;
    /** When set, restrict summary to this project (must be allowed by accessiblePropertyIds when that applies). */
    propertyId?: string;
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

    if (filters?.accessiblePropertyIds?.length) {
      query.andWhere(
        '(expense.propertyId IS NULL OR expense.propertyId IN (:...sumAccIds))',
        { sumAccIds: filters.accessiblePropertyIds },
      );
    }

    if (filters?.propertyId) {
      query.andWhere('expense.propertyId = :sumPropId', { sumPropId: filters.propertyId });
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
