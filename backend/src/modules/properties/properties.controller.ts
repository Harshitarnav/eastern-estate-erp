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
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { 
  CreatePropertyDto, 
  UpdatePropertyDto, 
  QueryPropertyDto,
  PaginatedPropertyResponseDto,
  PropertyResponseDto
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.create(createPropertyDto, req.user?.id);
  }

  @Get()
  async findAll(@Query() queryDto: QueryPropertyDto): Promise<PaginatedPropertyResponseDto> {
    return this.propertiesService.findAll(queryDto);
  }

  @Get('stats')
  async getStats() {
    return this.propertiesService.getStats();
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string): Promise<PropertyResponseDto> {
    return this.propertiesService.findByCode(code);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PropertyResponseDto> {
    return this.propertiesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.update(id, updatePropertyDto, req.user?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.propertiesService.remove(id);
  }

  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: string): Promise<PropertyResponseDto> {
    return this.propertiesService.toggleActive(id);
  }
}
