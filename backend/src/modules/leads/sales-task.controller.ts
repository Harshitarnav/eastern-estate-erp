/**
 * @file sales-task.controller.ts
 * @description Controller for managing sales tasks and personal scheduler
 * @module LeadsModule
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
import { SalesTaskService } from './sales-task.service';
import { CreateSalesTaskDto } from './dto/create-sales-task.dto';
import { TaskStatus } from './entities/sales-task.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('sales-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesTaskController {
  constructor(private readonly salesTaskService: SalesTaskService) {}

  @Post()
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  create(@Body() createSalesTaskDto: CreateSalesTaskDto) {
    return this.salesTaskService.create(createSalesTaskDto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query('status') status?: TaskStatus) {
    return this.salesTaskService.findByUser(userId, status);
  }

  @Get('user/:userId/today')
  getTodayTasks(@Param('userId') userId: string) {
    return this.salesTaskService.getTodayTasks(userId);
  }

  @Get('user/:userId/upcoming')
  getUpcomingTasks(@Param('userId') userId: string, @Query('days') days?: number) {
    return this.salesTaskService.getUpcomingTasks(userId, days ? Number(days) : 7);
  }

  @Get('user/:userId/overdue')
  getOverdueTasks(@Param('userId') userId: string) {
    return this.salesTaskService.getOverdueTasks(userId);
  }

  @Get('user/:userId/statistics')
  getStatistics(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesTaskService.getStatistics(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('user/:userId/by-date')
  getTasksByDateRange(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.salesTaskService.getTasksByDateRange(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesTaskService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateSalesTaskDto>) {
    return this.salesTaskService.update(id, updateData);
  }

  @Patch(':id/complete')
  completeTask(
    @Param('id') id: string,
    @Body() body: { outcome?: string; notes?: string },
  ) {
    return this.salesTaskService.completeTask(id, body.outcome, body.notes);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: TaskStatus }) {
    return this.salesTaskService.updateStatus(id, body.status);
  }

  @Patch(':id/cancel')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  cancelTask(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.salesTaskService.cancelTask(id, body.reason);
  }

  @Patch(':id/reminder-sent')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  markReminderSent(@Param('id') id: string) {
    return this.salesTaskService.markReminderSent(id);
  }

  @Delete(':id')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  remove(@Param('id') id: string) {
    return this.salesTaskService.remove(id);
  }
}



