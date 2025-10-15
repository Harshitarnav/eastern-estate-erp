import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for querying/filtering towers
 * 
 * Supports pagination, filtering, and searching.
 * Enables efficient tower discovery for users.
 * 
 * Eastern Estate User Experience:
 * Help customers find their perfect tower match quickly.
 * Filter by construction status, size, amenities, etc.
 */
export class QueryTowerDto {
  /**
   * Page number for pagination
   * Default: 1
   */
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  /**
   * Number of items per page
   * Default: 10
   */
  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  /**
   * Search term for tower name or number
   * Searches across name, towerNumber, and description
   */
  @ApiPropertyOptional({
    description: 'Search term for name, number, or description',
    example: 'Tower A',
  })
  @IsString()
  @IsOptional()
  search?: string;

  /**
   * Filter by property/project ID
   * Get all towers within a specific project
   */
  @ApiPropertyOptional({
    description: 'Filter by property ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  @IsOptional()
  propertyId?: string;

  /**
   * Filter by construction status
   * Helps customers find ready-to-move or under-construction options
   */
  @ApiPropertyOptional({
    description: 'Filter by construction status',
    enum: ['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'],
    example: 'READY_TO_MOVE',
  })
  @IsEnum(['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'])
  @IsOptional()
  constructionStatus?: 'PLANNED' | 'UNDER_CONSTRUCTION' | 'COMPLETED' | 'READY_TO_MOVE';

  /**
   * Filter by Vastu compliance
   * Important for traditional customers
   */
  @ApiPropertyOptional({
    description: 'Filter by Vastu compliance',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  vastuCompliant?: boolean;

  /**
   * Filter by tower facing direction
   * Customer preference for natural light and ventilation
   */
  @ApiPropertyOptional({
    description: 'Filter by facing direction',
    example: 'North',
  })
  @IsString()
  @IsOptional()
  facing?: string;

  /**
   * Minimum number of floors
   * For customers with specific height preferences
   */
  @ApiPropertyOptional({
    description: 'Minimum number of floors',
    example: 10,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minFloors?: number;

  /**
   * Maximum number of floors
   */
  @ApiPropertyOptional({
    description: 'Maximum number of floors',
    example: 20,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxFloors?: number;

  /**
   * Filter by active status
   * Include only active towers by default
   */
  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean = true;

  /**
   * Sort field
   * Order results by specific field
   */
  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'displayOrder',
    enum: ['name', 'towerNumber', 'totalFloors', 'totalUnits', 'displayOrder', 'createdAt'],
    default: 'displayOrder',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'displayOrder';

  /**
   * Sort order
   * Ascending or descending
   */
  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
