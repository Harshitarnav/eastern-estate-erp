import { IsBooleanString, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class QueryProjectDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBooleanString()
  @IsOptional()
  isActive?: string;

  @IsUUID('4')
  @IsOptional()
  excludeId?: string;
}
