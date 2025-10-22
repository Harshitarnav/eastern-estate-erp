import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ConstructionTeamsService } from './construction-teams.service';

@Controller('construction-teams')
export class ConstructionTeamsController {
  constructor(private readonly constructionTeamsService: ConstructionTeamsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.constructionTeamsService.create(createDto);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.constructionTeamsService.findByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constructionTeamsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.constructionTeamsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constructionTeamsService.remove(id);
  }
}
