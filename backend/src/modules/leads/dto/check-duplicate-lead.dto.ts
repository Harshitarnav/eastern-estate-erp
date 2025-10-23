import { IsOptional, IsEmail, IsString } from 'class-validator';

export class CheckDuplicateLeadDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class DuplicateLeadResponseDto {
  isDuplicate: boolean;
  existingLead?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    status: string;
    source: string;
    assignedTo?: string;
    createdAt: Date;
  };
}
