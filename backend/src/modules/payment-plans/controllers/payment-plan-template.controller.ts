import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PaymentPlanTemplateService } from '../services/payment-plan-template.service';
import { CreatePaymentPlanTemplateDto } from '../dto/create-payment-plan-template.dto';
import { UpdatePaymentPlanTemplateDto } from '../dto/update-payment-plan-template.dto';

@Controller('payment-plan-templates')
@UseGuards(JwtAuthGuard)
export class PaymentPlanTemplateController {
  constructor(private readonly templateService: PaymentPlanTemplateService) {}

  @Post()
  async create(@Body() createDto: CreatePaymentPlanTemplateDto, @Req() req: any) {
    return await this.templateService.create(createDto, req.user.id);
  }

  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const isActiveOnly = activeOnly === 'true';
    return await this.templateService.findAll(isActiveOnly);
  }

  @Get('default')
  async findDefault() {
    return await this.templateService.findDefault();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.templateService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePaymentPlanTemplateDto,
    @Req() req: any
  ) {
    return await this.templateService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.templateService.remove(id, req.user.id);
    return { message: 'Payment plan template deleted successfully' };
  }
}
