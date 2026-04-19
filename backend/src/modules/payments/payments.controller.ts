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
    return this.paymentsService.create(createPaymentDto, req.user.id);
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
    @Query('isVerified') isVerified?: string,
    @Query('propertyId') propertyId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const filters: any = {};
    
    if (bookingId) filters.bookingId = bookingId;
    if (customerId) filters.customerId = customerId;
    if (paymentType) filters.paymentType = paymentType;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (status) filters.status = status;
    if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (minAmount) filters.minAmount = parseFloat(minAmount);
    if (maxAmount) filters.maxAmount = parseFloat(maxAmount);
    if (propertyId) filters.propertyId = propertyId;
    filters.accessiblePropertyIds = req?.accessiblePropertyIds;

    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const limitNum = limit
      ? Math.min(200, Math.max(1, parseInt(limit, 10) || 10))
      : 10;

    const { data, total } = await this.paymentsService.findAllPaginated(
      filters,
      pageNum,
      limitNum,
    );

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Get('statistics')
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentType') paymentType?: string,
    @Query('propertyId') propertyId?: string,
    @Request() req?: any,
  ) {
    const filters: any = {};
    
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (paymentType) filters.paymentType = paymentType;
    if (propertyId) filters.propertyId = propertyId;
    filters.accessiblePropertyIds = req?.accessiblePropertyIds;

    return this.paymentsService.getStatistics(filters);
  }

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId') bookingId: string, @Request() req: any) {
    return this.paymentsService.findAll({
      bookingId,
      accessiblePropertyIds: req?.accessiblePropertyIds,
    });
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string, @Request() req: any) {
    return this.paymentsService.findAll({
      customerId,
      accessiblePropertyIds: req?.accessiblePropertyIds,
    });
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
    return this.paymentsService.verify(id, req.user.id);
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
