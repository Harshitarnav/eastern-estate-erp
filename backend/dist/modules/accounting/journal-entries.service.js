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
exports.JournalEntriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const journal_entry_entity_1 = require("./entities/journal-entry.entity");
const journal_entry_line_entity_1 = require("./entities/journal-entry-line.entity");
const account_entity_1 = require("./entities/account.entity");
let JournalEntriesService = class JournalEntriesService {
    constructor(journalEntriesRepository, journalEntryLinesRepository, accountsRepository, dataSource) {
        this.journalEntriesRepository = journalEntriesRepository;
        this.journalEntryLinesRepository = journalEntryLinesRepository;
        this.accountsRepository = accountsRepository;
        this.dataSource = dataSource;
    }
    generateEntryNumber() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `JE${dateStr}${random}`;
    }
    async create(createJournalEntryDto, userId) {
        const totalDebit = createJournalEntryDto.lines.reduce((sum, line) => sum + line.debitAmount, 0);
        const totalCredit = createJournalEntryDto.lines.reduce((sum, line) => sum + line.creditAmount, 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new common_1.BadRequestException(`Journal entry must balance. Debits: ${totalDebit}, Credits: ${totalCredit}`);
        }
        for (const line of createJournalEntryDto.lines) {
            const account = await this.accountsRepository.findOne({
                where: { id: line.accountId },
            });
            if (!account) {
                throw new common_1.NotFoundException(`Account with ID ${line.accountId} not found`);
            }
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const entryNumber = createJournalEntryDto.entryNumber || this.generateEntryNumber();
            const journalEntry = this.journalEntriesRepository.create({
                ...createJournalEntryDto,
                entryNumber,
                createdBy: userId,
                totalDebit,
                totalCredit,
            });
            const savedEntry = await queryRunner.manager.save(journalEntry);
            const lines = createJournalEntryDto.lines.map(line => this.journalEntryLinesRepository.create({
                ...line,
                journalEntryId: savedEntry.id,
            }));
            await queryRunner.manager.save(lines);
            await queryRunner.commitTransaction();
            return this.findOne(savedEntry.id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(filters) {
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
    async findOne(id) {
        const journalEntry = await this.journalEntriesRepository.findOne({
            where: { id },
            relations: ['lines', 'lines.account', 'creator', 'poster', 'voider'],
        });
        if (!journalEntry) {
            throw new common_1.NotFoundException(`Journal entry with ID ${id} not found`);
        }
        return journalEntry;
    }
    async update(id, updateJournalEntryDto) {
        const journalEntry = await this.findOne(id);
        if (journalEntry.status === journal_entry_entity_1.JournalEntryStatus.POSTED) {
            throw new common_1.BadRequestException('Cannot update posted journal entries');
        }
        if (journalEntry.status === journal_entry_entity_1.JournalEntryStatus.VOID) {
            throw new common_1.BadRequestException('Cannot update voided journal entries');
        }
        Object.assign(journalEntry, updateJournalEntryDto);
        return await this.journalEntriesRepository.save(journalEntry);
    }
    async post(id, userId) {
        const journalEntry = await this.findOne(id);
        if (journalEntry.status !== journal_entry_entity_1.JournalEntryStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft journal entries can be posted');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            journalEntry.status = journal_entry_entity_1.JournalEntryStatus.POSTED;
            await queryRunner.manager.save(journalEntry);
            for (const line of journalEntry.lines) {
                const account = await queryRunner.manager.findOne(account_entity_1.Account, {
                    where: { id: line.accountId },
                });
                if (account) {
                    const isDebitAccount = ['ASSET', 'EXPENSE'].includes(account.accountType);
                    if (isDebitAccount) {
                        account.currentBalance = Number(account.currentBalance) + line.debitAmount - line.creditAmount;
                    }
                    else {
                        account.currentBalance = Number(account.currentBalance) + line.creditAmount - line.debitAmount;
                    }
                    await queryRunner.manager.save(account);
                }
            }
            await queryRunner.commitTransaction();
            return this.findOne(id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async void(id, userId, voidDto) {
        const journalEntry = await this.findOne(id);
        if (journalEntry.status !== journal_entry_entity_1.JournalEntryStatus.POSTED) {
            throw new common_1.BadRequestException('Only posted journal entries can be voided');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            journalEntry.status = journal_entry_entity_1.JournalEntryStatus.VOID;
            journalEntry.voidedBy = userId;
            journalEntry.voidedAt = new Date();
            journalEntry.voidReason = voidDto.voidReason;
            await queryRunner.manager.save(journalEntry);
            for (const line of journalEntry.lines) {
                const account = await queryRunner.manager.findOne(account_entity_1.Account, {
                    where: { id: line.accountId },
                });
                if (account) {
                    const isDebitAccount = ['ASSET', 'EXPENSE'].includes(account.accountType);
                    if (isDebitAccount) {
                        account.currentBalance = Number(account.currentBalance) - line.debitAmount + line.creditAmount;
                    }
                    else {
                        account.currentBalance = Number(account.currentBalance) - line.creditAmount + line.debitAmount;
                    }
                    await queryRunner.manager.save(account);
                }
            }
            await queryRunner.commitTransaction();
            return this.findOne(id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async remove(id) {
        const journalEntry = await this.findOne(id);
        if (journalEntry.status === journal_entry_entity_1.JournalEntryStatus.POSTED) {
            throw new common_1.BadRequestException('Cannot delete posted journal entries. Void them instead.');
        }
        await this.journalEntriesRepository.remove(journalEntry);
    }
};
exports.JournalEntriesService = JournalEntriesService;
exports.JournalEntriesService = JournalEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(journal_entry_entity_1.JournalEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(journal_entry_line_entity_1.JournalEntryLine)),
    __param(2, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], JournalEntriesService);
//# sourceMappingURL=journal-entries.service.js.map