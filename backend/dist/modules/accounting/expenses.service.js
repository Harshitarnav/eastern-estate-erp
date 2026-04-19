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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const expense_entity_1 = require("./entities/expense.entity");
const accounting_integration_service_1 = require("./accounting-integration.service");
let ExpensesService = class ExpensesService {
    constructor(expensesRepository, accountingIntegrationService) {
        this.expensesRepository = expensesRepository;
        this.accountingIntegrationService = accountingIntegrationService;
    }
    generateExpenseCode() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `EXP${dateStr}${random}`;
    }
    async create(createExpenseDto, userId) {
        const expenseCode = createExpenseDto.expenseCode || this.generateExpenseCode();
        const expense = this.expensesRepository.create({
            ...createExpenseDto,
            expenseCode,
            createdBy: userId,
        });
        return await this.expensesRepository.save(expense);
    }
    async findAll(filters) {
        const query = this.expensesRepository.createQueryBuilder('expense')
            .leftJoinAndSelect('expense.account', 'account')
            .leftJoinAndSelect('expense.employee', 'employee')
            .leftJoinAndSelect('expense.property', 'property');
        if (filters?.expenseCategory) {
            query.andWhere('expense.expenseCategory = :category', {
                category: filters.expenseCategory,
            });
        }
        if (filters?.status) {
            query.andWhere('expense.status = :status', { status: filters.status });
        }
        if (filters?.startDate) {
            query.andWhere('expense.expenseDate >= :startDate', {
                startDate: filters.startDate,
            });
        }
        if (filters?.endDate) {
            query.andWhere('expense.expenseDate <= :endDate', {
                endDate: filters.endDate,
            });
        }
        if (filters?.vendorId) {
            query.andWhere('expense.vendorId = :vendorId', {
                vendorId: filters.vendorId,
            });
        }
        if (filters?.employeeId) {
            query.andWhere('expense.employeeId = :employeeId', {
                employeeId: filters.employeeId,
            });
        }
        if (filters?.propertyId) {
            query.andWhere('expense.propertyId = :propertyId', {
                propertyId: filters.propertyId,
            });
        }
        if (filters?.accessiblePropertyIds?.length) {
            query.andWhere('(expense.propertyId IS NULL OR expense.propertyId IN (:...expAccIds))', { expAccIds: filters.accessiblePropertyIds });
        }
        query.orderBy('expense.expenseDate', 'DESC');
        return await query.getMany();
    }
    async findOne(id) {
        const expense = await this.expensesRepository.findOne({
            where: { id },
            relations: ['account', 'employee', 'property', 'creator', 'approver'],
        });
        if (!expense) {
            throw new common_1.NotFoundException(`Expense with ID ${id} not found`);
        }
        return expense;
    }
    async update(id, updateExpenseDto) {
        const expense = await this.findOne(id);
        if (expense.status === expense_entity_1.ExpenseStatus.APPROVED || expense.status === expense_entity_1.ExpenseStatus.PAID) {
            throw new common_1.BadRequestException('Cannot update approved or paid expenses');
        }
        if (expense.journalEntryId) {
            throw new common_1.BadRequestException('This expense is posted to the books (journal entry linked). It cannot be edited. Contact an admin if a correction is required.');
        }
        const uuidFields = ['accountId', 'vendorId', 'employeeId', 'propertyId', 'constructionProjectId'];
        const sanitized = { ...updateExpenseDto };
        for (const field of uuidFields) {
            if (sanitized[field] === '')
                sanitized[field] = null;
        }
        Object.assign(expense, sanitized);
        return await this.expensesRepository.save(expense);
    }
    async approve(id, userId, approveDto) {
        const expense = await this.findOne(id);
        if (expense.status !== expense_entity_1.ExpenseStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending expenses can be approved');
        }
        expense.status = expense_entity_1.ExpenseStatus.APPROVED;
        expense.approvedBy = userId;
        expense.approvedAt = new Date();
        return await this.expensesRepository.save(expense);
    }
    async reject(id, userId, rejectDto) {
        const expense = await this.findOne(id);
        if (expense.status !== expense_entity_1.ExpenseStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending expenses can be rejected');
        }
        expense.status = expense_entity_1.ExpenseStatus.REJECTED;
        expense.approvedBy = userId;
        expense.approvedAt = new Date();
        expense.rejectionReason = rejectDto.rejectionReason;
        return await this.expensesRepository.save(expense);
    }
    async markAsPaid(id, userId) {
        const expense = await this.findOne(id);
        if (expense.status !== expense_entity_1.ExpenseStatus.APPROVED) {
            throw new common_1.BadRequestException('Only approved expenses can be marked as paid');
        }
        expense.status = expense_entity_1.ExpenseStatus.PAID;
        expense.paymentStatus = 'PAID';
        const saved = await this.expensesRepository.save(expense);
        const je = await this.accountingIntegrationService.onExpensePaid({
            id: saved.id,
            expenseCode: saved.expenseCode,
            amount: Number(saved.amount),
            expenseDate: saved.expenseDate,
            description: saved.description,
            accountId: saved.accountId,
            createdBy: userId,
            propertyId: saved.propertyId ?? null,
        });
        if (je) {
            await this.expensesRepository.update(saved.id, { journalEntryId: je.id });
            saved.journalEntryId = je.id;
        }
        return saved;
    }
    async bulkImport(rows, userId, defaults) {
        if (!Array.isArray(rows) || !rows.length) {
            throw new common_1.BadRequestException('Provide at least one expense row to import.');
        }
        const errors = [];
        const toCreate = [];
        rows.forEach((row, idx) => {
            const humanRow = idx + 2;
            const category = (row.expenseCategory || '').toString().trim();
            const amt = Number(row.amount);
            const dateStr = (row.expenseDate || '').toString().trim();
            if (!category) {
                errors.push({ row: humanRow, message: 'Missing expenseCategory' });
                return;
            }
            if (!amt || amt <= 0 || Number.isNaN(amt)) {
                errors.push({ row: humanRow, message: 'Invalid amount (must be > 0)' });
                return;
            }
            if (!dateStr) {
                errors.push({ row: humanRow, message: 'Missing expenseDate' });
                return;
            }
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) {
                errors.push({ row: humanRow, message: `Invalid expenseDate "${dateStr}"` });
                return;
            }
            toCreate.push(this.expensesRepository.create({
                expenseCode: this.generateExpenseCode(),
                expenseCategory: category,
                amount: amt,
                expenseDate: date,
                description: row.description?.toString().trim() || undefined,
                expenseType: row.expenseType?.toString().trim() || undefined,
                paymentMethod: row.paymentMethod?.toString().trim() || undefined,
                paymentReference: row.paymentReference?.toString().trim() || undefined,
                invoiceNumber: row.invoiceNumber?.toString().trim() || undefined,
                invoiceDate: row.invoiceDate ? new Date(row.invoiceDate) : undefined,
                propertyId: row.propertyId || defaults?.propertyId || undefined,
                vendorId: row.vendorId || undefined,
                employeeId: row.employeeId || undefined,
                accountId: row.accountId || undefined,
                status: expense_entity_1.ExpenseStatus.PENDING,
                createdBy: userId,
            }));
        });
        if (!toCreate.length) {
            return { created: 0, skipped: rows.length, errors, createdIds: [] };
        }
        const saved = await this.expensesRepository.save(toCreate);
        return {
            created: saved.length,
            skipped: rows.length - saved.length,
            errors,
            createdIds: saved.map((s) => s.id),
        };
    }
    async remove(id) {
        const expense = await this.findOne(id);
        if (expense.status === expense_entity_1.ExpenseStatus.PAID) {
            throw new common_1.BadRequestException('Cannot delete paid expenses');
        }
        await this.expensesRepository.remove(expense);
    }
    async getExpensesSummary(filters) {
        const query = this.expensesRepository.createQueryBuilder('expense');
        if (filters?.startDate) {
            query.andWhere('expense.expenseDate >= :startDate', {
                startDate: filters.startDate,
            });
        }
        if (filters?.endDate) {
            query.andWhere('expense.expenseDate <= :endDate', {
                endDate: filters.endDate,
            });
        }
        if (filters?.accessiblePropertyIds?.length) {
            query.andWhere('(expense.propertyId IS NULL OR expense.propertyId IN (:...sumAccIds))', { sumAccIds: filters.accessiblePropertyIds });
        }
        if (filters?.propertyId) {
            query.andWhere('expense.propertyId = :sumPropId', { sumPropId: filters.propertyId });
        }
        const expenses = await query.getMany();
        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const byCategory = Object.values(expenses.reduce((acc, exp) => {
            const cat = exp.expenseCategory;
            if (!acc[cat]) {
                acc[cat] = { category: cat, total: 0 };
            }
            acc[cat].total += Number(exp.amount);
            return acc;
        }, {}));
        const byStatus = Object.values(expenses.reduce((acc, exp) => {
            const status = exp.status;
            if (!acc[status]) {
                acc[status] = { status, total: 0 };
            }
            acc[status].total += Number(exp.amount);
            return acc;
        }, {}));
        return {
            totalExpenses,
            byCategory,
            byStatus,
        };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        accounting_integration_service_1.AccountingIntegrationService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map