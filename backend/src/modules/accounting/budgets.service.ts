import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget, BudgetStatus } from './entities/budget.entity';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
  ) {}

  private generateBudgetCode(): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BDG${year}${random}`;
  }

  async create(createBudgetDto: CreateBudgetDto, userId: string): Promise<Budget> {
    const budgetCode = createBudgetDto.budgetCode || this.generateBudgetCode();

    const budget = this.budgetsRepository.create({
      ...createBudgetDto,
      budgetCode,
      createdBy: userId,
    });

    return await this.budgetsRepository.save(budget);
  }

  async findAll(filters?: {
    fiscalYear?: number;
    status?: BudgetStatus;
    accountId?: string;
  }): Promise<Budget[]> {
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

  async findOne(id: string): Promise<Budget> {
    const budget = await this.budgetsRepository.findOne({
      where: { id },
      relations: ['account', 'creator'],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    const budget = await this.findOne(id);

    if (budget.status === BudgetStatus.CLOSED) {
      throw new BadRequestException('Cannot update closed budgets');
    }

    Object.assign(budget, updateBudgetDto);

    return await this.budgetsRepository.save(budget);
  }

  async remove(id: string): Promise<void> {
    const budget = await this.findOne(id);

    if (budget.status === BudgetStatus.ACTIVE || budget.status === BudgetStatus.CLOSED) {
      throw new BadRequestException('Cannot delete active or closed budgets');
    }

    await this.budgetsRepository.remove(budget);
  }

  async getBudgetVarianceReport(fiscalYear?: number): Promise<{
    budgets: Budget[];
    totalBudgeted: number;
    totalActual: number;
    totalVariance: number;
    overBudgetCount: number;
    underBudgetCount: number;
  }> {
    const query = this.budgetsRepository.createQueryBuilder('budget')
      .leftJoinAndSelect('budget.account', 'account')
      .where('budget.status = :status', { status: BudgetStatus.ACTIVE });

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
}
