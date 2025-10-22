import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum FileCategory {
  DOCUMENT = 'document',
  IMAGE = 'image',
  RECEIPT = 'receipt',
  KYC = 'kyc',
  AVATAR = 'avatar',
  PROPERTY = 'property',
  CONSTRUCTION = 'construction',
  OTHER = 'other',
}

export class UploadFileDto {
  @IsEnum(FileCategory)
  category: FileCategory;

  @IsString()
  @IsOptional()
  entityId?: string; // ID of related entity (customer, employee, etc.)

  @IsString()
  @IsOptional()
  entityType?: string; // Type of entity (customer, employee, property, etc.)

  @IsString()
  @IsOptional()
  description?: string;
}

export class FileResponseDto {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  category?: FileCategory;
  entityId?: string;
  entityType?: string;
  description?: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy?: string;
}
