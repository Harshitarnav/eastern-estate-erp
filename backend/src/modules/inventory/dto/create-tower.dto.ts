import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  IsArray,
} from 'class-validator';

export class CreateTowerDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  towerCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  totalFloors: number;

  @IsNumber()
  @IsOptional()
  flatsPerFloor?: number;

  @IsNumber()
  @IsOptional()
  totalFlats?: number;

  @IsNumber()
  @IsOptional()
  towerSize?: number;

  @IsString()
  @IsOptional()
  @IsIn(['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'])
  facing?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsBoolean()
  @IsOptional()
  hasLift?: boolean;

  @IsNumber()
  @IsOptional()
  numberOfLifts?: number;

  @IsNumber()
  @IsOptional()
  liftCapacity?: number;

  @IsBoolean()
  @IsOptional()
  hasStairs?: boolean;

  @IsNumber()
  @IsOptional()
  numberOfStairs?: number;

  @IsString()
  @IsOptional()
  @IsIn(['Open', 'Covered', 'Underground'])
  parkingType?: string;

  @IsNumber()
  @IsOptional()
  parkingCapacity?: number;

  @IsBoolean()
  @IsOptional()
  hasGym?: boolean;

  @IsBoolean()
  @IsOptional()
  hasGarden?: boolean;

  @IsBoolean()
  @IsOptional()
  hasSecurityAlarm?: boolean;

  @IsBoolean()
  @IsOptional()
  hasFireAlarm?: boolean;

  @IsBoolean()
  @IsOptional()
  isVastuCompliant?: boolean;

  @IsBoolean()
  @IsOptional()
  hasCentralAc?: boolean;

  @IsBoolean()
  @IsOptional()
  hasIntercom?: boolean;

  @IsArray()
  @IsOptional()
  layoutImages?: string[];

  @IsArray()
  @IsOptional()
  arialViewImages?: string[];

  @IsArray()
  @IsOptional()
  amenities?: string[];

  @IsString()
  @IsOptional()
  surroundingDescription?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Active', 'Under Construction', 'Completed', 'On Hold'])
  status?: string;
}