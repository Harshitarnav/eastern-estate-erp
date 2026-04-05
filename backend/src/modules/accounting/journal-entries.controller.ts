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
  Request,
  Req,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto, VoidJournalEntryDto } from './dto/create-journal-entry.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JournalEntryStatus } from './entities/journal-entry.entity';
import {
  accessiblePropertyIdsOrThrow,
  assertJournalEntryReadable,
} from './utils/accounting-scope.util';

@Controller('accounting/journal-entries')
@UseGuards(JwtAuthGuard)
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  create(@Body() createJournalEntryDto: CreateJournalEntryDto, @Request() req) {
    return this.journalEntriesService.create(createJournalEntryDto, req.user.userId);
  }

  @Get()
  findAll(
    @Req() req: ExpressRequest,
    @Query('status') status?: JournalEntryStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('referenceType') referenceType?: string,
  ) {
    const scopeIds = accessiblePropertyIdsOrThrow(req as any);
    return this.journalEntriesService.findAll({
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      referenceType,
      accessiblePropertyIds: scopeIds || undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: ExpressRequest) {
    const entry = await this.journalEntriesService.findOne(id);
    assertJournalEntryReadable(entry as any, req as any);
    return entry;
  }

  @Get(':id/lines')
  async findLines(@Param('id') id: string, @Req() req: ExpressRequest) {
    const entry = await this.journalEntriesService.findOne(id);
    assertJournalEntryReadable(entry as any, req as any);
    return entry.lines ?? [];
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJournalEntryDto: UpdateJournalEntryDto,
    @Req() req: ExpressRequest,
  ) {
    const entry = await this.journalEntriesService.findOne(id);
    assertJournalEntryReadable(entry as any, req as any);
    return this.journalEntriesService.update(id, updateJournalEntryDto);
  }

  @Post(':id/post')
  async post(@Param('id') id: string, @Request() req) {
    const entry = await this.journalEntriesService.findOne(id);
    assertJournalEntryReadable(entry as any, req as any);
    return this.journalEntriesService.post(id, req.user.userId);
  }

  @Post(':id/void')
  async void(
    @Param('id') id: string,
    @Body() voidDto: VoidJournalEntryDto,
    @Request() req,
  ) {
    const entry = await this.journalEntriesService.findOne(id);
    assertJournalEntryReadable(entry as any, req as any);
    return this.journalEntriesService.void(id, req.user.userId, voidDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: ExpressRequest) {
    const entry = await this.journalEntriesService.findOne(id);
    assertJournalEntryReadable(entry as any, req as any);
    return this.journalEntriesService.remove(id);
  }
}
