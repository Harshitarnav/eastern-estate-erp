import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTowerDto } from './create-tower.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating an existing tower
 * 
 * Extends CreateTowerDto but makes all fields optional.
 * Allows partial updates without requiring all fields.
 * PropertyId is omitted as towers cannot be moved between properties.
 * 
 * Eastern Estate Principle:
 * Flexibility in updates while maintaining data integrity.
 * Every change should enhance the customer experience.
 */
export class UpdateTowerDto extends PartialType(
  OmitType(CreateTowerDto, ['propertyId'] as const)
) {
  /**
   * Active status for soft delete
   * Instead of deleting towers, we deactivate them
   * This preserves historical data and relationships
   */
  @ApiPropertyOptional({
    description: 'Active status of the tower',
    example: true,
  })
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @IsOptional()
  isActive?: boolean;
}
