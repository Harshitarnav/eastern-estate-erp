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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PaymentStatus } from './entities/payment.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.create(createPaymentDto, req.user.userId);
  }

  @Get()
  async findAll(
    @Query('bookingId') bookingId?: string,
    @Query('customerId') customerId?: string,
    @Query('paymentType') paymentType?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('status') status?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};
    
    if (bookingId) filters.bookingId = bookingId;
    if (customerId) filters.customerId = customerId;
    if (paymentType) filters.paymentType = paymentType;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (minAmount) filters.minAmount = parseFloat(minAmount);
    if (maxAmount) filters.maxAmount = parseFloat(maxAmount);

    const payments = await this.paymentsService.findAll(filters);
    
    // Paginate results
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedPayments = payments.slice(startIndex, endIndex);
    const total = payments.length;
    const totalPages = Math.ceil(total / limitNum);
    
    return {
      data: paginatedPayments,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    };
  }

  @Get('statistics')
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentType') paymentType?: string,
  ) {
    const filters: any = {};
    
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (paymentType) filters.paymentType = paymentType;

    return this.paymentsService.getStatistics(filters);
  }

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findAll({ bookingId });
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.paymentsService.findAll({ customerId });
  }

  @Get('code/:paymentCode')
  findByCode(@Param('paymentCode') paymentCode: string) {
    return this.paymentsService.findByPaymentCode(paymentCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Post(':id/verify')
  verify(@Param('id') id: string, @Request() req) {
    return this.paymentsService.verify(id, req.user.userId);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.paymentsService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
