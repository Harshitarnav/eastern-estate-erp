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
let ExpensesService = class ExpensesService {
    constructor(expensesRepository) {
        this.expensesRepository = expensesRepository;
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
        Object.assign(expense, updateExpenseDto);
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
    async markAsPaid(id) {
        const expense = await this.findOne(id);
        if (expense.status !== expense_entity_1.ExpenseStatus.APPROVED) {
            throw new common_1.BadRequestException('Only approved expenses can be marked as paid');
        }
        expense.status = expense_entity_1.ExpenseStatus.PAID;
        expense.paymentStatus = 'PAID';
        return await this.expensesRepository.save(expense);
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
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map