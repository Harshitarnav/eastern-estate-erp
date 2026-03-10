import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DocumentCategory, DocumentEntityType } from '../entities/document.entity';

export class CreateDocumentDto {
  @IsString()
  name: string;

  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @IsEnum(DocumentEntityType)
  entityType: DocumentEntityType;

  @IsUUID()
  entityId: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsString()
  fileUrl: string;

  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  fileSize?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
