import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConstructionService } from './construction.service';
import {
  CreateConstructionProjectDto,
  UpdateConstructionProjectDto,
  QueryConstructionProjectDto,
  ConstructionProjectResponseDto,
  PaginatedConstructionProjectsResponse,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('construction')
@UseGuards(JwtAuthGuard)
export class ConstructionController {
  constructor(private readonly constructionService: ConstructionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateConstructionProjectDto): Promise<ConstructionProjectResponseDto> {
    return this.constructionService.create(createDto);
  }

  @Get()
  async findAll(@Query() query: QueryConstructionProjectDto): Promise<PaginatedConstructionProjectsResponse> {
    return this.constructionService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return this.constructionService.getStatistics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ConstructionProjectResponseDto> {
    return this.constructionService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateConstructionProjectDto,
  ): Promise<ConstructionProjectResponseDto> {
    return this.constructionService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.constructionService.remove(id);
  }

  @Post(':id/progress')
  @HttpCode(HttpStatus.OK)
  async updateProgress(
    @Param('id') id: string,
    @Body() body: { phase: string; progress: number },
  ): Promise<ConstructionProjectResponseDto> {
    return this.constructionService.updateProgress(id, body.phase, body.progress);
  }
}
