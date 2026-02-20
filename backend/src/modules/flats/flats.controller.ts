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
import { FlatsService } from './flats.service';
import {
  CreateFlatDto,
  UpdateFlatDto,
  QueryFlatDto,
  FlatResponseDto,
  PaginatedFlatsResponse,
  FlatInventorySummaryDto,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('flats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FlatsController {
  constructor(private readonly flatsService: FlatsService) {}

  @Get('stats')
  async getGlobalStats() {
    return this.flatsService.getGlobalStats();
  }

  /**
   * Create a new flat
   * POST /flats
   * Only admin and super_admin can create flats
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() createFlatDto: CreateFlatDto): Promise<FlatResponseDto> {
    return this.flatsService.create(createFlatDto);
  }

  /**
   * Get all flats with filtering and pagination
   * GET /flats
   */
  @Get()
  async findAll(@Query() query: QueryFlatDto): Promise<PaginatedFlatsResponse> {
    return this.flatsService.findAll(query);
  }

  /**
   * Get flat by ID
   * GET /flats/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FlatResponseDto> {
    return this.flatsService.findOne(id);
  }

  /**
   * Get flats by tower ID
   * GET /flats/tower/:towerId
   */
  @Get('tower/:towerId')
  async findByTower(
    @Param('towerId') towerId: string,
  ): Promise<FlatResponseDto[]> {
    return this.flatsService.findByTower(towerId);
  }

  /**
   * Get flats by property ID
   * GET /flats/property/:propertyId
   */
  @Get('property/:propertyId')
  async findByProperty(
    @Param('propertyId') propertyId: string,
  ): Promise<FlatResponseDto[]> {
    return this.flatsService.findByProperty(propertyId);
  }

  /**
   * Get tower inventory summary
   * GET /flats/tower/:towerId/inventory/summary
   */
  @Get('tower/:towerId/inventory/summary')
  async getTowerInventorySummary(
    @Param('towerId') towerId: string,
  ): Promise<FlatInventorySummaryDto> {
    return this.flatsService.getTowerInventorySummary(towerId);
  }

  /**
   * Get property statistics
   * GET /flats/property/:propertyId/stats
   */
  @Get('property/:propertyId/stats')
  async getPropertyStats(@Param('propertyId') propertyId: string) {
    return this.flatsService.getPropertyStats(propertyId);
  }

  /**
   * Get tower statistics
   * GET /flats/tower/:towerId/stats
   */
  @Get('tower/:towerId/stats')
  async getTowerStats(@Param('towerId') towerId: string) {
    return this.flatsService.getTowerStats(towerId);
  }

  /**
   * Update flat
   * PUT /flats/:id
   * Only admin and super_admin can update flats
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateFlatDto: UpdateFlatDto,
  ): Promise<FlatResponseDto> {
    return this.flatsService.update(id, updateFlatDto);
  }

  /**
   * Delete flat
   * DELETE /flats/:id
   * Only admin and super_admin can delete flats
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.flatsService.remove(id);
  }
}
