import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
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
}
