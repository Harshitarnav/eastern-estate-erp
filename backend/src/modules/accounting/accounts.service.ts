import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { JournalEntryStatus } from './entities/journal-entry.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';

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
    // Check if account code already exists
    const existingAccount = await this.accountsRepository.findOne({
      where: { accountCode: createAccountDto.accountCode },
    });

    if (existingAccount) {
      throw new BadRequestException(`Account with code ${createAccountDto.accountCode} already exists`);
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

  async findAll(filters?: {
    accountType?: AccountType;
    isActive?: boolean;
    parentAccountId?: string;
  }): Promise<Account[]> {
    const query = this.accountsRepository.createQueryBuilder('account');

    if (filters?.accountType) {
      query.andWhere('account.accountType = :accountType', {
        accountType: filters.accountType,
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('account.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.parentAccountId) {
      query.andWhere('account.parentAccountId = :parentAccountId', {
        parentAccountId: filters.parentAccountId,
      });
    }

    query.orderBy('account.accountCode', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: ['parentAccount', 'childAccounts'],
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
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

  async getAccountHierarchy(): Promise<Account[]> {
    // Get all accounts with their children
    const accounts = await this.accountsRepository.find({
      where: { isActive: true },
      relations: ['childAccounts'],
      order: { accountCode: 'ASC' },
    });

    // Filter to get only root accounts (no parent)
    return accounts.filter(account => !account.parentAccountId);
  }

  async getBalanceSheet(): Promise<{
    assets: Account[];
    liabilities: Account[];
    equity: Account[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  }> {
    const assets = await this.accountsRepository.find({
      where: { accountType: AccountType.ASSET, isActive: true },
      order: { accountCode: 'ASC' },
    });

    const liabilities = await this.accountsRepository.find({
      where: { accountType: AccountType.LIABILITY, isActive: true },
      order: { accountCode: 'ASC' },
    });

    const equity = await this.accountsRepository.find({
      where: { accountType: AccountType.EQUITY, isActive: true },
      order: { accountCode: 'ASC' },
    });

    const totalAssets = assets.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
    const totalEquity = equity.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
    };
  }

  async getProfitAndLoss(startDate?: Date, endDate?: Date): Promise<{
    income: Account[];
    expenses: Account[];
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  }> {
    const income = await this.accountsRepository.find({
      where: { accountType: AccountType.INCOME, isActive: true },
      order: { accountCode: 'ASC' },
    });

    const expenses = await this.accountsRepository.find({
      where: { accountType: AccountType.EXPENSE, isActive: true },
      order: { accountCode: 'ASC' },
    });

    const totalIncome = income.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      income,
      expenses,
      totalIncome,
      totalExpenses,
      netProfit,
    };
  }

  // ============ TRIAL BALANCE ============
  async getTrialBalance(): Promise<{
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
    const allAccounts = await this.accountsRepository.find({
      where: { isActive: true },
      order: { accountCode: 'ASC' },
    });

    // Asset and Expense accounts carry debit balances normally
    // Liability, Equity, Income accounts carry credit balances normally
    const trialBalanceRows = allAccounts.map((account) => {
      const balance = Number(account.currentBalance);
      const isDebitNormal = [AccountType.ASSET, AccountType.EXPENSE].includes(account.accountType);
      return {
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        debitBalance: isDebitNormal ? (balance > 0 ? balance : 0) : (balance < 0 ? Math.abs(balance) : 0),
        creditBalance: isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : (balance > 0 ? balance : 0),
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
