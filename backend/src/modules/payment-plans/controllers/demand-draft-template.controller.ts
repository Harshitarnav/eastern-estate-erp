import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { DemandDraftTemplateService } from '../services/demand-draft-template.service';
import { CreateDemandDraftTemplateDto } from '../dto/create-demand-draft-template.dto';
import { UpdateDemandDraftTemplateDto } from '../dto/update-demand-draft-template.dto';

@Controller('demand-draft-templates')
@UseGuards(JwtAuthGuard)
export class DemandDraftTemplateController {
  constructor(private readonly templateService: DemandDraftTemplateService) {}

  @Post()
  async create(@Body() createDto: CreateDemandDraftTemplateDto, @Req() req: any) {
    return await this.templateService.create(createDto, req.user.id);
  }

  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const isActiveOnly = activeOnly === 'true';
    return await this.templateService.findAll(isActiveOnly);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.templateService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDemandDraftTemplateDto,
    @Req() req: any
  ) {
    return await this.templateService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.templateService.remove(id, req.user.id);
    return { message: 'Demand draft template deleted successfully' };
  }
}
