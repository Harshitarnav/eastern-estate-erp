/**
 * @file sales-target.controller.ts
 * @description Controller for managing sales targets
 * @module EmployeesModule
 */

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
import { SalesTargetService } from './sales-target.service';
import { CreateSalesTargetDto } from './dto/create-sales-target.dto';
import { TargetPeriod } from './entities/sales-target.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('sales-targets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesTargetController {
  constructor(private readonly salesTargetService: SalesTargetService) {}

  @Post()
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  create(@Body() createSalesTargetDto: CreateSalesTargetDto) {
    return this.salesTargetService.create(createSalesTargetDto);
  }

  @Get('salesperson/:salesPersonId')
  findBySalesPerson(@Param('salesPersonId') salesPersonId: string) {
    return this.salesTargetService.findBySalesPerson(salesPersonId);
  }

  @Get('salesperson/:salesPersonId/active')
  getActiveTarget(
    @Param('salesPersonId') salesPersonId: string,
    @Query('period') period?: TargetPeriod,
  ) {
    return this.salesTargetService.getActiveTarget(salesPersonId, period);
  }

  @Get('team/performance-summary')
  getTeamPerformanceSummary(@Query('teamMemberIds') teamMemberIds: string) {
    const ids = teamMemberIds.split(',');
    return this.salesTargetService.getTeamPerformanceSummary(ids);
  }

  @Get('team/targets')
  getTeamTargets(
    @Query('teamMemberIds') teamMemberIds: string,
    @Query('period') period?: TargetPeriod,
  ) {
    const ids = teamMemberIds.split(',');
    return this.salesTargetService.getTeamTargets(ids, period);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesTargetService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateSalesTargetDto>) {
    return this.salesTargetService.update(id, updateData);
  }

  @Patch(':id/update-achievement')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  updateAchievement(@Param('id') id: string) {
    return this.salesTargetService.updateAchievement(id);
  }

  @Patch(':id/self-target')
  updateSelfTarget(
    @Param('id') id: string,
    @Body() body: { selfTargetBookings: number; selfTargetRevenue: number; notes?: string },
  ) {
    return this.salesTargetService.updateSelfTarget(
      id,
      body.selfTargetBookings,
      body.selfTargetRevenue,
      body.notes,
    );
  }

  @Patch(':id/mark-incentive-paid')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  markIncentivePaid(@Param('id') id: string) {
    return this.salesTargetService.markIncentivePaid(id);
  }

  @Delete(':id')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  remove(@Param('id') id: string) {
    return this.salesTargetService.remove(id);
  }
}



