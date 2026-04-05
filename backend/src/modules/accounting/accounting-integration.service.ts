/**
 * AccountingIntegrationService
 *
 * Provides auto Journal Entry creation for other modules:
 *  - Payment received  → Debit Bank/Cash, Credit Sales Revenue
 *  - Expense paid      → Debit Expense Account, Credit Bank/Cash
 *  - Salary paid       → Debit Salary Expense, Credit Bank/Cash
 *
 * Usage: Import AccountingModule in the consuming module, then inject this service.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { JournalEntry, JournalEntryStatus } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';

interface AutoJEOptions {
  date: Date;
  description: string;
  referenceType: string;
  referenceId: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  createdBy?: string;
  propertyId?: string | null;
}

@Injectable()
export class AccountingIntegrationService {
  private readonly logger = new Logger(AccountingIntegrationService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountsRepo: Repository<Account>,
    @InjectRepository(JournalEntry)
    private readonly jeRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private readonly jelRepo: Repository<JournalEntryLine>,
  ) {}

  // ─── Smart account lookup ─────────────────────────────────────────────────
  // Each finder tries project-scoped accounts first, then falls back to company-wide (NULL propertyId)

  /** Find the best Cash or Bank account to use as default debit/credit side */
  async findCashOrBankAccount(propertyId?: string | null): Promise<Account | null> {
    const scopeFilters = this.buildScopeFilters(propertyId);
    for (const scope of scopeFilters) {
      const found = await this.accountsRepo.findOne({
        where: [
          { ...scope, accountType: AccountType.ASSET, isActive: true, accountName: ILike('%bank%') },
          { ...scope, accountType: AccountType.ASSET, isActive: true, accountName: ILike('%cash%') },
        ],
        order: { accountCode: 'ASC' },
      });
      if (found) return found;
      // Try any ASSET in this scope
      const fallback = await this.accountsRepo.findOne({
        where: { ...scope, accountType: AccountType.ASSET, isActive: true },
        order: { accountCode: 'ASC' },
      });
      if (fallback) return fallback;
    }
    return null;
  }

  /** Find a Sales Revenue / Income account */
  async findSalesRevenueAccount(propertyId?: string | null): Promise<Account | null> {
    const scopeFilters = this.buildScopeFilters(propertyId);
    for (const scope of scopeFilters) {
      const found = await this.accountsRepo.findOne({
        where: [
          { ...scope, accountType: AccountType.INCOME, isActive: true, accountName: ILike('%sales%') },
          { ...scope, accountType: AccountType.INCOME, isActive: true, accountName: ILike('%revenue%') },
          { ...scope, accountType: AccountType.INCOME, isActive: true, accountName: ILike('%income%') },
        ],
        order: { accountCode: 'ASC' },
      });
      if (found) return found;
      const fallback = await this.accountsRepo.findOne({
        where: { ...scope, accountType: AccountType.INCOME, isActive: true },
        order: { accountCode: 'ASC' },
      });
      if (fallback) return fallback;
    }
    return null;
  }

  /** Find a Salary Expense account */
  async findSalaryExpenseAccount(propertyId?: string | null): Promise<Account | null> {
    const scopeFilters = this.buildScopeFilters(propertyId);
    for (const scope of scopeFilters) {
      const found = await this.accountsRepo.findOne({
        where: [
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%salary%') },
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%payroll%') },
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%wages%') },
        ],
        order: { accountCode: 'ASC' },
      });
      if (found) return found;
      const fallback = await this.accountsRepo.findOne({
        where: { ...scope, accountType: AccountType.EXPENSE, isActive: true },
        order: { accountCode: 'ASC' },
      });
      if (fallback) return fallback;
    }
    return null;
  }

  /** Find an Expense account by ID, falling back to any expense account */
  async findExpenseAccount(accountId?: string, propertyId?: string | null): Promise<Account | null> {
    if (accountId) {
      const acc = await this.accountsRepo.findOne({ where: { id: accountId, isActive: true } });
      if (acc) return acc;
    }
    const scopeFilters = this.buildScopeFilters(propertyId);
    for (const scope of scopeFilters) {
      const found = await this.accountsRepo.findOne({
        where: { ...scope, accountType: AccountType.EXPENSE, isActive: true },
        order: { accountCode: 'ASC' },
      });
      if (found) return found;
    }
    return null;
  }

  /**
   * Build scope filters for account lookup.
   * Returns [project-scope, company-scope] if propertyId provided,
   * or just [company-scope] if not.
   */
  private buildScopeFilters(propertyId?: string | null): Array<{ propertyId?: string | null }> {
    if (propertyId) {
      return [{ propertyId }, { propertyId: null as any }];
    }
    return [{}]; // no filter = any account
  }

  // ─── Generate journal entry number ───────────────────────────────────────

  private async generateEntryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `JE${year}`;
    const result = await this.jeRepo
      .createQueryBuilder('je')
      .select('MAX(je.entryNumber)', 'max')
      .where('je.entryNumber LIKE :prefix', { prefix: `${prefix}%` })
      .getRawOne();
    let nextNum = 1;
    if (result?.max) {
      const lastNum = parseInt(String(result.max).replace(prefix, ''), 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }
    return `${prefix}${String(nextNum).padStart(5, '0')}`;
  }

  // ─── Core auto-JE creator ─────────────────────────────────────────────────

  async createAutoJE(opts: AutoJEOptions): Promise<JournalEntry | null> {
    const amount = Math.round(Number(opts.amount) * 100) / 100;
    if (!amount || amount <= 0) return null;

    try {
      const entryNumber = await this.generateEntryNumber();

      const je = this.jeRepo.create({
        entryNumber,
        entryDate: opts.date,
        description: opts.description,
        referenceType: opts.referenceType,
        referenceId: opts.referenceId,
        status: JournalEntryStatus.POSTED, // Auto-created JEs are posted immediately
        totalDebit: amount,
        totalCredit: amount,
        createdBy: opts.createdBy,
        approvedBy: opts.createdBy,
        approvedAt: new Date(),
        propertyId: opts.propertyId ?? null,
      });

      const savedJE = await this.jeRepo.save(je) as JournalEntry;

      // Debit line
      const debitLine = this.jelRepo.create({
        journalEntryId: savedJE.id,
        accountId: opts.debitAccountId,
        debitAmount: amount,
        creditAmount: 0,
        description: opts.description,
      });

      // Credit line
      const creditLine = this.jelRepo.create({
        journalEntryId: savedJE.id,
        accountId: opts.creditAccountId,
        debitAmount: 0,
        creditAmount: amount,
        description: opts.description,
      });

      await this.jelRepo.save([debitLine, creditLine]);

      // Update account balances
      await this.updateBalance(opts.debitAccountId, amount, 0);
      await this.updateBalance(opts.creditAccountId, 0, amount);

      this.logger.log(
        `Auto JE created: ${entryNumber} | ${opts.referenceType} ${opts.referenceId} | ₹${amount}`,
      );

      return savedJE;
    } catch (err) {
      this.logger.error(`Failed to create auto JE for ${opts.referenceType} ${opts.referenceId}: ${err.message}`);
      return null; // Never block the triggering operation
    }
  }

  private async updateBalance(accountId: string, debit: number, credit: number): Promise<void> {
    const account = await this.accountsRepo.findOne({ where: { id: accountId } });
    if (!account) return;

    const isDebitType = account.accountType === AccountType.ASSET || account.accountType === AccountType.EXPENSE;
    const current = Math.round(Number(account.currentBalance) * 100) / 100;

    account.currentBalance = isDebitType
      ? Math.round((current + debit - credit) * 100) / 100
      : Math.round((current + credit - debit) * 100) / 100;

    await this.accountsRepo.save(account);
  }

  // ─── Public hooks ─────────────────────────────────────────────────────────

  /**
   * Call when a BOOKING PAYMENT is marked as COMPLETED.
   * Debit: Bank/Cash account
   * Credit: Sales Revenue account
   */
  async onPaymentCompleted(payment: {
    id: string;
    paymentCode: string;
    amount: number;
    paymentDate: Date;
    paymentMethod?: string;
    createdBy?: string;
    propertyId?: string | null;
  }): Promise<JournalEntry | null> {
    const [bankAccount, revenueAccount] = await Promise.all([
      this.findCashOrBankAccount(payment.propertyId),
      this.findSalesRevenueAccount(payment.propertyId),
    ]);

    if (!bankAccount || !revenueAccount) {
      this.logger.warn(
        `Auto JE skipped for payment ${payment.paymentCode}: missing Bank or Revenue account in Chart of Accounts`,
      );
      return null;
    }

    return this.createAutoJE({
      date: payment.paymentDate instanceof Date ? payment.paymentDate : new Date(payment.paymentDate),
      description: `Payment received — ${payment.paymentCode} via ${payment.paymentMethod || 'N/A'}`,
      referenceType: 'PAYMENT',
      referenceId: payment.id,
      debitAccountId: bankAccount.id,
      creditAccountId: revenueAccount.id,
      amount: payment.amount,
      createdBy: payment.createdBy,
      propertyId: payment.propertyId,
    });
  }

  /**
   * Call when an EXPENSE is marked as PAID.
   * Debit: Expense account (from expense.accountId or default)
   * Credit: Bank/Cash account
   */
  async onExpensePaid(expense: {
    id: string;
    expenseCode: string;
    amount: number;
    expenseDate: Date;
    description: string;
    accountId?: string;
    createdBy?: string;
    propertyId?: string | null;
  }): Promise<JournalEntry | null> {
    const [expenseAccount, bankAccount] = await Promise.all([
      this.findExpenseAccount(expense.accountId, expense.propertyId),
      this.findCashOrBankAccount(expense.propertyId),
    ]);

    if (!expenseAccount || !bankAccount) {
      this.logger.warn(
        `Auto JE skipped for expense ${expense.expenseCode}: missing Expense or Bank account`,
      );
      return null;
    }

    return this.createAutoJE({
      date: expense.expenseDate instanceof Date ? expense.expenseDate : new Date(expense.expenseDate),
      description: `Expense paid — ${expense.expenseCode}: ${expense.description}`,
      referenceType: 'EXPENSE',
      referenceId: expense.id,
      debitAccountId: expenseAccount.id,
      creditAccountId: bankAccount.id,
      amount: expense.amount,
      createdBy: expense.createdBy,
      propertyId: expense.propertyId,
    });
  }

  /** Find a Construction / Work-in-Progress expense account */
  async findConstructionExpenseAccount(propertyId?: string | null): Promise<Account | null> {
    const scopeFilters = this.buildScopeFilters(propertyId);
    for (const scope of scopeFilters) {
      const found = await this.accountsRepo.findOne({
        where: [
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%construction%') },
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%work in progress%') },
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%wip%') },
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%contractor%') },
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%civil%') },
        ],
        order: { accountCode: 'ASC' },
      });
      if (found) return found;
      const fallback = await this.accountsRepo.findOne({
        where: { ...scope, accountType: AccountType.EXPENSE, isActive: true },
        order: { accountCode: 'ASC' },
      });
      if (fallback) return fallback;
    }
    return null;
  }

  /** Find a Material Purchase expense account */
  async findMaterialPurchaseAccount(propertyId?: string | null): Promise<Account | null> {
    const scopeFilters = this.buildScopeFilters(propertyId);
    for (const scope of scopeFilters) {
      const found = await this.accountsRepo.findOne({
        where: [
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%material%') },
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%purchase%') },
          { ...scope, accountType: AccountType.EXPENSE, isActive: true, accountName: ILike('%procurement%') },
        ],
        order: { accountCode: 'ASC' },
      });
      if (found) return found;
    }
    return this.findConstructionExpenseAccount(propertyId);
  }

  /**
   * Call when an RA Bill is marked as PAID.
   * Debit:  Construction WIP / Work Expense account
   * Credit: Bank / Cash account
   */
  async onRABillPaid(bill: {
    id: string;
    raBillNumber: string;
    netPayable: number;
    paidAt: Date;
    vendorName?: string;
    projectName?: string;
    createdBy?: string;
    propertyId?: string | null;
  }): Promise<JournalEntry | null> {
    const [constructionAccount, bankAccount] = await Promise.all([
      this.findConstructionExpenseAccount(bill.propertyId),
      this.findCashOrBankAccount(bill.propertyId),
    ]);

    if (!constructionAccount || !bankAccount) {
      this.logger.warn(
        `Auto JE skipped for RA Bill ${bill.raBillNumber}: missing Construction Expense or Bank account in Chart of Accounts`,
      );
      return null;
    }

    const description = [
      `RA Bill paid — ${bill.raBillNumber}`,
      bill.vendorName ? `| Vendor: ${bill.vendorName}` : '',
      bill.projectName ? `| Project: ${bill.projectName}` : '',
    ].filter(Boolean).join(' ');

    return this.createAutoJE({
      date: bill.paidAt instanceof Date ? bill.paidAt : new Date(bill.paidAt),
      description,
      referenceType: 'RA_BILL',
      referenceId: bill.id,
      debitAccountId: constructionAccount.id,
      creditAccountId: bankAccount.id,
      amount: bill.netPayable,
      createdBy: bill.createdBy,
      propertyId: bill.propertyId,
    });
  }

  /**
   * Call when a VENDOR PAYMENT is recorded.
   * Debit:  Material Purchase / Expense account
   * Credit: Bank / Cash account
   */
  async onVendorPaymentRecorded(payment: {
    id: string;
    amount: number;
    paymentDate: Date;
    vendorName?: string;
    transactionReference?: string;
    createdBy?: string;
    propertyId?: string | null;
  }): Promise<JournalEntry | null> {
    const [materialAccount, bankAccount] = await Promise.all([
      this.findMaterialPurchaseAccount(payment.propertyId),
      this.findCashOrBankAccount(payment.propertyId),
    ]);

    if (!materialAccount || !bankAccount) {
      this.logger.warn(
        `Auto JE skipped for vendor payment ${payment.id}: missing Material Expense or Bank account in Chart of Accounts`,
      );
      return null;
    }

    const description = [
      `Vendor payment recorded`,
      payment.vendorName ? `— ${payment.vendorName}` : '',
      payment.transactionReference ? `| Ref: ${payment.transactionReference}` : '',
    ].filter(Boolean).join(' ');

    return this.createAutoJE({
      date: payment.paymentDate instanceof Date ? payment.paymentDate : new Date(payment.paymentDate),
      description,
      referenceType: 'VENDOR_PAYMENT',
      referenceId: payment.id,
      debitAccountId: materialAccount.id,
      creditAccountId: bankAccount.id,
      amount: payment.amount,
      createdBy: payment.createdBy,
      propertyId: payment.propertyId,
    });
  }

  /**
   * Call when a SALARY PAYMENT is marked as PAID.
   * Debit: Salary Expense account
   * Credit: Bank/Cash account
   */
  async onSalaryPaid(salary: {
    id: string;
    employeeName: string;
    netSalary: number;
    paymentDate: Date;
    paymentMonth: Date;
    createdBy?: string;
    propertyId?: string | null;
  }): Promise<JournalEntry | null> {
    const [salaryAccount, bankAccount] = await Promise.all([
      this.findSalaryExpenseAccount(salary.propertyId),
      this.findCashOrBankAccount(salary.propertyId),
    ]);

    if (!salaryAccount || !bankAccount) {
      this.logger.warn(
        `Auto JE skipped for salary ${salary.id}: missing Salary Expense or Bank account`,
      );
      return null;
    }

    const monthStr = new Date(salary.paymentMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    return this.createAutoJE({
      date: salary.paymentDate instanceof Date ? salary.paymentDate : new Date(salary.paymentDate),
      description: `Salary paid — ${salary.employeeName} for ${monthStr}`,
      referenceType: 'SALARY',
      referenceId: salary.id,
      debitAccountId: salaryAccount.id,
      creditAccountId: bankAccount.id,
      amount: salary.netSalary,
      createdBy: salary.createdBy,
      propertyId: salary.propertyId,
    });
  }
}
