import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';

/**
 * Tower Response DTO
 * 
 * Standardized response format for tower data.
 * Includes property relationship and computed fields.
 * 
 * Eastern Estate Transparency:
 * Provide complete, clear information to build customer trust.
 */
export class TowerResponseDto {
  @ApiProperty({
    description: 'Tower unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Tower name',
    example: 'Diamond Tower A',
  })
  name: string;

  @ApiProperty({
    description: 'Tower number/code',
    example: 'T1',
  })
  towerNumber: string;

  @ApiProperty({
    description: 'Tower code',
    example: 'T1',
  })
  towerCode: string;

  @ApiPropertyOptional({
    description: 'Tower description',
    example: 'Premium residential tower with 2BHK and 3BHK apartments',
  })
  description?: string;

  @ApiProperty({
    description: 'Total number of floors',
    example: 15,
  })
  totalFloors: number;

  @ApiProperty({
    description: 'Total number of units',
    example: 60,
  })
  totalUnits: number;

  @ApiProperty({
    description: 'Number of basement levels',
    example: 2,
  })
  basementLevels: number;

  @ApiPropertyOptional({
    description: 'Units per floor configuration',
    example: '4 units per floor (2BHK + 3BHK)',
  })
  unitsPerFloor?: string;

  @ApiPropertyOptional({
    description: 'Tower-specific amenities',
    example: ['High-speed Elevators', 'Sky Lounge'],
    type: [String],
  })
  amenities?: string[];

  @ApiProperty({
    description: 'Construction status',
    example: 'UNDER_CONSTRUCTION',
    enum: ['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'],
  })
  constructionStatus: string;

  @ApiPropertyOptional({
    description: 'Construction start date',
    example: '2024-01-15',
  })
  constructionStartDate?: string | Date;

  @ApiPropertyOptional({
    description: 'Completion date',
    example: '2025-12-31',
  })
  completionDate?: string | Date;

  @ApiPropertyOptional({
    description: 'RERA number',
    example: 'RERA/OR/2024/12345',
  })
  reraNumber?: string;

  @ApiPropertyOptional({
    description: 'Built-up area in sq.ft',
    example: 75000,
  })
  builtUpArea?: number;

  @ApiPropertyOptional({
    description: 'Carpet area in sq.ft',
    example: 60000,
  })
  carpetArea?: number;

  @ApiPropertyOptional({
    description: 'Ceiling height in feet',
    example: 10.5,
  })
  ceilingHeight?: number;

  @ApiProperty({
    description: 'Number of elevators',
    example: 2,
  })
  numberOfLifts: number;

  @ApiProperty({
    description: 'Vastu compliance',
    example: true,
  })
  vastuCompliant: boolean;

  @ApiPropertyOptional({
    description: 'Facing direction',
    example: 'North',
  })
  facing?: string;

  @ApiPropertyOptional({
    description: 'Special features',
    example: 'Premium corner units with city views',
  })
  specialFeatures?: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Display order',
    example: 1,
  })
  displayOrder: number;

  @ApiPropertyOptional({
    description: 'Tower images',
    type: [String],
  })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Floor plans',
  })
  floorPlans?: Record<string, string>;

  @ApiProperty({
    description: 'Property ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  propertyId: string;

  @ApiPropertyOptional({
    description: 'Property details',
  })
  property?: {
    id: string;
    name: string;
    propertyCode: string;
    city: string;
    state: string;
  };

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: string | Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-20T15:45:00Z',
  })
  updatedAt: string | Date;

  // Computed fields
  @ApiPropertyOptional({
    description: 'Number of flats in this tower',
    example: 60,
  })
  flatsCount?: number;

  @ApiPropertyOptional({
    description: 'Number of available units',
    example: 45,
  })
  availableUnits?: number;

  @ApiPropertyOptional({
    description: 'Number of sold units',
    example: 15,
  })
  soldUnits?: number;

  @ApiPropertyOptional({
    description: 'Occupancy percentage',
    example: 25,
  })
  occupancyRate?: number;

  @ApiPropertyOptional({
    description: 'Planned number of units for the tower',
    example: 64,
  })
  unitsPlanned?: number;

  @ApiPropertyOptional({
    description: 'Number of units currently defined',
    example: 58,
  })
  unitsDefined?: number;

  @ApiPropertyOptional({
    description: 'Data completeness percentage (0-100)',
    example: 78.5,
  })
  dataCompletionPct?: number;

  @ApiPropertyOptional({
    description: 'Editorial data completeness status',
    enum: DataCompletenessStatus,
  })
  dataCompletenessStatus?: DataCompletenessStatus;

  @ApiPropertyOptional({
    description: 'Outstanding data issue count',
    example: 3,
  })
  issuesCount?: number;
}

/**
 * Paginated Tower Response
 * 
 * Standard pagination wrapper for tower lists.
 */
export class PaginatedTowerResponseDto {
  @ApiProperty({
    description: 'Array of towers',
    type: [TowerResponseDto],
  })
  data: TowerResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
