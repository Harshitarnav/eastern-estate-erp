import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConstructionReportsService } from '../services/construction-reports.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@Controller('construction/reports')
@UseGuards(JwtAuthGuard)
export class ConstructionReportsController {
  constructor(private readonly reportsService: ConstructionReportsService) {}

  @Get()
  getDashboard() {
    return this.reportsService.getDashboardSummary();
  }

  @Get('budget')
  getBudgetVsActual(@Query('projectId') projectId?: string) {
    return this.reportsService.getBudgetVsActual(projectId);
  }

  @Get('cost-to-complete')
  getCostToComplete(@Query('projectId') projectId?: string) {
    return this.reportsService.getCostToComplete(projectId);
  }

  @Get('vendor-spend')
  getVendorSpend(
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?: string,
  ) {
    return this.reportsService.getVendorSpendSummary(startDate, endDate);
  }

  @Get('labour')
  getLabourProductivity(@Query('projectId') projectId?: string) {
    return this.reportsService.getLabourProductivity(projectId);
  }

  @Get('qc')
  getQCPassRate(@Query('projectId') projectId?: string) {
    return this.reportsService.getQCPassRate(projectId);
  }
}
