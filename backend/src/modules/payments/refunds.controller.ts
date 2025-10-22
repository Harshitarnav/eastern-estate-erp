import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto, ApproveRefundDto, ProcessRefundDto } from './dto/create-refund.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RefundStatus } from './entities/payment-refund.entity';

@Controller('refunds')
@UseGuards(JwtAuthGuard)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  create(@Body() createRefundDto: CreateRefundDto, @Request() req) {
    return this.refundsService.create(createRefundDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('paymentId') paymentId?: string,
    @Query('status') status?: RefundStatus,
  ) {
    const filters: any = {};
    
    if (paymentId) filters.paymentId = paymentId;
    if (status) filters.status = status;

    return this.refundsService.findAll(filters);
  }

  @Get('pending')
  getPending() {
    return this.refundsService.getPendingRefunds();
  }

  @Get('approved')
  getApproved() {
    return this.refundsService.getApprovedRefunds();
  }

  @Get('statistics')
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.refundsService.getRefundStats(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.refundsService.findOne(id);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveRefundDto,
    @Request() req,
  ) {
    return this.refundsService.approve(id, req.user.userId, approveDto);
  }

  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.refundsService.reject(id, req.user.userId, body.reason);
  }

  @Post(':id/process')
  process(
    @Param('id') id: string,
    @Body() processDto: ProcessRefundDto,
    @Request() req,
  ) {
    return this.refundsService.process(id, req.user.userId, processDto);
  }
}
