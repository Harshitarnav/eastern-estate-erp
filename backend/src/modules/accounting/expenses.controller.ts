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
  Req,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, ApproveExpenseDto, RejectExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExpenseStatus } from './entities/expense.entity';
import {
  accessiblePropertyIdsOrThrow,
  assertExpenseReadable,
} from './utils/accounting-scope.util';

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
    @Req() req: ExpressRequest,
    @Query('category') category?: string,
    @Query('status') status?: ExpenseStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    const scopeIds = accessiblePropertyIdsOrThrow(req as any);
    return this.expensesService.findAll({
      expenseCategory: category,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      propertyId,
      accessiblePropertyIds: scopeIds || undefined,
    });
  }

  @Get('summary')
  getSummary(
    @Req() req: ExpressRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const scopeIds = accessiblePropertyIdsOrThrow(req as any);
    return this.expensesService.getExpensesSummary({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      accessiblePropertyIds: scopeIds || undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: ExpressRequest) {
    const exp = await this.expensesService.findOne(id);
    assertExpenseReadable(exp, req as any);
    return exp;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Req() req: ExpressRequest,
  ) {
    const exp = await this.expensesService.findOne(id);
    assertExpenseReadable(exp, req as any);
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveExpenseDto,
    @Request() req,
  ) {
    const exp = await this.expensesService.findOne(id);
    assertExpenseReadable(exp, req as any);
    return this.expensesService.approve(id, req.user.userId, approveDto);
  }

  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectExpenseDto,
    @Request() req,
  ) {
    const exp = await this.expensesService.findOne(id);
    assertExpenseReadable(exp, req as any);
    return this.expensesService.reject(id, req.user.userId, rejectDto);
  }

  @Post(':id/paid')
  async markAsPaid(@Param('id') id: string, @Request() req) {
    const exp = await this.expensesService.findOne(id);
    assertExpenseReadable(exp, req as any);
    return this.expensesService.markAsPaid(id, req.user?.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: ExpressRequest) {
    const exp = await this.expensesService.findOne(id);
    assertExpenseReadable(exp, req as any);
    return this.expensesService.remove(id);
  }
}
