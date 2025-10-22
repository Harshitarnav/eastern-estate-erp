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
} from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { CreateInstallmentDto, CreateInstallmentScheduleDto } from './dto/create-installment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InstallmentStatus } from './entities/payment-installment.entity';

@Controller('installments')
@UseGuards(JwtAuthGuard)
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Post()
  create(@Body() createInstallmentDto: CreateInstallmentDto) {
    return this.installmentsService.create(createInstallmentDto);
  }

  @Post('schedule')
  createSchedule(@Body() scheduleDto: CreateInstallmentScheduleDto) {
    return this.installmentsService.createSchedule(scheduleDto);
  }

  @Get()
  findAll(
    @Query('bookingId') bookingId?: string,
    @Query('status') status?: InstallmentStatus,
    @Query('overdue') overdue?: string,
  ) {
    const filters: any = {};
    
    if (bookingId) filters.bookingId = bookingId;
    if (status) filters.status = status;
    if (overdue === 'true') filters.overdue = true;

    return this.installmentsService.findAll(filters);
  }

  @Get('overdue')
  getOverdue() {
    return this.installmentsService.getOverdue();
  }

  @Get('upcoming')
  getUpcoming(@Query('days') days?: string) {
    const daysAhead = days ? parseInt(days) : 7;
    return this.installmentsService.getUpcoming(daysAhead);
  }

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.installmentsService.findByBooking(bookingId);
  }

  @Get('booking/:bookingId/stats')
  getBookingStats(@Param('bookingId') bookingId: string) {
    return this.installmentsService.getBookingStats(bookingId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.installmentsService.update(id, updateData);
  }

  @Post(':id/pay')
  markAsPaid(
    @Param('id') id: string,
    @Body() body: { paymentId: string; paidAmount?: number },
  ) {
    return this.installmentsService.markAsPaid(id, body.paymentId, body.paidAmount);
  }

  @Post(':id/waive')
  waive(@Param('id') id: string) {
    return this.installmentsService.waive(id);
  }

  @Post('update-late-fees')
  updateLateFees(@Body() body: { lateFeePerDay?: number }) {
    const lateFeePerDay = body.lateFeePerDay || 50;
    return this.installmentsService.updateLateFees(lateFeePerDay);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installmentsService.remove(id);
  }
}
