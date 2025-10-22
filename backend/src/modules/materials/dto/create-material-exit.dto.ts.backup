import { IsUUID, IsNumber, IsString, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';

export class CreateMaterialExitDto {
  @IsUUID()
  materialId: string;

  @IsUUID()
  @IsOptional()
  constructionProjectId?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  purpose: string;

  @IsUUID()
  issuedTo: string;

  @IsUUID()
  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  exitDate?: string;

  @IsBoolean()
  @IsOptional()
  returnExpected?: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;
}
