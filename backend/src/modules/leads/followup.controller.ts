/**
 * @file followup.controller.ts
 * @description Controller for managing lead followups
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
import { FollowUpService } from './followup.service';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('followups')
@UseGuards(JwtAuthGuard)
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Post()
  create(@Body() createFollowUpDto: CreateFollowUpDto) {
    return this.followUpService.create(createFollowUpDto);
  }

  @Get('lead/:leadId')
  findByLead(@Param('leadId') leadId: string) {
    return this.followUpService.findByLead(leadId);
  }

  @Get('salesperson/:salesPersonId')
  findBySalesPerson(
    @Param('salesPersonId') salesPersonId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.followUpService.findBySalesPerson(
      salesPersonId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('salesperson/:salesPersonId/upcoming')
  getUpcomingFollowUps(@Param('salesPersonId') salesPersonId: string) {
    return this.followUpService.getUpcomingFollowUps(salesPersonId);
  }

  @Get('salesperson/:salesPersonId/statistics')
  getStatistics(
    @Param('salesPersonId') salesPersonId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.followUpService.getStatistics(
      salesPersonId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('salesperson/:salesPersonId/site-visit-statistics')
  getSiteVisitStatistics(
    @Param('salesPersonId') salesPersonId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.followUpService.getSiteVisitStatistics(
      salesPersonId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.followUpService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateFollowUpDto>) {
    return this.followUpService.update(id, updateData);
  }

  @Patch(':id/reminder-sent')
  markReminderSent(@Param('id') id: string) {
    return this.followUpService.markReminderSent(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.followUpService.remove(id);
  }
}




