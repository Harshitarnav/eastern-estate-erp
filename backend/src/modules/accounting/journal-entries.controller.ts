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
} from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto, VoidJournalEntryDto } from './dto/create-journal-entry.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JournalEntryStatus } from './entities/journal-entry.entity';

@Controller('journal-entries')
@UseGuards(JwtAuthGuard)
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  create(@Body() createJournalEntryDto: CreateJournalEntryDto, @Request() req) {
    return this.journalEntriesService.create(createJournalEntryDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('status') status?: JournalEntryStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('referenceType') referenceType?: string,
  ) {
    return this.journalEntriesService.findAll({
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      referenceType,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalEntriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJournalEntryDto: UpdateJournalEntryDto) {
    return this.journalEntriesService.update(id, updateJournalEntryDto);
  }

  @Post(':id/post')
  post(@Param('id') id: string, @Request() req) {
    return this.journalEntriesService.post(id, req.user.userId);
  }

  @Post(':id/void')
  void(@Param('id') id: string, @Body() voidDto: VoidJournalEntryDto, @Request() req) {
    return this.journalEntriesService.void(id, req.user.userId, voidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.journalEntriesService.remove(id);
  }
}
