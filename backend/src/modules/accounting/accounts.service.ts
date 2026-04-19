import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { JournalEntryStatus } from './entities/journal-entry.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import type { AccountingReportScope } from './utils/accounting-scope.util';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(JournalEntryLine)
    private journalEntryLinesRepository: Repository<JournalEntryLine>,
    private dataSource: DataSource,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    // Duplicate check is scoped: same code is allowed in different projects but not within the same scope.
    // propertyId = undefined/null means "company-wide" scope.
    const scopedPropertyId = createAccountDto.propertyId || null;
    const existingAccount = await this.accountsRepository.findOne({
      where: {
        accountCode: createAccountDto.accountCode,
        isActive: true,
        propertyId: scopedPropertyId,
      } as any,
    });

    if (existingAccount) {
      const scope = scopedPropertyId ? 'this project' : 'the company-wide scope';
      throw new BadRequestException(
        `Account with code ${createAccountDto.accountCode} already exists in ${scope}`,
      );
    }

    // If parent account specified, verify it exists
    if (createAccountDto.parentAccountId) {
      const parentAccount = await this.accountsRepository.findOne({
        where: { id: createAccountDto.parentAccountId },
      });

      if (!parentAccount) {
        throw new NotFoundException(`Parent account not found`);
      }
    }

    const account = this.accountsRepository.create({
      ...createAccountDto,
      currentBalance: createAccountDto.openingBalance || 0, // Set current balance to opening balance
    });
    return await this.accountsRepository.save(account);
  }

  async findAll(
    filters?: {
      accountType?: AccountType;
      isActive?: boolean;
      parentAccountId?: string;
      propertyId?: string;
      /** When true with propertyId: only GL rows tagged to that project (excludes company-wide accounts). */
      projectOnlyCoa?: boolean;
    },
    scopePropertyIds?: string[] | null,
  ): Promise<Account[]> {
    const query = this.accountsRepository.createQueryBuilder('account')
      .leftJoinAndSelect('account.property', 'property');

    if (filters?.accountType) {
      query.andWhere('account.accountType = :accountType', {
        accountType: filters.accountType,
      });
    }

    // Default to showing only active accounts; caller can pass isActive=false to see deactivated ones
    const isActiveFilter = filters?.isActive !== undefined ? filters.isActive : true;
    query.andWhere('account.isActive = :isActive', { isActive: isActiveFilter });

    if (filters?.parentAccountId) {
      query.andWhere('account.parentAccountId = :parentAccountId', {
        parentAccountId: filters.parentAccountId,
      });
    }

    if (filters?.propertyId) {
      if (filters.projectOnlyCoa) {
        query.andWhere('account.propertyId = :propertyId', { propertyId: filters.propertyId });
      } else {
        // Company-wide COA rows (property_id NULL) are used for postings; include them with project-tagged rows.
        query.andWhere('(account.propertyId IS NULL OR account.propertyId = :propertyId)', {
          propertyId: filters.propertyId,
        });
      }
    }

    if (scopePropertyIds?.length) {
      query.andWhere(
        '(account.propertyId IS NULL OR account.propertyId IN (:...scopePropertyIds))',
        { scopePropertyIds },
      );
    }

    query.orderBy('account.accountCode', 'ASC');

    const rows = await query.getMany();

    // `currentBalance` on each row is updated on post for all projects; overlay JE activity for this project only
    // so list totals match Balance Sheet / dashboard for the same property.
    if (filters?.propertyId) {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const netMap = await this.journalNetMapForSingleProjectView(filters.propertyId, { to: end }, [
        AccountType.ASSET,
        AccountType.LIABILITY,
        AccountType.EQUITY,
        AccountType.INCOME,
        AccountType.EXPENSE,
      ]);
      return rows.map((a) => {
        const jeNet = netMap.get(a.id) ?? 0;
        // Same cumulative JE basis as getBalanceSheet / dashboard (not stored currentBalance, which is org-wide per GL id).
        return Object.assign(Object.create(Object.getPrototypeOf(a)), a, {
          currentBalance: Math.round(jeNet * 100) / 100,
        }) as Account;
      });
    }

    return rows;
  }

  async findOne(id: string, overlayPropertyId?: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: ['parentAccount', 'childAccounts'],
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    if (overlayPropertyId) {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const netMap = await this.journalNetMapForSingleProjectView(overlayPropertyId, { to: end }, [
        AccountType.ASSET,
        AccountType.LIABILITY,
        AccountType.EQUITY,
        AccountType.INCOME,
        AccountType.EXPENSE,
      ]);
      const jeNet = netMap.get(account.id) ?? 0;
      return Object.assign(Object.create(Object.getPrototypeOf(account)), account, {
        currentBalance: Math.round(jeNet * 100) / 100,
      }) as Account;
    }

    return account;
  }

  async findByCode(accountCode: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { accountCode },
    });

    if (!account) {
      throw new NotFoundException(`Account with code ${accountCode} not found`);
    }

    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(id);

    Object.assign(account, updateAccountDto);

    return await this.accountsRepository.save(account);
  }

  /**
   * Bulk import for Chart of Accounts rows, used by the Excel import flow.
   *
   * Each row is: { accountCode, accountName, accountType, accountCategory, description?, openingBalance? }.
   * Rules:
   *  - Skip rows where (accountCode, scopedPropertyId) already exists (no overwrite).
   *  - Target scope is a single `propertyId` (null = company-wide).
   *  - Returns per-row outcome so the UI can highlight duplicates and bad types.
   */
  async bulkImport(
    rows: Array<{
      accountCode: string;
      accountName: string;
      accountType: string;
      accountCategory: string;
      description?: string;
      openingBalance?: number;
    }>,
    scopePropertyId: string | null,
  ): Promise<{
    created: number;
    skipped: number;
    errors: Array<{ row: number; code: string; message: string }>;
    createdIds: string[];
  }> {
    if (!Array.isArray(rows) || !rows.length) {
      throw new BadRequestException('Provide at least one account row to import.');
    }
    const ALLOWED = new Set<string>(Object.values(AccountType));
    const scopedPropertyId = scopePropertyId || null;

    // Pre-fetch existing codes for this scope to detect dupes without N queries.
    const existing = await this.accountsRepository
      .createQueryBuilder('a')
      .select(['a.accountCode'])
      .where('a.propertyId IS NOT DISTINCT FROM :pid', { pid: scopedPropertyId })
      .getMany();
    const existingCodes = new Set(existing.map((a) => a.accountCode));

    const seenInBatch = new Set<string>();
    const errors: Array<{ row: number; code: string; message: string }> = [];
    const toCreate: Array<Partial<Account>> = [];

    rows.forEach((row, idx) => {
      const humanRow = idx + 2; // +1 for 1-based, +1 for header row in Excel
      const code = String(row.accountCode || '').trim();
      const name = String(row.accountName || '').trim();
      const type = String(row.accountType || '').trim().toUpperCase();
      const category = String(row.accountCategory || '').trim();

      if (!code) {
        errors.push({ row: humanRow, code: '', message: 'Missing accountCode' });
        return;
      }
      if (!name) {
        errors.push({ row: humanRow, code, message: 'Missing accountName' });
        return;
      }
      if (!ALLOWED.has(type)) {
        errors.push({
          row: humanRow,
          code,
          message: `Invalid accountType "${type}". Use one of ${[...ALLOWED].join(', ')}`,
        });
        return;
      }
      if (!category) {
        errors.push({ row: humanRow, code, message: 'Missing accountCategory' });
        return;
      }
      if (existingCodes.has(code) || seenInBatch.has(code)) {
        errors.push({ row: humanRow, code, message: 'Already exists - skipped' });
        return;
      }
      seenInBatch.add(code);
      toCreate.push({
        accountCode: code,
        accountName: name,
        accountType: type as AccountType,
        accountCategory: category,
        description: row.description?.toString().trim() || null as unknown as string,
        openingBalance: Number(row.openingBalance) || 0,
        currentBalance: Number(row.openingBalance) || 0,
        propertyId: scopedPropertyId,
        isActive: true,
      });
    });

    if (!toCreate.length) {
      return { created: 0, skipped: rows.length, errors, createdIds: [] };
    }

    const saved = await this.accountsRepository.save(
      toCreate.map((r) => this.accountsRepository.create(r)),
    );
    return {
      created: saved.length,
      skipped: rows.length - saved.length,
      errors,
      createdIds: saved.map((s) => s.id),
    };
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id);

    // Check if account has child accounts
    const childAccounts = await this.accountsRepository.count({
      where: { parentAccountId: id },
    });

    if (childAccounts > 0) {
      throw new BadRequestException('Cannot delete account with child accounts');
    }

    // Check if account has transactions (would need to check journal_entry_lines)
    // For now, just soft delete by setting isActive to false
    account.isActive = false;
    await this.accountsRepository.save(account);
  }

  async getAccountHierarchy(scopePropertyIds?: string[] | null): Promise<Account[]> {
    const qb = this.accountsRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.childAccounts', 'childAccounts')
      .where('account.isActive = :ia', { ia: true })
      .andWhere('account.parentAccountId IS NULL');

    if (scopePropertyIds?.length) {
      qb.andWhere(
        '(account.propertyId IS NULL OR account.propertyId IN (:...scopePropertyIds))',
        { scopePropertyIds },
      );
    }

    qb.orderBy('account.accountCode', 'ASC');
    return qb.getMany();
  }

  /**
   * For company-wide reports (no project id): include all active accounts of the type.
   * For project list UIs: include company-wide (NULL) + project-tagged accounts (legacy helper).
   */
  private async findAccountsByTypeAndPropertyScope(
    accountType: AccountType,
    propertyId?: string,
  ): Promise<Account[]> {
    const qb = this.accountsRepository
      .createQueryBuilder('account')
      .where('account.accountType = :type', { type: accountType })
      .andWhere('account.isActive = :ia', { ia: true });
    if (propertyId) {
      qb.andWhere('(account.propertyId IS NULL OR account.propertyId = :pid)', { pid: propertyId });
    }
    qb.orderBy('account.accountCode', 'ASC');
    return qb.getMany();
  }

  /** India FY start (1 Apr) for the financial year containing `ref`. */
  private indiaFYStartDate(ref: Date): Date {
    const y = ref.getFullYear();
    const m = ref.getMonth();
    const fyYear = m < 3 ? y - 1 : y;
    return new Date(fyYear, 3, 1);
  }

  /**
   * Net per account from posted journal lines. Single project: je.property_id match.
   * Consolidated global: all posted JEs. Consolidated scoped: NULL property_id or allowed projects.
   */
  private async aggregateJournalNetByAccount(
    range: { from?: Date; to?: Date },
    types: AccountType[],
    scope: AccountingReportScope,
  ): Promise<Map<string, number>> {
    const params: unknown[] = [JournalEntryStatus.POSTED];
    let cond = 'WHERE je.status = $1';
    let n = 2;

    if (scope.kind === 'single') {
      cond += ` AND je.property_id = $${n}`;
      params.push(scope.propertyId);
      n++;
    } else if (scope.restrictJournalPropertyIds?.length) {
      cond += ` AND (je.property_id IS NULL OR je.property_id = ANY($${n}::uuid[]))`;
      params.push(scope.restrictJournalPropertyIds);
      n++;
    }

    if (range.from) {
      cond += ` AND je.entry_date >= $${n}`;
      params.push(range.from);
      n++;
    }
    if (range.to) {
      cond += ` AND je.entry_date <= $${n}`;
      params.push(range.to);
      n++;
    }
    const typePlaceholders = types.map((_, i) => `$${n + i}`).join(', ');
    types.forEach((t) => params.push(t));

    const sql = `
      SELECT account.id AS id,
        SUM(
          CASE
            WHEN account.account_type IN ('ASSET', 'EXPENSE') THEN line.debit_amount - line.credit_amount
            ELSE line.credit_amount - line.debit_amount
          END
        )::float AS net
      FROM journal_entry_lines line
      INNER JOIN journal_entries je ON je.id = line.journal_entry_id
      INNER JOIN accounts account ON account.id = line.account_id
      ${cond}
        AND account.account_type IN (${typePlaceholders})
      GROUP BY account.id
    `;

    const rows: Array<{ id: string; net: string | number }> = await this.dataSource.query(sql, params);
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(r.id, Number(r.net) || 0);
    }
    return map;
  }

  /**
   * All posted activity on GL rows owned by a project (account.property_id = P), regardless of
   * journal_entries.property_id. Used when reconciling assigned accounts: history often posts on org-wide JEs.
   */
  private async aggregateJournalNetForAccountsOwnedByProperty(
    range: { from?: Date; to?: Date },
    types: AccountType[],
    propertyId: string,
  ): Promise<Map<string, number>> {
    const params: unknown[] = [JournalEntryStatus.POSTED, propertyId];
    let cond = 'WHERE je.status = $1 AND account.property_id = $2';
    let n = 3;

    if (range.from) {
      cond += ` AND je.entry_date >= $${n}`;
      params.push(range.from);
      n++;
    }
    if (range.to) {
      cond += ` AND je.entry_date <= $${n}`;
      params.push(range.to);
      n++;
    }
    const typePlaceholders = types.map((_, i) => `$${n + i}`).join(', ');
    types.forEach((t) => params.push(t));

    const sql = `
      SELECT account.id AS id,
        SUM(
          CASE
            WHEN account.account_type IN ('ASSET', 'EXPENSE') THEN line.debit_amount - line.credit_amount
            ELSE line.credit_amount - line.debit_amount
          END
        )::float AS net
      FROM journal_entry_lines line
      INNER JOIN journal_entries je ON je.id = line.journal_entry_id
      INNER JOIN accounts account ON account.id = line.account_id
      ${cond}
        AND account.account_type IN (${typePlaceholders})
      GROUP BY account.id
    `;

    const rows: Array<{ id: string; net: string | number }> = await this.dataSource.query(sql, params);
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(r.id, Number(r.net) || 0);
    }
    return map;
  }

  /** Single-project reports: shared GL rows by JE property; project-owned rows by full ledger on that account id. */
  private async journalNetMapForSingleProjectView(
    propertyId: string,
    range: { from?: Date; to?: Date },
    types: AccountType[],
  ): Promise<Map<string, number>> {
    const [strict, owned] = await Promise.all([
      this.aggregateJournalNetByAccount(range, types, { kind: 'single', propertyId }),
      this.aggregateJournalNetForAccountsOwnedByProperty(range, types, propertyId),
    ]);
    const merged = new Map(strict);
    for (const [id, v] of owned) {
      merged.set(id, v);
    }
    return merged;
  }

  private async accountsWithScopedBalances(
    netById: Map<string, number>,
  ): Promise<Account[]> {
    const ids = [...netById.keys()];
    if (!ids.length) return [];
    const found = await this.accountsRepository.find({
      where: { id: In(ids), isActive: true },
      order: { accountCode: 'ASC' },
    });
    return found.map((a) =>
      Object.assign(Object.create(Object.getPrototypeOf(a)), a, {
        currentBalance: netById.get(a.id) ?? 0,
      }) as Account,
    );
  }

  async getBalanceSheet(scope: AccountingReportScope): Promise<{
    assets: Account[];
    liabilities: Account[];
    equity: Account[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  }> {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const netMap =
      scope.kind === 'single'
        ? await this.journalNetMapForSingleProjectView(scope.propertyId, { to: end }, [
            AccountType.ASSET,
            AccountType.LIABILITY,
            AccountType.EQUITY,
          ])
        : await this.aggregateJournalNetByAccount(
            { to: end },
            [AccountType.ASSET, AccountType.LIABILITY, AccountType.EQUITY],
            scope,
          );
    const withBal = await this.accountsWithScopedBalances(netMap);
    const assets = withBal.filter((a) => a.accountType === AccountType.ASSET);
    const liabilities = withBal.filter((a) => a.accountType === AccountType.LIABILITY);
    const equity = withBal.filter((a) => a.accountType === AccountType.EQUITY);
    const totalAssets = assets.reduce((s, a) => s + Number(a.currentBalance), 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + Number(a.currentBalance), 0);
    const totalEquity = equity.reduce((s, a) => s + Number(a.currentBalance), 0);
    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
    };
  }

  async getProfitAndLoss(
    startDate: Date | undefined,
    endDate: Date | undefined,
    scope: AccountingReportScope,
  ): Promise<{
    income: Account[];
    expenses: Account[];
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  }> {
    const rangeEnd = endDate ?? new Date();
    rangeEnd.setHours(23, 59, 59, 999);
    const rangeStart = startDate ?? this.indiaFYStartDate(rangeEnd);
    const netMap =
      scope.kind === 'single'
        ? await this.journalNetMapForSingleProjectView(scope.propertyId, { from: rangeStart, to: rangeEnd }, [
            AccountType.INCOME,
            AccountType.EXPENSE,
          ])
        : await this.aggregateJournalNetByAccount(
            { from: rangeStart, to: rangeEnd },
            [AccountType.INCOME, AccountType.EXPENSE],
            scope,
          );
    const withBal = await this.accountsWithScopedBalances(netMap);
    const income = withBal.filter((a) => a.accountType === AccountType.INCOME);
    const expenses = withBal.filter((a) => a.accountType === AccountType.EXPENSE);
    const totalIncome = income.reduce((s, a) => s + Number(a.currentBalance), 0);
    const totalExpenses = expenses.reduce((s, a) => s + Number(a.currentBalance), 0);
    const netProfit = totalIncome - totalExpenses;
    return { income, expenses, totalIncome, totalExpenses, netProfit };
  }

  // ============ TRIAL BALANCE ============
  async getTrialBalance(scope: AccountingReportScope): Promise<{
    accounts: Array<{
      accountCode: string;
      accountName: string;
      accountType: string;
      debitBalance: number;
      creditBalance: number;
    }>;
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  }> {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const types = [
      AccountType.ASSET,
      AccountType.LIABILITY,
      AccountType.EQUITY,
      AccountType.INCOME,
      AccountType.EXPENSE,
    ];
    const netMap =
      scope.kind === 'single'
        ? await this.journalNetMapForSingleProjectView(scope.propertyId, { to: end }, types)
        : await this.aggregateJournalNetByAccount({ to: end }, types, scope);

    const qb = this.accountsRepository.createQueryBuilder('account').where('account.isActive = :ia', { ia: true });
    if (scope.kind === 'single') {
      qb.andWhere('(account.propertyId IS NULL OR account.propertyId = :pid)', { pid: scope.propertyId });
    } else if (scope.restrictJournalPropertyIds?.length) {
      qb.andWhere('(account.propertyId IS NULL OR account.propertyId IN (:...pids))', {
        pids: scope.restrictJournalPropertyIds,
      });
    }
    qb.orderBy('account.accountCode', 'ASC');
    const allAccounts = await qb.getMany();

    const trialBalanceRows = allAccounts.map((account) => {
      const balance = Number(netMap.get(account.id) ?? 0);
      const isDebitNormal = [AccountType.ASSET, AccountType.EXPENSE].includes(account.accountType);
      return {
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        debitBalance: isDebitNormal ? (balance > 0 ? balance : 0) : balance < 0 ? Math.abs(balance) : 0,
        creditBalance: isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : balance > 0 ? balance : 0,
      };
    });

    const totalDebit = trialBalanceRows.reduce((sum, row) => sum + row.debitBalance, 0);
    const totalCredit = trialBalanceRows.reduce((sum, row) => sum + row.creditBalance, 0);

    return {
      accounts: trialBalanceRows,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  }

  // ============ PROPERTY-WISE P&L ============
  async getPropertyWisePL(propertyId: string): Promise<{
    propertyId: string;
    income: Array<{ accountName: string; accountCode: string; amount: number }>;
    expenses: Array<{ accountName: string; accountCode: string; amount: number }>;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  }> {
    // Get journal entry lines for this property via journal entries that reference this property
    const incomeLines = await this.journalEntryLinesRepository
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.account', 'account')
      .leftJoin('line.journalEntry', 'entry')
      .where('entry.referenceType = :refType', { refType: 'PROPERTY' })
      .andWhere('entry.referenceId = :propertyId', { propertyId })
      .andWhere('entry.status = :status', { status: JournalEntryStatus.POSTED })
      .andWhere('account.accountType = :type', { type: AccountType.INCOME })
      .getMany();

    const expenseLines = await this.journalEntryLinesRepository
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.account', 'account')
      .leftJoin('line.journalEntry', 'entry')
      .where('entry.referenceType = :refType', { refType: 'PROPERTY' })
      .andWhere('entry.referenceId = :propertyId', { propertyId })
      .andWhere('entry.status = :status', { status: JournalEntryStatus.POSTED })
      .andWhere('account.accountType = :type', { type: AccountType.EXPENSE })
      .getMany();

    // Aggregate by account
    const aggregateByAccount = (lines: JournalEntryLine[]) => {
      const map = new Map<string, { accountName: string; accountCode: string; amount: number }>();
      for (const line of lines) {
        const key = line.accountId;
        const existing = map.get(key);
        const net = Number(line.creditAmount) - Number(line.debitAmount);
        if (existing) {
          existing.amount += net;
        } else {
          map.set(key, {
            accountName: (line as any).account?.accountName || key,
            accountCode: (line as any).account?.accountCode || '',
            amount: net,
          });
        }
      }
      return Array.from(map.values());
    };

    const income = aggregateByAccount(incomeLines);
    const expenses = aggregateByAccount(expenseLines).map(e => ({ ...e, amount: Math.abs(e.amount) }));

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      propertyId,
      income,
      expenses,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
    };
  }
}
