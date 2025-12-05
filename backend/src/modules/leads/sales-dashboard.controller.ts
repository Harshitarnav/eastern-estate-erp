import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { SalesDashboardService } from './sales-dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('sales-dashboard')
@UseGuards(JwtAuthGuard)
export class SalesDashboardController {
  constructor(private readonly salesDashboardService: SalesDashboardService) {}

  @Get(':salesPersonId')
  getDashboardMetrics(
    @Param('salesPersonId') salesPersonId: string,
    @Query('agentId') agentId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('towerId') towerId?: string,
    @Query('flatId') flatId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Req() req?: any,
  ) {
    const user = req?.user;
    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
    const isManager = roles.some((r) =>
      ['super_admin', 'admin', 'sales_manager', 'sales_gm'].includes(r),
    );

    const effectiveSalesPersonId = isManager ? agentId || salesPersonId : user?.id || salesPersonId;

    return this.salesDashboardService.getDashboardMetrics({
      salesPersonId: effectiveSalesPersonId,
      propertyId,
      towerId,
      flatId,
      dateFrom,
      dateTo,
    });
  }
}



