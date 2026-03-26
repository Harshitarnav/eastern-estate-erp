"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankStatementsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const XLSX = require("xlsx");
const bank_statement_entity_1 = require("./entities/bank-statement.entity");
const bank_account_entity_1 = require("./entities/bank-account.entity");
const journal_entry_entity_1 = require("./entities/journal-entry.entity");
function normalise(raw) {
    return raw.trim().toLowerCase().replace(/[\s_\-\.]+/g, '_');
}
function pick(row, candidates) {
    for (const c of candidates) {
        if (row[c] !== undefined && row[c] !== null && row[c] !== '')
            return row[c];
    }
    return undefined;
}
function parseNum(val) {
    if (val === undefined || val === null || val === '')
        return 0;
    const s = String(val).replace(/[,\s₹]/g, '');
    return parseFloat(s) || 0;
}
function parseDate(val) {
    if (!val)
        return null;
    if (typeof val === 'number') {
        const d = XLSX.SSF.parse_date_code(val);
        if (d)
            return new Date(d.y, d.m - 1, d.d);
    }
    const d = new Date(String(val));
    return isNaN(d.getTime()) ? null : d;
}
let BankStatementsService = class BankStatementsService {
    constructor(statementsRepo, bankAccountsRepo, journalEntriesRepo) {
        this.statementsRepo = statementsRepo;
        this.bankAccountsRepo = bankAccountsRepo;
        this.journalEntriesRepo = journalEntriesRepo;
    }
    findAll(bankAccountId) {
        return this.statementsRepo.find({
            where: { bankAccountId },
            order: { transactionDate: 'ASC' },
        });
    }
    findUnreconciled(bankAccountId) {
        return this.statementsRepo.find({
            where: { bankAccountId, isReconciled: false },
            order: { transactionDate: 'ASC' },
        });
    }
    async uploadStatement(bankAccountId, fileBuffer, originalName) {
        const bankAccount = await this.bankAccountsRepo.findOne({ where: { id: bankAccountId } });
        if (!bankAccount)
            throw new common_1.NotFoundException('Bank account not found');
        const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: false });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName)
            throw new common_1.BadRequestException('Excel file has no sheets');
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (rawRows.length === 0)
            throw new common_1.BadRequestException('Excel file is empty or has no data rows');
        const rows = rawRows.map(row => {
            const norm = {};
            for (const [k, v] of Object.entries(row)) {
                norm[normalise(k)] = v;
            }
            return norm;
        });
        let inserted = 0;
        let skipped = 0;
        for (const row of rows) {
            const rawDate = pick(row, [
                'transaction_date', 'txn_date', 'date', 'value_date',
                'posting_date', 'trans_date', 'tran_date',
            ]);
            const txnDate = parseDate(rawDate);
            if (!txnDate) {
                skipped++;
                continue;
            }
            const description = String(pick(row, ['description', 'narration', 'particulars', 'details', 'remarks', 'transaction_details']) || '').trim();
            if (!description) {
                skipped++;
                continue;
            }
            const debit = parseNum(pick(row, ['debit', 'debit_amount', 'withdrawal', 'dr', 'debit_(dr.)']));
            const credit = parseNum(pick(row, ['credit', 'credit_amount', 'deposit', 'cr', 'credit_(cr.)']));
            const balance = parseNum(pick(row, ['balance', 'closing_balance', 'available_balance', 'running_balance']));
            const refNo = String(pick(row, ['reference_number', 'ref_no', 'cheque_no', 'chq_no', 'utr', 'transaction_id', 'txn_id']) || '').trim() || undefined;
            const txnId = String(pick(row, ['transaction_id', 'txn_id', 'transaction_ref_no', 'transaction_reference']) || '').trim() || undefined;
            if (debit === 0 && credit === 0) {
                skipped++;
                continue;
            }
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
    async reconcile(statementId, journalEntryId) {
        const stmt = await this.statementsRepo.findOne({ where: { id: statementId } });
        if (!stmt)
            throw new common_1.NotFoundException('Bank statement line not found');
        if (stmt.isReconciled)
            throw new common_1.BadRequestException('This transaction is already reconciled');
        const je = await this.journalEntriesRepo.findOne({ where: { id: journalEntryId } });
        if (!je)
            throw new common_1.NotFoundException('Journal entry not found');
        if (je.status !== 'POSTED')
            throw new common_1.BadRequestException('Only POSTED journal entries can be used for reconciliation');
        stmt.isReconciled = true;
        stmt.reconciledWithEntryId = journalEntryId;
        stmt.reconciledDate = new Date();
        return this.statementsRepo.save(stmt);
    }
    async unreconcile(statementId) {
        const stmt = await this.statementsRepo.findOne({ where: { id: statementId } });
        if (!stmt)
            throw new common_1.NotFoundException('Bank statement line not found');
        stmt.isReconciled = false;
        stmt.reconciledWithEntryId = null;
        stmt.reconciledDate = null;
        return this.statementsRepo.save(stmt);
    }
};
exports.BankStatementsService = BankStatementsService;
exports.BankStatementsService = BankStatementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_statement_entity_1.BankStatement)),
    __param(1, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(2, (0, typeorm_1.InjectRepository)(journal_entry_entity_1.JournalEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BankStatementsService);
//# sourceMappingURL=bank-statements.service.js.map