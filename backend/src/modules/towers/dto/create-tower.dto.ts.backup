import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
  IsUUID,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new tower
 * 
 * Validates all required fields for tower creation.
 * Ensures data integrity and business rules compliance.
 * 
 * Eastern Estate Quality Standards:
 * - Every tower represents a promise of "Life Long Bonding"
 * - Premium construction standards reflected in validation
 * - Customer trust ensured through complete, accurate information
 */
export class CreateTowerDto {
  /**
   * Tower name - should be memorable and easy to identify
   * @example "Diamond Tower A", "Emerald Block", "Prestige Wing"
   */
  @ApiProperty({
    description: 'Name of the tower',
    example: 'Tower A',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tower name is required for identification' })
  @MaxLength(100, { message: 'Tower name cannot exceed 100 characters' })
  name: string;

  /**
   * Tower number/code for internal tracking
   * @example "T1", "A", "DC-01"
   */
  @ApiProperty({
    description: 'Unique tower number/code',
    example: 'T1',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tower number is required' })
  @MaxLength(50)
  towerNumber: string;

  @ApiPropertyOptional({
    description: 'Tower code identifier (defaults to tower number when omitted)',
    example: 'T1',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  towerCode?: string;

  /**
   * Detailed description highlighting unique features
   * Marketing-friendly content focusing on lifestyle and bonding
   */
  @ApiPropertyOptional({
    description: 'Detailed description of the tower',
    example: 'Premium tower featuring spacious 2BHK and 3BHK apartments with world-class amenities',
  })
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Total number of floors excluding basement
   * Validates realistic building height
   */
  @ApiProperty({
    description: 'Total number of floors',
    example: 15,
    minimum: 1,
    maximum: 100,
  })
  @IsInt({ message: 'Total floors must be a whole number' })
  @Min(1, { message: 'Tower must have at least 1 floor' })
  @Max(100, { message: 'Total floors cannot exceed 100' })
  @Type(() => Number)
  totalFloors: number;

  /**
   * Total residential units in the tower
   * Must be realistic based on floors and units per floor
   */
  @ApiProperty({
    description: 'Total number of residential units',
    example: 60,
    minimum: 1,
  })
  @IsInt({ message: 'Total units must be a whole number' })
  @Min(1, { message: 'Tower must have at least 1 unit' })
  @Type(() => Number)
  totalUnits: number;

  @ApiPropertyOptional({
    description: 'Planned number of units for the tower',
    example: 64,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  unitsPlanned?: number;

  /**
   * Number of basement levels for parking/utility
   */
  @ApiPropertyOptional({
    description: 'Number of basement levels',
    example: 2,
    default: 0,
  })
  @IsInt()
  @Min(0, { message: 'Basement levels cannot be negative' })
  @Max(5, { message: 'Basement levels cannot exceed 5' })
  @IsOptional()
  @Type(() => Number)
  basementLevels?: number;

  /**
   * Configuration of units per floor
   * Helps customers understand tower layout
   */
  @ApiPropertyOptional({
    description: 'Units per floor configuration',
    example: '4 units per floor (2BHK + 3BHK)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  unitsPerFloor?: string;

  /**
   * Tower-specific amenities
   * Highlights what makes this tower special
   */
  @ApiPropertyOptional({
    description: 'Array of tower-specific amenities',
    example: ['High-speed Elevators', 'Sky Lounge', 'Terrace Garden'],
    type: [String],
  })
  @IsArray({ message: 'Amenities must be provided as an array' })
  @IsString({ each: true, message: 'Each amenity must be a string' })
  @IsOptional()
  amenities?: string[];

  /**
   * Construction status for transparency
   * Customers appreciate knowing the current stage
   */
  @ApiPropertyOptional({
    description: 'Current construction status',
    enum: ['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'],
    example: 'UNDER_CONSTRUCTION',
    default: 'PLANNED',
  })
  @IsEnum(['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'], {
    message: 'Invalid construction status',
  })
  @IsOptional()
  constructionStatus?: 'PLANNED' | 'UNDER_CONSTRUCTION' | 'COMPLETED' | 'READY_TO_MOVE';

  /**
   * Construction start date
   * Provides timeline clarity to customers
   */
  @ApiPropertyOptional({
    description: 'Construction start date',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'Invalid date format for construction start' })
  @IsOptional()
  constructionStartDate?: string;

  /**
   * Expected/Actual completion date
   * Critical for customer decision-making
   */
  @ApiPropertyOptional({
    description: 'Expected or actual completion date',
    example: '2025-12-31',
  })
  @IsDateString({}, { message: 'Invalid date format for completion date' })
  @IsOptional()
  completionDate?: string;

  /**
   * RERA number for compliance and trust
   * Essential for customer confidence
   */
  @ApiPropertyOptional({
    description: 'RERA approval number',
    example: 'RERA/OR/2024/12345',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  reraNumber?: string;

  /**
   * Total built-up area in square feet
   * Helps in understanding tower scale
   */
  @ApiPropertyOptional({
    description: 'Total built-up area in sq.ft',
    example: 75000,
  })
  @IsNumber({}, { message: 'Built-up area must be a number' })
  @Min(0, { message: 'Built-up area cannot be negative' })
  @IsOptional()
  @Type(() => Number)
  builtUpArea?: number;

  /**
   * Total carpet area in square feet
   * Actual usable space for residents
   */
  @ApiPropertyOptional({
    description: 'Total carpet area in sq.ft',
    example: 60000,
  })
  @IsNumber({}, { message: 'Carpet area must be a number' })
  @Min(0, { message: 'Carpet area cannot be negative' })
  @IsOptional()
  @Type(() => Number)
  carpetArea?: number;

  /**
   * Floor-to-ceiling height for spaciousness
   * Premium living standard indicator
   */
  @ApiPropertyOptional({
    description: 'Floor-to-ceiling height in feet',
    example: 10.5,
  })
  @IsNumber({}, { message: 'Ceiling height must be a number' })
  @Min(8, { message: 'Minimum ceiling height should be 8 feet' })
  @Max(20, { message: 'Maximum ceiling height cannot exceed 20 feet' })
  @IsOptional()
  @Type(() => Number)
  ceilingHeight?: number;

  /**
   * Number of elevators/lifts
   * Convenience factor for residents
   */
  @ApiPropertyOptional({
    description: 'Number of elevators',
    example: 2,
    default: 1,
  })
  @IsInt()
  @Min(1, { message: 'At least 1 elevator is required' })
  @Max(10, { message: 'Maximum 10 elevators allowed' })
  @IsOptional()
  @Type(() => Number)
  numberOfLifts?: number;

  /**
   * Vastu compliance status
   * Important for traditional Indian customers
   */
  @ApiPropertyOptional({
    description: 'Vastu compliance status',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  vastuCompliant?: boolean;

  /**
   * Facing direction of the tower
   * Preference factor for many customers
   */
  @ApiPropertyOptional({
    description: 'Tower facing direction',
    example: 'North',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  facing?: string;

  /**
   * Special features for marketing
   * What makes this tower stand out
   */
  @ApiPropertyOptional({
    description: 'Special features and highlights',
    example: 'Premium corner units with panoramic city views',
  })
  @IsString()
  @IsOptional()
  specialFeatures?: string;

  /**
   * Display order for listing
   * Lower numbers appear first
   */
  @ApiPropertyOptional({
    description: 'Display order for sorting',
    example: 1,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  displayOrder?: number;

  /**
   * Tower images URLs
   * Visual representation for customers
   */
  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: ['https://example.com/tower1.jpg', 'https://example.com/tower2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  /**
   * Floor plan images
   * Helps customers visualize their future home
   */
  @ApiPropertyOptional({
    description: 'Floor plan images mapped by floor range',
    example: { 'ground': 'url1', '1-10': 'url2' },
  })
  @IsObject()
  @IsOptional()
  floorPlans?: Record<string, string>;

  /**
   * Property/Project ID
   * Links tower to parent property
   */
  @ApiProperty({
    description: 'UUID of the parent property',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Invalid property ID format' })
  @IsNotEmpty({ message: 'Property ID is required' })
  propertyId: string;
}
