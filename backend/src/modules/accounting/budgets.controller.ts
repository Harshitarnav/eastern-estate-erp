import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BudgetStatus } from './entities/budget.entity';

@Controller('accounting/budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto, @Request() req) {
    return this.budgetsService.create(createBudgetDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('fiscalYear') fiscalYear?: string,
    @Query('status') status?: BudgetStatus,
  ) {
    return this.budgetsService.findAll({
      fiscalYear: fiscalYear ? parseInt(fiscalYear) : undefined,
      status,
    });
  }

  @Get('variance-report')
  getVarianceReport(@Query('fiscalYear') fiscalYear?: string) {
    return this.budgetsService.getBudgetVarianceReport(
      fiscalYear ? parseInt(fiscalYear) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }
}
