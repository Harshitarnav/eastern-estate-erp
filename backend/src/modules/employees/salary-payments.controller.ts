import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SalaryPaymentsService, CreateSalaryPaymentDto } from './salary-payments.service';

@UseGuards(JwtAuthGuard)
@Controller('employees/salary-payments')
export class SalaryPaymentsController {
  constructor(private readonly salaryPaymentsService: SalaryPaymentsService) {}

  /** List all salary payments, optionally filtered */
  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: string,
    @Query('status') status?: string,
  ) {
    return this.salaryPaymentsService.findAll({ employeeId, month, status });
  }

  /** Monthly payroll summary */
  @Get('summary')
  getSummary(@Query('month') month: string) {
    const m = month || new Date().toISOString().slice(0, 7) + '-01';
    return this.salaryPaymentsService.getMonthSummary(m);
  }

  /** Create a new salary payment record (status: PENDING) */
  @Post()
  create(@Body() dto: CreateSalaryPaymentDto, @Request() req) {
    return this.salaryPaymentsService.create(dto, req.user.userId);
  }

  /** Get single salary payment */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryPaymentsService.findOne(id);
  }

  /** Mark salary as PAID - triggers auto Journal Entry */
  @Post(':id/pay')
  processPay(
    @Param('id') id: string,
    @Body() body: {
      paymentMode?: string;
      transactionReference?: string;
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      paymentRemarks?: string;
      propertyId?: string;
    },
    @Request() req,
  ) {
    return this.salaryPaymentsService.processPay(id, req.user.userId, body);
  }

  /** Cancel a pending salary payment */
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.salaryPaymentsService.cancel(id);
  }

  /** Void posted JE and return salary to PENDING (books stay in sync) */
  @Post(':id/reverse-pay')
  reversePay(@Param('id') id: string, @Request() req) {
    return this.salaryPaymentsService.reversePaidPayment(id, req.user.userId);
  }

  /** Retry / regenerate missing Journal Entry for a PAID salary */
  @Post(':id/retry-je')
  retryJE(@Param('id') id: string, @Request() req) {
    return this.salaryPaymentsService.retryJE(id, req.user.userId);
  }
}
