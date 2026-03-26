import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { BankStatement } from './entities/bank-statement.entity';
import { BankAccount } from './entities/bank-account.entity';
import { JournalEntry } from './entities/journal-entry.entity';

// ─── Column-name normaliser ────────────────────────────────────────────────
// Converts "Transaction Date", "Txn Date", etc. to a consistent key
function normalise(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_\-\.]+/g, '_');
}

// Pick the first matching column name from a row object
function pick(row: Record<string, any>, candidates: string[]): any {
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== null && row[c] !== '') return row[c];
  }
  return undefined;
}

// Parse a number from a cell that may be a string like "1,234.56"
function parseNum(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  const s = String(val).replace(/[,\s₹]/g, '');
  return parseFloat(s) || 0;
}

// Parse date from an Excel date serial or a string
function parseDate(val: any): Date | null {
  if (!val) return null;
  if (typeof val === 'number') {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  const d = new Date(String(val));
  return isNaN(d.getTime()) ? null : d;
}

@Injectable()
export class BankStatementsService {
  constructor(
    @InjectRepository(BankStatement)
    private readonly statementsRepo: Repository<BankStatement>,
    @InjectRepository(BankAccount)
    private readonly bankAccountsRepo: Repository<BankAccount>,
    @InjectRepository(JournalEntry)
    private readonly journalEntriesRepo: Repository<JournalEntry>,
  ) {}

  // ─── List all for a bank account ────────────────────────────────────────
  findAll(bankAccountId: string): Promise<BankStatement[]> {
    return this.statementsRepo.find({
      where: { bankAccountId },
      order: { transactionDate: 'ASC' },
    });
  }

  // ─── Unreconciled only ──────────────────────────────────────────────────
  findUnreconciled(bankAccountId: string): Promise<BankStatement[]> {
    return this.statementsRepo.find({
      where: { bankAccountId, isReconciled: false },
      order: { transactionDate: 'ASC' },
    });
  }

  // ─── Upload Excel bank statement ────────────────────────────────────────
  async uploadStatement(
    bankAccountId: string,
    fileBuffer: Buffer,
    originalName: string,
  ): Promise<{ inserted: number; skipped: number }> {
    // Verify bank account exists
    const bankAccount = await this.bankAccountsRepo.findOne({ where: { id: bankAccountId } });
    if (!bankAccount) throw new NotFoundException('Bank account not found');

    // Parse Excel
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new BadRequestException('Excel file has no sheets');

    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rawRows.length === 0) throw new BadRequestException('Excel file is empty or has no data rows');

    // Normalise header keys
    const rows = rawRows.map(row => {
      const norm: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        norm[normalise(k)] = v;
      }
      return norm;
    });

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      // ── Extract fields (flexible column names) ──────────────────────────
      const rawDate = pick(row, [
        'transaction_date', 'txn_date', 'date', 'value_date',
        'posting_date', 'trans_date', 'tran_date',
      ]);
      const txnDate = parseDate(rawDate);
      if (!txnDate) { skipped++; continue; }

      const description = String(
        pick(row, ['description', 'narration', 'particulars', 'details', 'remarks', 'transaction_details']) || ''
      ).trim();
      if (!description) { skipped++; continue; }

      const debit = parseNum(
        pick(row, ['debit', 'debit_amount', 'withdrawal', 'dr', 'debit_(dr.)'])
      );
      const credit = parseNum(
        pick(row, ['credit', 'credit_amount', 'deposit', 'cr', 'credit_(cr.)'])
      );
      const balance = parseNum(
        pick(row, ['balance', 'closing_balance', 'available_balance', 'running_balance'])
      );
      const refNo = String(
        pick(row, ['reference_number', 'ref_no', 'cheque_no', 'chq_no', 'utr', 'transaction_id', 'txn_id']) || ''
      ).trim() || undefined;
      const txnId = String(
        pick(row, ['transaction_id', 'txn_id', 'transaction_ref_no', 'transaction_reference']) || ''
      ).trim() || undefined;

      // Skip empty lines
      if (debit === 0 && credit === 0) { skipped++; continue; }

      const stmt = this.statementsRepo.create({
        bankAccountId,
        transactionDate: txnDate,
        description,
        referenceNumber: refNo,
        transactionId: txnId,
        debitAmount: Math.round(debit * 100) / 100,
        creditAmount: Math.round(credit * 100) / 100,
        balance: Math.round(balance * 100) / 100,
        uploadedFile: originalName,
        isReconciled: false,
      });

      await this.statementsRepo.save(stmt);
      inserted++;
    }

    return { inserted, skipped };
  }

  // ─── Reconcile a single statement line ─────────────────────────────────
  async reconcile(statementId: string, journalEntryId: string): Promise<BankStatement> {
    const stmt = await this.statementsRepo.findOne({ where: { id: statementId } });
    if (!stmt) throw new NotFoundException('Bank statement line not found');
    if (stmt.isReconciled) throw new BadRequestException('This transaction is already reconciled');

    const je = await this.journalEntriesRepo.findOne({ where: { id: journalEntryId } });
    if (!je) throw new NotFoundException('Journal entry not found');
    if (je.status !== 'POSTED') throw new BadRequestException('Only POSTED journal entries can be used for reconciliation');

    stmt.isReconciled = true;
    stmt.reconciledWithEntryId = journalEntryId;
    stmt.reconciledDate = new Date();
    return this.statementsRepo.save(stmt);
  }

  // ─── Un-reconcile ───────────────────────────────────────────────────────
  async unreconcile(statementId: string): Promise<BankStatement> {
    const stmt = await this.statementsRepo.findOne({ where: { id: statementId } });
    if (!stmt) throw new NotFoundException('Bank statement line not found');
    stmt.isReconciled = false;
    stmt.reconciledWithEntryId = null;
    stmt.reconciledDate = null;
    return this.statementsRepo.save(stmt);
  }
}
