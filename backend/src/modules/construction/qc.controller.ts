import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QCService } from './qc.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('qc-checklists')
@UseGuards(JwtAuthGuard)
export class QCController {
  constructor(private readonly qcService: QCService) {}

  @Get('template/:phase')
  getTemplate(@Param('phase') phase: string) {
    return this.qcService.getTemplate(phase);
  }

  @Get('summary/:projectId')
  getProjectSummary(@Param('projectId') projectId: string) {
    return this.qcService.getProjectSummary(projectId);
  }

  @Get()
  findAll(
    @Query('constructionProjectId') constructionProjectId?: string,
    @Query('phase') phase?: string,
    @Query('result') result?: string,
  ) {
    return this.qcService.findAll({ constructionProjectId, phase, result });
  }

  @Post()
  create(@Body() createDto: any, @Request() req: any) {
    return this.qcService.create(createDto, req.user?.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qcService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.qcService.update(id, updateDto);
  }

  @Post(':id/defects')
  addDefect(@Param('id') id: string, @Body() defect: any) {
    return this.qcService.addDefect(id, defect);
  }

  @Patch(':id/defects/:defectId')
  updateDefect(
    @Param('id') id: string,
    @Param('defectId') defectId: string,
    @Body() updateData: any,
  ) {
    return this.qcService.updateDefect(id, defectId, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qcService.remove(id);
  }
}
