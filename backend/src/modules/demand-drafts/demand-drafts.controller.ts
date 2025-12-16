import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { DemandDraftsService } from './demand-drafts.service';
import { CreateDemandDraftDto } from './dto/create-demand-draft.dto';
import { UpdateDemandDraftDto } from './dto/update-demand-draft.dto';

@Controller('demand-drafts')
export class DemandDraftsController {
  constructor(private readonly demandDraftsService: DemandDraftsService) {}

  @Post()
  create(@Body() dto: CreateDemandDraftDto) {
    return this.demandDraftsService.create(dto);
  }

  @Get()
  findAll(
    @Query('flatId') flatId?: string,
    @Query('customerId') customerId?: string,
    @Query('bookingId') bookingId?: string,
    @Query('milestoneId') milestoneId?: string,
  ) {
    return this.demandDraftsService.findAll({ flatId, customerId, bookingId, milestoneId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demandDraftsService.findOne(id);
  }

  @Get(':id/html')
  async getHtml(@Param('id') id: string) {
    const draft = await this.demandDraftsService.findOneRaw(id);
    return { html: this.demandDraftsService.buildHtmlTemplate(draft) };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDemandDraftDto) {
    return this.demandDraftsService.update(id, dto);
  }

  @Post(':id/send')
  markSent(@Param('id') id: string, @Body('fileUrl') fileUrl?: string) {
    return this.demandDraftsService.markSent(id, fileUrl);
  }
}
