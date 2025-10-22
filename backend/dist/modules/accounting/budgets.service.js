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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const budget_entity_1 = require("./entities/budget.entity");
let BudgetsService = class BudgetsService {
    constructor(budgetsRepository) {
        this.budgetsRepository = budgetsRepository;
    }
    generateBudgetCode() {
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `BDG${year}${random}`;
    }
    async create(createBudgetDto, userId) {
        const budgetCode = createBudgetDto.budgetCode || this.generateBudgetCode();
        const budget = this.budgetsRepository.create({
            ...createBudgetDto,
            budgetCode,
            createdBy: userId,
        });
        return await this.budgetsRepository.save(budget);
    }
    async findAll(filters) {
        const query = this.budgetsRepository.createQueryBuilder('budget')
            .leftJoinAndSelect('budget.account', 'account');
        if (filters?.fiscalYear) {
            query.andWhere('budget.fiscalYear = :fiscalYear', {
                fiscalYear: filters.fiscalYear,
            });
        }
        if (filters?.status) {
            query.andWhere('budget.status = :status', { status: filters.status });
        }
        if (filters?.accountId) {
            query.andWhere('budget.accountId = :accountId', {
                accountId: filters.accountId,
            });
        }
        query.orderBy('budget.fiscalYear', 'DESC')
            .addOrderBy('budget.budgetName', 'ASC');
        return await query.getMany();
    }
    async findOne(id) {
        const budget = await this.budgetsRepository.findOne({
            where: { id },
            relations: ['account', 'creator'],
        });
        if (!budget) {
            throw new common_1.NotFoundException(`Budget with ID ${id} not found`);
        }
        return budget;
    }
    async update(id, updateBudgetDto) {
        const budget = await this.findOne(id);
        if (budget.status === budget_entity_1.BudgetStatus.CLOSED) {
            throw new common_1.BadRequestException('Cannot update closed budgets');
        }
        Object.assign(budget, updateBudgetDto);
        return await this.budgetsRepository.save(budget);
    }
    async remove(id) {
        const budget = await this.findOne(id);
        if (budget.status === budget_entity_1.BudgetStatus.ACTIVE || budget.status === budget_entity_1.BudgetStatus.CLOSED) {
            throw new common_1.BadRequestException('Cannot delete active or closed budgets');
        }
        await this.budgetsRepository.remove(budget);
    }
    async getBudgetVarianceReport(fiscalYear) {
        const query = this.budgetsRepository.createQueryBuilder('budget')
            .leftJoinAndSelect('budget.account', 'account')
            .where('budget.status = :status', { status: budget_entity_1.BudgetStatus.ACTIVE });
        if (fiscalYear) {
            query.andWhere('budget.fiscalYear = :fiscalYear', { fiscalYear });
        }
        const budgets = await query.getMany();
        const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.budgetedAmount), 0);
        const totalActual = budgets.reduce((sum, b) => sum + Number(b.actualAmount), 0);
        const totalVariance = totalActual - totalBudgeted;
        const overBudgetCount = budgets.filter(b => Number(b.actualAmount) > Number(b.budgetedAmount)).length;
        const underBudgetCount = budgets.filter(b => Number(b.actualAmount) < Number(b.budgetedAmount)).length;
        return {
            budgets,
            totalBudgeted,
            totalActual,
            totalVariance,
            overBudgetCount,
            underBudgetCount,
        };
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map