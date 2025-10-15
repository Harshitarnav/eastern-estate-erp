import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TowersService } from './towers.service';
import {
  CreateTowerDto,
  UpdateTowerDto,
  QueryTowerDto,
  TowerResponseDto,
  PaginatedTowerResponseDto,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * Towers Controller
 * 
 * RESTful API endpoints for tower management.
 * Handles HTTP requests and delegates business logic to TowersService.
 * 
 * Eastern Estate API Philosophy:
 * - Clear, consistent endpoints
 * - Comprehensive documentation
 * - Proper status codes and error handling
 * - Security through authentication
 * 
 * All endpoints require JWT authentication to ensure data security.
 * 
 * @controller /api/towers
 */
@ApiTags('Towers')
@Controller('towers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TowersController {
  constructor(private readonly towersService: TowersService) {}

  /**
   * Create a new tower
   * 
   * POST /api/towers
   * 
   * Creates a new tower within a property/project.
   * Validates all data and ensures business rules compliance.
   * 
   * @param createTowerDto - Tower creation data
   * @returns Created tower with full details
   * 
   * @example
   * Request:
   * POST /api/towers
   * {
   *   "name": "Diamond Tower A",
   *   "towerNumber": "T1",
   *   "totalFloors": 15,
   *   "totalUnits": 60,
   *   "propertyId": "uuid-here"
   * }
   * 
   * Response: 201 Created
   * {
   *   "id": "uuid",
   *   "name": "Diamond Tower A",
   *   ...
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new tower',
    description: 'Creates a new tower within a property with complete details and validation',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tower created successfully',
    type: TowerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or business rule violation',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Property not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tower number already exists in this property',
  })
  async create(@Body() createTowerDto: CreateTowerDto): Promise<TowerResponseDto> {
    return this.towersService.create(createTowerDto);
  }

  /**
   * Get all towers with filtering
   * 
   * GET /api/towers
   * 
   * Retrieves a paginated list of towers with optional filtering.
   * Supports search, filtering by property, construction status, etc.
   * 
   * @param queryDto - Query parameters for filtering and pagination
   * @returns Paginated list of towers
   * 
   * @example
   * GET /api/towers?page=1&limit=10&propertyId=uuid&constructionStatus=READY_TO_MOVE
   * 
   * Response: 200 OK
   * {
   *   "data": [...],
   *   "meta": {
   *     "total": 50,
   *     "page": 1,
   *     "limit": 10,
   *     "totalPages": 5
   *   }
   * }
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all towers',
    description: 'Retrieves a paginated list of towers with comprehensive filtering options',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Towers retrieved successfully',
    type: PaginatedTowerResponseDto,
  })
  async findAll(@Query() queryDto: QueryTowerDto): Promise<PaginatedTowerResponseDto> {
    return this.towersService.findAll(queryDto);
  }

  /**
   * Get tower by ID
   * 
   * GET /api/towers/:id
   * 
   * Retrieves complete details of a specific tower including property relationship.
   * 
   * @param id - Tower UUID
   * @returns Tower details
   * 
   * @example
   * GET /api/towers/550e8400-e29b-41d4-a716-446655440000
   * 
   * Response: 200 OK
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "name": "Diamond Tower A",
   *   "property": {...},
   *   ...
   * }
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get tower by ID',
    description: 'Retrieves complete details of a specific tower',
  })
  @ApiParam({
    name: 'id',
    description: 'Tower UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tower found',
    type: TowerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tower not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TowerResponseDto> {
    return this.towersService.findOne(id);
  }

  /**
   * Update tower
   * 
   * PUT /api/towers/:id
   * 
   * Updates tower information with data validation.
   * Allows partial updates - only provided fields are updated.
   * 
   * @param id - Tower UUID
   * @param updateTowerDto - Updated tower data
   * @returns Updated tower details
   * 
   * @example
   * PUT /api/towers/550e8400-e29b-41d4-a716-446655440000
   * {
   *   "constructionStatus": "COMPLETED",
   *   "completionDate": "2025-12-31"
   * }
   * 
   * Response: 200 OK
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "constructionStatus": "COMPLETED",
   *   ...
   * }
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update tower',
    description: 'Updates tower information with validation. Supports partial updates.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tower UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tower updated successfully',
    type: TowerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tower not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tower number conflict',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTowerDto: UpdateTowerDto,
  ): Promise<TowerResponseDto> {
    return this.towersService.update(id, updateTowerDto);
  }

  /**
   * Delete tower (soft delete)
   * 
   * DELETE /api/towers/:id
   * 
   * Soft deletes a tower by setting isActive to false.
   * Preserves historical data and maintains referential integrity.
   * 
   * @param id - Tower UUID
   * @returns Success message
   * 
   * @example
   * DELETE /api/towers/550e8400-e29b-41d4-a716-446655440000
   * 
   * Response: 200 OK
   * {
   *   "message": "Tower Diamond Tower A has been deactivated..."
   * }
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete tower',
    description: 'Soft deletes a tower (deactivates). Historical data is preserved.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tower UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tower deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tower not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.towersService.remove(id);
  }

  /**
   * Get towers by property
   * 
   * GET /api/towers/property/:propertyId
   * 
   * Retrieves all towers within a specific property/project.
   * Useful for property detail pages and tower selection.
   * 
   * @param propertyId - Property UUID
   * @returns List of towers in the property
   * 
   * @example
   * GET /api/towers/property/550e8400-e29b-41d4-a716-446655440000
   * 
   * Response: 200 OK
   * [
   *   {
   *     "id": "uuid",
   *     "name": "Tower A",
   *     ...
   *   },
   *   ...
   * ]
   */
  @Get('property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get towers by property',
    description: 'Retrieves all towers within a specific property',
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Towers retrieved successfully',
    type: [TowerResponseDto],
  })
  async findByProperty(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
  ): Promise<TowerResponseDto[]> {
    return this.towersService.findByProperty(propertyId);
  }

  /**
   * Get tower statistics
   * 
   * GET /api/towers/:id/statistics
   * 
   * Retrieves aggregated statistics for a tower.
   * Includes unit counts, occupancy rate, and construction status.
   * 
   * @param id - Tower UUID
   * @returns Tower statistics
   * 
   * @example
   * GET /api/towers/550e8400-e29b-41d4-a716-446655440000/statistics
   * 
   * Response: 200 OK
   * {
   *   "towerId": "uuid",
   *   "towerName": "Diamond Tower A",
   *   "totalUnits": 60,
   *   "availableUnits": 45,
   *   "soldUnits": 15,
   *   "occupancyRate": 25
   * }
   */
  @Get(':id/statistics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get tower statistics',
    description: 'Retrieves aggregated statistics for a tower including unit counts and occupancy',
  })
  @ApiParam({
    name: 'id',
    description: 'Tower UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tower not found',
  })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.towersService.getStatistics(id);
  }
}
