import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  PaginatedProjectResponseDto,
  ProjectResponseDto,
  QueryProjectDto,
  UpdateProjectDto,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(createProjectDto, req.user?.id);
  }

  @Get()
  async findAll(@Query() query: QueryProjectDto): Promise<PaginatedProjectResponseDto> {
    return this.projectsService.findAll(query);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string): Promise<ProjectResponseDto> {
    return this.projectsService.findByCode(code);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, updateProjectDto, req.user?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.projectsService.remove(id);
  }

  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.projectsService.toggleActive(id);
  }
}
