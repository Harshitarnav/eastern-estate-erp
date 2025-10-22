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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, ApproveExpenseDto, RejectExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExpenseStatus } from './entities/expense.entity';

@Controller('accounting/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return this.expensesService.create(createExpenseDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('status') status?: ExpenseStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.findAll({
      expenseCategory: category,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('summary')
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.getExpensesSummary({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() approveDto: ApproveExpenseDto, @Request() req) {
    return this.expensesService.approve(id, req.user.userId, approveDto);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() rejectDto: RejectExpenseDto, @Request() req) {
    return this.expensesService.reject(id, req.user.userId, rejectDto);
  }

  @Post(':id/paid')
  markAsPaid(@Param('id') id: string) {
    return this.expensesService.markAsPaid(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
