import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ConstructionProgressLogsService } from './construction-progress-logs.service';

@Controller('construction-progress-logs')
export class ConstructionProgressLogsController {
  constructor(private readonly constructionProgressLogsService: ConstructionProgressLogsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.constructionProgressLogsService.create(createDto);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.constructionProgressLogsService.findByProject(projectId);
  }

  @Get('project/:projectId/latest')
  getLatestByProject(@Param('projectId') projectId: string) {
    return this.constructionProgressLogsService.getLatestByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constructionProgressLogsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.constructionProgressLogsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constructionProgressLogsService.remove(id);
  }
}
