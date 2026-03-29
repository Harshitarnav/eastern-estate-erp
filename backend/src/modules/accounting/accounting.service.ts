import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { JournalEntry, JournalEntryStatus } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankStatement } from './entities/bank-statement.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

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
    private dataSource: DataSource,
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
  private async generateEntryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `JE${year}`;
    const result = await this.journalEntryRepository
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

  async createJournalEntry(data: any) {
    const { lines, ...entryData } = data;

    // Auto-generate entry number if not supplied
    if (!entryData.entryNumber) {
      entryData.entryNumber = await this.generateEntryNumber();
    }

    // Create entry
    const entry = this.journalEntryRepository.create(entryData);
    const savedEntry = await this.journalEntryRepository.save(entry);
    // Ensure savedEntry is not an array
    const entryResult = Array.isArray(savedEntry) ? savedEntry[0] : savedEntry;

    // Create lines
    if (lines && lines.length > 0) {
      const entryLines = lines.map((line: any) => {
        return this.journalEntryLineRepository.create({
          ...line,
          journalEntryId: entryResult.id,
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
      relations: ['lines', 'lines.account'],
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
      .addOrderBy('line.id', 'ASC')
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
        narration: line.description || line.journalEntry.description,
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
      relations: ['lines', 'lines.account'],
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
    // Try common cash account codes first, then fall back to name search
    const commonCashCodes = ['1001', '1100', '1110', '1010', '101', 'CASH'];
    let cashAccount: Account | null = null;

    for (const code of commonCashCodes) {
      cashAccount = await this.accountRepository.findOne({
        where: { accountCode: code },
      });
      if (cashAccount) break;
    }

    // Fall back: find any ASSET account whose name contains "cash"
    // (covers "Cash on Hand", "Cash In Hand", "Petty Cash", etc.)
    if (!cashAccount) {
      cashAccount = await this.accountRepository
        .createQueryBuilder('account')
        .where('LOWER(account.accountName) LIKE :name', { name: '%cash%' })
        .andWhere('account.accountType = :type', { type: AccountType.ASSET })
        .orderBy('account.accountCode', 'ASC')
        .getOne();
    }

    if (!cashAccount) {
      throw new Error(
        'Cash account not found. Please create an account named "Cash on Hand" ' +
        '(or code 1001/1110) under ASSET type in Chart of Accounts.',
      );
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

    // 1. Exact name match
    let account = await this.accountRepository.findOne({
      where: { accountName: bankAccount.accountName },
    });

    // 2. Case-insensitive / partial name match
    if (!account) {
      account = await this.accountRepository
        .createQueryBuilder('a')
        .where('LOWER(a.accountName) LIKE :name', {
          name: `%${bankAccount.accountName.toLowerCase()}%`,
        })
        .andWhere('a.accountType = :type', { type: AccountType.ASSET })
        .orderBy('a.accountCode', 'ASC')
        .getOne();
    }

    // 3. Match on bank name (e.g. "HDFC" appears in account name)
    if (!account) {
      account = await this.accountRepository
        .createQueryBuilder('a')
        .where('LOWER(a.accountName) LIKE :bank', {
          bank: `%${bankAccount.bankName.toLowerCase()}%`,
        })
        .andWhere('a.accountType = :type', { type: AccountType.ASSET })
        .orderBy('a.accountCode', 'ASC')
        .getOne();
    }

    if (!account) {
      throw new Error(
        `No Chart of Accounts entry found for bank "${bankAccount.accountName}". ` +
        `Please create an ASSET account in Chart of Accounts with the name "${bankAccount.accountName}" ` +
        `or a name containing "${bankAccount.bankName}".`,
      );
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
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < (data as any[]).length; i++) {
      const row = (data as any[])[i];
      try {
        // Resolve account codes to IDs so balance updates work correctly
        const debitCode  = String(row['Debit Account']  || '').trim();
        const creditCode = String(row['Credit Account'] || '').trim();

        const [debitAccount, creditAccount] = await Promise.all([
          this.accountRepository.findOne({ where: { accountCode: debitCode } }),
          this.accountRepository.findOne({ where: { accountCode: creditCode } }),
        ]);

        if (!debitAccount) {
          throw new Error(`Debit account code "${debitCode}" not found in Chart of Accounts`);
        }
        if (!creditAccount) {
          throw new Error(`Credit account code "${creditCode}" not found in Chart of Accounts`);
        }

        const entry = await this.createJournalEntry({
          entryNumber: row['Entry Number'],
          entryDate: new Date(row['Date']),
          description: row['Narration'],
          financialYear: row['Financial Year'],
          period: row['Period'],
          lines: [
            {
              accountId:    debitAccount.id,
              accountCode:  debitCode,
              debitAmount:  parseFloat(row['Debit Amount']) || 0,
              creditAmount: 0,
              description:  row['Description'],
            },
            {
              accountId:    creditAccount.id,
              accountCode:  creditCode,
              debitAmount:  0,
              creditAmount: parseFloat(row['Credit Amount']) || 0,
              description:  row['Description'],
            },
          ],
        });
        imported.push(entry);
      } catch (error) {
        this.logger.error(`Row ${i + 2}: ${error.message}`);
        errors.push({ row: i + 2, error: error.message });
      }
    }

    return {
      total:    (data as any[]).length,
      imported: imported.length,
      failed:   errors.length,
      errors,
      entries:  imported,
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

  // ============ PROPERTY-WISE P&L ============
  async getPropertyWisePL(startDate: Date, endDate: Date) {
    // Revenue per property: completed payments linked directly via booking.property_id
    const revenueRows = await this.dataSource.query(`
      SELECT
        p.id         AS property_id,
        p.name       AS property_name,
        COALESCE(SUM(pay.amount), 0) AS revenue
      FROM properties p
      LEFT JOIN bookings b  ON b.property_id = p.id
      LEFT JOIN payments pay ON pay.booking_id = b.id
        AND pay.payment_status = 'COMPLETED'
        AND pay.payment_date BETWEEN $1 AND $2
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
    `, [startDate, endDate]);

    // Expenses per property (from the expenses table)
    const expenseRows = await this.dataSource.query(`
      SELECT
        p.id         AS property_id,
        p.name       AS property_name,
        COALESCE(SUM(e.amount), 0) AS expenses
      FROM properties p
      LEFT JOIN expenses e ON e.property_id = p.id
        AND e.status = 'PAID'
        AND e.expense_date BETWEEN $1 AND $2
      GROUP BY p.id, p.name
      ORDER BY expenses DESC
    `, [startDate, endDate]);

    // Merge by property id
    const map: Record<string, {
      propertyId: string;
      propertyName: string;
      revenue: number;
      expenses: number;
      netProfit: number;
      margin: number;
    }> = {};

    for (const row of revenueRows) {
      map[row.property_id] = {
        propertyId: row.property_id,
        propertyName: row.property_name,
        revenue: Number(row.revenue),
        expenses: 0,
        netProfit: 0,
        margin: 0,
      };
    }

    for (const row of expenseRows) {
      if (!map[row.property_id]) {
        map[row.property_id] = {
          propertyId: row.property_id,
          propertyName: row.property_name,
          revenue: 0,
          expenses: 0,
          netProfit: 0,
          margin: 0,
        };
      }
      map[row.property_id].expenses = Number(row.expenses);
    }

    const properties = Object.values(map).map(p => {
      p.netProfit = Math.round((p.revenue - p.expenses) * 100) / 100;
      p.margin = p.revenue > 0 ? Math.round((p.netProfit / p.revenue) * 10000) / 100 : 0;
      return p;
    });

    const totals = properties.reduce(
      (acc, p) => ({
        revenue: acc.revenue + p.revenue,
        expenses: acc.expenses + p.expenses,
        netProfit: acc.netProfit + p.netProfit,
      }),
      { revenue: 0, expenses: 0, netProfit: 0 },
    );

    return {
      period: { startDate, endDate },
      properties,
      totals: {
        ...totals,
        margin: totals.revenue > 0
          ? Math.round((totals.netProfit / totals.revenue) * 10000) / 100
          : 0,
      },
    };
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

  // ============ AR AGING REPORT ============
  async getARAgingReport(asOf?: Date): Promise<any> {
    const asOfDate = asOf || new Date();

    // Outstanding installments from payment_schedules (PENDING or OVERDUE)
    const rows = await this.dataSource.query(`
      SELECT
        c.id                             AS customer_id,
        c.full_name                      AS customer_name,
        c.phone_number                   AS customer_phone,
        b.booking_number,
        p.name                           AS property_name,
        ps.id                            AS schedule_id,
        ps.installment_number            AS schedule_number,
        ps.due_date,
        (ps.amount - ps.paid_amount)     AS outstanding,
        ps.amount                        AS installment_amount,
        ($1::date - ps.due_date::date)   AS days_overdue
      FROM payment_schedules ps
      JOIN bookings b  ON b.id = ps.booking_id
      JOIN customers c ON c.id = b.customer_id
      JOIN properties p ON p.id = b.property_id
      WHERE ps.status IN ('PENDING','OVERDUE','PARTIAL')
        AND ps.due_date <= $1
        AND (ps.amount - ps.paid_amount) > 0
      ORDER BY c.full_name, ps.due_date
    `, [asOfDate]);

    // Group by customer
    const customerMap: Record<string, {
      customerId: string;
      customerName: string;
      customerPhone: string;
      bucket0_30: number;
      bucket31_60: number;
      bucket61_90: number;
      bucket90plus: number;
      total: number;
      bookings: string[];
    }> = {};

    for (const row of rows) {
      const id = row.customer_id;
      if (!customerMap[id]) {
        customerMap[id] = {
          customerId: id,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90plus: 0,
          total: 0,
          bookings: [],
        };
      }
      const days = Number(row.days_overdue) || 0;
      const amt = Number(row.outstanding) || 0;
      if (days <= 30) customerMap[id].bucket0_30 += amt;
      else if (days <= 60) customerMap[id].bucket31_60 += amt;
      else if (days <= 90) customerMap[id].bucket61_90 += amt;
      else customerMap[id].bucket90plus += amt;
      customerMap[id].total += amt;
      if (!customerMap[id].bookings.includes(row.booking_number)) {
        customerMap[id].bookings.push(row.booking_number);
      }
    }

    const customers = Object.values(customerMap).sort((a, b) => b.bucket90plus - a.bucket90plus);
    const totals = customers.reduce(
      (acc, c) => ({
        bucket0_30: acc.bucket0_30 + c.bucket0_30,
        bucket31_60: acc.bucket31_60 + c.bucket31_60,
        bucket61_90: acc.bucket61_90 + c.bucket61_90,
        bucket90plus: acc.bucket90plus + c.bucket90plus,
        total: acc.total + c.total,
      }),
      { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90plus: 0, total: 0 },
    );

    return { asOf: asOfDate, customers, totals };
  }

  // ============ AP AGING REPORT ============
  async getAPAgingReport(asOf?: Date): Promise<any> {
    const asOfDate = asOf || new Date();

    // Outstanding vendor balances from vendors table
    const vendorRows = await this.dataSource.query(`
      SELECT
        v.id               AS vendor_id,
        v.vendor_name,
        v.vendor_code,
        v.contact_person   AS contact_name,
        v.phone_number     AS phone,
        v.outstanding_amount,
        COALESCE(
          MAX(po.expected_delivery_date),
          NOW()::date
        )                  AS latest_due_date,
        ($1::date - COALESCE(MAX(po.expected_delivery_date), NOW()::date)::date) AS days_overdue
      FROM vendors v
      LEFT JOIN purchase_orders po ON po.vendor_id = v.id
        AND po.status NOT IN ('RECEIVED','CANCELLED')
      WHERE v.outstanding_amount > 0
      GROUP BY v.id, v.vendor_name, v.vendor_code, v.contact_person, v.phone_number, v.outstanding_amount
      ORDER BY v.outstanding_amount DESC
    `, [asOfDate]);

    const vendors = vendorRows.map((row: any) => {
      const days = Number(row.days_overdue) || 0;
      const amt = Number(row.outstanding_amount) || 0;
      return {
        vendorId: row.vendor_id,
        vendorName: row.vendor_name,
        vendorCode: row.vendor_code,
        vendorCategory: null,
        contactName: row.contact_name,
        phone: row.phone,
        outstandingAmount: amt,
        daysOverdue: days,
        bucket: days <= 0 ? 'current' : days <= 30 ? '0_30' : days <= 60 ? '31_60' : days <= 90 ? '61_90' : '90plus',
        bucket0_30: days > 0 && days <= 30 ? amt : 0,
        bucket31_60: days > 30 && days <= 60 ? amt : 0,
        bucket61_90: days > 60 && days <= 90 ? amt : 0,
        bucket90plus: days > 90 ? amt : 0,
        current: days <= 0 ? amt : 0,
      };
    });

    const totals = vendors.reduce(
      (acc: any, v: any) => ({
        current: acc.current + v.current,
        bucket0_30: acc.bucket0_30 + v.bucket0_30,
        bucket31_60: acc.bucket31_60 + v.bucket31_60,
        bucket61_90: acc.bucket61_90 + v.bucket61_90,
        bucket90plus: acc.bucket90plus + v.bucket90plus,
        total: acc.total + v.outstandingAmount,
      }),
      { current: 0, bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90plus: 0, total: 0 },
    );

    return { asOf: asOfDate, vendors, totals };
  }

  // ============ CASH FLOW STATEMENT ============
  async getCashFlowStatement(startDate: Date, endDate: Date): Promise<any> {
    // Categorize JE lines into Operating / Investing / Financing based on account type + name patterns
    // NOTE: raw SQL must use snake_case column names (SnakeNamingStrategy)
    const lines = await this.dataSource.query(`
      SELECT
        jel.id,
        jel.debit_amount  AS "debitAmount",
        jel.credit_amount AS "creditAmount",
        jel.description,
        a.account_type    AS "accountType",
        a.account_name    AS "accountName",
        a.account_code    AS "accountCode",
        je.entry_date     AS "entryDate",
        je.description    AS "narration",
        je.reference_type AS "referenceType"
      FROM journal_entry_lines jel
      JOIN accounts a        ON a.id = jel.account_id
      JOIN journal_entries je ON je.id = jel.journal_entry_id
      WHERE je.status = 'POSTED'
        AND je.entry_date BETWEEN $1 AND $2
      ORDER BY je.entry_date
    `, [startDate, endDate]);

    const operating: any[] = [];
    const investing: any[] = [];
    const financing: any[] = [];

    for (const line of lines) {
      const name = (line.accountName || '').toLowerCase();
      const ref = (line.referenceType || '').toLowerCase();
      const type = line.accountType;
      const net = Number(line.debitAmount) - Number(line.creditAmount);

      const entry = {
        date: line.entryDate,
        description: line.description || line.narration,
        accountName: line.accountName,
        debit: Number(line.debitAmount),
        credit: Number(line.creditAmount),
        net,
      };

      // Investing: property, land, equipment, construction
      if (name.includes('property') || name.includes('land') || name.includes('equipment') || name.includes('machinery') || name.includes('building') || ref === 'property') {
        investing.push(entry);
      }
      // Financing: loans, capital, equity
      else if (name.includes('loan') || name.includes('capital') || name.includes('equity') || name.includes('borrowing') || type === 'EQUITY') {
        financing.push(entry);
      }
      // Operating: everything else (income, expense, current assets like receivables)
      else if (type === 'INCOME' || type === 'EXPENSE' || (type === 'ASSET' && !name.includes('bank') && !name.includes('cash'))) {
        operating.push(entry);
      }
      // Cash & Bank movements are the "net change" in cash — don't double-count
    }

    const sum = (arr: any[], key: 'debit' | 'credit' | 'net') => arr.reduce((s, e) => s + e[key], 0);

    // Opening cash balance: sum of static opening_balance for cash/bank accounts
    // PLUS all posted JEs that affected cash/bank accounts BEFORE the start date
    const cashAccounts = await this.dataSource.query(`
      SELECT
        COALESCE(SUM(a.opening_balance), 0) +
        COALESCE((
          SELECT SUM(
            CASE
              WHEN a2.account_type = 'ASSET' THEN jel2.debit_amount - jel2.credit_amount
              ELSE jel2.credit_amount - jel2.debit_amount
            END
          )
          FROM journal_entry_lines jel2
          JOIN accounts a2            ON a2.id  = jel2.account_id
          JOIN journal_entries je2    ON je2.id = jel2.journal_entry_id
          WHERE je2.status = 'POSTED'
            AND je2.entry_date < $1
            AND a2.account_type = 'ASSET'
            AND (LOWER(a2.account_name) LIKE '%cash%' OR LOWER(a2.account_name) LIKE '%bank%')
        ), 0) AS opening
      FROM accounts a
      WHERE a.account_type = 'ASSET'
        AND (LOWER(a.account_name) LIKE '%cash%' OR LOWER(a.account_name) LIKE '%bank%')
    `, [startDate]);
    const openingBalance = Number(cashAccounts[0]?.opening) || 0;

    const netOperating = sum(operating, 'net');
    const netInvesting = -sum(investing, 'net'); // outflows are negative for investing
    const netFinancing = sum(financing, 'net');
    const netChange = netOperating + netInvesting + netFinancing;

    return {
      period: { startDate, endDate },
      openingBalance,
      closingBalance: openingBalance + netChange,
      netChange,
      operating: {
        items: operating,
        total: netOperating,
      },
      investing: {
        items: investing,
        total: netInvesting,
      },
      financing: {
        items: financing,
        total: netFinancing,
      },
    };
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
