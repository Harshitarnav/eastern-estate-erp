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
  PropertyResponseDto,
  PropertyHierarchyDto,
  PropertyInventorySummaryDto,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.create(createPropertyDto, req.user?.id);
  }

  @Get()
  async findAll(
    @Query() queryDto: QueryPropertyDto,
    @Request() req: any,
  ): Promise<PaginatedPropertyResponseDto> {
    return this.propertiesService.findAll(queryDto, req.user?.id);
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.propertiesService.getStats(req.user?.id);
  }

  @Get('code/:code')
  async findByCode(
    @Param('code') code: string,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.findByCode(code, req.user?.id);
  }

  @Get(':id/hierarchy')
  async getHierarchy(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<PropertyHierarchyDto> {
    return this.propertiesService.getHierarchy(id, req.user?.id);
  }

  @Get(':id/inventory/summary')
  async getInventorySummary(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<PropertyInventorySummaryDto> {
    return this.propertiesService.getInventorySummary(id, req.user?.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.findOne(id, req.user?.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.update(id, updatePropertyDto, req.user?.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    return this.propertiesService.remove(id, req.user?.id);
  }

  @Put(':id/toggle-active')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async toggleActive(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.toggleActive(id, req.user?.id);
  }
}
