import { IsBoolean, IsDateString, IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MaxLength(50)
  projectCode: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsString()
  @IsOptional()
  @Length(3, 15)
  pincode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(150)
  contactEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(25)
  contactPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(25)
  gstNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(25)
  panNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  financeEntityName?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
