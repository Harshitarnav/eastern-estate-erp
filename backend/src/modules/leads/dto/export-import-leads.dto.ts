import { IsOptional, IsDateString, IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportLeadsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(['excel', 'pdf'])
  format?: 'excel' | 'pdf';
}

export class ImportLeadRowDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  source: string;

  @IsOptional()
  @IsString()
  property?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  towerId?: string;

  @IsOptional()
  @IsString()
  flatId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ImportLeadsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportLeadRowDto)
  leads: ImportLeadRowDto[];

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  towerId?: string;

  @IsOptional()
  @IsString()
  flatId?: string;
}

export class ImportLeadsResultDto {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: {
    row: number;
    data: ImportLeadRowDto;
    error: string;
  }[];
  createdLeads: string[];
}
