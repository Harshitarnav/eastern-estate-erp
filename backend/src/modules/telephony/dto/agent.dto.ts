import { IsNumber, IsBoolean, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateAgentAvailabilityDto {
  @IsNumber()
  employeeId: number;

  @IsBoolean()
  isAvailable: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateAgentSkillsDto {
  @IsNumber()
  employeeId: number;

  @IsArray()
  @IsString({ each: true })
  skills: string[];
}

export class AgentStatsQueryDto {
  @IsOptional()
  @IsNumber()
  propertyId?: number;

  @IsOptional()
  @IsNumber()
  employeeId?: number;
}


