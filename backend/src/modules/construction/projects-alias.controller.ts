import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ConstructionProjectsService } from './construction-projects.service';
import { CreateConstructionProjectDto } from './dto/create-construction-project.dto';
import { UpdateConstructionProjectDto } from './dto/update-construction-project.dto';

// This controller simply aliases /projects to the existing construction projects endpoints
@Controller('projects')
export class ProjectsAliasController {
  constructor(private readonly constructionProjectsService: ConstructionProjectsService) {}

  @Post()
  create(@Body() createDto: CreateConstructionProjectDto) {
    return this.constructionProjectsService.create(createDto);
  }

  @Get()
  findAll(@Query('propertyId') propertyId?: string) {
    return this.constructionProjectsService.findAll(propertyId);
  }

  @Get('property/:propertyId')
  getByProperty(@Param('propertyId') propertyId: string) {
    return this.constructionProjectsService.getByProperty(propertyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constructionProjectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateConstructionProjectDto) {
    return this.constructionProjectsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constructionProjectsService.remove(id);
  }
}
