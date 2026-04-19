import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { Account, AccountType } from './entities/account.entity';

@Injectable()
export class BankAccountsService {
  private readonly logger = new Logger(BankAccountsService.name);

  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountsRepo: Repository<BankAccount>,
    @InjectRepository(Account)
    private readonly accountsRepo: Repository<Account>,
  ) {}

  async findAll(propertyId?: string): Promise<(BankAccount & { coaAccount?: { id: string; accountCode: string } | null })[]> {
    const where: any = {};
    if (propertyId) where.propertyId = propertyId;
    const bankAccounts = await this.bankAccountsRepo.find({
      where: Object.keys(where).length ? where : undefined,
      order: { createdAt: 'ASC' },
    });

    // Enrich each bank account with its linked COA entry (matched by name + ASSET type)
    return Promise.all(
      bankAccounts.map(async (ba) => {
        const coaAccount = await this.accountsRepo.findOne({
          where: { accountName: ba.accountName, accountType: AccountType.ASSET },
          select: ['id', 'accountCode'],
        });
        return Object.assign(ba, { coaAccount: coaAccount ? { id: coaAccount.id, accountCode: coaAccount.accountCode } : null });
      }),
    );
  }

  async findOne(id: string): Promise<BankAccount> {
    const account = await this.bankAccountsRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException(`Bank account ${id} not found`);
    return account;
  }

  // ── Auto-generate the next available bank account code (12xx range) ──────────
  // Uses numeric MAX (not string MAX) to avoid lexicographic ordering issues
  // e.g. '1241' > '12000' as strings, but 12000 > 1241 numerically
  private async nextBankAccountCode(): Promise<string> {
    const rows = await this.accountsRepo
      .createQueryBuilder('a')
      .select('a.accountCode', 'code')
      .where('a.accountCode ~ :pattern', { pattern: '^12[0-9]+$' })
      .getRawMany<{ code: string }>();

    let nextNum = 1200;
    for (const { code } of rows) {
      const parsed = parseInt(code, 10);
      if (!isNaN(parsed) && parsed >= nextNum) nextNum = parsed + 1;
    }
    return String(nextNum);
  }

  // ── Ensure a matching COA (Chart of Accounts) entry exists for this bank ─────
  private async ensureCOAAccount(bankAccount: BankAccount): Promise<Account> {
    // Check if a COA account already exists with this name in the same property scope
    const qb = this.accountsRepo
      .createQueryBuilder('a')
      .where('LOWER(a.accountName) = LOWER(:name)', { name: bankAccount.accountName })
      .andWhere('a.accountType = :type', { type: AccountType.ASSET });

    if (bankAccount.propertyId) {
      qb.andWhere('a.propertyId = :pid', { pid: bankAccount.propertyId });
    } else {
      qb.andWhere('a.propertyId IS NULL');
    }

    const existing = await qb.getOne();

    if (existing) {
      this.logger.log(`COA account already exists for "${bankAccount.accountName}" (code: ${existing.accountCode})`);
      return existing;
    }

    const code = await this.nextBankAccountCode();
    const coaAccount = this.accountsRepo.create({
      accountCode: code,
      accountName: bankAccount.accountName,
      accountType: AccountType.ASSET,
      accountCategory: 'Bank',
      openingBalance: Number(bankAccount.openingBalance) || 0,
      currentBalance: Number(bankAccount.currentBalance) || 0,
      description: `Auto-created for bank account: ${bankAccount.bankName} (${bankAccount.accountNumber})`,
      isActive: true,
      propertyId: bankAccount.propertyId ?? null,
    });

    const saved = await this.accountsRepo.save(coaAccount);
    this.logger.log(`COA account created for "${bankAccount.accountName}" with code ${code}`);
    return saved;
  }

  async create(dto: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifscCode?: string;
    branchName?: string;
    accountType?: string;
    openingBalance?: number;
    description?: string;
    propertyId?: string | null;
  }): Promise<BankAccount> {
    const ob = Number(dto.openingBalance) || 0;
    const account = this.bankAccountsRepo.create({
      accountName: dto.accountName,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      ifscCode: dto.ifscCode,
      branchName: dto.branchName,
      accountType: dto.accountType || 'Current',
      openingBalance: ob,
      currentBalance: ob,
      description: dto.description,
      propertyId: dto.propertyId || null,
    });
    const saved = await this.bankAccountsRepo.save(account);

    // Auto-create the matching COA entry (non-blocking - bank account is saved even if COA fails)
    let coaAccount: Account | null = null;
    try {
      coaAccount = await this.ensureCOAAccount(saved);
    } catch (err: any) {
      this.logger.error(`Failed to create COA entry for "${saved.accountName}": ${err?.message}`);
    }

    return Object.assign(saved, { coaAccount: coaAccount ? { id: coaAccount.id, accountCode: coaAccount.accountCode } : null });
  }

  async update(id: string, dto: Partial<BankAccount>): Promise<BankAccount> {
    const account = await this.findOne(id);
    const oldName = account.accountName;
    Object.assign(account, dto);
    const saved = await this.bankAccountsRepo.save(account);

    if (dto.accountName && dto.accountName !== oldName) {
      // Name changed → rename the existing COA account if it exists
      const coaAccount = await this.accountsRepo
        .createQueryBuilder('a')
        .where('LOWER(a.accountName) = LOWER(:name)', { name: oldName })
        .andWhere('a.accountType = :type', { type: AccountType.ASSET })
        .getOne();

      if (coaAccount) {
        coaAccount.accountName = dto.accountName;
        await this.accountsRepo.save(coaAccount);
        this.logger.log(`COA account renamed from "${oldName}" to "${dto.accountName}" (code: ${coaAccount.accountCode})`);
      }
    }

    // Always ensure a COA account exists (handles existing banks created before this feature)
    try {
      await this.ensureCOAAccount(saved);
    } catch (err: any) {
      this.logger.error(`Failed to ensure COA entry for "${saved.accountName}": ${err?.message}`);
    }

    return saved;
  }

  async deactivate(id: string): Promise<BankAccount> {
    const account = await this.findOne(id);
    account.isActive = false;
    return this.bankAccountsRepo.save(account);
  }

  async activate(id: string): Promise<BankAccount> {
    const account = await this.findOne(id);
    account.isActive = true;
    return this.bankAccountsRepo.save(account);
  }

  async delete(id: string): Promise<{ message: string }> {
    const account = await this.findOne(id);
    await this.bankAccountsRepo.remove(account);
    return { message: 'Bank account deleted successfully' };
  }
}
