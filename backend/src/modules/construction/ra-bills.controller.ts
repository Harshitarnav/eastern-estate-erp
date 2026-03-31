import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RABillsService } from './ra-bills.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('ra-bills')
@UseGuards(JwtAuthGuard)
export class RABillsController {
  constructor(private readonly raBillsService: RABillsService) {}

  @Post()
  create(@Body() createDto: any, @Request() req: any) {
    return this.raBillsService.create(createDto, req.user?.id);
  }

  @Get()
  findAll(
    @Query('constructionProjectId') constructionProjectId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
    @Req() req?: any,
  ) {
    return this.raBillsService.findAll({
      constructionProjectId,
      vendorId,
      status,
      propertyId,
      accessiblePropertyIds: req?.accessiblePropertyIds,
    });
  }

  @Get('summary/:projectId')
  getSummary(@Param('projectId') projectId: string) {
    return this.raBillsService.getSummaryByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.raBillsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.raBillsService.update(id, updateDto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.raBillsService.submit(id);
  }

  @Post(':id/certify')
  certify(@Param('id') id: string, @Request() req: any) {
    return this.raBillsService.certify(id, req.user?.id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.raBillsService.approve(id, req.user?.id);
  }

  @Post(':id/mark-paid')
  markPaid(
    @Param('id') id: string,
    @Body() body: { paymentReference?: string },
    @Request() req: any,
  ) {
    return this.raBillsService.markPaid(id, body.paymentReference, req.user?.id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: { notes?: string }) {
    return this.raBillsService.reject(id, body.notes);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.raBillsService.remove(id);
  }
}
