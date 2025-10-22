import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { JournalEntry, JournalEntryStatus } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankStatement } from './entities/bank-statement.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalEntryLineRepository: Repository<JournalEntryLine>,
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(BankStatement)
    private bankStatementRepository: Repository<BankStatement>,
  ) {}

  // ============ CHART OF ACCOUNTS ============
  async createAccount(data: any) {
    const account = this.accountRepository.create(data);
    return this.accountRepository.save(account);
  }

  async getAllAccounts() {
    return this.accountRepository.find({
      relations: ['parentAccount', 'childAccounts'],
      order: { accountCode: 'ASC' },
    });
  }

  async getAccountById(id: string) {
    return this.accountRepository.findOne({
      where: { id },
      relations: ['parentAccount', 'childAccounts'],
    });
  }

  async updateAccount(id: string, data: any) {
    await this.accountRepository.update(id, data);
    return this.getAccountById(id);
  }

  // ============ JOURNAL ENTRIES ============
  async createJournalEntry(data: any) {
    const { lines, ...entryData } = data;
    
    // Create entry
    const entry = this.journalEntryRepository.create(entryData);
    const savedEntry = await this.journalEntryRepository.save(entry);
    // Ensure savedEntry is not an array
    const entryResult = Array.isArray(savedEntry) ? savedEntry[0] : savedEntry;

    // Create lines
    if (lines && lines.length > 0) {
      const entryLines = lines.map((line: any, index: number) => {
        return this.journalEntryLineRepository.create({
          ...line,
          journalEntryId: entryResult.id,
          line_number: index + 1,
        });
      });
      await this.journalEntryLineRepository.save(entryLines);

      // Update account balances
      await this.updateAccountBalances(lines);
    }

    return this.getJournalEntryById(entryResult.id);
  }

  async getJournalEntryById(id: string) {
    return this.journalEntryRepository.findOne({
      where: { id },
      relations: ['property'],
    });
  }

  async getJournalEntryLines(entryId: string) {
    return this.journalEntryLineRepository.find({
      where: { journalEntryId: entryId },
      relations: ['account'],
      order: { id: 'ASC' },
    });
  }

  private async updateAccountBalances(lines: any[]) {
    for (const line of lines) {
      const account = await this.accountRepository.findOne({
        where: { id: line.accountId },
      });
      
      if (account) {
        const debit = parseFloat(line.debitAmount) || 0;
        const credit = parseFloat(line.creditAmount) || 0;
        
        // Asset/Expense accounts increase with debit
        if (account.accountType === AccountType.ASSET || account.accountType === AccountType.EXPENSE) {
          account.currentBalance = parseFloat(account.currentBalance as any) + debit - credit;
        } else {
          // Liability/Equity/Income accounts increase with credit
          account.currentBalance = parseFloat(account.currentBalance as any) + credit - debit;
        }
        
        await this.accountRepository.save(account);
      }
    }
  }

  // ============ LEDGER REPORTS ============
  async getAccountLedger(accountId: string, startDate: Date, endDate: Date) {
    const account = await this.getAccountById(accountId);
    
    const entries = await this.journalEntryLineRepository
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.journalEntry', 'entry')
      .where('line.accountId = :accountId', { accountId })
      .andWhere('entry.entryDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('entry.status = :status', { status: JournalEntryStatus.POSTED })
      .orderBy('entry.entryDate', 'ASC')
      .addOrderBy('line.line_number', 'ASC')
      .getMany();

    let runningBalance = account.openingBalance;
    const ledgerEntries = entries.map((line: any) => {
      const debit = parseFloat(line.debitAmount) || 0;
      const credit = parseFloat(line.creditAmount) || 0;
      
      if (account.accountType === AccountType.ASSET || account.accountType === AccountType.EXPENSE) {
        runningBalance = runningBalance + debit - credit;
      } else {
        runningBalance = runningBalance + credit - debit;
      }

      return {
        date: line.journalEntry.entryDate,
        entryNumber: line.journalEntry.entryNumber,
        narration: line.description || line.journalEntry.narration,
        debit,
        credit,
        balance: runningBalance,
      };
    });

    return {
      account,
      openingBalance: account.openingBalance,
      closingBalance: runningBalance,
      entries: ledgerEntries,
    };
  }

  async getWeeklyLedger(week: number, year: number) {
    // Calculate start and end dates for the week
    const startDate = this.getDateOfWeek(week, year);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const entries = await this.journalEntryRepository.find({
      where: {
        entryDate: Between(startDate, endDate),
        status: JournalEntryStatus.POSTED,
      },
      relations: ['property'],
      order: { entryDate: 'ASC' },
    });

    const summary = {
      week,
      year,
      startDate,
      endDate,
      totalEntries: entries.length,
      totalDebit: entries.reduce((sum, e) => sum + parseFloat(e.totalDebit as any), 0),
      totalCredit: entries.reduce((sum, e) => sum + parseFloat(e.totalCredit as any), 0),
      entries,
    };

    return summary;
  }

  async getCashBook(startDate: Date, endDate: Date) {
    const cashAccount = await this.accountRepository.findOne({
      where: { accountCode: '1001' }, // Assuming 1001 is Cash account
    });

    if (!cashAccount) {
      throw new Error('Cash account not found');
    }

    return this.getAccountLedger(cashAccount.id, startDate, endDate);
  }

  async getBankBook(bankAccountId: string, startDate: Date, endDate: Date) {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id: bankAccountId },
    });

    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    // Find the accounting account linked to this bank
    const account = await this.accountRepository.findOne({
      where: { accountName: bankAccount.accountName },
    });

    if (!account) {
      throw new Error('Bank account ledger not found');
    }

    return this.getAccountLedger(account.id, startDate, endDate);
  }

  // ============ EXCEL IMPORT/EXPORT ============
  async importJournalEntriesFromExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const imported = [];
    for (const row of data as any[]) {
      try {
        const entry = await this.createJournalEntry({
          entryNumber: row['Entry Number'],
          entryDate: new Date(row['Date']),
          narration: row['Narration'],
          financialYear: row['Financial Year'],
          period: row['Period'],
          lines: [
            {
              accountCode: row['Debit Account'],
              debitAmount: parseFloat(row['Debit Amount']) || 0,
              creditAmount: 0,
              description: row['Description'],
            },
            {
              accountCode: row['Credit Account'],
              debitAmount: 0,
              creditAmount: parseFloat(row['Credit Amount']) || 0,
              description: row['Description'],
            },
          ],
        });
        imported.push(entry);
      } catch (error) {
        console.error('Error importing row:', row, error);
      }
    }

    return {
      total: data.length,
      imported: imported.length,
      failed: data.length - imported.length,
      entries: imported,
    };
  }

  async exportLedgerToExcel(accountId: string, startDate: Date, endDate: Date) {
    const ledger = await this.getAccountLedger(accountId, startDate, endDate);
    
    const data = ledger.entries.map((entry: any) => ({
      Date: entry.date,
      'Entry Number': entry.entryNumber,
      Narration: entry.narration,
      Debit: entry.debit,
      Credit: entry.credit,
      Balance: entry.balance,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportTrialBalanceToExcel(date: Date) {
    const accounts = await this.accountRepository.find({
      where: { isActive: true },
      order: { accountCode: 'ASC' },
    });

    const data = accounts.map((account) => ({
      'Account Code': account.accountCode,
      'Account Name': account.accountName,
      'Account Type': account.accountType,
      Debit: account.currentBalance >= 0 ? account.currentBalance : 0,
      Credit: account.currentBalance < 0 ? Math.abs(account.currentBalance as any) : 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trial Balance');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // ============ ITR EXPORTS ============
  async exportForITR(financialYear: string) {
    // Get all income accounts
    const incomeAccounts = await this.accountRepository.find({
      where: { accountType: AccountType.INCOME },
    });

    // Get all expense accounts
    const expenseAccounts = await this.accountRepository.find({
      where: { accountType: AccountType.EXPENSE },
    });

    const totalIncome = incomeAccounts.reduce(
      (sum, acc) => sum + parseFloat(acc.currentBalance as any),
      0,
    );

    const totalExpenses = expenseAccounts.reduce(
      (sum, acc) => sum + parseFloat(acc.currentBalance as any),
      0,
    );

    return {
      financial_year: financialYear,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: totalIncome - totalExpenses,
      income_heads: incomeAccounts.map((acc) => ({
        head: acc.accountName,
        amount: acc.currentBalance,
      })),
      expense_heads: expenseAccounts.map((acc) => ({
        head: acc.accountName,
        amount: acc.currentBalance,
      })),
    };
  }

  // ============ BANK RECONCILIATION ============
  async uploadBankStatement(data: any, file: any) {
    const statements = [];
    
    // Parse file based on type
    if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      for (const row of rows as any[]) {
        const statement = this.bankStatementRepository.create({
          bankAccountId: data.bankAccountId,
          statementDate: new Date(row['Date']),
          transactionDate: new Date(row['Transaction Date'] || row['Date']),
          transactionId: row['Transaction ID'] || row['Ref No'],
          description: row['Description'] || row['Narration'],
          referenceNumber: row['Reference Number'] || row['Cheque No'],
          debitAmount: parseFloat(row['Debit'] || row['Withdrawal']) || 0,
          creditAmount: parseFloat(row['Credit'] || row['Deposit']) || 0,
          balance: parseFloat(row['Balance']) || 0,
          uploadedFile: file.originalname,
        });
        statements.push(statement);
      }
    }

    const saved = await this.bankStatementRepository.save(statements);
    
    return {
      total: saved.length,
      bankAccountId: data.bankAccountId,
      fileName: file.originalname,
      statements: saved,
    };
  }

  async getUnreconciledTransactions(bankAccountId: string) {
    return this.bankStatementRepository.find({
      where: {
        bankAccountId,
        isReconciled: false,
      },
      order: { transactionDate: 'DESC' },
    });
  }

  async reconcileTransaction(statementId: string, journalEntryId: string) {
    await this.bankStatementRepository.update(statementId, {
      isReconciled: true,
      reconciledWithEntryId: journalEntryId,
      reconciledDate: new Date(),
    });

    return this.bankStatementRepository.findOne({ where: { id: statementId } });
  }

  // ============ HELPER METHODS ============
  private getDateOfWeek(week: number, year: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  }

  // ============ BANK ACCOUNTS ============
  async createBankAccount(data: any) {
    const bankAccount = this.bankAccountRepository.create(data);
    return this.bankAccountRepository.save(bankAccount);
  }

  async getAllBankAccounts() {
    return this.bankAccountRepository.find({
      where: { isActive: true },
      order: { accountName: 'ASC' },
    });
  }

  async getBankAccountById(id: string) {
    return this.bankAccountRepository.findOne({ where: { id } });
  }
}
