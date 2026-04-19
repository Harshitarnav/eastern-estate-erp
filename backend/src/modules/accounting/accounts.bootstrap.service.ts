import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';

/**
 * Ensures the Chart of Accounts always contains the minimum set of
 * accounts the auto-JE pipeline needs to post entries for booking
 * payments, expenses, vendor bills and salary payments.
 *
 * Without a Bank/Cash ASSET and a Sales/Revenue INCOME account,
 * {@link AccountingIntegrationService.onPaymentCompleted} silently
 * skips JE creation with only a WARN log, so "Record Payment" in
 * Collections appears to succeed while nothing reaches the ledger.
 *
 * This service runs on application boot, checks the COA, and
 * company-wide seeds whatever is missing. It is idempotent:
 *   - If a matching active account already exists (property-scoped
 *     or company-wide) it does nothing.
 *   - If previously-seeded accounts were renamed by the user, the
 *     name-match finders still pick them up (e.g. "HDFC Bank",
 *     "Project Sales"), so re-seeding does not happen.
 */
@Injectable()
export class AccountsBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AccountsBootstrapService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountsRepo: Repository<Account>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureDefaults();
    } catch (err: any) {
      this.logger.error(
        `Failed to ensure default Chart of Accounts: ${err?.message ?? err}`,
      );
    }
  }

  private async ensureDefaults(): Promise<void> {
    const required: Array<{
      label: string;
      code: string;
      name: string;
      type: AccountType;
      category: string;
      namePatterns: string[];
    }> = [
      {
        label: 'Bank / Cash (ASSET)',
        code: '1001',
        name: 'Bank Account',
        type: AccountType.ASSET,
        category: 'Current Assets',
        namePatterns: ['%bank%', '%cash%'],
      },
      {
        label: 'Sales Revenue (INCOME)',
        code: '4001',
        name: 'Sales Revenue',
        type: AccountType.INCOME,
        category: 'Revenue',
        namePatterns: ['%sales%', '%revenue%', '%income%'],
      },
    ];

    const created: string[] = [];
    const present: string[] = [];

    for (const def of required) {
      const existing = await this.findMatching(def.type, def.namePatterns);
      if (existing) {
        present.push(`${def.label} → ${existing.accountCode} ${existing.accountName}`);
        continue;
      }

      const freshCode = await this.pickFreeCode(def.code);
      const account = this.accountsRepo.create({
        accountCode: freshCode,
        accountName: def.name,
        accountType: def.type,
        accountCategory: def.category,
        isActive: true,
        openingBalance: 0,
        currentBalance: 0,
        propertyId: null,
        description:
          'Auto-created default required by the accounting integration ' +
          '(payment / expense / vendor-bill JE posting). Safe to rename, ' +
          'but do not delete or deactivate unless another account of the ' +
          'same type exists.',
      });
      await this.accountsRepo.save(account);
      created.push(`${def.label} → ${freshCode} ${def.name}`);
    }

    if (created.length > 0) {
      this.logger.log(
        `Seeded default Chart of Accounts entries: ${created.join(' | ')}`,
      );
    }
    if (present.length > 0) {
      this.logger.log(
        `Default Chart of Accounts entries already present: ${present.join(' | ')}`,
      );
    }
  }

  private async findMatching(
    type: AccountType,
    patterns: string[],
  ): Promise<Account | null> {
    // First pass: company-wide or property-scoped, matching expected names.
    for (const pattern of patterns) {
      const match = await this.accountsRepo.findOne({
        where: {
          accountType: type,
          isActive: true,
          accountName: ILike(pattern),
        },
        order: { accountCode: 'ASC' },
      });
      if (match) return match;
    }

    // Second pass: any active account of this type counts - matches the
    // fallback logic in AccountingIntegrationService.
    const any = await this.accountsRepo.findOne({
      where: { accountType: type, isActive: true },
      order: { accountCode: 'ASC' },
    });
    return any ?? null;
  }

  /**
   * Pick a company-wide account code that's not already taken. Starts at
   * the preferred code (e.g. "1001") and increments the numeric suffix
   * until we find a free slot. Keeps the seed idempotent even if a user
   * manually created an account at the default code.
   */
  private async pickFreeCode(preferred: string): Promise<string> {
    const base = preferred.replace(/\d+$/, '');
    const startNumMatch = preferred.match(/\d+$/);
    let n = startNumMatch ? parseInt(startNumMatch[0], 10) : 1;
    const width = startNumMatch?.[0].length ?? 4;

    for (let i = 0; i < 50; i += 1) {
      const candidate = `${base}${String(n + i).padStart(width, '0')}`;
      const taken = await this.accountsRepo.findOne({
        where: { accountCode: candidate, propertyId: IsNull() as any },
      });
      if (!taken) return candidate;
    }
    // Fall back to a timestamp-suffixed code if nothing in the range works.
    return `${preferred}-${Date.now().toString().slice(-5)}`;
  }
}
