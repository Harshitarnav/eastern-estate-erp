import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { FlatPaymentPlanService } from '../services/flat-payment-plan.service';
import { CreateFlatPaymentPlanDto } from '../dto/create-flat-payment-plan.dto';
import { FlatPaymentMilestone } from '../entities/flat-payment-plan.entity';

@Controller('flat-payment-plans')
@UseGuards(JwtAuthGuard)
export class FlatPaymentPlanController {
  constructor(private readonly flatPaymentPlanService: FlatPaymentPlanService) {}

  @Post()
  async create(@Body() createDto: CreateFlatPaymentPlanDto, @Req() req: any) {
    return await this.flatPaymentPlanService.create(createDto, req.user.id);
  }

  @Get()
  async findAll() {
    return await this.flatPaymentPlanService.findAll();
  }

  @Get('flat/:flatId')
  async findByFlatId(@Param('flatId') flatId: string) {
    return await this.flatPaymentPlanService.findByFlatId(flatId);
  }

  @Get('booking/:bookingId')
  async findByBookingId(@Param('bookingId') bookingId: string) {
    return await this.flatPaymentPlanService.findByBookingId(bookingId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.flatPaymentPlanService.findOne(id);
  }

  @Put(':id/milestones/:sequence')
  async updateMilestone(
    @Param('id') id: string,
    @Param('sequence') sequence: string,
    @Body() updates: Partial<FlatPaymentMilestone>,
    @Req() req: any
  ) {
    return await this.flatPaymentPlanService.updateMilestone(
      id,
      parseInt(sequence),
      updates,
      req.user.id
    );
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: any) {
    return await this.flatPaymentPlanService.cancel(id, req.user.id);
  }
}
