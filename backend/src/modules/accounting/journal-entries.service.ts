import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JournalEntry, JournalEntryStatus } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { Account } from './entities/account.entity';
import { CreateJournalEntryDto, UpdateJournalEntryDto, VoidJournalEntryDto } from './dto/create-journal-entry.dto';

@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalEntryLinesRepository: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    private dataSource: DataSource,
  ) {}

  private generateEntryNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `JE${dateStr}${random}`;
  }

  async create(createJournalEntryDto: CreateJournalEntryDto, userId: string): Promise<JournalEntry> {
    // Validate that debits equal credits
    const totalDebit = createJournalEntryDto.lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredit = createJournalEntryDto.lines.reduce((sum, line) => sum + line.creditAmount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(`Journal entry must balance. Debits: ${totalDebit}, Credits: ${totalCredit}`);
    }

    // Validate all accounts exist
    for (const line of createJournalEntryDto.lines) {
      const account = await this.accountsRepository.findOne({
        where: { id: line.accountId },
      });
      if (!account) {
        throw new NotFoundException(`Account with ID ${line.accountId} not found`);
      }
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entryNumber = createJournalEntryDto.entryNumber || this.generateEntryNumber();

      // Create journal entry
      const journalEntry = this.journalEntriesRepository.create({
        ...createJournalEntryDto,
        entryNumber,
        createdBy: userId,
        totalDebit,
        totalCredit,
      });

      const savedEntry = await queryRunner.manager.save(journalEntry);

      // Create journal entry lines
      const lines = createJournalEntryDto.lines.map(line =>
        this.journalEntryLinesRepository.create({
          ...line,
          journalEntryId: savedEntry.id,
        }),
      );

      await queryRunner.manager.save(lines);

      await queryRunner.commitTransaction();

      return this.findOne(savedEntry.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: {
    status?: JournalEntryStatus;
    startDate?: Date;
    endDate?: Date;
    referenceType?: string;
  }): Promise<JournalEntry[]> {
    const query = this.journalEntriesRepository.createQueryBuilder('je')
      .leftJoinAndSelect('je.lines', 'lines')
      .leftJoinAndSelect('lines.account', 'account');

    if (filters?.status) {
      query.andWhere('je.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('je.entryDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('je.entryDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.referenceType) {
      query.andWhere('je.referenceType = :referenceType', {
        referenceType: filters.referenceType,
      });
    }

    query.orderBy('je.entryDate', 'DESC').addOrderBy('je.entryNumber', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<JournalEntry> {
    const journalEntry = await this.journalEntriesRepository.findOne({
      where: { id },
      relations: ['lines', 'lines.account', 'creator', 'poster', 'voider'],
    });

    if (!journalEntry) {
      throw new NotFoundException(`Journal entry with ID ${id} not found`);
    }

    return journalEntry;
  }

  async update(id: string, updateJournalEntryDto: UpdateJournalEntryDto): Promise<JournalEntry> {
    const journalEntry = await this.findOne(id);

    if (journalEntry.status === JournalEntryStatus.POSTED) {
      throw new BadRequestException('Cannot update posted journal entries');
    }

    if (journalEntry.status === JournalEntryStatus.VOID) {
      throw new BadRequestException('Cannot update voided journal entries');
    }

    Object.assign(journalEntry, updateJournalEntryDto);

    return await this.journalEntriesRepository.save(journalEntry);
  }

  async post(id: string, userId: string): Promise<JournalEntry> {
    const journalEntry = await this.findOne(id);

    if (journalEntry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestException('Only draft journal entries can be posted');
    }

    // Use transaction to update entry and account balances
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update journal entry status
      journalEntry.status = JournalEntryStatus.POSTED;
//       journalEntry.postedBy = userId;
//       journalEntry.postedAt = new Date();

      await queryRunner.manager.save(journalEntry);

      // Update account balances
      for (const line of journalEntry.lines) {
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: line.accountId },
        });

        if (account) {
          // Debit increases: Assets, Expenses
          // Credit increases: Liabilities, Equity, Income
          const isDebitAccount = ['ASSET', 'EXPENSE'].includes(account.accountType);
          
          if (isDebitAccount) {
            account.currentBalance = Number(account.currentBalance) + line.debitAmount - line.creditAmount;
          } else {
            account.currentBalance = Number(account.currentBalance) + line.creditAmount - line.debitAmount;
          }

          await queryRunner.manager.save(account);
        }
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async void(id: string, userId: string, voidDto: VoidJournalEntryDto): Promise<JournalEntry> {
    const journalEntry = await this.findOne(id);

    if (journalEntry.status !== JournalEntryStatus.POSTED) {
      throw new BadRequestException('Only posted journal entries can be voided');
    }

    // Use transaction to void entry and reverse account balances
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update journal entry status
      journalEntry.status = JournalEntryStatus.VOID;
      journalEntry.voidedBy = userId;
      journalEntry.voidedAt = new Date();
      journalEntry.voidReason = voidDto.voidReason;

      await queryRunner.manager.save(journalEntry);

      // Reverse account balances
      for (const line of journalEntry.lines) {
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: line.accountId },
        });

        if (account) {
          const isDebitAccount = ['ASSET', 'EXPENSE'].includes(account.accountType);
          
          if (isDebitAccount) {
            account.currentBalance = Number(account.currentBalance) - line.debitAmount + line.creditAmount;
          } else {
            account.currentBalance = Number(account.currentBalance) - line.creditAmount + line.debitAmount;
          }

          await queryRunner.manager.save(account);
        }
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const journalEntry = await this.findOne(id);

    if (journalEntry.status === JournalEntryStatus.POSTED) {
      throw new BadRequestException('Cannot delete posted journal entries. Void them instead.');
    }

    await this.journalEntriesRepository.remove(journalEntry);
  }
}
